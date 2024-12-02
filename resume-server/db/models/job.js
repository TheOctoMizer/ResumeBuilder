// db/models/job.js

const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
    },
    { versionKey: false }
);

const Job = mongoose.model("Job", jobSchema);

module.exports = Job;
