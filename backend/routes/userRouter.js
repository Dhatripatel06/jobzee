import express from "express";
import { isAuthorized } from "../middlewares/auth.js";
import { 
  getUser, 
  login, 
  logout, 
  register, 
  updateProfile,
  getAllEmployees,
  getEmployeeProfile,
  updateEmployeeProfile,
  sendOTPForLogin,
  verifyOTPAndLogin,
  forgotPassword,
  verifyOTPAndResetPassword,
  addConnection,
  removeConnection,
  getConnections,
  getConnectionStatus,
} from "../controllers/userController.js";

const router = express.Router();

// Basic auth routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", isAuthorized, logout);
router.get("/getuser", isAuthorized, getUser);
router.put("/update", isAuthorized, updateProfile);

// Employee profile routes
router.get("/employees", isAuthorized, getAllEmployees);
router.get("/employee/:id", isAuthorized, getEmployeeProfile);
router.put("/employee/profile", isAuthorized, updateEmployeeProfile);

// Connection system routes
router.post("/connect/:id", isAuthorized, addConnection);
router.delete("/connect/:id", isAuthorized, removeConnection);
router.get("/connections", isAuthorized, getConnections);
router.get("/connection-status/:id", isAuthorized, getConnectionStatus);

// OTP-based login routes
router.post("/otp/send", sendOTPForLogin);
router.post("/otp/verify", verifyOTPAndLogin);

// Forgot password routes
router.post("/password/forgot", forgotPassword);
router.post("/password/reset", verifyOTPAndResetPassword);

export default router;