import io from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.onConnectCallback = null;
    this.onDisconnectCallback = null;
    this.onMessageCallback = null;
    this.reconnectInterval = null;
  }

  connect(onConnect, onDisconnect) {
    this.onConnectCallback = onConnect;
    this.onDisconnectCallback = onDisconnect;

    const wsUrl = process.env.REACT_APP_WS_URL || 'http://localhost:8000';
    this.socket = io(wsUrl);

    this.socket.on('connect', () => {
      console.log('Socket.IO connected');
      this.isConnected = true;
      if (this.onConnectCallback) {
        this.onConnectCallback();
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      this.isConnected = false;
      if (this.onDisconnectCallback) {
        this.onDisconnectCallback();
      }
    });

    this.socket.on('poll_created', (data) => {
      if (this.onMessageCallback) {
        this.onMessageCallback({
          type: 'poll_created',
          data: data
        });
      }
    });

    this.socket.on('poll_vote', (data) => {
      if (this.onMessageCallback) {
        this.onMessageCallback({
          type: 'poll_vote',
          data: data
        });
      }
    });

    this.socket.on('poll_like', (data) => {
      if (this.onMessageCallback) {
        this.onMessageCallback({
          type: 'poll_like',
          data: data
        });
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      this.scheduleReconnect();
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
    }
  }

  sendMessage(message) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message', message);
    }
  }

  onPollUpdate(callback) {
    this.onMessageCallback = callback;
  }

  handleMessage(data) {
    // Handle different message types
    switch (data.type) {
      case 'poll_created':
        console.log('New poll created:', data.data);
        break;
      case 'poll_vote':
        console.log('Vote updated:', data.data);
        break;
      case 'poll_like':
        console.log('Like updated:', data.data);
        break;
      default:
        console.log('Unknown message type:', data.type);
    }
  }

  scheduleReconnect() {
    this.reconnectInterval = setInterval(() => {
      console.log('Attempting to reconnect...');
      this.socket.connect();
    }, 5000); // Try to reconnect every 5 seconds
  }
}

export const websocketService = new WebSocketService();
