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
import Chat from "./components/Chat/Chat";
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
          "http://localhost:4000/api/v1/user/getuser",
          {
            withCredentials: true,
          }
        );
        console.log(response);
        setUser(response.data.user);
        setIsAuthorized(true);
        
        // Initialize socket connection after user is fetched
        const token = Cookies.get("token");
        if (token && !socketService.isConnected()) {
          socketService.connect(token);
        }
      } catch (error) {
        setIsAuthorized(false);
        // Disconnect socket if not authorized
        socketService.disconnect();
      }
    };
    fetchUser();
  }, [isAuthorized]);

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
            <Route path="/chat" element={<Chat />} />
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