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
        DESCRIPTION: { type: String },
        WORK_ARRANGEMENT: { type: String, enum: ["Full-time", "Part-time", "Internship", "Contract", "None"] },
            WORK_LOCATION: { type: String, enum: ["Remote", "Onsite", "Hybrid", "None"] },
        isGenerate: { type: Boolean, default: false },
        resumePath: { type: String, default: null },
        processedAt: { type: Date, default: Date.now },
        isAppliedTo: { type: Boolean, default: false },
        appliedAt: { type: Date, default: null },
        isRejected: { type: Boolean, default: false },
        rejectedAt: { type: Date, default: null },
        isShortlisted: { type: Boolean, default: false },
        shortlistedAt: { type: Date, default: null },
        isOffered: { type: Boolean, default: false },
        offeredAt: { type: Date, default: null },
        offeredSalary: { type: String, default: null },
        isAccepted: { type: Boolean, default: false },
        acceptedAt: { type: Date, default: null },
        isDeclined: { type: Boolean, default: false },
        declinedAt: { type: Date, default: null },
        recomendations: { type: [String] },
        notes: { type: String },
    },
    { versionKey: false }
);

const Entity = mongoose.model("Entity", entitySchema);

module.exports = Entity;
