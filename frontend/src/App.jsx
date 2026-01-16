import React, { useContext, useEffect } from "react";
import { Context } from "./main";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";
import ForgotPassword from "./components/Auth/ForgotPassword";
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Home from "./components/Home/Home";
import Jobs from "./components/Job/Jobs";
import JobDetails from "./components/Job/JobDetails";
import MyJobs from "./components/Job/MyJobs";
import PostJobs from "./components/Job/PostJob";
import Application from "./components/Application/Application";
import MyApplications from "./components/Application/MyApplications";
import EmployeeList from "./components/Employee/EmployeeList";
import EmployeeProfile from "./components/Employee/EmployeeProfile";
import EmployerProfile from "./components/Employee/EmployerProfile";
import EditProfilePage from "./components/Employee/EditProfilePage";
import Chat from "./components/Chat/Chat";
import ResumeToolkit from "./components/Tools/ResumeToolkit";
import NotFound from "./components/NotFound/NotFound";
import axios from "axios";
import { Toaster } from "react-hot-toast";
import socketService from "./services/socketService";
import Cookies from "js-cookie";

const App = () => {
  const { isAuthorized, setIsAuthorized, setUser } = useContext(Context);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          "https://jobzee-two.vercel.app/api/v1/user/getuser",
          {
            withCredentials: true,
          }
        );
        console.log("User fetched:", response.data);
        setUser(response.data.user);
        setIsAuthorized(true);

        // Initialize socket connection after user is fetched
        const token = localStorage.getItem("token");
        console.log("Token from localStorage:", token ? "present" : "missing");
        if (token && !socketService.isConnected()) {
          console.log("Connecting socket from App.jsx");
          setTimeout(() => {
            socketService.connect(token);
          }, 100);
        }
      } catch (error) {
        console.log("User not authenticated:", error.response?.status);
        setIsAuthorized(false);
        setUser(null);
        // Clear token from localStorage
        localStorage.removeItem("token");
        // Disconnect socket if not authorized
        socketService.disconnect();
      }
    };
    fetchUser();
  }, []); // Only run once on mount

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/" element={<Home />} />
            <Route path="/job/getall" element={<Jobs />} />
            <Route path="/job/:id" element={<JobDetails />} />
            <Route path="/job/post" element={<PostJobs />} />
            <Route path="/job/me" element={<MyJobs />} />
            <Route path="/application/:id" element={<Application />} />
            <Route path="/applications/me" element={<MyApplications />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employee/:id" element={<EmployeeProfile />} />
            <Route path="/employer/:id" element={<EmployerProfile />} />
            <Route path="/employee/profile/edit" element={<EditProfilePage />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/tools" element={<ResumeToolkit />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#334155',
              padding: '16px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
            },
            success: {
              iconTheme: {
                primary: '#2d5649',
                secondary: '#fff',
              },
            },
          }}
        />
      </div>
    </Router>
  );
};

export default App;