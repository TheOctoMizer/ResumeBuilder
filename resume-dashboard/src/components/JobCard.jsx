// src/components/JobCard.jsx

import React from "react";
import PropTypes from "prop-types";
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Tooltip,
  Chip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Download as DownloadIcon,
  Build as BuildIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  AttachMoney as SalaryIcon,
} from "@mui/icons-material";
import { useState } from "react";

function JobCard({ job, onGenerateDownload, themeMode}) {
  const navigate = useNavigate();
  console.log(job);
  console.log(themeMode);
  const [jobId, setJobId] = useState(job.id);
  // Helper function to format location
  const formatLocation = (job) => {
    const locationParts = [
      job.City || '',
      job.State || '',
      job.Country || ''
    ].filter(Boolean);
    return locationParts.length > 0 ? locationParts.join(', ') : 'Location Not Specified';
  };

  // Helper function to format salary
  const formatSalary = (salary) => {
    if (!salary) return 'Salary Not Specified';
    
    // Check if salary is a number or contains currency symbol
    const numericSalary = parseFloat(salary.replace(/[^\d.-]/g, ''));
    
    if (!isNaN(numericSalary)) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(numericSalary);
    }
    
    return salary;
  };

  const handleJobClick = () => {
    if (job && job.job_id) {  // Make sure we're using the correct ID field
      console.log("Job object:", job);
      console.log("Navigating to job:", job.job_id);
      navigate(`/dashboard/${job.job_id}`);
    } else {
      console.error('No job ID available:', job);
    }
  };

  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        transition: "transform 0.2s",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
        }
      }}
      onClick={handleJobClick}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div" gutterBottom>
          {job.JobTitle || "Job Title Not Available"}
        </Typography>
        
        <Typography color="text.secondary" gutterBottom>
          <WorkIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          {job.Company || "Company Not Specified"}
        </Typography>
        
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          {formatLocation(job)}
        </Typography>
        
        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <SalaryIcon fontSize="small" sx={{ verticalAlign: 'middle', mr: 1 }} />
          {formatSalary(job.Salary)}
        </Typography>
        
        {job.TechnicalSkills && job.TechnicalSkills.length > 0 && (
          <div style={{ marginTop: 8 }}>
            {job.TechnicalSkills.slice(0, 3).map((skill, index) => (
              <Chip 
                key={index} 
                label={skill} 
                size="small" 
                variant="outlined" 
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
            {job.TechnicalSkills.length > 3 && (
              <span 
                style={{ 
                  border: '1px solid #1976d2', 
                  borderRadius: '4px', 
                  padding: '2px 6px', 
                  marginRight: '4px',
                  fontSize: '0.75rem',
                  color: '#1976d2'
                }}
              >
                +{job.TechnicalSkills.length - 3} more
              </span>
            )}
          </div>
        )}
      </CardContent>
      <CardActions>
        <Tooltip title={job.ResumePath ? "Download Resume" : "Generate Resume"}>
          <IconButton
            size="small"
            color="secondary"
            aria-label={job.ResumePath ? "Download Resume" : "Generate Resume"}
            onClick={(e) => {
              e.stopPropagation(); // Prevent triggering card click
              onGenerateDownload(job);
            }}
          >
            {/* {job.ResumePath ? <DownloadIcon /> : <BuildIcon />} */}
            {job.ResumePath ? "Download Resume" : "Generate Resume"}
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

JobCard.propTypes = {
  job: PropTypes.shape({
    job_id: PropTypes.string.isRequired,
    JobTitle: PropTypes.string,
    Company: PropTypes.string,
    City: PropTypes.string,
    State: PropTypes.string,
    Country: PropTypes.string,
    Salary: PropTypes.string,
    TechnicalSkills: PropTypes.arrayOf(PropTypes.string),
    ResumePath: PropTypes.string
  }).isRequired,
  onGenerateDownload: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired
};

export default JobCard;
