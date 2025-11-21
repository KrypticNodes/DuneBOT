import { WebSocketServer, WebSocket } from 'ws';
import type { Server } from 'http';

export interface WebSocketMessage {
  type: 'transaction' | 'new_mint' | 'alert' | 'wallet_update' | 'connection_status';
  data: any;
}

export class AppWebSocketServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('🔌 New WebSocket client connected');
      this.clients.add(ws);

      ws.on('close', () => {
        console.log('🔌 WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('❌ WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send initial connection confirmation
      this.sendToClient(ws, {
        type: 'connection_status',
        data: { status: 'connected', timestamp: new Date().toISOString() },
      });
    });

    console.log('✅ WebSocket server initialized on path /ws');
  }

  private sendToClient(ws: WebSocket, message: WebSocketMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  broadcast(message: WebSocketMessage): void {
    const payload = JSON.stringify(message);
    let sentCount = 0;

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
        sentCount++;
      }
    });

    if (sentCount > 0) {
      console.log(`📡 Broadcasted ${message.type} to ${sentCount} client(s)`);
    }
  }

  getClientCount(): number {
    return this.clients.size;
  }

  close(): void {
    this.clients.forEach((client) => {
      client.close();
    });
    this.wss.close();
    console.log('🛑 WebSocket server closed');
  }
}
