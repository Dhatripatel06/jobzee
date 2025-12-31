import { io } from "socket.io-client";

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  // Initialize socket connection
  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    // Setup default listeners
    this.socket.on("connect", () => {
      console.log("Socket connected:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    return this.socket;
  }

  // Disconnect socket
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Check if connected
  isConnected() {
    return this.socket?.connected || false;
  }

  // Emit event
  emit(event, data) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Socket not connected. Cannot emit:", event);
    }
  }

  // Listen to event
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store listener for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  // Remove listener
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored listeners
      if (this.listeners.has(event)) {
        const callbacks = this.listeners.get(event);
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      this.listeners.delete(event);
    }
  }

  // Send message
  sendMessage(receiverId, content, conversationId) {
    this.emit("sendMessage", {
      receiverId,
      content,
      conversationId,
    });
  }

  // Send typing indicator
  sendTyping(receiverId, isTyping) {
    this.emit("typing", {
      receiverId,
      isTyping,
    });
  }

  // Mark messages as read
  markAsRead(conversationId, senderId) {
    this.emit("markAsRead", {
      conversationId,
      senderId,
    });
  }

  // Get socket instance
  getSocket() {
    return this.socket;
  }
}

// Export singleton instance
const socketService = new SocketService();
export default socketService;
