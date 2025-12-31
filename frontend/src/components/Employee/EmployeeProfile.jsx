import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeProfile } from "../../services/api";
import { FaUserCircle, FaEnvelope, FaPhone, FaArrowLeft, FaComments } from "react-icons/fa";
import toast from "react-hot-toast";

const EmployeeProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate("/employees")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <FaArrowLeft />
          <span>Back to Employees</span>
        </button>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-12 text-white">
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                {employee.profilePhoto?.url ? (
                  <img
                    src={employee.profilePhoto.url}
                    alt={employee.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                  />
                ) : (
                  <FaUserCircle className="w-32 h-32 text-white opacity-80" />
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{employee.name}</h1>
                <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                  <span
                    className={`w-3 h-3 rounded-full ${
                      employee.isOnline ? "bg-green-400" : "bg-gray-400"
                    }`}
                  ></span>
                  <span className="text-blue-100">
                    {employee.isOnline
                      ? "Online"
                      : `Last seen ${new Date(employee.lastSeen).toLocaleDateString()}`}
                  </span>
                </div>
                <button
                  onClick={handleStartChat}
                  className="flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors mx-auto md:mx-0"
                >
                  <FaComments />
                  Start Conversation
                </button>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="px-8 py-8">
            {/* Bio */}
            {employee.bio && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">About</h2>
                <p className="text-gray-700 leading-relaxed">{employee.bio}</p>
              </div>
            )}

            {/* Skills */}
            {employee.skills && employee.skills.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-3">
                  {employee.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {employee.experience && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">Experience</h2>
                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {employee.experience}
                </p>
              </div>
            )}

            {/* Contact Information */}
            <div className="border-t pt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-3">
                {employee.email ? (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaEnvelope className="text-blue-600" />
                    <a
                      href={`mailto:${employee.email}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {employee.email}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-500">
                    <FaEnvelope />
                    <span>Email not shared</span>
                  </div>
                )}

                {employee.phone ? (
                  <div className="flex items-center gap-3 text-gray-700">
                    <FaPhone className="text-blue-600" />
                    <a
                      href={`tel:${employee.phone}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {employee.phone}
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 text-gray-500">
                    <FaPhone />
                    <span>Phone not shared</span>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-4">
                * Contact details are shown based on user's privacy settings
              </p>
            </div>

            {/* Member Since */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-sm text-gray-600">
                Member since {new Date(employee.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
