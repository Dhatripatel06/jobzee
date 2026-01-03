import React, { useState, useContext } from "react";
import { Context } from "../../main";
import axios from "axios";
import { 
  FaUserCircle, 
  FaTimes, 
  FaPlus, 
  FaTrash,
  FaBriefcase,
  FaGraduationCap,
  FaToggleOn,
  FaToggleOff
} from "react-icons/fa";
import toast from "react-hot-toast";

const EditProfile = ({ onClose, onUpdate }) => {
  const { user, setUser } = useContext(Context);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    headline: user?.headline || "",
    bio: user?.bio || "",
    skills: user?.skills?.join(", ") || "",
    companyWebsite: user?.companyWebsite || "",
    industry: user?.industry || "",
    companySize: user?.companySize || "",
    showEmail: user?.showEmail || false,
    showPhone: user?.showPhone || false,
  });
  
  const [experience, setExperience] = useState(
    user?.experience && user.experience.length > 0 
      ? user.experience 
      : [{
          company: "",
          role: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: ""
        }]
  );

  const [education, setEducation] = useState(
    user?.education && user.education.length > 0
      ? user.education
      : [{
          school: "",
          degree: "",
          fieldOfStudy: "",
          startDate: "",
          endDate: "",
          current: false,
          grade: "",
          description: ""
        }]
  );
  
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(user?.profilePhoto?.url || "");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Experience handlers
  const handleExperienceChange = (index, field, value) => {
    const newExperience = [...experience];
    newExperience[index][field] = value;
    setExperience(newExperience);
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        company: "",
        role: "",
        location: "",
        startDate: "",
        endDate: "",
        current: false,
        description: ""
      }
    ]);
  };

  const removeExperience = (index) => {
    if (experience.length > 1) {
      setExperience(experience.filter((_, i) => i !== index));
    }
  };

  // Education handlers
  const handleEducationChange = (index, field, value) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        school: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        current: false,
        grade: "",
        description: ""
      }
    ]);
  };

  const removeEducation = (index) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("headline", formData.headline);
      submitData.append("bio", formData.bio);
      submitData.append("skills", formData.skills);
      
      // Employer-specific fields
      if (user?.role === "Employer") {
        submitData.append("companyWebsite", formData.companyWebsite);
        submitData.append("industry", formData.industry);
        submitData.append("companySize", formData.companySize);
      }
      
      submitData.append("showEmail", formData.showEmail);
      submitData.append("showPhone", formData.showPhone);
      
      // Add experience array
      submitData.append("experience", JSON.stringify(experience.filter(exp => 
        exp.company || exp.role
      )));
      
      // Add education array
      submitData.append("education", JSON.stringify(education.filter(edu => 
        edu.school || edu.degree
      )));
      
      if (profilePhoto) {
        submitData.append("profilePhoto", profilePhoto);
      }

      const response = await axios.put(
        "http://localhost:4000/api/v1/user/employee/profile",
        submitData,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      
      toast.success("Profile updated successfully!");
      setUser(response.data.user);
      
      if (onUpdate) {
        onUpdate(response.data.user);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white rounded-t-lg z-10">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Profile Photo */}
          <div className="flex flex-col items-center pb-6 border-b">
            <div className="mb-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#2d5649]"
                />
              ) : (
                <FaUserCircle className="w-32 h-32 text-gray-300" />
              )}
            </div>
            <label className="cursor-pointer px-6 py-2 bg-[#2d5649] text-white rounded-lg hover:bg-[#3d7359] transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              Change Photo
            </label>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
              required
            />
          </div>

          {/* Professional Headline */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Professional Headline
            </label>
            <input
              type="text"
              name="headline"
              value={formData.headline}
              onChange={handleInputChange}
              maxLength="120"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
              placeholder="e.g., Full Stack Developer | React & Node.js Specialist"
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.headline.length}/120 characters
            </p>
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              About / Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="4"
              maxLength="500"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Employer-Specific Fields */}
          {user?.role === "Employer" && (
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Company Information</h3>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Website
                </label>
                <input
                  type="url"
                  name="companyWebsite"
                  value={formData.companyWebsite}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                  placeholder="https://www.yourcompany.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                  placeholder="e.g., Technology, Finance, Healthcare"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Company Size
                </label>
                <select
                  name="companySize"
                  value={formData.companySize}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                >
                  <option value="">Select company size</option>
                  <option value="1-10 employees">1-10 employees</option>
                  <option value="11-50 employees">11-50 employees</option>
                  <option value="51-200 employees">51-200 employees</option>
                  <option value="201-500 employees">201-500 employees</option>
                  <option value="501-1000 employees">501-1000 employees</option>
                  <option value="1001-5000 employees">1001-5000 employees</option>
                  <option value="5001-10000 employees">5001-10000 employees</option>
                  <option value="10000+ employees">10000+ employees</option>
                </select>
              </div>
            </div>
          )}

          {/* Skills */}
          {user?.role === "Job Seeker" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Skills
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                placeholder="JavaScript, React, Node.js, MongoDB (comma-separated)"
              />
              <p className="text-sm text-gray-500 mt-1">
                Enter skills separated by commas
              </p>
            </div>
          )}

          {/* Experience Section - Job Seekers Only */}
          {user?.role === "Job Seeker" && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaBriefcase className="text-[#2d5649]" />
                Experience
              </h3>
              <button
                type="button"
                onClick={addExperience}
                className="flex items-center gap-2 px-4 py-2 bg-[#2d5649] text-white rounded-lg hover:bg-[#3d7359] transition-colors text-sm"
              >
                <FaPlus />
                Add Experience
              </button>
            </div>
            
            <div className="space-y-6">
              {experience.map((exp, index) => (
                <div key={index} className="p-4 border-2 border-gray-200 rounded-lg relative">
                  {experience.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={exp.company}
                        onChange={(e) => handleExperienceChange(index, 'company', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                        placeholder="e.g., Google"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role / Title
                      </label>
                      <input
                        type="text"
                        value={exp.role}
                        onChange={(e) => handleExperienceChange(index, 'role', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                        placeholder="e.g., Senior Developer"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={exp.location}
                        onChange={(e) => handleExperienceChange(index, 'location', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                        placeholder="e.g., San Francisco, CA"
                      />
                    </div>
                    
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <input
                          type="checkbox"
                          checked={exp.current}
                          onChange={(e) => handleExperienceChange(index, 'current', e.target.checked)}
                          className="w-4 h-4 text-[#2d5649] rounded focus:ring-2 focus:ring-[#2d5649]"
                        />
                        Currently working here
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={exp.startDate ? new Date(exp.startDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleExperienceChange(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                      />
                    </div>
                    
                    {!exp.current && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={exp.endDate ? new Date(exp.endDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleExperienceChange(index, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => handleExperienceChange(index, 'description', e.target.value)}
                      rows="3"
                      maxLength="1000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent resize-none"
                      placeholder="Describe your responsibilities and achievements..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Education Section - Job Seekers Only */}
          {user?.role === "Job Seeker" && (
          <div className="border-t pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaGraduationCap className="text-[#2d5649]" />
                Education
              </h3>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-2 px-4 py-2 bg-[#2d5649] text-white rounded-lg hover:bg-[#3d7359] transition-colors text-sm"
              >
                <FaPlus />
                Add Education
              </button>
            </div>
            
            <div className="space-y-6">
              {education.map((edu, index) => (
                <div key={index} className="p-4 border-2 border-gray-200 rounded-lg relative">
                  {education.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash />
                    </button>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        School / University
                      </label>
                      <input
                        type="text"
                        value={edu.school}
                        onChange={(e) => handleEducationChange(index, 'school', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                        placeholder="e.g., Stanford University"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Degree
                      </label>
                      <input
                        type="text"
                        value={edu.degree}
                        onChange={(e) => handleEducationChange(index, 'degree', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                        placeholder="e.g., Bachelor's"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Field of Study
                      </label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => handleEducationChange(index, 'fieldOfStudy', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Grade / GPA
                      </label>
                      <input
                        type="text"
                        value={edu.grade}
                        onChange={(e) => handleEducationChange(index, 'grade', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                        placeholder="e.g., 3.8 GPA"
                      />
                    </div>
                    
                    <div>
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
                        <input
                          type="checkbox"
                          checked={edu.current}
                          onChange={(e) => handleEducationChange(index, 'current', e.target.checked)}
                          className="w-4 h-4 text-[#2d5649] rounded focus:ring-2 focus:ring-[#2d5649]"
                        />
                        Currently studying here
                      </label>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={edu.startDate ? new Date(edu.startDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleEducationChange(index, 'startDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                      />
                    </div>
                    
                    {!edu.current && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          End Date
                        </label>
                        <input
                          type="date"
                          value={edu.endDate ? new Date(edu.endDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleEducationChange(index, 'endDate', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={edu.description}
                      onChange={(e) => handleEducationChange(index, 'description', e.target.value)}
                      rows="2"
                      maxLength="500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d5649] focus:border-transparent resize-none"
                      placeholder="Activities, societies, achievements..."
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          )}

          {/* Privacy Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">Show email on profile</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Allow others to see your email address
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showEmail: !formData.showEmail })}
                  className="text-3xl focus:outline-none"
                >
                  {formData.showEmail ? (
                    <FaToggleOn className="text-[#2d5649]" />
                  ) : (
                    <FaToggleOff className="text-gray-400" />
                  )}
                </button>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900 font-medium">Show phone on profile</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Allow others to see your phone number
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showPhone: !formData.showPhone })}
                  className="text-3xl focus:outline-none"
                >
                  {formData.showPhone ? (
                    <FaToggleOn className="text-[#2d5649]" />
                  ) : (
                    <FaToggleOff className="text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t sticky bottom-0 bg-white pb-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-[#2d5649] text-white font-semibold rounded-lg hover:bg-[#3d7359] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
