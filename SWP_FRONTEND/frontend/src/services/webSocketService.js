import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class WebSocketService {  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.currentToken = null; // Store current token for reconnection
  }  connect(token) {
    return new Promise((resolve, reject) => {
      try {
        console.log('Connecting to WebSocket with token:', token ? 'Token provided' : 'No token');
        
        // Store token for potential reconnection
        this.currentToken = token;
        
        // Create SockJS connection
        const wsUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'}/ws`;
        const socket = new SockJS(wsUrl);        // Create STOMP client
        const connectHeaders = {
          'Authorization': `Bearer ${token}`
        };
        console.log('Connect headers:', connectHeaders);
        
        this.client = new Client({
          webSocketFactory: () => socket,
          connectHeaders: connectHeaders,
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          reconnectDelay: this.reconnectDelay,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });// Set up connection handlers
        this.client.onConnect = (frame) => {
          console.log('Connected to WebSocket server:', frame);
          this.connected = true;
          this.reconnectAttempts = 0;
          
          // Add a small delay to ensure connection is fully established
          setTimeout(() => {
            // Subscribe to personal notifications
            this.subscribeToNotifications();
          }, 100);
          
          resolve(frame);
        };        this.client.onStompError = (frame) => {
          console.error('STOMP Error:', frame);
          console.error('STOMP Error headers:', frame.headers);
          console.error('STOMP Error body:', frame.body);
          this.connected = false;
          reject(new Error(`WebSocket connection failed: ${frame.body || 'Unknown error'}`));
        };        this.client.onWebSocketClose = (event) => {
          console.log('WebSocket connection closed:', event);
          console.log('Close code:', event.code);
          console.log('Close reason:', event.reason);
          this.connected = false;
          
          // Use stored token for reconnection
          if (this.currentToken) {
            this.handleReconnect(this.currentToken);
          }
        };

        this.client.onWebSocketError = (error) => {
          console.error('WebSocket error:', error);
          this.connected = false;
        };

        // Activate the client
        this.client.activate();

      } catch (error) {
        console.error('Error creating WebSocket connection:', error);
        reject(error);
      }
    });
  }
  subscribeToNotifications() {
    if (!this.client) {
      console.warn('Cannot subscribe - client is null');
      return;
    }
    
    if (!this.client.connected) {
      console.warn('Cannot subscribe - STOMP client not connected');
      return;
    }

    try {
      console.log('Attempting to subscribe to notifications...');
      // Subscribe to personal notification queue
      const subscription = this.client.subscribe('/user/queue/notifications', (message) => {
        try {
          const notification = JSON.parse(message.body);
          console.log('Received notification:', notification);
          
          // Call all registered message handlers
          this.messageHandlers.forEach((handler, handlerName) => {
            try {
              handler(notification);
            } catch (error) {
              console.error(`Error in message handler ${handlerName}:`, error);
            }
          });
        } catch (error) {
          console.error('Error processing notification message:', error);
        }
      });

      this.subscriptions.set('notifications', subscription);
      console.log('Successfully subscribed to notifications');
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  }

  addMessageHandler(name, handler) {
    this.messageHandlers.set(name, handler);
  }

  removeMessageHandler(name) {
    this.messageHandlers.delete(name);
  }

  handleReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect(token).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }, this.reconnectDelay);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect() {
    if (this.client) {
      // Unsubscribe from all subscriptions
      this.subscriptions.forEach((subscription, key) => {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error(`Error unsubscribing from ${key}:`, error);
        }
      });
      this.subscriptions.clear();

      // Clear message handlers
      this.messageHandlers.clear();

      // Deactivate client
      try {
        this.client.deactivate();
      } catch (error) {
        console.error('Error deactivating STOMP client:', error);
      }

      this.client = null;
      this.connected = false;
      this.reconnectAttempts = 0;
    }
  }

  isConnected() {
    return this.connected && this.client && this.client.connected;
  }

  // Send a message (if needed in the future)
  send(destination, body, headers = {}) {
    if (!this.isConnected()) {
      throw new Error('WebSocket not connected');
    }
    
    this.client.publish({
      destination,
      body: JSON.stringify(body),
      headers
    });
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
