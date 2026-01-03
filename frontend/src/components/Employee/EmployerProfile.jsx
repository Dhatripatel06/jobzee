import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployerProfile } from "../../services/api";
import axios from "axios";
import { Context } from "../../main";
import { 
  FaBuilding, 
  FaEnvelope, 
  FaPhone, 
  FaArrowLeft, 
  FaComments, 
  FaGlobe,
  FaUsers,
  FaIndustry,
  FaBriefcase,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaCalendarAlt
} from "react-icons/fa";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const EmployerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const [employer, setEmployer] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const isOwnProfile = user && employer && user._id === employer._id;

  useEffect(() => {
    fetchEmployerProfile();
    fetchEmployerJobs();
  }, [id]);

  const fetchEmployerProfile = async () => {
    try {
      setLoading(true);
      const data = await getEmployerProfile(id);
      if (data.employee.role !== "Employer") {
        toast.error("This is not an employer profile");
        navigate("/employees");
        return;
      }
      setEmployer(data.employee);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch profile");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployerJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await axios.get(
        `http://localhost:4000/api/v1/job/getall`,
        { withCredentials: true }
      );
      // Filter jobs by this employer
      const employerJobs = response.data.jobs.filter(
        job => job.postedBy === id
      );
      setJobs(employerJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleStartChat = () => {
    navigate(`/chat?userId=${id}`);
  };

  const handleViewJob = (jobId) => {
    navigate(`/job/${jobId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#2d5649]"></div>
          <p className="mt-4 text-gray-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!employer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Company not found</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-[#2d5649] text-white rounded-lg hover:bg-[#3d7359]"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-[#2d5649] transition-colors"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Company Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow overflow-hidden mb-4"
        >
          {/* Cover Banner */}
          <div className="h-40 bg-gradient-to-r from-[#2d5649] via-[#3d7359] to-[#4d8569] relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
          </div>

          {/* Company Info */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-6 -mt-16 relative">
              {/* Company Logo */}
              <div className="flex-shrink-0">
                {employer.profilePhoto?.url ? (
                  <img
                    src={employer.profilePhoto.url}
                    alt={employer.name}
                    className="w-32 h-32 rounded-lg object-cover border-4 border-white shadow-xl bg-white"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-lg border-4 border-white shadow-xl bg-white flex items-center justify-center">
                    <FaBuilding className="w-16 h-16 text-[#2d5649]" />
                  </div>
                )}
              </div>

              {/* Company Name and Industry */}
              <div className="flex-1 pt-4 sm:pt-16">
                <h1 className="text-3xl font-bold text-gray-900">{employer.name}</h1>
                {employer.industry && (
                  <p className="text-lg text-gray-700 mt-1 flex items-center gap-2">
                    <FaIndustry className="text-[#2d5649]" />
                    {employer.industry}
                  </p>
                )}
                {employer.companySize && (
                  <p className="text-gray-600 mt-2 flex items-center gap-2">
                    <FaUsers className="text-[#2d5649]" />
                    {employer.companySize}
                  </p>
                )}
              </div>

              {/* Action Button */}
              <div className="flex flex-col gap-2 pt-4 sm:pt-16">
                {!isOwnProfile && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartChat}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2d5649] text-white font-semibold rounded-full hover:bg-[#3d7359] transition-colors"
                  >
                    <FaComments />
                    Contact Company
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* About Company */}
            {employer.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About the Company</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{employer.bio}</p>
              </motion.div>
            )}

            {/* Active Jobs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <FaBriefcase className="text-[#2d5649]" />
                Active Job Openings
                {jobs.length > 0 && (
                  <span className="ml-2 px-3 py-1 bg-[#2d5649] text-white text-sm rounded-full">
                    {jobs.length}
                  </span>
                )}
              </h2>
              
              {loadingJobs ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#2d5649]"></div>
                  <p className="mt-2 text-gray-600 text-sm">Loading jobs...</p>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-12">
                  <FaBriefcase className="mx-auto text-gray-300 text-5xl mb-4" />
                  <p className="text-gray-500">No active job openings at the moment</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobs.map((job) => (
                    <motion.div
                      key={job._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleViewJob(job._id)}
                      className="border border-gray-200 rounded-lg p-4 hover:border-[#2d5649] hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-[#2d5649]">
                            {job.title}
                          </h3>
                          {job.location && (
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                              <FaMapMarkerAlt className="text-xs" />
                              {job.location}
                            </p>
                          )}
                          {job.category && (
                            <p className="text-sm text-gray-600 mt-1">
                              {job.category}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          {job.fixedSalary ? (
                            <p className="text-[#2d5649] font-semibold flex items-center gap-1">
                              <FaMoneyBillWave className="text-sm" />
                              ${job.fixedSalary.toLocaleString()}
                            </p>
                          ) : job.salaryFrom && job.salaryTo ? (
                            <p className="text-[#2d5649] font-semibold flex items-center gap-1">
                              <FaMoneyBillWave className="text-sm" />
                              ${job.salaryFrom.toLocaleString()} - ${job.salaryTo.toLocaleString()}
                            </p>
                          ) : null}
                          {job.jobType && (
                            <p className="text-xs text-gray-500 mt-1">{job.jobType}</p>
                          )}
                        </div>
                      </div>
                      {job.description && (
                        <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaCalendarAlt />
                          Posted {new Date(job.jobPostedOn).toLocaleDateString()}
                        </span>
                        <span className="text-[#2d5649] font-medium hover:underline">
                          View Details →
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Company Website */}
            {employer.companyWebsite && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Website</h2>
                <a
                  href={employer.companyWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[#2d5649] hover:text-[#3d7359] font-medium"
                >
                  <FaGlobe />
                  Visit Website →
                </a>
              </motion.div>
            )}

            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Info</h2>
              <div className="space-y-3">
                {employer.showEmail && employer.email ? (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaEnvelope className="text-[#2d5649] flex-shrink-0" />
                    <a
                      href={`mailto:${employer.email}`}
                      className="hover:text-[#2d5649] transition-colors text-sm break-all"
                    >
                      {employer.email}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <FaEnvelope className="flex-shrink-0" />
                    <span className="text-sm">Email not shared</span>
                  </div>
                )}

                {employer.showPhone && employer.phone ? (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaPhone className="text-[#2d5649] flex-shrink-0" />
                    <a
                      href={`tel:${employer.phone}`}
                      className="hover:text-[#2d5649] transition-colors text-sm"
                    >
                      {employer.phone}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <FaPhone className="flex-shrink-0" />
                    <span className="text-sm">Phone not shared</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-4 italic">
                Contact visibility based on privacy settings
              </p>
            </motion.div>

            {/* Company Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 text-sm">Active Jobs</span>
                  <span className="text-lg font-bold text-[#2d5649]">{jobs.length}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t">
                  <span className="text-gray-600 text-sm">Member since</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(employer.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployerProfile;
