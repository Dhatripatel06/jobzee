import React, { useContext } from "react";
import { FaBuilding, FaSuitcase, FaUsers, FaUserPlus, FaRobot } from "react-icons/fa";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Context } from "../../main";

const HeroSection = () => {
  const { user } = useContext(Context);
  
  const details = [
    {
      id: 1,
      title: "1,23,441",
      subTitle: "Live Job",
      icon: <FaSuitcase />,
    },
    {
      id: 2,
      title: "91220",
      subTitle: "Companies",
      icon: <FaBuilding />,
    },
    {
      id: 3,
      title: "2,34,200",
      subTitle: "Job Seekers",
      icon: <FaUsers />,
    },
    {
      id: 4,
      title: "1,03,761",
      subTitle: "Employers",
      icon: <FaUserPlus />,
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div className="bg-gradient-to-b from-white to-accent-50 py-16 lg:py-24">
      <div className="page-container">
        {/* Hero Content */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6 leading-tight">
              Find a job that suits{" "}
              <span className="text-gradient">your interests and skills</span>
            </h1>
            <p className="text-lg md:text-xl text-secondary-600 mb-8 leading-relaxed">
              Craft Your Future, Design Your Destiny: Your Success Story Starts Here.
              Let us be the architect of your dreams, helping you design a destiny
              filled with purpose, passion, and unparalleled success.
            </p>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <img
              src="/heroS.jpg"
              alt="Hero"
              className="w-full max-w-md lg:max-w-lg rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>

        {/* Stats Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {details.map((element) => (
            <motion.div
              key={element.id}
              variants={itemVariants}
              className="card p-6 text-center group cursor-pointer"
            >
              <div className="text-accent-500 text-4xl md:text-5xl mb-4 flex justify-center
                            group-hover:scale-110 transition-transform duration-300">
                {element.icon}
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-secondary-900 mb-2">
                {element.title}
              </h3>
              <p className="text-secondary-600 font-medium">{element.subTitle}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* AI Tools Banner for Job Seekers */}
        {user && user.role === "Job Seeker" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-12"
          >
            <Link to="/tools">
              <div className="bg-gradient-to-r from-[#2d5649] to-[#3d7359] rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02]">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-4 rounded-full">
                      <FaRobot className="text-4xl text-white" />
                    </div>
                    <div className="text-white">
                      <h3 className="text-2xl font-bold mb-2">AI Career Tools & Resume Toolkit</h3>
                      <p className="text-white/90">
                        Access free AI-powered tools to optimize your resume and boost your job search
                      </p>
                    </div>
                  </div>
                  <button className="px-8 py-3 bg-white text-[#2d5649] font-bold rounded-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                    Explore Tools →
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;