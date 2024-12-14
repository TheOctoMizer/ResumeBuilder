// src/components/DetailModal.jsx

import React from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Stack,
} from "@mui/material";

function DetailModal({ open, onClose, job }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      aria-labelledby="job-detail-dialog-title"
    >
      <DialogTitle id="job-detail-dialog-title">Job Details</DialogTitle>
      <DialogContent dividers>
        {job ? (
          <Stack spacing={2}>
            <Typography variant="h6">{job.TITLE || "N/A"}</Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {job.COMPANY || "N/A"}
            </Typography>
            <Typography>
              <strong>Salary:</strong> {job.SALARY || "N/A"}
            </Typography>
            <Typography>
              <strong>Location:</strong> {job.LOCATION || "N/A"}
            </Typography>
            <Typography>
              <strong>Skills:</strong>{" "}
              {job.SKILL && job.SKILL.length > 0 ? job.SKILL.join(", ") : "N/A"}
            </Typography>
            <Typography>
              <strong>Description:</strong> {job.DESCRIPTION || "N/A"}
            </Typography>
          </Stack>
        ) : (
          <Typography>No details available.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

DetailModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  job: PropTypes.shape({
    TITLE: PropTypes.string,
    COMPANY: PropTypes.string,
    SALARY: PropTypes.string,
    LOCATION: PropTypes.string,
    SKILL: PropTypes.arrayOf(PropTypes.string),
    DESCRIPTION: PropTypes.string,
  }),
};

export default DetailModal;
