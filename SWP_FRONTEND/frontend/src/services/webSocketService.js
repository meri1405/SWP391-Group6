import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import { restockRequestApi } from "../api/restockRequestApi";

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.messageHandlers = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    this.currentToken = null; // Store current token for reconnection
    this.webSocketDisabled = false; // Added to track WebSocket state
    
    // Add custom event system for restock requests
    this.restockRequestListeners = [];
  }
  
  // Add methods for restock request notifications
  addRestockRequestListener(listener) {
    if (typeof listener === 'function') {
      console.log('[WebSocketService] Adding restock request listener');
      this.restockRequestListeners.push(listener);
      return () => this.removeRestockRequestListener(listener);
    }
    return () => {};
  }
  
  removeRestockRequestListener(listener) {
    const index = this.restockRequestListeners.indexOf(listener);
    if (index !== -1) {
      console.log('[WebSocketService] Removing restock request listener');
      this.restockRequestListeners.splice(index, 1);
    }
  }
  
  notifyRestockRequestListeners() {
    console.log(`[WebSocketService] Notifying ${this.restockRequestListeners.length} restock request listeners`);
    this.restockRequestListeners.forEach(listener => {
      try {
        listener();
      } catch (error) {
        console.error('[WebSocketService] Error in restock request listener:', error);
      }
    });
  }
  
  // Initialize the service with restockRequestApi
  initialize() {
    // Subscribe to restock request notifications from the API
    restockRequestApi.subscribeToUpdates(() => {
      console.log('[WebSocketService] Received restock request update from API');
      this.notifyRestockRequestListeners();
    });
    
    console.log('[WebSocketService] Initialized with restock request subscription');
  }
  
  connect(token) {
    return new Promise((resolve, reject) => {
      try {
        // Validate token before connecting
        if (!token) {
          console.warn("No token provided for WebSocket connection");
          reject(new Error("Authentication token required"));
          return;
        }

        // Store token for potential reconnection
        this.currentToken = token;

        // Temporarily disable WebSocket connection due to authentication issues
        // The backend WebSocket endpoint (/ws) is not configured with authentication interceptor
        // This causes 401 Unauthorized errors when trying to connect with Bearer tokens
        // Real-time notifications are disabled until backend WebSocket auth is properly configured
        console.log(
          "WebSocket connection temporarily disabled due to authentication issues"
        );
        
        // Set WebSocket disabled flag
        this.webSocketDisabled = true;
        
        if (!this.webSocketDisabled) {
          // Create SockJS connection with token in URL
          const wsUrl = `${
            import.meta.env.VITE_API_BASE_URL || "http://localhost:8080"
          }/ws?token=${encodeURIComponent(token)}`;
          console.log(
            "Connecting to WebSocket URL:",
            wsUrl.replace(token, "***TOKEN***")
          );
          console.log(
            "Using token:",
            token ? `${token.substring(0, 20)}...` : "No token"
          );
          const socket = new SockJS(wsUrl);

          // Create STOMP client
          this.client = new Client({
            webSocketFactory: () => socket,
            debug: (str) => {
              console.log("STOMP Debug:", str);
            },
            reconnectDelay: this.reconnectDelay,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            connectHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });

          // Set up connection handlers
          this.client.onConnect = (frame) => {
            console.log("Connected to WebSocket server:", frame);
            this.connected = true;
            this.webSocketDisabled = false;
            this.reconnectAttempts = 0;

            // Subscribe to personal notifications
            this.subscribeToNotifications();

            resolve(frame);
          };

          this.client.onStompError = (frame) => {
            console.error("STOMP Error:", frame);
            this.connected = false;
            reject(new Error("WebSocket connection failed"));
          };
          this.client.onWebSocketClose = (event) => {
            console.log("WebSocket connection closed:", event);
            this.connected = false;

            // Use stored token for reconnection
            if (this.currentToken) {
              this.handleReconnect(this.currentToken);
            }
          };

          this.client.onWebSocketError = (error) => {
            console.error("WebSocket error:", error);
            this.connected = false;
          };

          // Activate the client
          this.client.activate();
        } else {
          // If WebSocket is disabled, just resolve with a disabled status
          resolve({ status: "disabled" });
        }
      } catch (error) {
        console.error("Error creating WebSocket connection:", error);
        reject(error);
      }
    });
  }

  subscribeToNotifications() {
    if (!this.client || !this.connected) {
      console.warn("Cannot subscribe - client not connected");
      return;
    }

    try {
      // Subscribe to personal notification queue
      const subscription = this.client.subscribe(
        "/user/queue/notifications",
        (message) => {
          try {
            const notification = JSON.parse(message.body);
            console.log("Received notification:", notification);

            // Call all registered message handlers
            this.messageHandlers.forEach((handler, handlerName) => {
              try {
                handler(notification);
              } catch (error) {
                console.error(
                  `Error in message handler ${handlerName}:`,
                  error
                );
              }
            });
          } catch (error) {
            console.error("Error processing notification message:", error);
          }
        }
      );

      this.subscriptions.set("notifications", subscription);
      console.log("Subscribed to notifications");
    } catch (error) {
      console.error("Error subscribing to notifications:", error);
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
      console.log(
        `Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      setTimeout(() => {
        this.connect(token).catch((error) => {
          console.error("Reconnection failed:", error);
        });
      }, this.reconnectDelay);
    } else {
      console.error("Max reconnection attempts reached");
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
        console.error("Error deactivating STOMP client:", error);
      }

      this.client = null;
      this.connected = false;
      this.reconnectAttempts = 0;
    }
  }

  isConnected() {
    // Check if WebSocket is disabled
    if (this.webSocketDisabled) {
      return false;
    }
    
    // Return connection status
    return this.connected && this.client && this.client.connected;
  }

  // Send a message (if needed in the future)
  send(destination, body, headers = {}) {
    if (!this.isConnected()) {
      throw new Error("WebSocket not connected");
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
      headers,
    });
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

// Initialize the service
webSocketService.initialize();

export default webSocketService;
