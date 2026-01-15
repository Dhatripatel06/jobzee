import cloudinary from "cloudinary";
import { config } from "dotenv";

// Load environment variables first
config({ path: "./config/config.env" });

// Configure cloudinary before importing app
console.log('Cloudinary Config:', {
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET ? '***configured***' : 'missing'
});

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API,
  api_secret: process.env.CLOUDINARY_CLIENT_SECRET,
});

import app from "./app.js";
import { createServer } from "http";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { User } from "./models/userSchema.js";
import { Message } from "./models/messageSchema.js";
import { Conversation } from "./models/conversationSchema.js";

// Create HTTP server
const httpServer = createServer(app);

// Socket.IO configuration
const io = new Server(httpServer, {
  cors: {
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Store online users: { userId: socketId }
const onlineUsers = new Map();

// Socket.IO authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error("Authentication error"));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new Error("User not found"));
    }
    
    socket.userId = user._id.toString();
    socket.user = user;
    next();
  } catch (error) {
    next(new Error("Authentication error"));
  }
});

// Socket.IO connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Add user to online users
  onlineUsers.set(socket.userId, socket.id);
  
  // Update user's online status
  User.findByIdAndUpdate(socket.userId, { 
    isOnline: true,
    lastSeen: new Date(),
  }).catch(err => console.error("Error updating online status:", err));
  
  // Broadcast online status to all connected users
  io.emit("userOnline", { userId: socket.userId, isOnline: true });
  
  // Join user's personal room
  socket.join(socket.userId);
  
  // Send online users list to the newly connected user
  socket.emit("onlineUsers", Array.from(onlineUsers.keys()));
  
  // Handle sending messages
  socket.on("sendMessage", async (data) => {
    try {
      const { receiverId, content, conversationId } = data;
      
      let conversation;
      
      // Find or create conversation
      if (conversationId) {
        conversation = await Conversation.findById(conversationId);
      }
      
      if (!conversation) {
        // Check if conversation already exists
        conversation = await Conversation.findOne({
          participants: { $all: [socket.userId, receiverId] }
        });
        
        // Create new conversation if it doesn't exist
        if (!conversation) {
          conversation = await Conversation.create({
            participants: [socket.userId, receiverId],
            unreadCount: new Map(),
          });
        }
      }
      
      // Create message in database
      const message = await Message.create({
        conversationId: conversation._id,
        sender: socket.userId,
        receiver: receiverId,
        content,
        status: "sent",
      });
      
      await message.populate("sender", "name profilePhoto");
      await message.populate("receiver", "name profilePhoto");
      
      // Update conversation
      await Conversation.findByIdAndUpdate(conversation._id, {
        lastMessage: message._id,
        $inc: { [`unreadCount.${receiverId}`]: 1 },
      });
      
      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
        
        // Auto-mark as delivered
        message.status = "delivered";
        message.deliveredAt = new Date();
        await message.save();
        
        // Notify sender about delivery
        socket.emit("messageDelivered", { messageId: message._id, conversationId: conversation._id });
      }
      
      // Send confirmation to sender
      socket.emit("messageSent", message);
      
    } catch (error) {
      console.error("Error sending message:", error);
      socket.emit("messageError", { error: error.message });
    }
  });
  
  // Handle typing indicator
  socket.on("typing", (data) => {
    const { receiverId, isTyping } = data;
    const receiverSocketId = onlineUsers.get(receiverId);
    
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("userTyping", {
        userId: socket.userId,
        isTyping,
      });
    }
  });
  
  // Handle message read status
  socket.on("markAsRead", async (data) => {
    try {
      const { conversationId, senderId } = data;
      
      // Update all unread messages
      await Message.updateMany(
        {
          conversationId,
          sender: senderId,
          receiver: socket.userId,
          status: { $ne: "read" },
        },
        {
          status: "read",
          readAt: new Date(),
        }
      );
      
      // Update conversation unread count
      await Conversation.findByIdAndUpdate(conversationId, {
        [`unreadCount.${socket.userId}`]: 0,
      });
      
      // Notify sender
      const senderSocketId = onlineUsers.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("messagesRead", {
          conversationId,
          readBy: socket.userId,
        });
      }
      
    } catch (error) {
      console.error("Error marking messages as read:", error);
    }
  });
  
  // Handle disconnection
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.userId}`);
    
    // Remove from online users
    onlineUsers.delete(socket.userId);
    
    // Update user's offline status
    try {
      await User.findByIdAndUpdate(socket.userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
      
      // Broadcast offline status
      io.emit("userOffline", { userId: socket.userId, isOnline: false });
    } catch (error) {
      console.error("Error updating offline status:", error);
    }
  });
});

// Export io for use in other files if needed
export { io };

httpServer.listen(process.env.PORT, () => {
  console.log(`Server running at port ${process.env.PORT}`);
});