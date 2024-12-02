// db/models/entity.js

const mongoose = require("mongoose");

const entitySchema = new mongoose.Schema(
    {
        jobId: { type: mongoose.Schema.Types.ObjectId, ref: "Job", required: true },
        COMPANY: { type: String },
        TITLE: { type: String },
        SALARY: { type: String },
        LOCATION: { type: String },
        EXPERIENCE: { type: [String] },
        EDUCATION: { type: [String] },
        SKILL: { type: [String] },
        WORK_ARRANGEMENT: { type: String, enum: ["Full-time", "Part-time", "Internship", "Contract", "None"] },
            WORK_LOCATION: { type: String, enum: ["Remote", "Onsite", "Hybrid", "None"] },
        isGenerate: { type: Boolean, default: false },
        resumePath: { type: String, default: null },
        processedAt: { type: Date, default: Date.now },
    },
    { versionKey: false }
);

const Entity = mongoose.model("Entity", entitySchema);

module.exports = Entity;
