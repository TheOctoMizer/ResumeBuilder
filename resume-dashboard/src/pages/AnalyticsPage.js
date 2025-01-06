import React from "react";
import { Container, Typography, Box, IconButton, useTheme, Paper, Button } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Analytics from "../components/Analytics";
import { useNavigate } from "react-router-dom";

function AnalyticsPage({ toggleTheme, themeMode }) {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleDashboardNavigation = () => {
    navigate("/dashboard");
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        padding: theme.spacing(3),
        background: `linear-gradient(45deg, ${theme.palette.background.default}, ${theme.palette.background.paper})`,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: theme.spacing(2),
          right: theme.spacing(2),
        }}
      >
        <IconButton onClick={toggleTheme} color="inherit">
          {themeMode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Box>
      <Paper
        elevation={3}
        sx={{
          padding: theme.spacing(4),
          borderRadius: theme.spacing(1),
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Analytics
          </Typography>
          <Button variant="contained" color="primary" onClick={handleDashboardNavigation}>
            Back to Dashboard
          </Button>
        </Box>
        <Analytics />
      </Paper>
    </Container>
  );
}

export default AnalyticsPage; 