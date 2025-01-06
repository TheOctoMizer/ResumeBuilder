import React from "react";
import Analytics from "../components/Analytics";
import { motion } from "framer-motion";

function AnalyticsPage() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.3 }}
      className="p-6"
    >
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>
      <Analytics />
    </motion.div>
  );
}

export default AnalyticsPage; 