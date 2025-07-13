import { jest } from '@jest/globals';
import ws from 'ws';
import websocketService from '../../src/services/websocketService.js';

// Mock logger
jest.mock('../../src/lib/logger.js', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
}));

describe('WebSocket Service', () => {
  let mockServer;
  let mockWs;
  let mockWss;

  beforeEach(() => {
    // Reset the service
    websocketService.wss = null;
    websocketService.packageRooms.clear();
    websocketService.clients.clear();

    // Create mock server
    mockServer = {
      on: jest.fn()
    };

    // Create mock WebSocket
    mockWs = {
      readyState: 1, // OPEN
      on: jest.fn(),
      send: jest.fn(),
      close: jest.fn()
    };

    // Create mock WebSocketServer
    mockWss = {
      on: jest.fn()
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize WebSocket server', async () => {
      const MockWebSocketServer = jest.fn(() => mockWss);
      await websocketService.initialize(mockServer, MockWebSocketServer);
      expect(MockWebSocketServer).toHaveBeenCalledWith({ server: mockServer });
      expect(mockWss.on).toHaveBeenCalledWith('connection', expect.any(Function));
    });
  });

  describe('client management', () => {
    let connectionHandler;

    beforeEach(async () => {
      const MockWebSocketServer = jest.fn(() => mockWss);
      await websocketService.initialize(mockServer, MockWebSocketServer);
      connectionHandler = mockWss.on.mock.calls.find(call => call[0] === 'connection')[1];
    });

    it('should generate unique client IDs', () => {
      const id1 = websocketService.generateClientId();
      const id2 = websocketService.generateClientId();
      expect(id1).toBeDefined();
      expect(id2).toBeDefined();
      expect(id1).not.toBe(id2);
    });

    it('should handle client connection', () => {
      connectionHandler(mockWs);
      expect(websocketService.clients.has(mockWs)).toBe(true);
      expect(mockWs.on).toHaveBeenCalledWith('message', expect.any(Function));
      expect(mockWs.on).toHaveBeenCalledWith('close', expect.any(Function));
      expect(mockWs.on).toHaveBeenCalledWith('error', expect.any(Function));
    });

    it('should handle client disconnection', () => {
      // Add client first
      websocketService.clients.set(mockWs, {
        id: 'test-client',
        packageId: 'test-package',
        connectedAt: new Date()
      });
      // Add to package room
      websocketService.packageRooms.set('test-package', new Set([mockWs]));
      // Simulate disconnect
      websocketService.handleClientDisconnect(mockWs);
      expect(websocketService.clients.has(mockWs)).toBe(false);
      expect(websocketService.packageRooms.has('test-package')).toBe(false);
    });
  });

  describe('message handling', () => {
    let messageHandler;

    beforeEach(async () => {
      const MockWebSocketServer = jest.fn(() => mockWss);
      await websocketService.initialize(mockServer, MockWebSocketServer);
      // Get the connection handler and simulate connection
      const connectionHandler = mockWss.on.mock.calls.find(call => call[0] === 'connection')[1];
      connectionHandler(mockWs);
      // Get the message handler
      messageHandler = mockWs.on.mock.calls.find(call => call[0] === 'message')[1];
    });

    it('should handle join-package message', () => {
      const message = {
        type: 'join-package',
        packageId: 'test-package'
      };
      websocketService.handleMessage(mockWs, message);
      const client = websocketService.clients.get(mockWs);
      expect(client.packageId).toBe('test-package');
      expect(websocketService.packageRooms.has('test-package')).toBe(true);
      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining('"success":true')
      );
    });

    it('should handle leave-package message', () => {
      // Setup client in package
      const client = websocketService.clients.get(mockWs);
      client.packageId = 'test-package';
      websocketService.packageRooms.set('test-package', new Set([mockWs]));
      const message = {
        type: 'leave-package',
        packageId: 'test-package'
      };
      websocketService.handleMessage(mockWs, message);
      expect(client.packageId).toBeNull();
      expect(websocketService.packageRooms.has('test-package')).toBe(false);
    });

    it('should handle update-card-list message', () => {
      // Setup client in package
      const client = websocketService.clients.get(mockWs);
      client.packageId = 'test-package';
      websocketService.packageRooms.set('test-package', new Set([mockWs]));
      const message = {
        type: 'update-card-list',
        packageId: 'test-package',
        data: [{ name: 'Lightning Bolt', count: 4 }]
      };
      websocketService.handleMessage(mockWs, message);
      // Should not send to sender (excluded)
      expect(mockWs.send).not.toHaveBeenCalledWith(
        expect.stringContaining('card-list-updated')
      );
    });

    it('should handle update-version-selection message', () => {
      // Setup client in package
      const client = websocketService.clients.get(mockWs);
      client.packageId = 'test-package';
      websocketService.packageRooms.set('test-package', new Set([mockWs]));
      const message = {
        type: 'update-version-selection',
        packageId: 'test-package',
        data: { cardName: 'Lightning Bolt', scryfallId: '123' }
      };
      websocketService.handleMessage(mockWs, message);
      // Should not send to sender (excluded)
      expect(mockWs.send).not.toHaveBeenCalledWith(
        expect.stringContaining('version-selection-updated')
      );
    });

    it('should handle unknown message type', () => {
      const message = {
        type: 'unknown-type',
        data: {}
      };
      websocketService.handleMessage(mockWs, message);
      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining('"success":false')
      );
    });

    it('should handle invalid JSON', () => {
      const invalidData = 'invalid json';
      // Simulate raw message data
      messageHandler(invalidData);
      expect(mockWs.send).toHaveBeenCalledWith(
        expect.stringContaining('"success":false')
      );
    });
  });

  describe('broadcasting', () => {
    let mockWs2;

    beforeEach(() => {
      mockWs2 = {
        readyState: 1,
        send: jest.fn()
      };
      websocketService.packageRooms.set('test-package', new Set([mockWs, mockWs2]));
    });

    it('should broadcast to all clients in package room', () => {
      const message = {
        type: 'test-message',
        data: { test: 'data' }
      };
      websocketService.broadcastToPackage('test-package', message);
      expect(mockWs.send).toHaveBeenCalledWith(JSON.stringify(message));
      expect(mockWs2.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('should exclude sender from broadcast', () => {
      const message = {
        type: 'test-message',
        data: { test: 'data' }
      };
      websocketService.broadcastToPackage('test-package', message, mockWs);
      expect(mockWs.send).not.toHaveBeenCalled();
      expect(mockWs2.send).toHaveBeenCalledWith(JSON.stringify(message));
    });

    it('should handle non-existent package room', () => {
      const message = { type: 'test' };
      websocketService.broadcastToPackage('non-existent', message);
      expect(mockWs.send).not.toHaveBeenCalled();
      expect(mockWs2.send).not.toHaveBeenCalled();
    });
  });

  describe('stats', () => {
    it('should return correct stats', () => {
      // Setup some test data
      websocketService.clients.set(mockWs, {
        id: 'test-client',
        packageId: 'test-package',
        connectedAt: new Date()
      });
      websocketService.packageRooms.set('test-package', new Set([mockWs]));
      const stats = websocketService.getStats();
      expect(stats.totalClients).toBe(1);
      expect(stats.totalRooms).toBe(1);
      expect(stats.rooms).toHaveLength(1);
      expect(stats.rooms[0]).toEqual({
        packageId: 'test-package',
        clientCount: 1
      });
    });
  });
}); 