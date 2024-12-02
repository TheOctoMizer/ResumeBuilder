// App.js

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline"; // Import CssBaseline
import JobList from "./JobList";

function App() {
  // State to hold the current theme mode ('light' or 'dark')
  const [themeMode, setThemeMode] = useState("light");

  // State to determine if the user has manually selected a theme
  const [isManual, setIsManual] = useState(false);

  // Function to detect system's preferred color scheme
  const getSystemTheme = () => {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  };

  // Initialize theme on component mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setThemeMode(savedTheme);
      setIsManual(true);
    } else {
      setThemeMode(getSystemTheme());
    }
  }, []);

  // Listen for changes in system's color scheme if user hasn't set a manual preference
  useEffect(() => {
    if (!isManual) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e) => {
        setThemeMode(e.matches ? "dark" : "light");
      };
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [isManual]);

  // Memoize the theme to prevent unnecessary recalculations
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          ...(themeMode === "light"
            ? {
                // Light mode palette
                primary: {
                  main: "#6EC1E4", // Pastel Teal
                },
                secondary: {
                  main: "#FFCCC9", // Pastel Peach
                },
                background: {
                  default: "#FFF8E1", // Pastel Beige
                  paper: "#FFFFFF", // White
                },
                text: {
                  primary: "#2E2E2E", // Dark Gray
                },
              }
            : {
                // Dark mode palette
                primary: {
                  main: "#50C8D3", // Pastel Aqua
                },
                secondary: {
                  main: "#FF7F50", // Pastel Coral
                },
                background: {
                  default: "#2C2C2C", // Deep Charcoal
                  paper: "#3C3C3C", // Slightly Lighter Charcoal
                },
                text: {
                  primary: "#F5F5F5", // Light Gray
                },
              }),
        },
      }),
    [themeMode]
  );

  // Toggle theme and handle manual override
  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme); // Save user preference
      setIsManual(true); // User has set a manual preference
      return newTheme;
    });
  }, []);

  // Function to reset to system theme (optional)
  const resetTheme = useCallback(() => {
    localStorage.removeItem("theme"); // Remove user preference
    setIsManual(false); // Revert to system preference
    setThemeMode(getSystemTheme());
  }, []);

  // Apply the current theme as a class on the body element
  useEffect(() => {
    document.body.className = themeMode;
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Apply CssBaseline for consistent styling */}
      <JobList toggleTheme={toggleTheme} themeMode={themeMode} />
    </ThemeProvider>
  );
}

export default App;
