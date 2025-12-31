import React, { useState, useEffect, useContext } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import ConversationList from "./ConversationList";
import MessageBox from "./MessageBox";
import socketService from "../../services/socketService";
import Cookies from "js-cookie";
import axios from "axios";
import toast from "react-hot-toast";

const Chat = () => {
  const { isAuthorized, user } = useContext(Context);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [loadingConversation, setLoadingConversation] = useState(false);

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
      const token = Cookies.get("token");
      if (token && !socketService.isConnected()) {
        socketService.connect(token);
      }
    }

    return () => {
      // Don't disconnect on unmount as we want to keep connection active
      // Socket will be disconnected on logout
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
      const { data: conversationsData } = await axios.get(
        "http://localhost:4000/api/v1/message/conversations",
        { withCredentials: true }
      );

      // Find existing conversation with this user
      const existingConversation = conversationsData.conversations.find(
        (conv) => conv.participants.some((p) => p._id === userId)
      );

      if (existingConversation) {
        // Use existing conversation
        setSelectedConversation(existingConversation);
      } else {
        // Fetch user details to create a virtual conversation
        const { data: userData } = await axios.get(
          `http://localhost:4000/api/v1/user/employee/${userId}`,
          { withCredentials: true }
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
    <div className="h-screen flex">
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
  );
};

export default Chat;
