// src/components/AnalyticalDashboard.jsx

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Stack, Typography, CircularProgress, Alert } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

function AnalyticalDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Assuming your backend has an endpoint to provide statistics
      const response = await axios.get(`${API_BASE_URL}/api/jobs/stats`);
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching statistics:", err);
      setError("Failed to fetch statistics. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return (
      <Stack alignItems="center" mt={4}>
        <CircularProgress />
        <Typography variant="body1" mt={2}>
          Loading statistics...
        </Typography>
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!stats) {
    return <Alert severity="info">No statistics available.</Alert>;
  }

  // Sample data structures; adjust based on your actual API response
  const salaryData = stats.salaryDistribution; // e.g., [{ salaryRange: '50k-60k', count: 10 }, ...]
  const locationData = stats.locationDistribution; // e.g., [{ location: 'New York', count: 15 }, ...]
  const skillsData = stats.topSkills; // e.g., [{ skill: 'JavaScript', count: 20 }, ...]

  const pieColors = ["#6EC1E4", "#FFCCC9", "#50C8D3", "#FF7F50", "#2E2E2E"];

  return (
    <Stack spacing={4} sx={{ padding: 4, margin: 2 }}>
      <Typography variant="h4" align="center">
        Analytical Dashboard
      </Typography>

      <Typography variant="h6">Salary Distribution</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={salaryData}>
          <XAxis dataKey="salaryRange" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Bar dataKey="count" fill="#6EC1E4" />
        </BarChart>
      </ResponsiveContainer>

      <Typography variant="h6">Location Distribution</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={locationData}
            dataKey="count"
            nameKey="location"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#FFCCC9"
            label
          >
            {locationData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={pieColors[index % pieColors.length]}
              />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <Typography variant="h6">Top Skills</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={skillsData}>
          <XAxis dataKey="skill" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Bar dataKey="count" fill="#50C8D3" />
        </BarChart>
      </ResponsiveContainer>
    </Stack>
  );
}

export default AnalyticalDashboard;
