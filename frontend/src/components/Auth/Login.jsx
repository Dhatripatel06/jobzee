import React, { useContext, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, Navigate } from "react-router-dom";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { RiLock2Fill } from "react-icons/ri";
import { motion } from "framer-motion";
import { sendOTPForLogin, verifyOTPAndLogin } from "../../services/api";
import socketService from "../../services/socketService";
import Cookies from "js-cookie";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [loginMode, setLoginMode] = useState("password"); // "password" or "otp"
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpIdentifier, setOtpIdentifier] = useState("");

  const { isAuthorized, setIsAuthorized } = useContext(Context);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/user/login",
        { email, password, role },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(data.message);
      setEmail("");
      setRole("");
      setPassword("");
      setIsAuthorized(true);
      
      // Store token in localStorage for socket connection
      if (data.token) {
        localStorage.setItem("token", data.token);
        console.log("Token stored in localStorage");
        
        // Initialize socket connection after successful login
        setTimeout(() => {
          socketService.connect(data.token);
        }, 100);
      }
    } catch (error) {
      const message = error.response?.data?.message || "Internal Server Error or Network Issue";
      toast.error(message);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        method: "email",
        role,
        email,
      };

      const response = await sendOTPForLogin(payload);
      toast.success(response.message);
      setOtpSent(true);
      setOtpIdentifier(response.identifier);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    try {
      const payload = {
        otp,
        method: "email",
        email,
      };

      const response = await verifyOTPAndLogin(payload);
      toast.success(response.message);
      setIsAuthorized(true);
      
      // Store token in localStorage for socket connection
      if (response.token) {
        localStorage.setItem("token", response.token);
        console.log("Token stored in localStorage");
        
        // Initialize socket connection after successful login
        setTimeout(() => {
          socketService.connect(response.token);
        }, 100);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };

  if (isAuthorized) {
    return <Navigate to={"/"} />;
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-accent-50 via-white to-primary-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Form */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl shadow-2xl p-8 md:p-12"
          >
            <div className="text-center mb-8">
              <img
                src="/JobZeelogo.png"
                alt="JobZee Logo"
                className="h-24 w-auto mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-secondary-900">
                Welcome Back
              </h2>
              <p className="text-secondary-600 mt-2">
                Login to your account to continue
              </p>
            </div>

            {/* Login Mode Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginMode("password");
                  setOtpSent(false);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  loginMode === "password"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Password
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMode("otp");
                  setOtpSent(false);
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-colors ${
                  loginMode === "otp"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                OTP
              </button>
            </div>

            {loginMode === "password" ? (
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label
                    htmlFor="role"
                    className="block text-sm font-semibold text-secondary-700 mb-2"
                  >
                    Login As
                  </label>
                  <div className="relative">
                    <select
                      id="role"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="input-field appearance-none pr-10"
                      required
                    >
                      <option value="">Select Role</option>
                      <option value="Employer">Employer</option>
                      <option value="Job Seeker">Job Seeker</option>
                    </select>
                    <FaRegUser className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-secondary-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-field pr-10"
                      required
                    />
                    <MdOutlineMailOutline className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400 text-xl" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-secondary-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field pr-10"
                      required
                    />
                    <RiLock2Fill className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400 text-xl" />
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Submit Button */}
                <button type="submit" className="btn-primary w-full">
                  Sign In
                </button>
              </form>
            ) : (
              <form onSubmit={otpSent ? handleVerifyOTP : handleSendOTP} className="space-y-6">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-semibold text-secondary-700 mb-2">
                    Login As
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="input-field appearance-none pr-10"
                      required
                      disabled={otpSent}
                    >
                      <option value="">Select Role</option>
                      <option value="Employer">Employer</option>
                      <option value="Job Seeker">Job Seeker</option>
                    </select>
                    <FaRegUser className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
                  </div>
                </div>

                {!otpSent && (
                  <>
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
                        OTP will be sent to this email
                      </p>
                    </div>

                    <button type="submit" className="btn-primary w-full">
                      Send OTP
                    </button>
                  </>
                )}

                {otpSent && (
                  <>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
                      OTP sent to {otpIdentifier}
                    </div>

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

                    <button type="submit" className="btn-primary w-full">
                      Verify & Login
                    </button>

                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="w-full text-sm text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Resend OTP
                    </button>
                  </>
                )}
              </form>
            )}

            {/* Register Link */}
            <div className="text-center mt-6">
              <p className="text-secondary-600">
                Don't have an account?{" "}
                <Link
                  to={"/register"}
                  className="text-accent-500 font-semibold hover:text-accent-600 transition-colors duration-200"
                >
                  Register Now
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Right side - Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex items-center justify-center"
          >
            <img
              src="/login.png"
              alt="Login Illustration"
              className="w-full max-w-lg h-auto drop-shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Login;







