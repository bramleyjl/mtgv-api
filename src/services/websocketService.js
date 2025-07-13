import logger from '../lib/logger.js';

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
    
    this.wss.on('connection', (ws, req) => {
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

  handleMessage(ws, message) {
    const client = this.clients.get(ws);
    if (!client) {
      this.sendError(ws, 'Client not found');
      return;
    }

    logger.info('Received WebSocket message:', { type: message.type, clientId: client.id });

    switch (message.type) {
      case 'join-package':
        this.handleJoinPackage(ws, message, client);
        break;
      case 'leave-package':
        this.handleLeavePackage(ws, message, client);
        break;
      case 'update-card-list':
        this.handleUpdateCardList(ws, message, client);
        break;
      case 'update-version-selection':
        this.handleUpdateVersionSelection(ws, message, client);
        break;
      default:
        this.sendError(ws, `Unknown message type: ${message.type}`);
    }
  }

  handleJoinPackage(ws, message, client) {
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

  handleUpdateCardList(ws, message, client) {
    const { packageId, data } = message;
    
    if (!client.packageId || client.packageId !== packageId) {
      this.sendError(ws, 'Not in package room');
      return;
    }

    // Broadcast to all clients in the package room
    this.broadcastToPackage(packageId, {
      type: 'card-list-updated',
      data: data
    }, ws); // Exclude sender

    logger.info(`Card list updated for package ${packageId}`);
  }

  handleUpdateVersionSelection(ws, message, client) {
    const { packageId, data } = message;
    
    if (!client.packageId || client.packageId !== packageId) {
      this.sendError(ws, 'Not in package room');
      return;
    }

    // Broadcast to all clients in the package room
    this.broadcastToPackage(packageId, {
      type: 'version-selection-updated',
      data: data
    }, ws); // Exclude sender

    logger.info(`Version selection updated for package ${packageId}: ${data.cardName} -> ${data.scryfallId}`);
  }

  joinPackageRoom(ws, packageId) {
    if (!this.packageRooms.has(packageId)) {
      this.packageRooms.set(packageId, new Set());
    }
    this.packageRooms.get(packageId).add(ws);
  }

  leavePackageRoom(ws, packageId) {
    const room = this.packageRooms.get(packageId);
    if (room) {
      room.delete(ws);
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

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const client of room) {
      if (client !== excludeWs && client.readyState === 1) { // 1 = OPEN
        client.send(messageStr);
        sentCount++;
      }
    }

    logger.info(`Broadcasted to ${sentCount} clients in package ${packageId}`);
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