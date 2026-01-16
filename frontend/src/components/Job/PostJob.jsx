import React, { useContext, useState } from "react";
import axios from "axios";
import api from "../../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Context } from "../../main";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaGlobeAmericas,
  FaCity,
  FaDollarSign,
  FaFileAlt,
  FaLayerGroup,
  FaPaperPlane,
} from "react-icons/fa";

const PostJob = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [location, setLocation] = useState("");
  const [salaryFrom, setSalaryFrom] = useState("");
  const [salaryTo, setSalaryTo] = useState("");
  const [fixedSalary, setFixedSalary] = useState("");
  const [salaryType, setSalaryType] = useState("default");

  const { isAuthorized, user } = useContext(Context);

  const handleJobPost = async (e) => {
    e.preventDefault();
    if (salaryType === "Fixed Salary") {
      setSalaryFrom("");
      setSalaryTo("");
    } else if (salaryType === "Ranged Salary") {
      setFixedSalary("");
    } else {
      setSalaryFrom("");
      setSalaryTo("");
      setFixedSalary("");
    }
    await api
      .post(
        "/api/v1/job/post",
        fixedSalary.length >= 4
          ? {
            title,
            description,
            category,
            country,
            city,
            location,
            fixedSalary,
          }
          : {
            title,
            description,
            category,
            country,
            city,
            location,
            salaryFrom,
            salaryTo,
          }
      )
      .then((res) => {
        toast.success(res.data.message);
      })
      .catch((err) => {
        toast.error(err.response.data.message);
      });
  };

  const navigateTo = useNavigate();
  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2d5649] to-[#3a6d5a] px-8 py-6">
            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
              <FaBriefcase className="text-2xl" />
              Post New Job
            </h2>
            <p className="text-green-100 mt-2">
              Fill in the details to create a new job posting
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleJobPost} className="p-8 space-y-6">
            {/* Job Title and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <FaBriefcase className="text-[#2d5649]" />
                  Job Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Senior React Developer"
                  className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent transition duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="category"
                  className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <FaLayerGroup className="text-[#2d5649]" />
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent transition duration-200"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Graphics & Design">Graphics & Design</option>
                  <option value="Mobile App Development">
                    Mobile App Development
                  </option>
                  <option value="Frontend Web Development">
                    Frontend Web Development
                  </option>
                  <option value="Backend Development">Backend Development</option>
                  <option value="Account & Finance">Account & Finance</option>
                  <option value="Artificial Intelligence">
                    Artificial Intelligence
                  </option>
                  <option value="Video Animation">Video Animation</option>
                  <option value="MEAN Stack Development">
                    MEAN STACK Development
                  </option>
                  <option value="MERN Stack Development">
                    MERN STACK Development
                  </option>
                  <option value="Data Entry Operator">Data Entry Operator</option>
                </select>
              </div>
            </div>

            {/* Location Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label
                  htmlFor="country"
                  className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <FaGlobeAmericas className="text-[#2d5649]" />
                  Country
                </label>
                <input
                  id="country"
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g., United States"
                  className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent transition duration-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="city"
                  className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
                >
                  <FaCity className="text-[#2d5649]" />
                  City
                </label>
                <input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., New York"
                  className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent transition duration-200"
                  required
                />
              </div>
            </div>

            {/* Full Location Address */}
            <div className="space-y-2">
              <label
                htmlFor="location"
                className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <FaMapMarkerAlt className="text-[#2d5649]" />
                Full Address/Location
              </label>
              <input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., 123 Main Street, Building A, Floor 5"
                className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent transition duration-200"
                required
              />
            </div>

            {/* Salary Section */}
            <div className="space-y-4 bg-gray-50 p-6 rounded-xl border border-gray-200">
              <label
                htmlFor="salaryType"
                className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <FaDollarSign className="text-[#2d5649]" />
                Salary Information
              </label>

              <select
                id="salaryType"
                value={salaryType}
                onChange={(e) => setSalaryType(e.target.value)}
                className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent transition duration-200 bg-white"
                required
              >
                <option value="default">Select Salary Type</option>
                <option value="Fixed Salary">Fixed Salary</option>
                <option value="Ranged Salary">Ranged Salary</option>
              </select>

              <div className="mt-4">
                {salaryType === "default" ? (
                  <p className="text-sm text-gray-500 italic flex items-center gap-2">
                    <span className="text-yellow-500">⚠️</span>
                    Please select a salary type to continue
                  </p>
                ) : salaryType === "Fixed Salary" ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Enter Fixed Salary (e.g., 75000)"
                      value={fixedSalary}
                      onChange={(e) => setFixedSalary(e.target.value)}
                      className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent transition duration-200 bg-white"
                      required
                      min="0"
                    />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">
                        Minimum Salary
                      </label>
                      <input
                        type="number"
                        placeholder="From (e.g., 50000)"
                        value={salaryFrom}
                        onChange={(e) => setSalaryFrom(e.target.value)}
                        className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent transition duration-200 bg-white"
                        required
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-medium text-gray-600">
                        Maximum Salary
                      </label>
                      <input
                        type="number"
                        placeholder="To (e.g., 80000)"
                        value={salaryTo}
                        onChange={(e) => setSalaryTo(e.target.value)}
                        className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent transition duration-200 bg-white"
                        required
                        min="0"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Job Description */}
            <div className="space-y-2">
              <label
                htmlFor="description"
                className="block text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <FaFileAlt className="text-[#2d5649]" />
                Job Description
              </label>
              <textarea
                id="description"
                rows="8"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a detailed description of the job role, responsibilities, requirements, and benefits..."
                className="input-field w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent transition duration-200 resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific and detailed to attract the right candidates
              </p>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn-primary w-full bg-[#2d5649] hover:bg-[#234439] text-white font-semibold py-4 px-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300 flex items-center justify-center gap-3 text-lg"
            >
              <FaPaperPlane />
              Create Job Posting
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default PostJob;