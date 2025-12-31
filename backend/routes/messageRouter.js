import express from "express";
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  markAsDelivered,
  deleteMessage,
} from "../controllers/messageController.js";
import { isAuthorized } from "../middlewares/auth.js";

const router = express.Router();

router.post("/send", isAuthorized, sendMessage);
router.get("/conversations", isAuthorized, getConversations);
router.get("/conversation/:conversationId", isAuthorized, getMessages);
router.put("/conversation/:conversationId/read", isAuthorized, markAsRead);
router.put("/message/:messageId/delivered", isAuthorized, markAsDelivered);
router.delete("/message/:messageId", isAuthorized, deleteMessage);

export default router;
