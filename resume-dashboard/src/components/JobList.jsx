// src/components/JobList.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  TextField,
} from "@mui/material";
import JobCard from "./JobCard";
import PaginationControls from "./PaginationControls";
import axios from "axios";
import PropTypes from 'prop-types';

function JobList({ toggleTheme, themeMode, searchTerm, setSearchTerm }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(12);

  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8000"; // Update to match backend port

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
      if (response.data.error) {
        setError(response.data.error);
      } else {
        setJobs(response.data.jobs);
        setTotalPages(response.data.pagination.total_pages);
        console.log(response.data.jobs);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError("Failed to fetch jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, limit, searchTerm, API_BASE_URL]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const handleLimitChange = (event) => {
    setLimit(parseInt(event.target.value, 10));
    setCurrentPage(1); // Reset to first page when limit changes
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const handleGenerateDownload = async (jobId) => {
    try {
      const response = await fetch("/api/generateResume", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ job_id: jobId }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Error generating resume:", error);
      setError(error.message);
    }
  };

  const handleCardClick = (jobId) => {
    console.log(`Card clicked for job ID: ${jobId}`);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <TextField
        label="Search Jobs"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchTerm}
        onChange={handleSearchChange}
        className="search-bar"
      />
      <Box sx={{ mt: 2 }}>
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
                <Grid item xs={12} sm={6} md={4} key={job.job_id}>
                  <JobCard
                    job={job}
                    onGenerateDownload={handleGenerateDownload}
                    onClick={handleCardClick}
                    key={job.JobID}
                    themeMode={themeMode}
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
      </Box>
    </Box>
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
