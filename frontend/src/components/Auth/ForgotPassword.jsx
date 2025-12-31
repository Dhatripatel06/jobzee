import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../../services/api";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLock2Fill } from "react-icons/ri";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP & Reset
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const payload = {
        method: "email",
        email,
      };

      const response = await forgotPassword(payload);
      toast.success(response.message);
      setIdentifier(response.identifier);
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      
      const payload = {
        otp,
        newPassword,
        method: "email",
        email,
      };

      const response = await resetPassword(payload);
      toast.success(response.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
        >
          <div className="text-center mb-8">
            <img
              src="/JobZeelogo.png"
              alt="JobZee Logo"
              className="h-20 w-auto mx-auto mb-4"
            />
            <h2 className="text-3xl font-bold text-secondary-900">
              {step === 1 ? "Forgot Password" : "Reset Password"}
            </h2>
            <p className="text-secondary-600 mt-2">
              {step === 1
                ? "Enter your details to receive OTP"
                : "Enter OTP and your new password"}
            </p>
          </div>

          {step === 1 ? (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pr-10"
                    required
                  />
                  <MdOutlineMailOutline className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400 text-xl" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  OTP will be sent to this email address
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>

              <div className="text-center">
                <Link
                  to="/login"
                  className="text-blue-600 hover:text-blue-700 font-semibold text-sm"
                >
                  ← Back to Login
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                OTP sent to {identifier}
              </div>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength="6"
                  className="input-field text-center text-2xl tracking-widest"
                  required
                />
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pr-10"
                    required
                    minLength="8"
                  />
                  <RiLock2Fill className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400 text-xl" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Minimum 8 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-secondary-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input-field pr-10"
                    required
                    minLength="8"
                  />
                  <RiLock2Fill className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400 text-xl" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:opacity-50"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-blue-600 hover:text-blue-700 font-semibold"
              >
                ← Back to Send OTP
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
};

export default ForgotPassword;
