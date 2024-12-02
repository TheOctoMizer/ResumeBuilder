// routes/jobRoutes.js

const express = require("express");
const Job = require("../db/models/job");
const Entity = require("../db/models/entity");

const router = express.Router();

/**
 * GET /api/jobs
 * Fetch paginated jobs with optional search
 * Query Parameters:
 * - page: Page number (default: 1)
 * - limit: Number of jobs per page (default: 10)
 * - search: Search term to filter jobs by title, company, or skills
 */
router.get("/", async (req, res) => {
    try {
        let { page, limit, search } = req.query;

        // Parse and set default values
        page = parseInt(page, 10) || 1;
        limit = parseInt(limit, 10) || 10;
        const skip = (page - 1) * limit;

        // Build the query object
        let query = {};

        if (search) {
            const searchRegex = new RegExp(search, 'i'); // Case-insensitive regex
            query = {
                $or: [
                    { TITLE: searchRegex },
                    { COMPANY: searchRegex },
                    { SKILL: { $elemMatch: searchRegex } }
                ]
            };
        }

        // Get total count for pagination
        const total = await Entity.countDocuments(query);

        // Fetch paginated data
        const jobs = await Entity.find(query)
            .sort({ processedAt: -1 })
            .skip(skip)
            .limit(limit);

        // Calculate total pages
        const totalPages = Math.ceil(total / limit);

        res.json({
            total,
            totalPages,
            currentPage: page,
            limit,
            jobs,
        });
    } catch (error) {
        console.error("Error fetching entities with pagination:", error.message);
        res.status(500).json({ error: "Failed to fetch jobs" });
    }
});

/**
 * POST /api/jobs
 * Add a new job
 */
router.post("/", async (req, res) => {
    try {
        const job = new Job({ content: req.body.content });
        await job.save();
        res.json({ status: "success", job });
    } catch (error) {
        console.error("Error saving job:", error.message);
        res.status(500).json({ error: "Failed to save job" });
    }
});

module.exports = router;
