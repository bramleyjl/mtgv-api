import { jest } from '@jest/globals';
import WebSocket from 'ws';
import app, { initializeApp } from '../../src/app.js';
import websocketService from '../../src/services/websocketService.js';

// Mock logger to reduce noise in tests
jest.mock('../../src/lib/logger.js', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

// Mock process.exit to prevent tests from exiting
const originalExit = process.exit;
process.exit = jest.fn();

// Mock the database module
jest.mock('../../src/db/database.js', () => ({
  getCollection: jest.fn().mockResolvedValue({
    aggregate: () => ({
      toArray: () => Promise.resolve([])
    }),
    find: () => ({
      toArray: () => Promise.resolve([])
    }),
    findOne: () => Promise.resolve(null)
  }),
  close: jest.fn().mockResolvedValue(undefined),
  connect: jest.fn().mockResolvedValue(undefined)
}));

// Mock the database initializer
jest.mock('../../src/db/initializer.js', () => ({
  initializeDatabase: jest.fn().mockResolvedValue(undefined)
}));

describe('WebSocket Integration Tests', () => {
  let server;
  const PORT = 4001; // Use different port to avoid conflicts
  // Map from wsClient to message queue
  const messageQueues = new WeakMap();

  beforeAll(async () => {
    // Initialize the app
    await initializeApp();
    
    // Start server
    server = app.listen(PORT);
    
    // Initialize WebSocket service
    await websocketService.initialize(server);
  }, 10000); // Increase timeout to 10 seconds

  afterAll(async () => {
    if (server) {
      server.close();
    }
    // Clean up WebSocket service
    if (websocketService.wss) {
      websocketService.wss.close();
    }
    // Clean up database connection
    const database = await import('../../src/db/database.js');
    await database.default.close();
    // Restore process.exit
    process.exit = originalExit;
  }, 10000); // Increase timeout to 10 seconds

  const connectWebSocket = () => {
    return new Promise((resolve, reject) => {
      const wsClient = new WebSocket(`ws://localhost:${PORT}`);
      // Set up message queue for this client
      messageQueues.set(wsClient, []);
      wsClient.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          messageQueues.get(wsClient).push(message);
        } catch (e) {
          // Ignore parse errors here, handled in test
        }
      });
      wsClient.on('open', () => {
        resolve(wsClient);
      });
      wsClient.on('error', (error) => {
        reject(error);
      });
    });
  };

  const sendMessage = (wsClient, message) => {
    return new Promise((resolve) => {
      wsClient.send(JSON.stringify(message));
      // Wait a bit for processing
      setTimeout(resolve, 100);
    });
  };

  const waitForMessage = (wsClient, timeout = 1000) => {
    return new Promise((resolve, reject) => {
      const queue = messageQueues.get(wsClient);
      if (queue && queue.length > 0) {
        return resolve(queue.shift());
      }
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error('Timeout waiting for message'));
      }, timeout);
      function onMessage() {
        clearTimeout(timer);
        wsClient.removeListener('message', onMessage);
        // Try to parse and return the next message
        const queue = messageQueues.get(wsClient);
        if (queue && queue.length > 0) {
          resolve(queue.shift());
        } else {
          reject(new Error('No message in queue after message event'));
        }
      }
      function cleanup() {
        wsClient.removeListener('message', onMessage);
      }
      wsClient.on('message', onMessage);
    });
  };

  describe('Package Room Management', () => {
    it('should allow client to join a package room', async () => {
      const client = await connectWebSocket();
      await sendMessage(client, {
        type: 'join-package',
        packageId: 'test-package-123'
      });
      const response = await waitForMessage(client);
      expect(response.success).toBe(true);
      expect(response.type).toBe('joined-package');
      expect(response.packageId).toBe('test-package-123');
      client.close();
    });
    it('should allow client to leave a package room', async () => {
      const client = await connectWebSocket();
      await sendMessage(client, {
        type: 'join-package',
        packageId: 'test-package-456'
      });
      await waitForMessage(client); // Wait for join response
      await sendMessage(client, {
        type: 'leave-package',
        packageId: 'test-package-456'
      });
      const response = await waitForMessage(client);
      expect(response.success).toBe(true);
      expect(response.type).toBe('left-package');
      expect(response.packageId).toBe('test-package-456');
      client.close();
    });
  });

  describe('Real-time Updates', () => {
    it('should broadcast card list updates to all clients in package room', async () => {
      const client1 = await connectWebSocket();
      const client2 = await connectWebSocket();
      await sendMessage(client1, {
        type: 'join-package',
        packageId: 'test-package-789'
      });
      await waitForMessage(client1); // Wait for join response
      await sendMessage(client2, {
        type: 'join-package',
        packageId: 'test-package-789'
      });
      await waitForMessage(client2); // Wait for join response
      const cardListUpdate = {
        type: 'update-card-list',
        packageId: 'test-package-789',
        data: [
          { name: 'Lightning Bolt', count: 4 },
          { name: 'Counterspell', count: 2 }
        ]
      };
      const messagePromise = waitForMessage(client2);
      await sendMessage(client1, cardListUpdate);
      const broadcastMessage = await messagePromise;
      expect(broadcastMessage.type).toBe('card-list-updated');
      expect(broadcastMessage.data).toEqual(cardListUpdate.data);
      client1.close();
      client2.close();
    });
    it('should broadcast version selection updates to all clients in package room', async () => {
      const client1 = await connectWebSocket();
      const client2 = await connectWebSocket();
      await sendMessage(client1, {
        type: 'join-package',
        packageId: 'test-package-version'
      });
      await waitForMessage(client1);
      await sendMessage(client2, {
        type: 'join-package',
        packageId: 'test-package-version'
      });
      await waitForMessage(client2);
      const versionUpdate = {
        type: 'update-version-selection',
        packageId: 'test-package-version',
        data: {
          cardName: 'Lightning Bolt',
          scryfallId: 'abc123'
        }
      };
      const messagePromise = waitForMessage(client2);
      await sendMessage(client1, versionUpdate);
      const broadcastMessage = await messagePromise;
      expect(broadcastMessage.type).toBe('version-selection-updated');
      expect(broadcastMessage.data).toEqual(versionUpdate.data);
      client1.close();
      client2.close();
    });
    it('should not broadcast updates to clients not in the package room', async () => {
      const client1 = await connectWebSocket();
      const client2 = await connectWebSocket();
      await sendMessage(client1, {
        type: 'join-package',
        packageId: 'test-package-isolated'
      });
      await waitForMessage(client1);
      const cardListUpdate = {
        type: 'update-card-list',
        packageId: 'test-package-isolated',
        data: [{ name: 'Lightning Bolt', count: 4 }]
      };
      const messagePromise = waitForMessage(client2, 500); // Shorter timeout
      await sendMessage(client1, cardListUpdate);
      await expect(messagePromise).rejects.toThrow('Timeout waiting for message');
      client1.close();
      client2.close();
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid message format', async () => {
      const client = await connectWebSocket();
      client.send('invalid json');
      const response = await waitForMessage(client);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Invalid message format');
      client.close();
    });
    it('should handle unknown message type', async () => {
      const client = await connectWebSocket();
      await sendMessage(client, {
        type: 'unknown-message-type',
        data: {}
      });
      const response = await waitForMessage(client);
      expect(response.success).toBe(false);
      expect(response.error).toContain('Unknown message type');
      client.close();
    });
    it('should handle updates from clients not in package room', async () => {
      const client = await connectWebSocket();
      await sendMessage(client, {
        type: 'update-card-list',
        packageId: 'test-package-error',
        data: [{ name: 'Lightning Bolt', count: 4 }]
      });
      const response = await waitForMessage(client);
      expect(response.success).toBe(false);
      expect(response.error).toBe('Not in package room');
      client.close();
    });
  });

  describe('Connection Management', () => {
    it('should handle client disconnection gracefully', async () => {
      const client = await connectWebSocket();
      await sendMessage(client, {
        type: 'join-package',
        packageId: 'test-package-disconnect'
      });
      await waitForMessage(client);
      client.close();
      await new Promise(resolve => setTimeout(resolve, 100));
      const stats = websocketService.getStats();
      expect(stats.totalClients).toBe(0);
    });
  });
}); 