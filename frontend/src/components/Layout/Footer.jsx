import React, { useContext } from "react";
import { Context } from "../../main";
import { Link } from "react-router-dom";
import { FaFacebookF, FaYoutube, FaLinkedin } from "react-icons/fa";
import { RiInstagramFill } from "react-icons/ri";
import { motion } from "framer-motion";

const Footer = () => {
  const { isAuthorized } = useContext(Context);

  if (!isAuthorized) {
    return null;
  }

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-secondary-900 text-white py-8 mt-auto"
    >
      <div className="page-container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="text-center md:text-left">
            <p className="text-secondary-300 text-sm md:text-base">
              &copy; {new Date().getFullYear()} JobZee. All Rights Reserved.
            </p>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <SocialLink to="/" icon={<FaFacebookF />} label="Facebook" />
            <SocialLink to="/" icon={<FaYoutube />} label="YouTube" />
            <SocialLink to="/" icon={<FaLinkedin />} label="LinkedIn" />
            <SocialLink to="/" icon={<RiInstagramFill />} label="Instagram" />
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

// SocialLink component
const SocialLink = ({ to, icon, label }) => (
  <Link
    to={to}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-10 h-10 flex items-center justify-center rounded-full 
               bg-secondary-800 text-white hover:bg-accent-500 
               transition-all duration-300 transform hover:scale-110 hover:-translate-y-1
               focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 focus:ring-offset-secondary-900"
  >
    {icon}
  </Link>
);

export default Footer;