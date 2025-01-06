// App.js

import React, { useEffect, useState, useCallback } from "react";
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  useLocation,
} from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import AnalyticsPage from "./pages/AnalyticsPage";
import "./App.css";
import "./index.css";
import Sidebar from "./components/Sidebar";

function App() {
  const [theme, setTheme] = useState(
    localStorage.getItem('theme') || 
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Apply theme to document element
    document.documentElement.classList.toggle('dark', theme === 'dark');
    
    // Apply theme to body
    document.body.classList.toggle('dark', theme === 'dark');
    
    // Save theme preference
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`
      min-h-screen 
      ${theme === 'dark' ? 'bg-dark-primary text-dark-primary' : 'bg-light-primary text-light-primary'}
    `}>
      <Router>
        <AppLayout toggleTheme={toggleTheme} theme={theme} />
      </Router>
    </div>
  );
}

function AppLayout({ toggleTheme, theme }) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar toggleTheme={toggleTheme} theme={theme} />

      {/* Main Content Area */}
      <main className="ml-20 w-full">
        <AppRoutes toggleTheme={toggleTheme} theme={theme} />
      </main>
    </div>
  );
}

function AppRoutes({ toggleTheme, theme }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/" 
          element={
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <Home toggleTheme={toggleTheme} themeMode={theme} />
            </motion.div>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard toggleTheme={toggleTheme} themeMode={theme} />
            </motion.div>
          } 
        />
        <Route 
          path="/dashboard/:jobId" 
          element={
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <Dashboard toggleTheme={toggleTheme} themeMode={theme} />
            </motion.div>
          } 
        />
        <Route 
          path="/analytics" 
          element={
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <AnalyticsPage toggleTheme={toggleTheme} themeMode={theme} />
            </motion.div>
          } 
        />
      </Routes>
    </AnimatePresence>
  );
}

export default App;
