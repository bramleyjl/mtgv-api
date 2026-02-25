import logger from '../lib/logger.js';
import CardPackage from '../models/cardPackage.js';
import Card from '../models/card.js';
import { sanitizeCardName } from '../lib/helper.js';

class WebSocketService {
  constructor() {
    this.wss = null;
    this.packageRooms = new Map(); // packageId -> Set of WebSocket clients
    this.clients = new Map(); // WebSocket -> client info
  }

  async initialize(server, WebSocketServerImpl) {
    let WebSocketServer;
    if (WebSocketServerImpl) {
      WebSocketServer = WebSocketServerImpl;
    } else {
      WebSocketServer = (await import('ws')).WebSocketServer;
    }
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws) => {
      logger.info('WebSocket client connected');

      // Store client info
      this.clients.set(ws, {
        id: this.generateClientId(),
        packageId: null,
        connectedAt: new Date()
      });

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          logger.error('Error parsing WebSocket message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleClientDisconnect(ws);
      });

      ws.on('error', (error) => {
        logger.error('WebSocket error:', error);
        this.handleClientDisconnect(ws);
      });
    });

    logger.info('WebSocket server initialized');
  }

  generateClientId() {
    return Math.random().toString(36).substr(2, 9);
  }

  async handleMessage(ws, message) {
    const client = this.clients.get(ws);
    if (!client) {
      this.sendError(ws, 'Client not found');
      return;
    }

    logger.info('Received WebSocket message:', { type: message.type, clientId: client.id, fullMessage: JSON.stringify(message) });

    switch (message.type) {
      case 'join-package':
        await this.handleJoinPackage(ws, message, client);
        break;
      case 'leave-package':
        this.handleLeavePackage(ws, message, client);
        break;
      case 'update-card-list':
        await this.handleUpdateCardList(ws, message, client);
        break;
      case 'update-version-selection':
        await this.handleUpdateVersionSelection(ws, message, client);
        break;
      case 'add-card-to-package':
        await this.handleAddCardToPackage(ws, message, client);
        break;
      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  async handleJoinPackage(ws, message, client) {
    const { packageId } = message;

    if (!packageId) {
      this.sendError(ws, 'Package ID is required');
      return;
    }

    // Leave current package if any
    if (client.packageId) {
      this.leavePackageRoom(ws, client.packageId);
    }

    // Join new package room
    this.joinPackageRoom(ws, packageId);
    client.packageId = packageId;

    // After joining, send the current card list to the client:
    try {
      const cardPackage = await CardPackage.getById(packageId);
      if (cardPackage) {
        ws.send(JSON.stringify({
          type: 'card-list-updated',
          data: cardPackage.card_list
        }));
      }
    } catch (error) {
      logger.error('Error getting package for WebSocket:', error);
    }

    logger.info(`Client ${client.id} joined package ${packageId}`);
    this.sendSuccess(ws, { type: 'joined-package', packageId });
  }

  handleLeavePackage(ws, message, client) {
    const { packageId } = message;

    if (client.packageId === packageId) {
      this.leavePackageRoom(ws, packageId);
      client.packageId = null;
      logger.info(`Client ${client.id} left package ${packageId}`);
      this.sendSuccess(ws, { type: 'left-package', packageId });
    }
  }

  async handleUpdateCardList(ws, message, client) {
    const { packageId, data } = message;

    if (!client.packageId || client.packageId !== packageId) {
      this.sendError(ws, 'Not in package room');
      return;
    }

    // Update the package in Redis with new card list
    try {
      const cardPackage = await CardPackage.getById(packageId);
      if (cardPackage) {
        cardPackage.card_list = data;
        await CardPackage.save(cardPackage);
        logger.info(`Updated card list for package ${packageId} in Redis`);
      }
    } catch (error) {
      logger.error('Error updating card list in Redis:', error);
    }

    // Broadcast to all clients in the package room
    this.broadcastToPackage(packageId, {
      type: 'card-list-updated',
      data: data
    }, ws); // Exclude sender

    logger.info(`Card list updated for package ${packageId}`);
  }

  async handleUpdateVersionSelection(ws, message, client) {
    const { packageId, data } = message;

    logger.info(`handleUpdateVersionSelection called: packageId=${packageId}, oracleId=${data.oracleId}, scryfallId=${data.scryfallId}`);

    if (!client.packageId || client.packageId !== packageId) {
      logger.warn(`Client not in package room: client.packageId=${client.packageId}, requested=${packageId}`);
      this.sendError(ws, 'Not in package room');
      return;
    }

    try {
      const updated = await CardPackage.updateSelectedPrint(packageId, data.oracleId, data.scryfallId);
      logger.info(`updateSelectedPrint result: ${updated}`);

      if (updated) {
        logger.info(`Persisted version selection for package ${packageId}: oracle_id ${data.oracleId} -> ${data.scryfallId}`);
      } else {
        logger.warn(`Failed to persist version selection for package ${packageId}: oracle_id ${data.oracleId}`);
      }

      // Broadcast to all clients in the package room
      this.broadcastToPackage(packageId, {
        type: 'version-selection-updated',
        data: data
      }, ws); // Exclude sender

      logger.info(`Version selection updated for package ${packageId}: oracle_id ${data.oracleId} -> ${data.scryfallId}`);
    } catch (error) {
      logger.error(`Error in handleUpdateVersionSelection: ${error.message}`);
      this.sendError(ws, 'Failed to update version selection');
    }
  }

  async handleAddCardToPackage(ws, message, client) {
    const { packageId, data } = message;
    const { cardName, count: quantity = 1 } = data || {};

    logger.info(`handleAddCardToPackage START: packageId=${packageId}, cardName=${cardName}, quantity=${quantity}, client.packageId=${client.packageId}`);

    if (!client.packageId || client.packageId !== packageId) {
      logger.warn(`Client not in package room: client.packageId=${client.packageId}, requested=${packageId}`);
      this.sendError(ws, 'Not in package room');
      return;
    }

    try {
      // Get the existing package
      logger.info(`[handleAddCardToPackage] Step 1: Getting package ${packageId}`);
      const cardPackage = await CardPackage.getById(packageId);
      if (!cardPackage) {
        logger.warn(`[handleAddCardToPackage] Package not found: ${packageId}`);
        this.sendError(ws, 'Package not found');
        return;
      }
      logger.info(`[handleAddCardToPackage] Step 2: Package retrieved, game=${cardPackage.game}`);

      // Lookup the card
      const sanitizedName = sanitizeCardName(cardName);
      logger.info(`[handleAddCardToPackage] Step 3: Looking up card, sanitizedName=${sanitizedName}`);
      const cardModel = new Card();
      const cardPrints = await cardModel.find_by({
        sanitized_name: sanitizedName,
        games: cardPackage.game,
      }, Card.SERIALIZED_FIELDS);

      if (!cardPrints || cardPrints.length === 0) {
        logger.warn(`Card not found: ${cardName}`);
        this.sendError(ws, `Card not found: ${cardName}`);
        return;
      }
      logger.info(`[handleAddCardToPackage] Step 4: Found ${cardPrints.length} prints`);

      // Sort card prints according to default selection
      const sortedPrints = CardPackage.applySorting(cardPrints, cardPackage.default_selection, cardPackage.game);
      logger.info(`[handleAddCardToPackage] Step 5: Sorted prints`);

      // Build new card entry
      const newEntry = {
        count: quantity,
        oracle_id: sortedPrints[0].oracle_id,
        name: sortedPrints[0].name,
        card_prints: sortedPrints,
        selected_print: sortedPrints[0].scryfall_id,
        user_selected: false,
      };
      logger.info(`[handleAddCardToPackage] Step 6: Built new entry`);

      // Update package
      cardPackage.package_entries.push(newEntry);
      cardPackage.card_list.push({ name: cardName, count: quantity });
      logger.info(`[handleAddCardToPackage] Step 7: Updated package arrays`);

      // Save updated package
      await CardPackage.save(cardPackage);
      logger.info(`[handleAddCardToPackage] Step 8: Saved package`);
      logger.info(`Added card ${cardName} to package ${packageId}`);

      // Broadcast to all clients in the package room
      logger.info(`[handleAddCardToPackage] Step 9: Broadcasting to package room`);
      this.broadcastToPackage(packageId, {
        type: 'card-added',
        data: {
          cardEntry: newEntry,
          cardList: cardPackage.card_list
        }
      });

      // Send success to sender
      logger.info(`[handleAddCardToPackage] Step 10: Sending success to sender`);
      this.sendSuccess(ws, {
        type: 'card-added',
        cardName,
        cardEntry: newEntry
      });

      logger.info(`[handleAddCardToPackage] COMPLETE: Successfully added ${cardName}`);

    } catch (error) {
      logger.error(`Error in handleAddCardToPackage: ${error.message}`);
      logger.error(`Error stack: ${error.stack}`);
      this.sendError(ws, 'Failed to add card to package');
    }
  }

  joinPackageRoom(ws, packageId) {
    if (!this.packageRooms.has(packageId)) {
      this.packageRooms.set(packageId, new Set());
    }
    this.packageRooms.get(packageId).add(ws);
    logger.info(`Client joined package room ${packageId}. Room now has ${this.packageRooms.get(packageId).size} clients`);
  }

  leavePackageRoom(ws, packageId) {
    const room = this.packageRooms.get(packageId);
    if (room) {
      room.delete(ws);
      logger.info(`Client left package room ${packageId}. Room now has ${room.size} clients`);
      if (room.size === 0) {
        this.packageRooms.delete(packageId);
        logger.info(`Package room ${packageId} closed (no clients)`);
      }
    }
  }

  broadcastToPackage(packageId, message, excludeWs = null) {
    const room = this.packageRooms.get(packageId);
    if (!room) {
      logger.warn(`Package room ${packageId} not found`);
      return;
    }

    logger.info(`[broadcastToPackage] Room ${packageId} has ${room.size} clients`);
    logger.info(`[broadcastToPackage] Message type: ${message.type}`);
    logger.info(`[broadcastToPackage] Exclude sender: ${!!excludeWs}`);

    const messageStr = JSON.stringify(message);
    let sentCount = 0;
    let totalClients = 0;

    // If there's only one client and it's the sender, don't exclude them
    const shouldExcludeSender = excludeWs && room.size > 1;
    logger.info(`[broadcastToPackage] Should exclude sender: ${shouldExcludeSender}`);

    for (const client of room) {
      totalClients++;
      const isExcluded = client === (shouldExcludeSender ? excludeWs : null);
      const readyState = client.readyState;
      logger.info(`[broadcastToPackage] Client ${totalClients}: readyState=${readyState}, isExcluded=${isExcluded}`);

      if (!isExcluded && readyState === 1) {
        client.send(messageStr);
        sentCount++;
        logger.info(`[broadcastToPackage] Sent message to client ${totalClients}`);
      }
    }

    logger.info(`[broadcastToPackage] Broadcasted to ${sentCount}/${totalClients} clients in package ${packageId}`);
  }

  handleClientDisconnect(ws) {
    const client = this.clients.get(ws);
    if (client) {
      if (client.packageId) {
        this.leavePackageRoom(ws, client.packageId);
      }
      this.clients.delete(ws);
      logger.info(`Client ${client.id} disconnected`);
    }
  }

  sendSuccess(ws, data) {
    if (ws.readyState === 1) { // 1 = OPEN
      ws.send(JSON.stringify({ success: true, ...data }));
    }
  }

  sendError(ws, error) {
    if (ws.readyState === 1) { // 1 = OPEN
      ws.send(JSON.stringify({ success: false, error }));
    }
  }

  getStats() {
    return {
      totalClients: this.clients.size,
      totalRooms: this.packageRooms.size,
      rooms: Array.from(this.packageRooms.entries()).map(([packageId, clients]) => ({
        packageId,
        clientCount: clients.size
      }))
    };
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
