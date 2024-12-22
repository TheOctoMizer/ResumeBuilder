// src/JobList.jsx

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Grid,
  CircularProgress,
  Alert,
  Stack,
  Typography,
  Container,
  Box,
  TextField,
  InputAdornment,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import JobCard from "./JobCard";
// import {
//   Download as DownloadIcon,
//   Refresh as RefreshIcon,
//   LightMode as LightModeIcon,
//   DarkMode as DarkModeIcon,
//   Build as BuildIcon,
// } from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";
import PaginationControls from "./PaginationControls";
import DetailModal from "./DetailModal";
import SnackbarAlert from "./SnackbarAlert";

// Define Alert component for Snackbar
const AlertSnackbar = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function JobList({ toggleTheme, themeMode }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(12); // Now dynamic

  // Modal state
  const [openModal, setOpenModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  // API base URL from environment variable
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

  // Fetch jobs function wrapped in useCallback
  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/allJobs`, {
        params: {
          page: currentPage,
          limit: limit,
          search: searchTerm,
        },
      });
      setJobs(response.data.jobs);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, currentPage, limit, searchTerm]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleRefresh = () => {
    fetchJobs();
    setSnackbar({
      open: true,
      message: "Jobs refreshed.",
      severity: "success",
    });
  };

  const handleGenerateDownload = async (job) => {
    try {
      if (job.resumePath) {
        // Use anchor tag to initiate download
        const link = document.createElement("a");
        link.href = `${API_BASE_URL}/${job.resumePath}`;
        link.download = job.resumePath.split("/").pop(); // Extract filename
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setSnackbar({
          open: true,
          message: "Resume downloaded successfully.",
          severity: "success",
        });
      } else if (job.isGenerate) {
        // Implement generate functionality
        // Placeholder for generate action
        // After successful generation, update job list or notify user
        // For example:
        await axios.post(`${API_BASE_URL}/api/generate?jobId=${job._id}`);
        fetchJobs();
        setSnackbar({
          open: true,
          message: `Generated resume for job ID: ${job._id}`,
          severity: "success",
        });
      } else {
        setSnackbar({
          open: true,
          message: `No action available for job ID: ${job._id}`,
          severity: "info",
        });
      }
    } catch (error) {
      console.error("Error in generate/download:", error);
      setSnackbar({
        open: true,
        message: "Action failed. Please try again.",
        severity: "error",
      });
    }
  };

  const handleSearchChange = (event) => {
    const value = event.target.value;
    // Example validation: limit length and remove harmful characters
    const sanitizedValue = value
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .substring(0, 100);
    setSearchTerm(sanitizedValue);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to first page
  };

  const handleCardClick = (job) => {
    setSelectedJob(job);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedJob(null);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Search jobs..."
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mr: 2, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <LoadingButton
          loading={refreshing}
          loadingPosition="start"
          startIcon={<RefreshIcon />}
          variant="contained"
          color="primary"
          onClick={handleRefresh}
        >
          Refresh
        </LoadingButton>
      </Box>

      <Stack spacing={3}>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "50vh",
            }}
          >
            <CircularProgress size={60} />
            <Typography variant="h6" color="textSecondary" sx={{ mt: 2 }}>
              Loading jobs...
            </Typography>
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ width: "100%" }}>
            {error}
          </Alert>
        ) : jobs.length === 0 ? (
          <Alert severity="info" sx={{ width: "100%" }}>
            No jobs found. Try adjusting your search.
          </Alert>
        ) : (
          <>
            <Grid container spacing={3}>
              {jobs.map((job) => (
                <Grid item xs={12} sm={6} md={4} key={job._id}>
                  <JobCard
                    job={job}
                    onGenerateDownload={handleGenerateDownload}
                    onClick={handleCardClick}
                  />
                </Grid>
              ))}
            </Grid>

            {/* Pagination Controls */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 4,
              }}
            >
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                limit={limit}
                onLimitChange={handleLimitChange}
              />
            </Box>
          </>
        )}

        {/* Detail Modal */}
        <DetailModal
          open={openModal}
          onClose={handleCloseModal}
          job={selectedJob}
        />

        {/* Snackbar for notifications */}
        <SnackbarAlert
          open={snackbar.open}
          message={snackbar.message}
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
        />
      </Stack>
    </Container>
  );
}

// Define PropTypes
JobList.propTypes = {
  toggleTheme: PropTypes.func.isRequired,
  themeMode: PropTypes.oneOf(["light", "dark"]).isRequired,
  searchTerm: PropTypes.string.isRequired,
  setSearchTerm: PropTypes.func.isRequired,
};

export default JobList;
