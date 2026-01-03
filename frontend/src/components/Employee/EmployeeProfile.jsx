import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeProfile } from "../../services/api";
import { Context } from "../../main";
import { 
  FaUserCircle, 
  FaEnvelope, 
  FaPhone, 
  FaArrowLeft, 
  FaComments, 
  FaEdit,
  FaBriefcase,
  FaGraduationCap,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaLinkedin
} from "react-icons/fa";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(Context);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = user && employee && user._id === employee._id;

  useEffect(() => {
    fetchEmployeeProfile();
  }, [id]);

  const fetchEmployeeProfile = async () => {
    try {
      setLoading(true);
      const data = await getEmployeeProfile(id);
      setEmployee(data.employee);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch profile");
      navigate("/employees");
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    navigate(`/chat?userId=${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">Employee not found</p>
          <button
            onClick={() => navigate("/employees")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Employees
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate("/employees")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#2d5649] transition-colors"
          >
            <FaArrowLeft />
            <span>Back to Employees</span>
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* LinkedIn-Style Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow overflow-hidden mb-4"
        >
          {/* Cover Image - Larger Banner */}
          <div className="h-56 bg-gradient-to-br from-[#2d5649] via-[#3d7359] to-[#1e3d33] relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200')] bg-cover bg-center opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          </div>

          {/* Profile Header */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row gap-4 -mt-20 relative">
              {/* Profile Photo - Larger with better overlap */}
              <div className="flex-shrink-0">
                {employee.profilePhoto?.url ? (
                  <img
                    src={employee.profilePhoto.url}
                    alt={employee.name}
                    className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-2xl bg-white ring-2 ring-gray-100"
                  />
                ) : (
                  <div className="w-40 h-40 rounded-full border-4 border-white shadow-2xl bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center ring-2 ring-gray-100">
                    <FaUserCircle className="w-36 h-36 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Name and Headline - More prominent */}
              <div className="flex-1 pt-4 sm:pt-20">
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">{employee.name}</h1>
                {employee.headline && (
                  <p className="text-xl text-gray-700 mt-2 font-medium leading-relaxed">{employee.headline}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-gray-600 text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2.5 h-2.5 rounded-full ${
                        employee.isOnline ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></span>
                    <span>
                      {employee.isOnline
                        ? "Online"
                        : `Last seen ${new Date(employee.lastSeen).toLocaleDateString()}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-4 sm:pt-20">
                {isOwnProfile ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/employee/profile/edit")}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 border-2 border-[#2d5649] text-[#2d5649] font-semibold rounded-full hover:bg-[#2d5649] hover:text-white transition-all"
                  >
                    <FaEdit />
                    Edit Profile
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleStartChat}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-[#2d5649] text-white font-semibold rounded-full hover:bg-[#3d7359] transition-colors"
                  >
                    <FaComments />
                    Message
                  </motion.button>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {/* About Section */}
            {employee.bio && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">{employee.bio}</p>
              </motion.div>
            )}

            {/* Experience Timeline */}
            {employee.experience && employee.experience.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FaBriefcase className="text-[#2d5649]" />
                  Experience
                </h2>
                <div className="space-y-8">
                  {employee.experience.map((exp, index) => (
                    <div key={index} className="relative pl-10 pb-8 border-l-[3px] border-gray-200 last:border-0 last:pb-0 group hover:border-[#2d5649] transition-colors">
                      <div className="absolute left-0 -ml-2.5 w-5 h-5 rounded-full bg-[#2d5649] border-4 border-white shadow-md group-hover:scale-110 transition-transform"></div>
                      <div className="bg-gray-50 rounded-lg p-4 group-hover:bg-[#f0f7f4] transition-colors">
                        <h3 className="text-xl font-bold text-gray-900">{exp.role}</h3>
                        <p className="text-lg text-gray-800 font-semibold mt-1">{exp.company}</p>
                        {exp.location && (
                          <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                            <FaMapMarkerAlt className="text-xs" />
                            {exp.location}
                          </p>
                        )}
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <FaCalendarAlt className="text-xs" />
                          {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start'} - {' '}
                          {exp.current ? 'Present' : exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'End'}
                        </p>
                        {exp.description && (
                          <p className="text-gray-700 mt-3 text-sm leading-relaxed whitespace-pre-line">{exp.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Education Section */}
            {employee.education && employee.education.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <FaGraduationCap className="text-[#2d5649]" />
                  Education
                </h2>
                <div className="space-y-8">
                  {employee.education.map((edu, index) => (
                    <div key={index} className="relative pl-10 pb-8 border-l-[3px] border-gray-200 last:border-0 last:pb-0 group hover:border-[#2d5649] transition-colors">
                      <div className="absolute left-0 -ml-2.5 w-5 h-5 rounded-full bg-[#2d5649] border-4 border-white shadow-md group-hover:scale-110 transition-transform"></div>
                      <div className="bg-gray-50 rounded-lg p-4 group-hover:bg-[#f0f7f4] transition-colors">
                        <h3 className="text-xl font-bold text-gray-900">{edu.school}</h3>
                        <p className="text-lg text-gray-800 font-semibold mt-1">{edu.degree}{edu.fieldOfStudy ? `, ${edu.fieldOfStudy}` : ''}</p>
                        <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                          <FaCalendarAlt className="text-xs" />
                          {edu.startDate ? new Date(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Start'} - {' '}
                          {edu.current ? 'Present' : edu.endDate ? new Date(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'End'}
                        </p>
                        {edu.grade && (
                          <p className="text-sm text-gray-600 mt-1">Grade: {edu.grade}</p>
                        )}
                        {edu.description && (
                          <p className="text-gray-700 mt-3 text-sm leading-relaxed whitespace-pre-line">{edu.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Skills Cloud */}
            {employee.skills && employee.skills.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2.5">
                  {employee.skills.map((skill, index) => (
                    <motion.span
                      key={index}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.1 + index * 0.05, type: "spring", stiffness: 200 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-800 rounded-full text-sm font-semibold hover:from-[#2d5649] hover:to-[#3d7359] hover:text-white shadow-sm hover:shadow-md transition-all cursor-default border border-gray-200 hover:border-transparent"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
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
                {employee.showEmail && employee.email ? (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaEnvelope className="text-[#2d5649] flex-shrink-0" />
                    <a
                      href={`mailto:${employee.email}`}
                      className="hover:text-[#2d5649] transition-colors text-sm break-all"
                    >
                      {employee.email}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <FaEnvelope className="flex-shrink-0" />
                    <span className="text-sm">Email not shared</span>
                  </div>
                )}

                {employee.showPhone && employee.phone ? (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaPhone className="text-[#2d5649] flex-shrink-0" />
                    <a
                      href={`tel:${employee.phone}`}
                      className="hover:text-[#2d5649] transition-colors text-sm"
                    >
                      {employee.phone}
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
                Contact visibility based on user's privacy settings
              </p>
            </motion.div>

            {/* Connections (if available) */}
            {employee.connections && employee.connections.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-lg shadow p-6"
              >
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Connections</h2>
                <p className="text-2xl font-bold text-[#2d5649]">
                  {employee.connections.length}
                </p>
                <p className="text-sm text-gray-600 mt-1">professional connections</p>
              </motion.div>
            )}

            {/* Member Since */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-lg shadow p-6"
            >
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Member since:</span>
                <br />
                {new Date(employee.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
