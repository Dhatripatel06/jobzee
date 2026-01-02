import React, { useState, useEffect, useRef, useContext } from "react";
import { Context } from "../../main";
import { getMessages, markMessagesAsRead } from "../../services/api";
import socketService from "../../services/socketService";
import { FaUserCircle, FaPaperPlane, FaArrowLeft } from "react-icons/fa";
import toast from "react-hot-toast";

const MessageBox = ({ conversation, onBack }) => {
  const { user } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  console.log("MessageBox - Conversation:", conversation);

  // Get the other participant in the conversation
  const otherParticipant = conversation?.participants?.find(
    (participant) => participant._id !== user?._id
  ) || conversation?.participants?.[0] || conversation?.participant;

  console.log("MessageBox - Other participant:", otherParticipant);

  useEffect(() => {
    if (conversation) {
      fetchMessages();
      markConversationAsRead();
      setupSocketListeners();
    }

    return () => {
      cleanupSocketListeners();
    };
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    if (!conversation || conversation.isNew) return;
    
    try {
      setLoading(true);
      const data = await getMessages(conversation._id);
      setMessages(data.messages);
    } catch (error) {
      toast.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  const markConversationAsRead = async () => {
    if (!conversation || conversation.isNew || !otherParticipant) return;
    
    try {
      await markMessagesAsRead(conversation._id);
      socketService.markAsRead(conversation._id, otherParticipant._id);
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  };

  const setupSocketListeners = () => {
    if (!otherParticipant) return;

    // Listen for messages FROM the other participant
    socketService.on("newMessage", (message) => {
      console.log("📨 Received newMessage:", message);
      const conversationId = conversation.isNew ? `new_${otherParticipant._id}` : conversation._id;
      
      // Check if this message belongs to this conversation
      const isForThisConversation = 
        message.conversationId === conversationId || 
        message.conversationId === conversation._id ||
        (message.sender && message.sender._id === otherParticipant._id) ||
        (message.sender === otherParticipant._id);
      
      if (isForThisConversation) {
        console.log("✅ Adding message to conversation");
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some((m) => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
        
        if (!conversation.isNew) {
          markConversationAsRead();
        }
      }
    });

    // Listen for messages sent BY the current user
    socketService.on("messageSent", (message) => {
      console.log("📤 Received messageSent:", message);
      const conversationId = conversation.isNew ? `new_${otherParticipant._id}` : conversation._id;
      
      // Check if this message belongs to this conversation
      const isForThisConversation = 
        message.conversationId === conversationId || 
        message.conversationId === conversation._id ||
        (message.receiver && message.receiver._id === otherParticipant._id) ||
        (message.receiver === otherParticipant._id);
      
      if (isForThisConversation) {
        console.log("✅ Adding sent message to conversation");
        setMessages((prev) => {
          // Check if message already exists
          const exists = prev.some((m) => m._id === message._id);
          if (exists) return prev;
          return [...prev, message];
        });
      }
    });

    socketService.on("messageDelivered", ({ messageId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId ? { ...msg, status: "delivered" } : msg
        )
      );
    });

    socketService.on("messagesRead", ({ conversationId }) => {
      const currentConversationId = conversation.isNew ? `new_${otherParticipant._id}` : conversation._id;
      if (conversationId === currentConversationId) {
        setMessages((prev) =>
          prev.map((msg) => ({ ...msg, status: "read" }))
        );
      }
    });

    socketService.on("userTyping", ({ userId, isTyping }) => {
      if (userId === otherParticipant._id) {
        setIsTyping(isTyping);
      }
    });
  };

  const cleanupSocketListeners = () => {
    socketService.removeAllListeners("newMessage");
    socketService.removeAllListeners("messageSent");
    socketService.removeAllListeners("messageDelivered");
    socketService.removeAllListeners("messagesRead");
    socketService.removeAllListeners("userTyping");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTyping = (value) => {
    if (!otherParticipant) return;
    
    setNewMessage(value);

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Send typing indicator
    socketService.sendTyping(otherParticipant._id, true);

    // Stop typing after 1 second of no input
    typingTimeoutRef.current = setTimeout(() => {
      socketService.sendTyping(otherParticipant._id, false);
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim() || sending || !otherParticipant) return;

    try {
      setSending(true);
      
      // For new conversations, use null as conversationId (will be created on backend)
      const conversationId = conversation.isNew ? null : conversation._id;
      
      // Send via socket for real-time delivery
      socketService.sendMessage(
        otherParticipant._id,
        newMessage.trim(),
        conversationId
      );

      setNewMessage("");
      
      // Stop typing indicator
      socketService.sendTyping(otherParticipant._id, false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return "Today";
    } else if (d.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
  };

  const renderMessages = () => {
    let lastDate = null;
    const elements = [];

    messages.forEach((message, index) => {
      const messageDate = new Date(message.createdAt).toDateString();
      
      // Add date divider if date changed
      if (messageDate !== lastDate) {
        elements.push(
          <div key={`date-${index}`} className="flex justify-center my-4">
            <span className="px-4 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
              {formatDate(message.createdAt)}
            </span>
          </div>
        );
        lastDate = messageDate;
      }

      const isOwnMessage = message.sender._id === user._id;

      elements.push(
        <div
          key={message._id}
          className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-3`}
        >
          <div
            className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
              isOwnMessage
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            <p className="break-words">{message.content}</p>
            <div className={`flex items-center gap-2 mt-1 text-xs ${
              isOwnMessage ? "text-blue-100" : "text-gray-600"
            }`}>
              <span>{formatTime(message.createdAt)}</span>
              {isOwnMessage && (
                <span>
                  {message.status === "sent" && "✓"}
                  {message.status === "delivered" && "✓✓"}
                  {message.status === "read" && (
                    <span className="text-blue-200">✓✓</span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>
      );
    });

    return elements;
  };

  if (!conversation || !otherParticipant) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-center px-4">
          Select a conversation to start messaging
        </p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center gap-3 bg-gray-50">
        <button
          onClick={onBack}
          className="md:hidden p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
          <FaArrowLeft />
        </button>
        
        {otherParticipant.profilePhoto?.url ? (
          <img
            src={otherParticipant.profilePhoto.url}
            alt={otherParticipant.name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <FaUserCircle className="w-10 h-10 text-gray-300" />
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {otherParticipant.name}
          </h3>
          <p className="text-sm text-gray-600">
            {otherParticipant.isOnline ? (
              <span className="text-green-600">● Online</span>
            ) : otherParticipant.lastSeen ? (
              `Last seen ${new Date(otherParticipant.lastSeen).toLocaleDateString()}`
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              No messages yet. Start the conversation!
            </p>
          </div>
        ) : (
          <>
            {renderMessages()}
            {isTyping && (
              <div className="flex items-center gap-2 text-gray-600 text-sm mb-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></span>
                </div>
                <span>{otherParticipant.name} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <FaPaperPlane />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageBox;
