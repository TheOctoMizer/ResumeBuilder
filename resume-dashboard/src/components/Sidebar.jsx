import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ChartBarIcon,
  DocumentChartBarIcon,
  MoonIcon,
  SunIcon,
} from "@heroicons/react/24/solid";

function Sidebar({ toggleTheme, theme }) {
  const location = useLocation();

  return (
    <div className="fixed top-0 left-0 h-full w-20 bg-gray-100 dark:bg-gray-800 flex flex-col p-3">
      {/* Navigation Links */}
      <NavLink
        to="/"
        className={`
          p-3 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all
          ${location.pathname === "/" ? "bg-gray-200 dark:bg-gray-700" : ""}
        `}
      >
        <HomeIcon className="h-6 w-6" />
      </NavLink>
      <NavLink
        to="/dashboard"
        className={`
          p-3 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all
          ${location.pathname === "/dashboard" ? "bg-gray-200 dark:bg-gray-700" : ""}
        `}
      >
        <ChartBarIcon className="h-6 w-6" />
      </NavLink>
      <NavLink
        to="/analytics"
        className={`
          p-3 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all
          ${location.pathname === "/analytics" ? "bg-gray-200 dark:bg-gray-700" : ""}
        `}
      >
        <DocumentChartBarIcon className="h-6 w-6" />
      </NavLink>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="mt-auto p-3 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-all"
      >
        {theme === "light" ? (
          <MoonIcon className="h-6 w-6" />
        ) : (
          <SunIcon className="h-6 w-6" />
        )}
      </button>
    </div>
  );
}

export default Sidebar; 