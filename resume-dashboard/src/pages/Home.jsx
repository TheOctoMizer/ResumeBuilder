// src/pages/Home.jsx

import React, { useState } from "react";
import PropTypes from "prop-types";
import Header from "../components/Header";
import JobList from "../components/JobList";
import { useNavigate } from "react-router-dom";

function Home({ toggleTheme, themeMode }) {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const handleAnalyticsClick = () => {
    navigate("/dashboard");
  };

  return (
    <>
      <Header
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        onRefresh={() => window.location.reload()}
        toggleTheme={toggleTheme}
        themeMode={themeMode}
        onAnalyticsClick={handleAnalyticsClick}
      />
      <JobList
        toggleTheme={toggleTheme}
        themeMode={themeMode}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
    </>
  );
}

Home.propTypes = {
  toggleTheme: PropTypes.func.isRequired,
  themeMode: PropTypes.oneOf(["light", "dark"]).isRequired,
};

export default Home;
