import React, { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import { motion } from "framer-motion";
import {
  FaBriefcase,
  FaMapMarkerAlt,
  FaCity,
  FaGlobeAmericas,
  FaDollarSign,
  FaCalendarAlt
} from "react-icons/fa";

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState({});
  const navigateTo = useNavigate();

  const { isAuthorized, user } = useContext(Context);

  useEffect(() => {
    api
      .get(`/api/v1/job/${id}`)
      .then((res) => {
        setJob(res.data.job);
      })
      .catch((err) => {
        navigateTo(err.response.data.message);
      });
  }, []);

  if (!isAuthorized) {
    navigateTo("/login");
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-accent-50 to-white py-16">
      <div className="page-container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-secondary-900 mb-2">
              {job.title}
            </h1>
            <div className="flex items-center gap-2 text-secondary-600">
              <FaBriefcase className="text-accent-500" />
              <span className="text-lg">{job.category}</span>
            </div>
          </div>

          {/* Job Details Card */}
          <div className="card p-8 mb-6">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Location Info */}
              <DetailItem
                icon={<FaGlobeAmericas />}
                label="Country"
                value={job.country}
              />
              <DetailItem
                icon={<FaCity />}
                label="City"
                value={job.city}
              />
              <DetailItem
                icon={<FaMapMarkerAlt />}
                label="Location"
                value={job.location}
              />
              <DetailItem
                icon={<FaCalendarAlt />}
                label="Posted On"
                value={job.jobPostedOn}
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-secondary-900 mb-3">
                Job Description
              </h3>
              <p className="text-secondary-700 leading-relaxed">
                {job.description}
              </p>
            </div>

            {/* Salary */}
            <div className="mb-6">
              <h3 className="text-xl font-bold text-secondary-900 mb-3 flex items-center gap-2">
                <FaDollarSign className="text-accent-500" />
                Salary
              </h3>
              <p className="text-2xl font-bold text-accent-500">
                {job.fixedSalary ? (
                  `$${job.fixedSalary}`
                ) : (
                  `$${job.salaryFrom} - $${job.salaryTo}`
                )}
              </p>
            </div>

            {/* Apply Button */}
            {user && user.role === "Employer" ? null : (
              <Link to={`/application/${job._id}`} className="btn-primary w-full md:w-auto block text-center">
                Apply Now
              </Link>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// DetailItem Component
const DetailItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-3">
    <div className="text-accent-500 text-xl mt-1">{icon}</div>
    <div>
      <p className="text-sm text-secondary-500 font-semibold mb-1">{label}</p>
      <p className="text-secondary-900 font-medium">{value}</p>
    </div>
  </div>
);

export default JobDetails;