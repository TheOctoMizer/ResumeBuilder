// index.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { connectDB } = require("./db/connection");
require("dotenv").config();

const jobRoutes = require("./routes/jobRoutes");
const entityRoutes = require("./routes/entityRoutes");
const generateResume = require("./routes/generateResume");

// Initialize Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// load react build
app.use(express.static("client/build"));

// Serve the React app
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "build", "index.html"));
});

// Custom logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const processTime = Date.now() - start;
    const logDetails = {
      host: req.hostname,
      requested: req.originalUrl,
      method: req.method,
      statusCode: res.statusCode,
      processTime: `${processTime}ms`,
    };
    console.log(logDetails);
  });
  next();
});

// Additional logging for development/debugging
app.use(morgan("dev")); // Optional: Logs in Apache combined format

// Connect to MongoDB
connectDB();

// Route Handlers
app.use("/api/jobs", jobRoutes);
app.use("/api/entities", entityRoutes);
app.use("/api/generate", generateResume);

const PORT = process.env.PORT || 5000;
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
