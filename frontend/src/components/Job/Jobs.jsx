import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import api from "../../services/api";
import { Link, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { motion } from "framer-motion";
import { FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const { isAuthorized } = useContext(Context);
  const navigateTo = useNavigate();

  useEffect(() => {
    try {
      api.get("/api/v1/job/getall")
        .then((res) => {
          setJobs(res.data);
        });
    } catch (error) {
      console.log(error);
    }
  }, []);

  if (!isAuthorized) {
    navigateTo("/login");
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-accent-50 to-white py-16">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="section-title">All Available Jobs</h1>
          <p className="section-subtitle">
            Explore opportunities and find your perfect match
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.jobs &&
            jobs.jobs.map((job, index) => (
              <motion.div
                key={job._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="card p-6 flex flex-col justify-between h-full group"
              >
                {/* Job Header */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-secondary-900 mb-3 group-hover:text-accent-500 transition-colors duration-200">
                    {job.title}
                  </h3>

                  <div className="flex items-center gap-2 text-secondary-600 mb-2">
                    <FaBriefcase className="text-accent-500" />
                    <span className="text-sm">{job.category}</span>
                  </div>

                  <div className="flex items-center gap-2 text-secondary-600">
                    <FaMapMarkerAlt className="text-accent-500" />
                    <span className="text-sm">{job.country}</span>
                  </div>
                </div>

                {/* View Details Button */}
                <Link
                  to={`/job/${job._id}`}
                  className="btn-primary text-center block"
                >
                  View Details
                </Link>
              </motion.div>
            ))}
        </div>

        {jobs.jobs && jobs.jobs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-2xl text-secondary-500">No jobs available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Jobs;