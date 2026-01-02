import React, { useContext, useEffect, useState } from "react";
import { Context } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ResumeModal from "./ResumeModal";
import { motion } from "framer-motion";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTrashAlt, FaFileAlt, FaEye, FaComments } from "react-icons/fa";

const MyApplications = () => {
  const { user } = useContext(Context);
  const [applications, setApplications] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [resumeImageUrl, setResumeImageUrl] = useState("");

  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    // Handle unauthorized access
    if (!isAuthorized) {
      navigateTo("/");
      return;
    }

    const fetchApplications = async () => {
      // Only fetch if user is loaded
      if (!user) {
        return;
      }

      try {
        const endpoint = user.role === "Employer"
          ? "http://localhost:4000/api/v1/application/employer/getall"
          : "http://localhost:4000/api/v1/application/jobseeker/getall";

        const res = await axios.get(endpoint, {
          withCredentials: true,
        });
        
        setApplications(res.data.applications);
      } catch (error) {
        console.error("Error fetching applications:", error);
        // Only show error toast if it's not a 400 (which might mean no applications)
        if (error.response?.status !== 400) {
          toast.error(error.response?.data?.message || "Failed to fetch applications");
        }
      }
    };

    fetchApplications();
  }, [user, isAuthorized, navigateTo]);

  const deleteApplication = async (id) => {
    try {
      const res = await axios.delete(
        `http://localhost:4000/api/v1/application/delete/${id}`,
        {
          withCredentials: true,
        }
      );
      toast.success(res.data.message);
      setApplications((prevApplication) =>
        prevApplication.filter((application) => application._id !== id)
      );
    } catch (error) {
      console.error("Error deleting application:", error);
      toast.error(error.response?.data?.message || "Failed to delete application");
    }
  };

  const openModal = (imageUrl, applicationId = null) => {
    console.log('openModal called with:', { imageUrl, applicationId });
    
    // Check if it's a PDF or document (raw file from Cloudinary)
    const isPDFOrDoc = imageUrl && (
      imageUrl.includes('.pdf') || 
      imageUrl.includes('.doc') || 
      imageUrl.includes('/raw/upload/') ||
      imageUrl.includes('application/pdf')
    );
    
    // If it's a PDF/document and we have an application ID, use the proxy URL
    if (applicationId && isPDFOrDoc) {
      const proxyUrl = `http://localhost:4000/api/v1/application/resume/${applicationId}`;
      console.log('Using proxy URL:', proxyUrl);
      setResumeImageUrl(proxyUrl);
    } else {
      console.log('Using direct URL:', imageUrl);
      setResumeImageUrl(imageUrl);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {user && user.role === "Job Seeker" ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">My Applications</h1>
            {applications.length <= 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <h4 className="text-2xl text-gray-500 font-medium">No Applications Found</h4>
                <p className="text-gray-400 mt-2">You haven't submitted any applications yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((element, index) => {
                  return (
                    <JobSeekerCard
                      element={element}
                      key={element._id}
                      index={index}
                      deleteApplication={deleteApplication}
                      openModal={openModal}
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Applications From Job Seekers</h1>
            {applications.length <= 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FaFileAlt className="text-6xl text-gray-300 mx-auto mb-4" />
                <h4 className="text-2xl text-gray-500 font-medium">No Applications Found</h4>
                <p className="text-gray-400 mt-2">No candidates have applied yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {applications.map((element, index) => {
                  return (
                    <EmployerCard
                      element={element}
                      key={element._id}
                      index={index}
                      openModal={openModal}
                    />
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>
      {modalOpen && (
        <ResumeModal imageUrl={resumeImageUrl} onClose={closeModal} />
      )}
    </section>
  );
};

export default MyApplications;

const JobSeekerCard = ({ element, deleteApplication, openModal, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-[#2d5649] to-[#3d7359] px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FaUser />
          Application Details
        </h3>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-3">
        <div className="flex items-start gap-2">
          <FaUser className="text-[#2d5649] mt-1 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-gray-600">Name:</span>
            <p className="text-gray-800 font-medium">{element.name}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FaEnvelope className="text-[#2d5649] mt-1 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-gray-600">Email:</span>
            <p className="text-gray-800 break-all">{element.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FaPhone className="text-[#2d5649] mt-1 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-gray-600">Phone:</span>
            <p className="text-gray-800">{element.phone}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FaMapMarkerAlt className="text-[#2d5649] mt-1 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-gray-600">Address:</span>
            <p className="text-gray-800">{element.address}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <span className="text-sm font-semibold text-gray-600">Cover Letter:</span>
          <p className="text-gray-700 text-sm mt-1 line-clamp-3">{element.coverLetter}</p>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="px-6 pb-4">
        <div 
          onClick={() => openModal(element.resume.url, element._id)}
          className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#2d5649] transition-all duration-300"
        >
          {element.resume.url.includes('.pdf') ? (
            <div className="w-full h-48 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
              <div className="text-center">
                <FaFileAlt className="text-red-500 text-5xl mx-auto mb-2" />
                <p className="text-gray-700 font-semibold">PDF Resume</p>
                <p className="text-xs text-gray-500">Click to view</p>
              </div>
            </div>
          ) : element.resume.url.includes('.doc') ? (
            <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <div className="text-center">
                <FaFileAlt className="text-blue-500 text-5xl mx-auto mb-2" />
                <p className="text-gray-700 font-semibold">Word Document</p>
                <p className="text-xs text-gray-500">Click to view</p>
              </div>
            </div>
          ) : (
            <img
              src={element.resume.url}
              alt="resume"
              className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
            <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
              <FaEye className="text-[#2d5649] text-2xl" />
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">Click to view full resume</p>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => deleteApplication(element._id)}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <FaTrashAlt />
          Delete Application
        </motion.button>
      </div>
    </motion.div>
  );
};

const EmployerCard = ({ element, openModal, index }) => {
  const navigate = useNavigate();

  const handleMessageCandidate = () => {
    // Navigate to chat with the applicant's user ID
    navigate(`/chat?userId=${element.applicantID.user}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
    >
      {/* Card Header */}
      <div className="bg-gradient-to-r from-[#2d5649] to-[#3d7359] px-6 py-4">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <FaUser />
          Candidate Profile
        </h3>
      </div>

      {/* Card Body */}
      <div className="p-6 space-y-3">
        <div className="flex items-start gap-2">
          <FaUser className="text-[#2d5649] mt-1 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-gray-600">Name:</span>
            <p className="text-gray-800 font-medium">{element.name}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FaEnvelope className="text-[#2d5649] mt-1 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-gray-600">Email:</span>
            <p className="text-gray-800 break-all">{element.email}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FaPhone className="text-[#2d5649] mt-1 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-gray-600">Phone:</span>
            <p className="text-gray-800">{element.phone}</p>
          </div>
        </div>

        <div className="flex items-start gap-2">
          <FaMapMarkerAlt className="text-[#2d5649] mt-1 flex-shrink-0" />
          <div>
            <span className="text-sm font-semibold text-gray-600">Address:</span>
            <p className="text-gray-800">{element.address}</p>
          </div>
        </div>

        <div className="pt-2 border-t border-gray-200">
          <span className="text-sm font-semibold text-gray-600">Cover Letter:</span>
          <p className="text-gray-700 text-sm mt-1 line-clamp-3">{element.coverLetter}</p>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="px-6 pb-4">
        <div 
          onClick={() => openModal(element.resume.url, element._id)}
          className="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-[#2d5649] transition-all duration-300"
        >
          {element.resume.url.includes('.pdf') ? (
            <div className="w-full h-48 bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
              <div className="text-center">
                <FaFileAlt className="text-red-500 text-5xl mx-auto mb-2" />
                <p className="text-gray-700 font-semibold">PDF Resume</p>
                <p className="text-xs text-gray-500">Click to view</p>
              </div>
            </div>
          ) : element.resume.url.includes('.doc') ? (
            <div className="w-full h-48 bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
              <div className="text-center">
                <FaFileAlt className="text-blue-500 text-5xl mx-auto mb-2" />
                <p className="text-gray-700 font-semibold">Word Document</p>
                <p className="text-xs text-gray-500">Click to view</p>
              </div>
            </div>
          ) : (
            <img
              src={element.resume.url}
              alt="resume"
              className="w-full h-48 object-cover transform group-hover:scale-105 transition-transform duration-300"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-center justify-center">
            <div className="bg-white rounded-full p-3 opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300">
              <FaEye className="text-[#2d5649] text-2xl" />
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 text-center mt-2">Click to view full resume</p>
      </div>

      {/* Actions */}
      <div className="px-6 pb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleMessageCandidate}
          className="w-full bg-[#2d5649] hover:bg-[#3d7359] text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
        >
          <FaComments />
          Message Candidate
        </motion.button>
      </div>
    </motion.div>
  );
};