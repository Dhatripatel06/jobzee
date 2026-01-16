import axios from "axios";
import api from "../../services/api";
import React, { useContext, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaCheck, FaBriefcase, FaMapMarkerAlt, FaGlobe, FaCity, FaTag, FaDollarSign, FaClock } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { MdEdit, MdDelete, MdDescription } from "react-icons/md";
import { Context } from "../../main";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const MyJobs = () => {
  const [myJobs, setMyJobs] = useState([]);
  const [editingMode, setEditingMode] = useState(null);
  const { isAuthorized, user } = useContext(Context);

  const navigateTo = useNavigate();

  //Fetching all jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data } = await api.get("/api/v1/job/getmyjobs");
        setMyJobs(data.myJobs);
      } catch (error) {
        toast.error(error.response.data.message);
        setMyJobs([]);
      }
    };
    fetchJobs();
  }, []);

  if (!isAuthorized || (user && user.role !== "Employer")) {
    navigateTo("/");
  }

  //Function For Enabling Editing Mode
  const handleEnableEdit = (jobId) => {
    setEditingMode(jobId);
  };

  //Function For Disabling Editing Mode
  const handleDisableEdit = () => {
    setEditingMode(null);
  };

  //Function For Updating The Job
  const handleUpdateJob = async (jobId) => {
    const updatedJob = myJobs.find((job) => job._id === jobId);
    await api
      .put(`/api/v1/job/update/${jobId}`, updatedJob)
      .then((res) => {
        toast.success(res.data.message);
        setEditingMode(null);
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  //Function For Deleting Job
  const handleDeleteJob = async (jobId) => {
    await api
      .delete(`/api/v1/job/delete/${jobId}`)
      .then((res) => {
        toast.success(res.data.message);
        setMyJobs((prevJobs) => prevJobs.filter((job) => job._id !== jobId));
      })
      .catch((error) => {
        toast.error(error.response.data.message);
      });
  };

  const handleInputChange = (jobId, field, value) => {
    setMyJobs((prevJobs) =>
      prevJobs.map((job) =>
        job._id === jobId ? { ...job, [field]: value } : job
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <FaBriefcase className="text-5xl text-[#2d5649] mr-4" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800">
              Your Posted Jobs
            </h1>
          </div>
          <p className="text-gray-600 text-lg mt-2">
            Manage and update your job listings
          </p>
        </motion.div>

        {myJobs.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            <AnimatePresence>
              {myJobs.map((element, index) => (
                <motion.div
                  key={element._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all duration-300 ${editingMode === element._id
                      ? "ring-4 ring-[#2d5649] ring-opacity-50 shadow-2xl"
                      : "hover:shadow-xl"
                    }`}
                >
                  <div className="p-8">
                    {/* Job Fields Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                      {/* Title Field */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <FaBriefcase className="mr-2 text-[#2d5649]" />
                          Job Title
                        </label>
                        <input
                          type="text"
                          disabled={editingMode !== element._id}
                          value={element.title}
                          onChange={(e) =>
                            handleInputChange(element._id, "title", e.target.value)
                          }
                          className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${editingMode === element._id
                              ? "border-[#2d5649] bg-white focus:ring-2 focus:ring-[#2d5649] focus:ring-opacity-50"
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            } outline-none`}
                        />
                      </div>

                      {/* Country Field */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <FaGlobe className="mr-2 text-[#2d5649]" />
                          Country
                        </label>
                        <input
                          type="text"
                          disabled={editingMode !== element._id}
                          value={element.country}
                          onChange={(e) =>
                            handleInputChange(element._id, "country", e.target.value)
                          }
                          className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${editingMode === element._id
                              ? "border-[#2d5649] bg-white focus:ring-2 focus:ring-[#2d5649] focus:ring-opacity-50"
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            } outline-none`}
                        />
                      </div>

                      {/* City Field */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <FaCity className="mr-2 text-[#2d5649]" />
                          City
                        </label>
                        <input
                          type="text"
                          disabled={editingMode !== element._id}
                          value={element.city}
                          onChange={(e) =>
                            handleInputChange(element._id, "city", e.target.value)
                          }
                          className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${editingMode === element._id
                              ? "border-[#2d5649] bg-white focus:ring-2 focus:ring-[#2d5649] focus:ring-opacity-50"
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            } outline-none`}
                        />
                      </div>

                      {/* Category Field */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <FaTag className="mr-2 text-[#2d5649]" />
                          Category
                        </label>
                        <select
                          value={element.category}
                          onChange={(e) =>
                            handleInputChange(element._id, "category", e.target.value)
                          }
                          disabled={editingMode !== element._id}
                          className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${editingMode === element._id
                              ? "border-[#2d5649] bg-white focus:ring-2 focus:ring-[#2d5649] focus:ring-opacity-50"
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            } outline-none`}
                        >
                          <option value="Graphics & Design">Graphics & Design</option>
                          <option value="Mobile App Development">Mobile App Development</option>
                          <option value="Frontend Web Development">Frontend Web Development</option>
                          <option value="MERN Stack Development">MERN STACK Development</option>
                          <option value="Account & Finance">Account & Finance</option>
                          <option value="Artificial Intelligence">Artificial Intelligence</option>
                          <option value="Video Animation">Video Animation</option>
                          <option value="MEAN Stack Development">MEAN STACK Development</option>
                          <option value="MEVN Stack Development">MEVN STACK Development</option>
                          <option value="Data Entry Operator">Data Entry Operator</option>
                        </select>
                      </div>

                      {/* Salary Field */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <FaDollarSign className="mr-2 text-[#2d5649]" />
                          Salary
                        </label>
                        {element.fixedSalary ? (
                          <input
                            type="number"
                            disabled={editingMode !== element._id}
                            value={element.fixedSalary}
                            onChange={(e) =>
                              handleInputChange(element._id, "fixedSalary", e.target.value)
                            }
                            className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${editingMode === element._id
                                ? "border-[#2d5649] bg-white focus:ring-2 focus:ring-[#2d5649] focus:ring-opacity-50"
                                : "border-gray-200 bg-gray-50 cursor-not-allowed"
                              } outline-none`}
                          />
                        ) : (
                          <div className="flex gap-2">
                            <input
                              type="number"
                              disabled={editingMode !== element._id}
                              value={element.salaryFrom}
                              onChange={(e) =>
                                handleInputChange(element._id, "salaryFrom", e.target.value)
                              }
                              placeholder="From"
                              className={`w-1/2 px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${editingMode === element._id
                                  ? "border-[#2d5649] bg-white focus:ring-2 focus:ring-[#2d5649] focus:ring-opacity-50"
                                  : "border-gray-200 bg-gray-50 cursor-not-allowed"
                                } outline-none`}
                            />
                            <input
                              type="number"
                              disabled={editingMode !== element._id}
                              value={element.salaryTo}
                              onChange={(e) =>
                                handleInputChange(element._id, "salaryTo", e.target.value)
                              }
                              placeholder="To"
                              className={`w-1/2 px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${editingMode === element._id
                                  ? "border-[#2d5649] bg-white focus:ring-2 focus:ring-[#2d5649] focus:ring-opacity-50"
                                  : "border-gray-200 bg-gray-50 cursor-not-allowed"
                                } outline-none`}
                            />
                          </div>
                        )}
                      </div>

                      {/* Expired Field */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <FaClock className="mr-2 text-[#2d5649]" />
                          Status
                        </label>
                        <select
                          value={element.expired}
                          onChange={(e) =>
                            handleInputChange(element._id, "expired", e.target.value)
                          }
                          disabled={editingMode !== element._id}
                          className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 ${editingMode === element._id
                              ? "border-[#2d5649] bg-white focus:ring-2 focus:ring-[#2d5649] focus:ring-opacity-50"
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            } outline-none`}
                        >
                          <option value={true}>Expired</option>
                          <option value={false}>Active</option>
                        </select>
                      </div>
                    </div>

                    {/* Long Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {/* Description Field */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <MdDescription className="mr-2 text-[#2d5649]" />
                          Job Description
                        </label>
                        <textarea
                          rows={5}
                          value={element.description}
                          disabled={editingMode !== element._id}
                          onChange={(e) =>
                            handleInputChange(element._id, "description", e.target.value)
                          }
                          className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 resize-none ${editingMode === element._id
                              ? "border-[#2d5649] bg-white focus:ring-2 focus:ring-[#2d5649] focus:ring-opacity-50"
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            } outline-none`}
                        />
                      </div>

                      {/* Location Field */}
                      <div className="space-y-2">
                        <label className="flex items-center text-sm font-semibold text-gray-700">
                          <FaMapMarkerAlt className="mr-2 text-[#2d5649]" />
                          Full Location
                        </label>
                        <textarea
                          value={element.location}
                          rows={5}
                          disabled={editingMode !== element._id}
                          onChange={(e) =>
                            handleInputChange(element._id, "location", e.target.value)
                          }
                          className={`w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200 resize-none ${editingMode === element._id
                              ? "border-[#2d5649] bg-white focus:ring-2 focus:ring-[#2d5649] focus:ring-opacity-50"
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                            } outline-none`}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3 justify-end pt-6 border-t border-gray-200">
                      {editingMode === element._id ? (
                        <>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleUpdateJob(element._id)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-[#2d5649] text-white font-semibold rounded-lg hover:bg-[#234438] transition-colors duration-200 shadow-md hover:shadow-lg"
                          >
                            <FaCheck />
                            Save Changes
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDisableEdit()}
                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-500 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md hover:shadow-lg"
                          >
                            <RxCross2 />
                            Cancel
                          </motion.button>
                        </>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleEnableEdit(element._id)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                          <MdEdit />
                          Edit Job
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteJob(element._id)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200 shadow-md hover:shadow-lg"
                      >
                        <MdDelete />
                        Delete Job
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center py-20"
          >
            <FaBriefcase className="text-8xl text-gray-300 mx-auto mb-6" />
            <p className="text-xl text-gray-600 font-medium">
              You haven't posted any jobs yet or may have deleted all of your jobs!
            </p>
            <p className="text-gray-500 mt-2">
              Start posting jobs to manage them here.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MyJobs;