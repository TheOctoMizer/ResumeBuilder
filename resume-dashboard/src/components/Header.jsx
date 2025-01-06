// src/components/Header.jsx

import React from "react";
import PropTypes from "prop-types";
import {
  Toolbar,
  Typography,
  Stack,
  TextField,
  Button,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  LightMode as LightModeIcon,
  DarkMode as DarkModeIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";

function Header({
  searchTerm,
  onSearchChange,
  onRefresh,
  toggleTheme,
  themeMode,
  onAnalyticsClick,
}) {
  return (
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
        <Tooltip title="Analytics">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<BarChartIcon />}
            onClick={onAnalyticsClick}
          >
            Analytics
          </Button>
        </Tooltip>
        <Tooltip title="Refresh">
          <IconButton aria-label="refresh" onClick={onRefresh}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Stack>
    </Toolbar>
  );
}

Header.propTypes = {
  searchTerm: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  toggleTheme: PropTypes.func.isRequired,
  themeMode: PropTypes.oneOf(["light", "dark"]).isRequired,
  onAnalyticsClick: PropTypes.func.isRequired,
};

export default Header;
