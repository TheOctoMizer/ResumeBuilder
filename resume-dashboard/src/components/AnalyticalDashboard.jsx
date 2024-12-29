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
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"; // Update to match backend port

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/jobs/stats`);
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setStats(response.data);
      }
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

  // Extract data for charts
  const salaryData = stats.salaryDistribution.map((item) => ({
    salaryRange: item._id,
    count: item.count,
  }));

  const locationData = stats.locationDistribution.map((item) => ({
    location: item._id,
    count: item.count,
  }));

  const skillsData = stats.topSkills.map((item) => ({
    skill: item._id,
    count: item.count,
  }));

  const jobSourceData = stats.jobSourceEffectiveness.map((item) => ({
    jobFind: item._id,
    total_applications: item.total_applications,
    shortlisted: item.shortlisted,
    interviewed: item.interviewed,
    offered: item.offered,
    accepted: item.accepted,
    rejected: item.rejected,
  }));

  const pieColors = ["#6EC1E4", "#FFCCC9", "#50C8D3", "#FF7F50", "#2E2E2E"];

  return (
    <Stack spacing={4} sx={{ padding: 4, margin: 2 }}>
      <Typography variant="h4" align="center">
        Analytical Dashboard
      </Typography>

      {/* Application Stage Distribution */}
      <Typography variant="h6">Application Stage Distribution</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={[
              {
                name: "Applied",
                value: stats.applicationStageDistribution.Applied || 0,
              },
              {
                name: "Shortlisted",
                value: stats.applicationStageDistribution.Shortlisted || 0,
              },
              {
                name: "Interviewed",
                value: stats.applicationStageDistribution.Interviewed || 0,
              },
              {
                name: "Offered",
                value: stats.applicationStageDistribution.Offered || 0,
              },
              {
                name: "Accepted",
                value: stats.applicationStageDistribution.Accepted || 0,
              },
              {
                name: "Rejected",
                value: stats.applicationStageDistribution.Rejected || 0,
              },
            ]}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            fill="#6EC1E4"
            label
          >
            {[
              "Applied",
              "Shortlisted",
              "Interviewed",
              "Offered",
              "Accepted",
              "Rejected",
            ].map((entry, index) => (
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

      {/* Salary Distribution */}
      <Typography variant="h6">Salary Distribution</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={salaryData}>
          <XAxis dataKey="salaryRange" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Bar dataKey="count" fill="#6EC1E4" />
        </BarChart>
      </ResponsiveContainer>

      {/* Location Distribution */}
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

      {/* Top Skills */}
      <Typography variant="h6">Top Skills</Typography>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={skillsData}>
          <XAxis dataKey="skill" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Bar dataKey="count" fill="#50C8D3" />
        </BarChart>
      </ResponsiveContainer>

      {/* Job Source Effectiveness */}
      <Typography variant="h6">Job Source Effectiveness</Typography>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={jobSourceData}>
          <XAxis dataKey="jobFind" />
          <YAxis allowDecimals={false} />
          <RechartsTooltip />
          <Legend />
          <Bar
            dataKey="total_applications"
            fill="#6EC1E4"
            name="Total Applications"
          />
          <Bar dataKey="shortlisted" fill="#FFCCC9" name="Shortlisted" />
          <Bar dataKey="interviewed" fill="#50C8D3" name="Interviewed" />
          <Bar dataKey="offered" fill="#FF7F50" name="Offered" />
          <Bar dataKey="accepted" fill="#2E2E2E" name="Accepted" />
          <Bar dataKey="rejected" fill="#D3D3D3" name="Rejected" />
        </BarChart>
      </ResponsiveContainer>
    </Stack>
  );
}

export default AnalyticalDashboard;
