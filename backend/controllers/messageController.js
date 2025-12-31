import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../middlewares/error.js";
import { Message } from "../models/messageSchema.js";
import { Conversation } from "../models/conversationSchema.js";
import { User } from "../models/userSchema.js";

// Send a new message
export const sendMessage = catchAsyncError(async (req, res, next) => {
  const { receiverId, content, messageType = "text" } = req.body;
  const senderId = req.user._id;

  if (!receiverId || !content) {
    return next(new ErrorHandler("Receiver and message content are required", 400));
  }

  // Check if receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    return next(new ErrorHandler("Receiver not found", 404));
  }

  // Find or create conversation
  let conversation = await Conversation.findOne({
    participants: { $all: [senderId, receiverId] },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      participants: [senderId, receiverId],
      unreadCount: {
        [senderId]: 0,
        [receiverId]: 0,
      },
    });
  }

  // Create message
  const message = await Message.create({
    conversationId: conversation._id,
    sender: senderId,
    receiver: receiverId,
    content,
    messageType,
    status: "sent",
  });

  // Update conversation with last message
  conversation.lastMessage = message._id;
  
  // Increment unread count for receiver
  const unreadCount = conversation.unreadCount.get(receiverId.toString()) || 0;
  conversation.unreadCount.set(receiverId.toString(), unreadCount + 1);
  
  await conversation.save();

  // Populate sender info for response
  await message.populate("sender", "name profilePhoto");
  await message.populate("receiver", "name profilePhoto");

  res.status(201).json({
    success: true,
    message: message,
    conversationId: conversation._id,
  });
});

// Get all conversations for current user
export const getConversations = catchAsyncError(async (req, res, next) => {
  const userId = req.user._id;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "name email role profilePhoto isOnline lastSeen")
    .populate({
      path: "lastMessage",
      select: "content sender createdAt status",
    })
    .sort({ updatedAt: -1 });

  // Format conversations to show other participant's info
  const formattedConversations = conversations.map((conv) => {
    const otherParticipant = conv.participants.find(
      (p) => p._id.toString() !== userId.toString()
    );
    
    const unreadCount = conv.unreadCount.get(userId.toString()) || 0;

    return {
      _id: conv._id,
      participant: otherParticipant,
      lastMessage: conv.lastMessage,
      unreadCount: unreadCount,
      updatedAt: conv.updatedAt,
    };
  });

  res.status(200).json({
    success: true,
    conversations: formattedConversations,
  });
});

// Get messages for a specific conversation
export const getMessages = catchAsyncError(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;

  // Check if user is part of this conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    return next(new ErrorHandler("Conversation not found or access denied", 404));
  }

  // Get messages with pagination
  const messages = await Message.find({ conversationId })
    .populate("sender", "name profilePhoto")
    .populate("receiver", "name profilePhoto")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const totalMessages = await Message.countDocuments({ conversationId });

  res.status(200).json({
    success: true,
    messages: messages.reverse(), // Reverse to show oldest first
    pagination: {
      currentPage: page,
      totalPages: Math.ceil(totalMessages / limit),
      totalMessages,
    },
  });
});

// Mark messages as read
export const markAsRead = catchAsyncError(async (req, res, next) => {
  const { conversationId } = req.params;
  const userId = req.user._id;

  // Check if user is part of this conversation
  const conversation = await Conversation.findOne({
    _id: conversationId,
    participants: userId,
  });

  if (!conversation) {
    return next(new ErrorHandler("Conversation not found or access denied", 404));
  }

  // Update all unread messages in this conversation where user is receiver
  await Message.updateMany(
    {
      conversationId,
      receiver: userId,
      status: { $ne: "read" },
    },
    {
      $set: {
        status: "read",
        readAt: new Date(),
      },
    }
  );

  // Reset unread count for this user
  conversation.unreadCount.set(userId.toString(), 0);
  await conversation.save();

  res.status(200).json({
    success: true,
    message: "Messages marked as read",
  });
});

// Mark message as delivered
export const markAsDelivered = catchAsyncError(async (req, res, next) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findOne({
    _id: messageId,
    receiver: userId,
  });

  if (!message) {
    return next(new ErrorHandler("Message not found", 404));
  }

  if (message.status === "sent") {
    message.status = "delivered";
    message.deliveredAt = new Date();
    await message.save();
  }

  res.status(200).json({
    success: true,
    message: "Message marked as delivered",
  });
});

// Delete a message
export const deleteMessage = catchAsyncError(async (req, res, next) => {
  const { messageId } = req.params;
  const userId = req.user._id;

  const message = await Message.findOne({
    _id: messageId,
    sender: userId,
  });

  if (!message) {
    return next(new ErrorHandler("Message not found or unauthorized", 404));
  }

  await message.deleteOne();

  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
  });
});
