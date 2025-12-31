import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiDownload } from "react-icons/hi";

const ResumeModal = ({ imageUrl, onClose }) => {
  // Check if the file is a PDF or document
  const isPDF = imageUrl && (
    imageUrl.includes('.pdf') || 
    imageUrl.toLowerCase().endsWith('.pdf') || 
    imageUrl.includes('pdf') ||
    imageUrl.includes('/raw/upload/')
  );
  const isDocument = imageUrl && (imageUrl.includes('.doc') || imageUrl.includes('.docx'));
  
  const handleDownload = () => {
    if (imageUrl) {
      // Force download by adding fl_attachment flag for Cloudinary URLs
      let downloadUrl = imageUrl;
      if (imageUrl.includes('cloudinary.com') && !imageUrl.includes('fl_attachment')) {
        downloadUrl = imageUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with Close and Download buttons */}
          <div className="absolute top-0 right-0 z-10 flex gap-2 p-4">
            <button
              onClick={handleDownload}
              className="p-2 bg-white rounded-full shadow-lg
                       hover:bg-blue-500 hover:text-white transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Download resume"
            >
              <HiDownload className="text-2xl" />
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white rounded-full shadow-lg
                       hover:bg-red-500 hover:text-white transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Close modal"
            >
              <HiX className="text-2xl" />
            </button>
          </div>

          {/* Resume Content */}
          <div className="overflow-auto max-h-[90vh]">
            {isPDF ? (
              // PDF Viewer - using embedded viewer with proper settings
              <div className="w-full h-[90vh]">
                <object
                  data={imageUrl}
                  type="application/pdf"
                  className="w-full h-full"
                >
                  {/* Fallback for browsers that don't support object tag */}
                  <div className="flex flex-col items-center justify-center h-full p-8 bg-gray-50">
                    <div className="text-center">
                      <svg className="w-24 h-24 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                      </svg>
                      <p className="text-xl font-semibold text-gray-800 mb-2">PDF Document</p>
                      <p className="text-gray-600 mb-4">Your browser cannot display this PDF</p>
                      <button
                        onClick={handleDownload}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Download PDF
                      </button>
                    </div>
                  </div>
                </object>
              </div>
            ) : isDocument ? (
              // Document preview
              <div className="flex flex-col items-center justify-center p-8 h-[90vh] bg-gray-50">
                <div className="text-center">
                  <svg className="w-24 h-24 text-blue-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
                  </svg>
                  <p className="text-xl font-semibold text-gray-800 mb-2">Word Document</p>
                  <p className="text-gray-600 mb-4">Click the button below to download and view</p>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download Document
                  </button>
                </div>
              </div>
            ) : (
              // Image Viewer
              <div className="p-4">
                <img
                  src={imageUrl}
                  alt="Resume"
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ResumeModal;