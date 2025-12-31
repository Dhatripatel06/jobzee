import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// ==================== EMPLOYEE PROFILE APIs ====================

export const getAllEmployees = async (params = {}) => {
  const response = await api.get("/user/employees", { params });
  return response.data;
};

export const getEmployeeProfile = async (id) => {
  const response = await api.get(`/user/employee/${id}`);
  return response.data;
};

export const updateEmployeeProfile = async (formData) => {
  const response = await api.put("/user/employee/profile", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// ==================== MESSAGING APIs ====================

export const sendMessage = async (data) => {
  const response = await api.post("/message/send", data);
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get("/message/conversations");
  return response.data;
};

export const getMessages = async (conversationId, page = 1) => {
  const response = await api.get(`/message/conversation/${conversationId}`, {
    params: { page },
  });
  return response.data;
};

export const markMessagesAsRead = async (conversationId) => {
  const response = await api.put(`/message/conversation/${conversationId}/read`);
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await api.delete(`/message/message/${messageId}`);
  return response.data;
};

// ==================== OTP LOGIN APIs ====================

export const sendOTPForLogin = async (data) => {
  const response = await api.post("/user/otp/send", data);
  return response.data;
};

export const verifyOTPAndLogin = async (data) => {
  const response = await api.post("/user/otp/verify", data);
  return response.data;
};

// ==================== FORGOT PASSWORD APIs ====================

export const forgotPassword = async (data) => {
  const response = await api.post("/user/password/forgot", data);
  return response.data;
};

export const resetPassword = async (data) => {
  const response = await api.post("/user/password/reset", data);
  return response.data;
};

export default api;
