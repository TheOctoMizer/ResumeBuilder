import React, { useState, useEffect, useCallback } from "react";
import {
  Typography,
  Box,
  Grid,
  Paper,
  useTheme,
  Card,
  CardContent,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Analytics() {
  const theme = useTheme();
  const [applicationStages, setApplicationStages] = useState({});
  const [timeToRespond, setTimeToRespond] = useState(0);
  const [jobStats, setJobStats] = useState({});
  const [jobSourceEffectiveness, setJobSourceEffectiveness] = useState([]);
  const [responseRates, setResponseRates] = useState({});
  const [error, setError] = useState(null);

  const fetchApplicationStages = useCallback(async () => {
    try {
      const response = await fetch("/api/applicationStages");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setApplicationStages(data);
    } catch (error) {
      console.error("Error fetching application stages:", error);
      setError(error.message);
    }
  }, []);

  const fetchTimeToRespond = useCallback(async () => {
    try {
      const response = await fetch("/api/timeToRespond");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTimeToRespond(data.average_time_to_shortlist_days);
    } catch (error) {
      console.error("Error fetching time to respond:", error);
      setError(error.message);
    }
  }, []);

  const fetchJobStats = useCallback(async () => {
    try {
      const response = await fetch("/api/stats");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setJobStats(data);
    } catch (error) {
      console.error("Error fetching job stats:", error);
      setError(error.message);
    }
  }, []);

  const fetchJobSourceEffectiveness = useCallback(async () => {
    try {
      const response = await fetch("/api/jobSourceEffectiveness");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setJobSourceEffectiveness(data);
    } catch (error) {
      console.error("Error fetching job source effectiveness:", error);
      setError(error.message);
    }
  }, []);

  const fetchResponseRates = useCallback(async () => {
    try {
      const response = await fetch("/api/responseRates");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResponseRates(data);
    } catch (error) {
      console.error("Error fetching response rates:", error);
      setError(error.message);
    }
  }, []);

  useEffect(() => {
    fetchApplicationStages();
    fetchTimeToRespond();
    fetchJobStats();
    fetchJobSourceEffectiveness();
    fetchResponseRates();
  }, [
    fetchApplicationStages,
    fetchTimeToRespond,
    fetchJobStats,
    fetchJobSourceEffectiveness,
    fetchResponseRates,
  ]);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#AF19FF",
    "#FF1919",
  ];

  const pieChartData = Object.entries(applicationStages).map(
    ([key, value], index) => ({
      name: key,
      value: value,
      color: COLORS[index % COLORS.length],
    })
  );

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Stages
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card elevation={3} sx={{ height: "100%" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Time to Respond
              </Typography>
              <Typography variant="body1">
                Average time to shortlist: {timeToRespond.toFixed(2)} days
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={12}>
          <Paper sx={{ padding: theme.spacing(2) }} elevation={3}>
            <Typography variant="h6" gutterBottom>
              Job Statistics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Salary Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={jobStats.salaryDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Location Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={jobStats.locationDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill={theme.palette.secondary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Top Skills
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={jobStats.topSkills}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill={theme.palette.primary.main} />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Job Source Effectiveness
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={jobSourceEffectiveness}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="_id" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="total_applications"
                      fill={theme.palette.secondary.main}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  Response Rates
                </Typography>
                <Typography variant="body1">
                  Shortlisted Rate:{" "}
                  {responseRates?.ResponseRates?.ShortlistedRate?.toFixed(2)}%
                </Typography>
                <Typography variant="body1">
                  Interviewed Rate:{" "}
                  {responseRates?.ResponseRates?.InterviewedRate?.toFixed(2)}%
                </Typography>
                <Typography variant="body1">
                  Offered Rate:{" "}
                  {responseRates?.ResponseRates?.OfferedRate?.toFixed(2)}%
                </Typography>
                <Typography variant="body1">
                  Accepted Rate:{" "}
                  {responseRates?.ResponseRates?.AcceptedRate?.toFixed(2)}%
                </Typography>
                <Typography variant="body1">
                  Rejected Rate:{" "}
                  {responseRates?.ResponseRates?.RejectedRate?.toFixed(2)}%
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Analytics; 