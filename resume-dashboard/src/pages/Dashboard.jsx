import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Grid,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { motion } from "framer-motion";
import DashboardCard from "../components/DashboardCard";

function Dashboard({ toggleTheme, themeMode }) {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // Fetch dashboard data for specific job
  const fetchDashboardData = useCallback(async () => {
    if (!jobId) return;

    setLoading(true);
    try {
      console.log("Fetching data for job ID:", jobId);
      const response = await fetch(`/api/dashboard/${jobId}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Fetched dashboard data:", data);
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <Alert severity="error">{error}</Alert>
      </Box>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
    >
      <Container maxWidth="xl" sx={{ mt: 3 }}>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : dashboardData ? (
          <Grid container spacing={3}>
            {/* Job Details */}
            <Grid item xs={12} md={6}>
              <DashboardCard
                title="Job Details"
                content={
                  <Box>
                    <Typography variant="h6">{dashboardData.jobDetails.JobTitle}</Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Company:</strong> {dashboardData.jobDetails.Company}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Location:</strong> {`${dashboardData.jobDetails.City || ''} ${dashboardData.jobDetails.State || ''}`}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Salary:</strong> {dashboardData.jobDetails.Salary || 'Not specified'}
                    </Typography>
                  </Box>
                }
              />
            </Grid>

            {/* Company Stats */}
            <Grid item xs={12} md={6}>
              <DashboardCard
                title="Company Statistics"
                content={
                  <Box>
                    <Typography variant="body1" gutterBottom>
                      <strong>Total Applications:</strong> {dashboardData.companyStats.totalApplications}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Average Salary:</strong> ${Math.round(dashboardData.companyStats.averageSalary).toLocaleString()}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Similar Roles:</strong>
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {dashboardData.companyStats.similarRoles.map((role, index) => (
                        <Chip key={index} label={role} size="small" />
                      ))}
                    </Box>
                  </Box>
                }
              />
            </Grid>

            {/* Application Timeline */}
            <Grid item xs={12}>
              <DashboardCard
                title="Application Timeline"
                content={
                  <Box>
                    <Typography variant="body1" gutterBottom>
                      <strong>Applied Date:</strong> {new Date(dashboardData.applicationTimeline.applied).toLocaleDateString()}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      <strong>Current Status:</strong> {dashboardData.applicationTimeline.status}
                    </Typography>
                    {dashboardData.applicationTimeline.interviews.length > 0 && (
                      <>
                        <Typography variant="body1" gutterBottom>
                          <strong>Interviews:</strong>
                        </Typography>
                        {dashboardData.applicationTimeline.interviews.map((interview, index) => (
                          <Box key={index} sx={{ ml: 2, mb: 1 }}>
                            <Typography variant="body2">
                              {new Date(interview.date).toLocaleDateString()} - {interview.type}
                            </Typography>
                          </Box>
                        ))}
                      </>
                    )}
                  </Box>
                }
              />
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info">Select a job to view details</Alert>
        )}
      </Container>
    </motion.div>
  );
}

export default Dashboard; 