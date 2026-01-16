import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import ConversationList from "./ConversationList";
import MessageBox from "./MessageBox";
import socketService from "../../services/socketService";
import Cookies from "js-cookie";
import axios from "axios";
import api from "../../services/api";
import toast from "react-hot-toast";

const Chat = () => {
  const { isAuthorized, user } = useContext(Context);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  // Redirect to login if not authorized
  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
    }
  }, [isAuthorized, navigate]);

  useEffect(() => {
    // Handle window resize
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Initialize socket connection when user is authorized
    if (isAuthorized && user) {
      const token = localStorage.getItem("token");
      console.log("Chat: Checking socket connection. Token:", token ? "exists" : "missing", "Connected:", socketService.isConnected());

      if (token && !socketService.isConnected()) {
        console.log("Chat: Initializing socket connection...");
        socketService.connect(token);

        // Wait a bit and check connection status
        setTimeout(() => {
          setSocketConnected(socketService.isConnected());
        }, 1000);
      } else {
        setSocketConnected(socketService.isConnected());
      }

      // Listen for new messages in real-time
      socketService.on("newMessage", (message) => {
        // This will be handled by MessageBox component
        console.log("New message received:", message);
      });
    }

    return () => {
      // Don't disconnect on unmount as we want to keep connection active
      // Socket will be disconnected on logout
      socketService.off("newMessage");
    };
  }, [isAuthorized, user]);

  useEffect(() => {
    // Check if there's a userId in query params to start a new conversation
    const userId = searchParams.get("userId");
    if (userId && isAuthorized && user) {
      startConversationWithUser(userId);
    }
  }, [searchParams, isAuthorized, user]);

  const startConversationWithUser = async (userId) => {
    try {
      setLoadingConversation(true);

      // Check if conversation already exists
      const { data: conversationsData } = await api.get("/api/v1/message/conversations");

      // Find existing conversation with this user
      const existingConversation = conversationsData.conversations?.find(
        (conv) => conv.participants?.some((p) => p._id === userId)
      );

      if (existingConversation) {
        // Use existing conversation
        setSelectedConversation(existingConversation);
      } else {
        // Fetch user details to create a virtual conversation
        const { data: userData } = await api.get(
          `/api/v1/user/employee/${userId}`
        );

        // Create a virtual conversation object
        const virtualConversation = {
          _id: `new_${userId}`,
          participants: [userData.employee],
          isNew: true,
        };

        setSelectedConversation(virtualConversation);
      }

      // Clear the userId from URL
      navigate("/chat", { replace: true });
    } catch (error) {
      console.error("Error starting conversation:", error);
      toast.error("Failed to start conversation");
    } finally {
      setLoadingConversation(false);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const handleReconnect = () => {
    const token = localStorage.getItem("token");
    if (token) {
      console.log("Manual reconnect triggered");
      socketService.disconnect();
      setTimeout(() => {
        socketService.connect(token);
        setTimeout(() => {
          setSocketConnected(socketService.isConnected());
          if (socketService.isConnected()) {
            toast.success("Socket reconnected!");
          } else {
            toast.error("Failed to reconnect socket");
          }
        }, 1000);
      }, 100);
    } else {
      toast.error("No authentication token found");
    }
  };

  // Show loading state
  if (loadingConversation) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5649] mx-auto mb-4"></div>
          <p className="text-gray-600">Starting conversation...</p>
        </div>
      </div>
    );
  }

  // Mobile view: show either list or messages
  if (isMobileView) {
    return (
      <div className="h-screen flex flex-col">
        {/* Socket Status Banner */}
        {!socketConnected && (
          <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 flex items-center justify-between">
            <span className="text-yellow-800 text-sm">⚠️ Real-time messaging disconnected</span>
            <button
              onClick={handleReconnect}
              className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
            >
              Reconnect
            </button>
          </div>
        )}
        {selectedConversation ? (
          <MessageBox conversation={selectedConversation} onBack={handleBack} />
        ) : (
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?._id}
          />
        )}
      </div>
    );
  }

  // Desktop view: show both list and messages side by side
  return (
    <div className="h-screen flex flex-col">
      {/* Socket Status Banner */}
      {!socketConnected && (
        <div className="bg-yellow-100 border-b border-yellow-200 px-4 py-2 flex items-center justify-between">
          <span className="text-yellow-800 text-sm">⚠️ Real-time messaging disconnected. Click reconnect or refresh the page.</span>
          <button
            onClick={handleReconnect}
            className="text-xs bg-yellow-600 text-white px-3 py-1 rounded hover:bg-yellow-700"
          >
            Reconnect
          </button>
        </div>
      )}
      <div className="flex flex-1">
        <div className="w-1/3 border-r">
          <ConversationList
            onSelectConversation={handleSelectConversation}
            selectedConversationId={selectedConversation?._id}
          />
        </div>
        <div className="flex-1">
          <MessageBox conversation={selectedConversation} onBack={handleBack} />
        </div>
      </div>
    </div>
  );
};

export default Chat;
