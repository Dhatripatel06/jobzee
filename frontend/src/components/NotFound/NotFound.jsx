import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <section className="min-h-screen bg-gradient-to-b from-accent-50 to-white flex items-center justify-center py-16">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* 404 Image */}
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            src="/notfound.png"
            alt="Page Not Found"
            className="w-full max-w-md mx-auto mb-8 drop-shadow-2xl"
          />

          {/* Title */}
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-4xl md:text-5xl font-bold text-secondary-900 mb-4"
          >
            Oops! Page Not Found
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg text-secondary-600 mb-8"
          >
            The page you're looking for doesn't exist or has been moved.
          </motion.p>

          {/* Return Home Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Link
              to={'/'}
              className="inline-flex items-center gap-2 btn-primary"
            >
              <FaHome />
              Return to Home Page
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default NotFound;