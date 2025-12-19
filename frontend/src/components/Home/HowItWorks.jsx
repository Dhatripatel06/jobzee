import React from "react";
import { FaUserPlus } from "react-icons/fa";
import { MdFindInPage } from "react-icons/md";
import { IoMdSend } from "react-icons/io";
import { motion } from "framer-motion";

const HowItWorks = () => {
  const steps = [
    {
      id: 1,
      icon: <FaUserPlus />,
      title: "Create Account",
      description: "Start Your Adventure: Create Your Account, Find Your Dream Job",
    },
    {
      id: 2,
      icon: <MdFindInPage />,
      title: "Find a Job/Post a Job",
      description:
        "Elevate Your Career: Explore Opportunities or Post Jobs That Transform Lives",
    },
    {
      id: 3,
      icon: <IoMdSend />,
      title: "Apply For Job/Recruit Suitable Candidates",
      description:
        "Seize the Moment: Apply for Opportunities or Recruit the Perfect Match",
    },
  ];

  return (
    <div className="bg-white py-16 lg:py-24">
      <div className="page-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="section-title">How JobZee Works</h2>
          <p className="section-subtitle">
            Get started in just three simple steps
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="card p-8 text-center relative overflow-hidden group"
            >
              {/* Step Number */}
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-accent-50 
                            flex items-center justify-center text-accent-500 font-bold text-xl
                            group-hover:bg-accent-500 group-hover:text-white transition-colors duration-300">
                {step.id}
              </div>

              {/* Icon */}
              <div className="text-accent-500 text-6xl mb-6 flex justify-center
                            group-hover:scale-110 transition-transform duration-300">
                {step.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-secondary-900 mb-4">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-secondary-600 leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;