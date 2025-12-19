import React, { useContext, useState } from "react";
import { Context } from "../../main";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { GiHamburgerMenu } from "react-icons/gi";
import { HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "framer-motion";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthorized, setIsAuthorized, user } = useContext(Context);
  const navigateTo = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await axios.get(
        "http://localhost:4000/api/v1/user/logout",
        {
          withCredentials: true,
        }
      );
      toast.success(response.data.message);
      setIsAuthorized(false);
      navigateTo("/login");
    } catch (error) {
      toast.error(error.response.data.message);
      setIsAuthorized(true);
    }
  };

  if (!isAuthorized) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-lg sticky top-0 z-50 border-b border-gray-200"
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src="/JobZee-logos__white.png"
              alt="JobZee Logo"
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavLink to="/" onClick={() => setShow(false)}>
              Home
            </NavLink>
            <NavLink to="/job/getall" onClick={() => setShow(false)}>
              All Jobs
            </NavLink>
            <NavLink to="/applications/me" onClick={() => setShow(false)}>
              {user && user.role === "Employer"
                ? "Applications"
                : "My Applications"}
            </NavLink>
            {user && user.role === "Employer" && (
              <>
                <NavLink to="/job/post" onClick={() => setShow(false)}>
                  Post Job
                </NavLink>
                <NavLink to="/job/me" onClick={() => setShow(false)}>
                  My Jobs
                </NavLink>
              </>
            )}
            <button
              onClick={handleLogout}
              className="ml-4 px-6 py-2.5 bg-accent-500 text-white rounded-lg font-semibold 
                       hover:bg-accent-600 transition-all duration-300 
                       focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2
                       active:scale-95 shadow-md hover:shadow-lg"
            >
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setShow(!show)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Toggle menu"
          >
            {show ? (
              <HiX className="h-6 w-6 text-secondary-700" />
            ) : (
              <GiHamburgerMenu className="h-6 w-6 text-secondary-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {show && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2 border-t border-gray-200">
                <MobileNavLink to="/" onClick={() => setShow(false)}>
                  Home
                </MobileNavLink>
                <MobileNavLink to="/job/getall" onClick={() => setShow(false)}>
                  All Jobs
                </MobileNavLink>
                <MobileNavLink to="/applications/me" onClick={() => setShow(false)}>
                  {user && user.role === "Employer"
                    ? "Applications"
                    : "My Applications"}
                </MobileNavLink>
                {user && user.role === "Employer" && (
                  <>
                    <MobileNavLink to="/job/post" onClick={() => setShow(false)}>
                      Post Job
                    </MobileNavLink>
                    <MobileNavLink to="/job/me" onClick={() => setShow(false)}>
                      My Jobs
                    </MobileNavLink>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full mt-4 px-6 py-3 bg-accent-500 text-white rounded-lg font-semibold 
                           hover:bg-accent-600 transition-all duration-300 
                           focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2
                           active:scale-95"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

// NavLink component for desktop
const NavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="px-4 py-2 text-secondary-700 font-medium rounded-lg
               hover:bg-accent-50 hover:text-accent-600 
               transition-all duration-200 
               focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2"
  >
    {children}
  </Link>
);

// MobileNavLink component
const MobileNavLink = ({ to, children, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-4 py-3 text-secondary-700 font-medium rounded-lg
               hover:bg-accent-50 hover:text-accent-600 
               transition-all duration-200"
  >
    {children}
  </Link>
);

export default Navbar;