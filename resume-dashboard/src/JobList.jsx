// JobList.jsx

import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import PropTypes from "prop-types";
import {
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Stack,
  Toolbar,
  Tooltip,
  CardActions,
  TextField,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  Build as BuildIcon,
} from "@mui/icons-material";
import MuiAlert from "@mui/material/Alert";

// Define Alert component for Snackbar
const AlertSnackbar = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function JobList({ toggleTheme, themeMode }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

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
      const response = await axios.get(`${API_BASE_URL}/api/jobs`, {
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

  const handleSearch = (event) => {
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

  // JobCard component
  const JobCard = ({ job, onGenerateDownload, onClick }) => (
    <Grid item xs={12} sm={6} md={4} key={job._id}>
      <Card
        variant="outlined"
        sx={{
          height: "100%", // Make card take full height of grid item
          display: "flex",
          flexDirection: "column",
          cursor: "pointer", // Indicate clickable
        }}
        onClick={() => onClick(job)}
      >
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" component="div">
            {job.TITLE || "N/A"}
          </Typography>
          <Typography color="text.secondary">{job.COMPANY || "N/A"}</Typography>
          <Typography variant="body2" mt={1}>
            <strong>Salary:</strong> {job.SALARY || "N/A"}
          </Typography>
          <Typography variant="body2">
            <strong>Location:</strong> {job.LOCATION || "N/A"}
          </Typography>
          <Typography variant="body2" mt={1}>
            <strong>Skills:</strong>{" "}
            {job.SKILL && job.SKILL.length > 0 ? job.SKILL.join(", ") : "N/A"}
          </Typography>
        </CardContent>
        <CardActions>
          <Tooltip
            title={job.resumePath ? "Download Resume" : "Generate Resume"}
          >
            <IconButton
              size="small"
              color="secondary"
              aria-label={
                job.resumePath ? "Download Resume" : "Generate Resume"
              }
              onClick={(e) => {
                e.stopPropagation(); // Prevent triggering card click
                onGenerateDownload(job);
              }}
            >
              {job.resumePath ? <DownloadIcon /> : <BuildIcon />}
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </Grid>
  );

  // Define PropTypes for JobCard
  JobCard.propTypes = {
    job: PropTypes.shape({
      _id: PropTypes.string.isRequired,
      TITLE: PropTypes.string,
      COMPANY: PropTypes.string,
      SALARY: PropTypes.string,
      LOCATION: PropTypes.string,
      SKILL: PropTypes.arrayOf(PropTypes.string),
      resumePath: PropTypes.string,
      isGenerate: PropTypes.bool,
      DESCRIPTION: PropTypes.string,
    }).isRequired,
    onGenerateDownload: PropTypes.func.isRequired,
    onClick: PropTypes.func.isRequired,
  };

  return (
    <Stack spacing={2} sx={{ padding: 2, margin: 2 }}>
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Typography variant="h6" component="div">
          Job Dashboard
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Search Jobs"
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            sx={{ width: "300px" }}
          />
          <Tooltip title="Refresh">
            <IconButton aria-label="refresh" onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Toggle Theme">
            <IconButton aria-label="toggle theme" onClick={toggleTheme}>
              {themeMode === "dark" ? <DarkModeIcon /> : <LightModeIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      </Toolbar>

      {loading ? (
        <Stack alignItems="center" mt={4}>
          <CircularProgress />
          <Typography variant="body1" mt={2}>
            Loading jobs...
          </Typography>
        </Stack>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : jobs.length === 0 ? (
        <Alert severity="info">No jobs found.</Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {jobs.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onGenerateDownload={handleGenerateDownload}
                onClick={handleCardClick}
              />
            ))}
          </Grid>
          {/* Pagination Controls and Items per page */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mt={4}
          >
            <FormControl variant="outlined" size="small">
              <InputLabel id="limit-select-label">Items per page</InputLabel>
              <Select
                labelId="limit-select-label"
                value={limit}
                onChange={handleLimitChange}
                label="Items per page"
                sx={{ width: "150px" }}
              >
                <MenuItem value={6}>6</MenuItem>
                <MenuItem value={12}>12</MenuItem>
                <MenuItem value={24}>24</MenuItem>
              </Select>
            </FormControl>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Stack>
        </>
      )}

      {/* Detail Modal */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="sm"
        aria-labelledby="job-detail-dialog-title"
      >
        <DialogTitle id="job-detail-dialog-title">Job Details</DialogTitle>
        <DialogContent dividers>
          {selectedJob ? (
            <Stack spacing={2}>
              <Typography variant="h6">{selectedJob.TITLE || "N/A"}</Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {selectedJob.COMPANY || "N/A"}
              </Typography>
              <Typography>
                <strong>Salary:</strong> {selectedJob.SALARY || "N/A"}
              </Typography>
              <Typography>
                <strong>Location:</strong> {selectedJob.LOCATION || "N/A"}
              </Typography>
              <Typography>
                <strong>Skills:</strong>{" "}
                {selectedJob.SKILL && selectedJob.SKILL.length > 0
                  ? selectedJob.SKILL.join(", ")
                  : "N/A"}
              </Typography>
              <Typography>
                <strong>Description:</strong> {selectedJob.DESCRIPTION || "N/A"}
              </Typography>
            </Stack>
          ) : (
            <Typography>No details available.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <AlertSnackbar
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </AlertSnackbar>
      </Snackbar>
    </Stack>
  );
}

// Define PropTypes
JobList.propTypes = {
  toggleTheme: PropTypes.func.isRequired,
  themeMode: PropTypes.oneOf(["light", "dark"]).isRequired,
};

export default JobList;
