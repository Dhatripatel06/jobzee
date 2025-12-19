import React, { useContext, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, Navigate } from "react-router-dom";
import { FaPencilAlt } from "react-icons/fa";
import { FaRegUser } from "react-icons/fa";
import { MdOutlineMailOutline } from "react-icons/md";
import { FaPhoneFlip } from "react-icons/fa6";
import { RiLock2Fill } from "react-icons/ri";
import { motion } from "framer-motion";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  const { isAuthorized, setIsAuthorized } = useContext(Context);

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(
        "http://localhost:4000/api/v1/user/register",
        { name, email, password, phone, role },
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success(data.message);
      setName("");
      setEmail("");
      setPhone("");
      setRole("");
      setPassword("");
      setIsAuthorized(true);
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  if (isAuthorized) {
    return <Navigate to={"/"} />;
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left side - Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden md:flex items-center justify-center order-2 md:order-1"
          >
            <img
              src="/register.png"
              alt="Register Illustration"
              className="w-full max-w-lg h-auto drop-shadow-2xl"
            />
          </motion.div>

          {/* Right side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 order-1 md:order-2"
          >
            <div className="text-center mb-8">
              <img
                src="/JobZeelogo.png"
                alt="JobZee Logo"
                className="h-24 w-auto mx-auto mb-4"
              />
              <h2 className="text-3xl font-bold text-secondary-900">
                Create Account
              </h2>
              <p className="text-secondary-600 mt-2">
                Join us and start your career journey
              </p>
            </div>

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Role Selection */}
              <div>
                <label
                  htmlFor="role"
                  className="block text-sm font-semibold text-secondary-700 mb-2"
                >
                  Register As
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

              {/* Name */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-secondary-700 mb-2"
                >
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-field pr-10"
                    required
                  />
                  <FaPencilAlt className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
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

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-secondary-700 mb-2"
                >
                  Phone Number
                </label>
                <div className="relative">
                  <input
                    id="phone"
                    type="tel"
                    placeholder="1234567890"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field pr-10"
                    required
                  />
                  <FaPhoneFlip className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400" />
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
                    placeholder="Create a strong password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pr-10"
                    required
                  />
                  <RiLock2Fill className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary-400 text-xl" />
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" className="btn-primary w-full">
                Create Account
              </button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-secondary-600">
                  Already have an account?{" "}
                  <Link
                    to={"/login"}
                    className="text-accent-500 font-semibold hover:text-accent-600 transition-colors duration-200"
                  >
                    Login Now
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Register;





