import React from "react";
import { FaMicrosoft, FaApple } from "react-icons/fa";
import { SiTesla } from "react-icons/si";
import { HiLocationMarker } from "react-icons/hi";
import { motion } from "framer-motion";

const PopularCompanies = () => {
  const companies = [
    {
      id: 1,
      title: "Microsoft",
      location: "Tramway Road, Kalina, Santacruz East, Mumbai, Maharashtra 400098",
      openPositions: 10,
      icon: <FaMicrosoft />,
    },
    {
      id: 2,
      title: "Tesla",
      location: "14TH FLOOR, SKAV 909, LAVELLE ROAD, BENGALURU Bangalore",
      openPositions: 5,
      icon: <SiTesla />,
    },
    {
      id: 3,
      title: "Apple",
      location: "Concorde Tower C,UB City No.24, Vittal Mallya Road, Bangalore 560001",
      openPositions: 20,
      icon: <FaApple />,
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
          <h2 className="section-title">Top Companies</h2>
          <p className="section-subtitle">
            Join the world's leading companies
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {companies.map((company, index) => (
            <motion.div
              key={company.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="card p-6 flex flex-col justify-between group"
            >
              <div>
                {/* Company Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-accent-500 text-5xl group-hover:scale-110 transition-transform duration-300">
                    {company.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-secondary-900">
                      {company.title}
                    </h3>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-2 mb-6">
                  <HiLocationMarker className="text-accent-500 mt-1 flex-shrink-0" />
                  <p className="text-sm text-secondary-600">{company.location}</p>
                </div>
              </div>

              {/* Open Positions Button */}
              <button className="btn-secondary w-full">
                {company.openPositions} Open Positions
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PopularCompanies;