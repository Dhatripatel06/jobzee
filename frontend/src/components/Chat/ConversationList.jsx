import React, { useState, useEffect, useContext } from "react";
import { Context } from "../../main";
import { getConversations } from "../../services/api";
import socketService from "../../services/socketService";
import { FaUserCircle, FaSearch } from "react-icons/fa";
import toast from "react-hot-toast";

const ConversationList = ({ onSelectConversation, selectedConversationId }) => {
  const { user } = useContext(Context);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  useEffect(() => {
    fetchConversations();
    setupSocketListeners();

    return () => {
      cleanupSocketListeners();
    };
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations();
      setConversations(data.conversations);
    } catch (error) {
      toast.error("Failed to fetch conversations");
    } finally {
      setLoading(false);
    }
  };

  const setupSocketListeners = () => {
    // Listen for online users
    socketService.on("onlineUsers", (users) => {
      setOnlineUsers(new Set(users));
    });

    // Listen for user online status
    socketService.on("userOnline", ({ userId }) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
      updateUserOnlineStatus(userId, true);
    });

    // Listen for user offline status
    socketService.on("userOffline", ({ userId }) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
      updateUserOnlineStatus(userId, false);
    });

    // Listen for new messages
    socketService.on("newMessage", (message) => {
      updateConversationWithNewMessage(message);
    });

    // Listen for sent messages
    socketService.on("messageSent", (message) => {
      updateConversationWithNewMessage(message);
    });
  };

  const cleanupSocketListeners = () => {
    socketService.removeAllListeners("onlineUsers");
    socketService.removeAllListeners("userOnline");
    socketService.removeAllListeners("userOffline");
    socketService.removeAllListeners("newMessage");
    socketService.removeAllListeners("messageSent");
  };

  const updateUserOnlineStatus = (userId, isOnline) => {
    setConversations((prevConvs) =>
      prevConvs.map((conv) =>
        conv.participant._id === userId
          ? {
              ...conv,
              participant: { ...conv.participant, isOnline },
            }
          : conv
      )
    );
  };

  const updateConversationWithNewMessage = (message) => {
    setConversations((prevConvs) => {
      const updatedConvs = prevConvs.map((conv) => {
        if (conv._id === message.conversationId) {
          const isForMe = message.receiver._id === user._id;
          return {
            ...conv,
            lastMessage: message,
            unreadCount: isForMe ? conv.unreadCount + 1 : conv.unreadCount,
            updatedAt: new Date(),
          };
        }
        return conv;
      });

      // Sort by most recent
      return updatedConvs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participant.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffInMs = now - d;
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <div className="h-full flex flex-col bg-white border-r">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Messages</h2>
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600 text-sm">Loading...</p>
            </div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center px-4">
              {search ? "No conversations found" : "No conversations yet"}
            </p>
          </div>
        ) : (
          <div>
            {filteredConversations.map((conv) => {
              const isOnline = onlineUsers.has(conv.participant._id);
              const isSelected = selectedConversationId === conv._id;

              return (
                <div
                  key={conv._id}
                  onClick={() => onSelectConversation(conv)}
                  className={`flex items-center gap-3 p-4 cursor-pointer transition-colors border-b ${
                    isSelected
                      ? "bg-blue-50 border-l-4 border-l-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* Profile Photo with Online Status */}
                  <div className="relative flex-shrink-0">
                    {conv.participant.profilePhoto?.url ? (
                      <img
                        src={conv.participant.profilePhoto.url}
                        alt={conv.participant.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="w-12 h-12 text-gray-300" />
                    )}
                    <span
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                  </div>

                  {/* Conversation Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conv.participant.name}
                      </h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-gray-600 truncate">
                        {conv.lastMessage.sender === user._id ? "You: " : ""}
                        {conv.lastMessage.content}
                      </p>
                    )}
                  </div>

                  {/* Unread Count Badge */}
                  {conv.unreadCount > 0 && (
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-blue-600 rounded-full">
                        {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationList;
