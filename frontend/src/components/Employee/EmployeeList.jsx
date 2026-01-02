import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAllEmployees } from "../../services/api";
import { FaSearch, FaUserCircle, FaMapMarkerAlt, FaComments } from "react-icons/fa";
import toast from "react-hot-toast";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, [currentPage, skills]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: 20,
      };
      
      if (search) params.search = search;
      if (skills) params.skills = skills;

      const data = await getAllEmployees(params);
      setEmployees(data.employees);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchEmployees();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Browse Job Seekers
          </h1>
          <p className="text-gray-600">Find talented professionals for your company</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or bio..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex-1">
              <input
                type="text"
                placeholder="Filter by skills (comma-separated)"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              Search
            </button>
          </form>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading employees...</p>
          </div>
        ) : (
          <>
            {/* Employee Grid */}
            {employees.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-md">
                <p className="text-gray-600 text-lg">No employees found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {employees.map((employee) => (
                  <div
                    key={employee._id}
                    className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden"
                  >
                    <Link to={`/employee/${employee._id}`} className="block">
                      <div className="p-6">
                      {/* Profile Photo */}
                      <div className="flex justify-center mb-4">
                        {employee.profilePhoto?.url ? (
                          <img
                            src={employee.profilePhoto.url}
                            alt={employee.name}
                            className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                          />
                        ) : (
                          <FaUserCircle className="w-24 h-24 text-gray-300" />
                        )}
                      </div>

                      {/* Name & Status */}
                      <div className="text-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 mb-1">
                          {employee.name}
                        </h3>
                        <div className="flex items-center justify-center gap-2">
                          <span
                            className={`w-3 h-3 rounded-full ${
                              employee.isOnline ? "bg-green-500" : "bg-gray-400"
                            }`}
                          ></span>
                          <span className="text-sm text-gray-600">
                            {employee.isOnline
                              ? "Online"
                              : `Last seen ${new Date(employee.lastSeen).toLocaleDateString()}`}
                          </span>
                        </div>
                      </div>

                      {/* Bio */}
                      {employee.bio && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {employee.bio}
                        </p>
                      )}

                      {/* Skills */}
                      {employee.skills && employee.skills.length > 0 && (
                        <div className="mb-4">
                          <div className="flex flex-wrap gap-2">
                            {employee.skills.slice(0, 3).map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                            {employee.skills.length > 3 && (
                              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                +{employee.skills.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Experience */}
                      {employee.experience && (
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Experience:</span>{" "}
                          {employee.experience}
                        </p>
                      )}
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t">
                      <button className="w-full text-blue-600 font-semibold hover:text-blue-700 transition-colors">
                        View Full Profile →
                      </button>
                    </div>
                  </Link>

                  {/* Message Button */}
                  <div className="px-6 py-4 border-t">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(`/chat?userId=${employee._id}`);
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2d5649] text-white font-semibold rounded-lg hover:bg-[#3d7359] transition-colors"
                    >
                      <FaComments />
                      Send Message
                    </button>
                  </div>
                </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeList;
