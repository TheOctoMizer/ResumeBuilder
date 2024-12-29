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
} from "@mui/material";
import {
  Download as DownloadIcon,
  Build as BuildIcon,
} from "@mui/icons-material";

function JobCard({ job, onGenerateDownload, onClick }) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
      }}
      onClick={() => onClick(job)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" component="div">
          {job.JobTitle || "N/A"}
        </Typography>
        <Typography color="text.secondary">{job.Company || "N/A"}</Typography>
        <Typography variant="body2" mt={1}>
          <strong>Salary:</strong> {job.Salary || "N/A"}
        </Typography>
        <Typography variant="body2">
          <strong>Location:</strong>{" "}
          {`${job.City}, ${job.State}, ${job.Country}` || "N/A"}
        </Typography>
        <Typography variant="body2" mt={1}>
          <strong>Skills:</strong>{" "}
          {job.TechnicalSkills && job.TechnicalSkills.length > 0
            ? job.TechnicalSkills.join(", ")
            : "N/A"}
        </Typography>
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
            {job.ResumePath ? <DownloadIcon /> : <BuildIcon />}
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
}

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

export default JobCard;
