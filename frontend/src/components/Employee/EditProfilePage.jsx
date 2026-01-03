import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import EditProfile from "./EditProfile";

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(Context);

  const handleClose = () => {
    // Navigate back to the profile page
    if (user.role === "Job Seeker") {
      navigate(`/employee/${user._id}`);
    } else {
      navigate(`/employer/${user._id}`);
    }
  };

  const handleUpdate = (updatedUser) => {
    setUser(updatedUser);
    // Navigate to updated profile
    if (updatedUser.role === "Job Seeker") {
      navigate(`/employee/${updatedUser._id}`);
    } else {
      navigate(`/employer/${updatedUser._id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <EditProfile onClose={handleClose} onUpdate={handleUpdate} />
    </div>
  );
};

export default EditProfilePage;
