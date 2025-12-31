import React, { useState, useContext } from "react";
import { Context } from "../../main";
import { updateEmployeeProfile } from "../../services/api";
import { FaUserCircle, FaTimes } from "react-icons/fa";
import toast from "react-hot-toast";

const EditProfile = ({ onClose, onUpdate }) => {
  const { user, setUser } = useContext(Context);
  
  const [formData, setFormData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    skills: user?.skills?.join(", ") || "",
    experience: user?.experience || "",
    showEmail: user?.showEmail || false,
    showPhone: user?.showPhone || false,
  });
  
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("bio", formData.bio);
      submitData.append("skills", formData.skills);
      submitData.append("experience", formData.experience);
      submitData.append("showEmail", formData.showEmail);
      submitData.append("showPhone", formData.showPhone);
      
      if (profilePhoto) {
        submitData.append("profilePhoto", profilePhoto);
      }

      const response = await updateEmployeeProfile(submitData);
      
      toast.success("Profile updated successfully!");
      setUser(response.user);
      
      if (onUpdate) {
        onUpdate(response.user);
      }
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Photo */}
          <div className="flex flex-col items-center">
            <div className="mb-4">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <FaUserCircle className="w-32 h-32 text-gray-300" />
              )}
            </div>
            <label className="cursor-pointer px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
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
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows="4"
              maxLength="500"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Tell us about yourself..."
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Skills */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Skills
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="JavaScript, React, Node.js (comma-separated)"
            />
            <p className="text-sm text-gray-500 mt-1">
              Enter skills separated by commas
            </p>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Experience
            </label>
            <textarea
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe your work experience..."
            />
          </div>

          {/* Privacy Settings */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showEmail"
                  checked={formData.showEmail}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">Show email on my profile</span>
              </label>
              
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="showPhone"
                  checked={formData.showPhone}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-700">Show phone number on my profile</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
