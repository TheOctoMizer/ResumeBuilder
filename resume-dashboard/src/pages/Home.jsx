// src/pages/Home.jsx

import React from "react";
import JobList from "../components/JobList";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

function Home({ toggleTheme, themeMode }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
        <h1 className="text-4xl font-bold mb-4 text-center">
          Welcome to the Job Application Tracker
        </h1>
        <p className="text-lg mb-8 text-center">
          This application helps you keep track of your job applications and
          provides insights into your job search process.
        </p>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Go to Dashboard
        </button>
      </div>
      <JobList
        toggleTheme={toggleTheme}
        themeMode={themeMode}
        searchTerm=""
        setSearchTerm={() => {}}
      />
    </motion.div>
  );
}

export default Home;
