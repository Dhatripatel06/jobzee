import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  email: {
    type: String,
  },
  phone: {
    type: Number,
  },
  otp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["login", "forgotPassword"],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
  },
  verified: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for automatic cleanup (TTL)
otpSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

export const OTP = mongoose.model("OTP", otpSchema);
