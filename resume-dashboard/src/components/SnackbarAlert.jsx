// src/components/SnackbarAlert.jsx

import React from "react";
import PropTypes from "prop-types";
import MuiAlert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

const AlertSnackbar = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

function SnackbarAlert({ open, message, severity, onClose }) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <AlertSnackbar
        onClose={onClose}
        severity={severity}
        sx={{ width: "100%" }}
      >
        {message}
      </AlertSnackbar>
    </Snackbar>
  );
}

SnackbarAlert.propTypes = {
  open: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  severity: PropTypes.oneOf(["error", "warning", "info", "success"]).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default SnackbarAlert;
