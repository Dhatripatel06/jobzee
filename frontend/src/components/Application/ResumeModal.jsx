import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiX, HiDownload } from "react-icons/hi";

const ResumeModal = ({ imageUrl, onClose }) => {
  console.log('ResumeModal received URL:', imageUrl);
  
  // Check if the file is a PDF or document
  const isPDF = imageUrl && (
    imageUrl.includes('.pdf') || 
    imageUrl.toLowerCase().endsWith('.pdf') || 
    imageUrl.includes('pdf') ||
    imageUrl.includes('/raw/upload/') ||
    imageUrl.includes('/application/resume/')
  );
  const isDocument = imageUrl && (imageUrl.includes('.doc') || imageUrl.includes('.docx'));
  
  // Authentication is handled via cookies, no need to add tokens to URLs
  let pdfUrl = imageUrl;
  console.log('PDF URL to display:', pdfUrl, 'isPDF:', isPDF);
  
  const handleDownload = () => {
    if (imageUrl) {
      // Authentication is handled via cookies
      let downloadUrl = imageUrl;
      
      if (imageUrl.includes('cloudinary.com') && !imageUrl.includes('fl_attachment')) {
        // Force download by adding fl_attachment flag for Cloudinary URLs
        downloadUrl = imageUrl.replace('/upload/', '/upload/fl_attachment/');
      }
      
      window.open(downloadUrl, '_blank');
    }
  };

  const handleOpenInNewTab = () => {
    if (imageUrl) {
      // Authentication is handled via cookies
      window.open(imageUrl, '_blank');
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
              onClick={handleOpenInNewTab}
              className="p-2 bg-white rounded-full shadow-lg
                       hover:bg-green-500 hover:text-white transition-all duration-300
                       focus:outline-none focus:ring-2 focus:ring-green-500"
              aria-label="Open in new tab"
              title="Open in new tab"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
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
          <div className="overflow-auto max-h-[90vh] bg-gray-100">
            {isPDF ? (
              // PDF Viewer - using iframe with credentials
              <div className="w-full h-[90vh] flex flex-col">
                <iframe
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="Resume PDF"
                  allow="fullscreen"
                  onLoad={() => {
                    console.log('PDF iframe loaded successfully');
                    console.log('PDF URL used:', pdfUrl);
                  }}
                  onError={(e) => {
                    console.error('PDF iframe error:', e);
                    console.error('Failed URL:', pdfUrl);
                    console.error('Is PDF detected:', isPDF);
                  }}
                />
                
                {/* Alternative viewing options */}
                <div className="bg-white border-t border-gray-200 p-4 text-center">
                  <p className="text-sm text-gray-600 mb-3">Having trouble viewing the PDF?</p>
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={handleOpenInNewTab}
                      className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                      Open in New Tab
                    </button>
                    <button
                      onClick={handleDownload}
                      className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      <HiDownload className="text-lg" />
                      Download PDF
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">
                    URL: {pdfUrl.length > 50 ? pdfUrl.substring(0, 50) + '...' : pdfUrl}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Status: {isPDF ? 'PDF detected' : 'Not detected as PDF'}
                  </p>
                </div>
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