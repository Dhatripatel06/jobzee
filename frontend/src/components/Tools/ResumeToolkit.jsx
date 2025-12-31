import React from "react";
import { motion } from "framer-motion";
import { FaRobot, FaFileAlt, FaMagic, FaExternalLinkAlt } from "react-icons/fa";

const ResumeToolkit = () => {
  const tools = [
    { 
      name: "Teal AI Resume Builder", 
      link: "https://www.tealhq.com/", 
      desc: "ATS-optimized resume tailoring with AI assistance.",
      icon: <FaRobot className="text-3xl text-blue-600" />
    },
    { 
      name: "SkillSyncer ATS Scanner", 
      link: "https://skillsyncer.com/", 
      desc: "Check resume keyword match and ATS compatibility.",
      icon: <FaFileAlt className="text-3xl text-green-600" />
    },
    { 
      name: "Simplify Copilot", 
      link: "https://simplify.jobs/", 
      desc: "Autofill job applications and track submissions.",
      icon: <FaMagic className="text-3xl text-purple-600" />
    },
    { 
      name: "Resume Worded", 
      link: "https://resumeworded.com/", 
      desc: "Free resume review and optimization tool.",
      icon: <FaFileAlt className="text-3xl text-orange-600" />
    },
    { 
      name: "Jobscan", 
      link: "https://www.jobscan.co/", 
      desc: "Match your resume against job descriptions.",
      icon: <FaRobot className="text-3xl text-red-600" />
    },
    { 
      name: "CV Compiler", 
      link: "https://cvcompiler.com/", 
      desc: "AI-powered resume analysis for tech jobs.",
      icon: <FaMagic className="text-3xl text-indigo-600" />
    }
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            AI Career Tools & Resume Toolkit
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Enhance your job search with these free AI-powered tools. Build ATS-optimized resumes, 
            scan for keyword matches, and streamline your application process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -5 }}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300"
            >
              <div className="p-6">
                <div className="flex items-center justify-center mb-4">
                  {tool.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">
                  {tool.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 text-center min-h-[3rem]">
                  {tool.desc}
                </p>
                <a
                  href={tool.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-[#2d5649] to-[#3d7359] text-white font-semibold py-3 px-4 rounded-lg hover:from-[#3d7359] hover:to-[#2d5649] transition-all duration-200"
                >
                  Open Tool
                  <FaExternalLinkAlt className="text-sm" />
                </a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Additional Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-12 bg-white rounded-xl shadow-lg p-8"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Resume Optimization Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-[#2d5649] mb-2">
                ✓ Use Keywords from Job Descriptions
              </h3>
              <p className="text-gray-600 text-sm">
                ATS systems scan for specific keywords. Use tools above to match them.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#2d5649] mb-2">
                ✓ Keep Formatting Simple
              </h3>
              <p className="text-gray-600 text-sm">
                Avoid complex tables or graphics that ATS can't read properly.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#2d5649] mb-2">
                ✓ Quantify Your Achievements
              </h3>
              <p className="text-gray-600 text-sm">
                Use numbers and metrics to demonstrate your impact and results.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#2d5649] mb-2">
                ✓ Tailor for Each Application
              </h3>
              <p className="text-gray-600 text-sm">
                Customize your resume for each job using the AI tools above.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ResumeToolkit;
