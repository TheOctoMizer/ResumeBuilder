// src/pages/Dashboard.jsx

import React from "react";
import PropTypes from "prop-types";
import Header from "../components/Header";
import AnalyticalDashboard from "../components/AnalyticalDashboard";
import { useNavigate } from "react-router-dom";

function Dashboard({ toggleTheme, themeMode }) {
  const navigate = useNavigate();

  const handleAnalyticsClick = () => {
    // Optionally, navigate to the dashboard itself or implement other logic
    // For now, we'll keep it as is
  };

  return (
    <>
      <Header
        searchTerm="" // Analytics page might not need search
        onSearchChange={() => {}} // No-op
        onRefresh={() => window.location.reload()}
        toggleTheme={toggleTheme}
        themeMode={themeMode}
        onAnalyticsClick={handleAnalyticsClick}
      />
      <AnalyticalDashboard />
    </>
  );
}

Dashboard.propTypes = {
  toggleTheme: PropTypes.func.isRequired,
  themeMode: PropTypes.oneOf(["light", "dark"]).isRequired,
};

export default Dashboard;
