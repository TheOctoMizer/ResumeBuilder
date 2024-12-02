// routes/entityRoutes.js

const express = require("express");
const Job = require("../db/models/job");
const Entity = require("../db/models/entity");
const { processJobContent } = require("../utils/openaiClient");
const { AbortController } = require("node-abort-controller");

const router = express.Router();

// Helper function for content extraction
function trimJobPosting(content) {
    const urlMatch = content.match(/URL:\s+(.*?)\n/);
    const url = urlMatch ? urlMatch[1] : "";

    const aboutJobMatch = content.match(/About the job\s*(.*?)Job search faster with Premium/s);
    const aboutJob = aboutJobMatch ? aboutJobMatch[1].trim() : "";

    const finalContent = `URL: ${url}\nAbout the job:\n${aboutJob}`;
    return finalContent;
}

// POST /api/entities/process?id=jobId - Process a job posting by query parameter
router.post("/process", async (req, res) => {
    const jobId = req.query.id;
    if (!jobId) {
        return res.status(400).json({ error: "Job ID is required" });
    }

    const controller = new AbortController();
    const signal = controller.signal;
    let aborted = false;

    // Listen for client disconnection
    req.on("close", () => {
        console.log("Client disconnected");
        aborted = true;
        controller.abort(); // Signal cancellation to processJobContent
    });

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }

        console.log(`Processing job ${jobId}`);

        // Trim content using the helper function
        const trimmedContent = trimJobPosting(job.content);
        // console.log("Trimmed Content:", trimmedContent);

        const entities = await processJobContent(trimmedContent, { signal }); // Pass the abort signal to the function

        if (aborted) {
            console.log(`Processing aborted for job ${jobId}`);
            return; // Stop further processing
        }

        if (!entities) {
            return res.status(500).json({ error: "Failed to extract entities" });
        }

        const entityDoc = new Entity({
            jobId: job._id,
            ...entities,
        });

        if (aborted) {
            console.log(`Processing aborted before saving for job ${jobId}`);
            return;
        }

        await entityDoc.save();
        res.json({ status: "success", entity: entityDoc });
    } catch (error) {
        if (aborted) {
            console.log("Error occurred but client was disconnected, no response sent.");
        } else if (error.name === "AbortError") {
            console.log(`Processing aborted for job ${jobId}`);
            // Handle gracefully if needed
        } else {
            console.error("Error processing job:", error.message);
            res.status(500).json({ error: "Failed to process job" });
        }
    }
});

// New endpoint to process all jobs
router.post("/processAll", async (req, res) => {
    const controller = new AbortController();
    const signal = controller.signal;
    let aborted = false;

    // Listen for client disconnection
    req.on("close", () => {
        console.log("Client disconnected");
        aborted = true;
        controller.abort();
    });

    try {
        // Fetch all jobs
        const jobs = await Job.find();

        for (const job of jobs) {
            if (aborted) {
                console.log("Processing aborted");
                break;
            }

            // Check if an Entity for this jobId already exists
            const existingEntity = await Entity.findOne({ jobId: job._id });
            if (existingEntity) {
                console.log(`Entity already exists for job ${job._id}, skipping`);
                continue;
            }

            console.log(`Processing job ${job._id}`);

            // Trim content using the helper function
            const trimmedContent = trimJobPosting(job.content);

            const entities = await processJobContent(trimmedContent, { signal });

            if (aborted) {
                console.log(`Processing aborted for job ${job._id}`);
                break;
            }

            if (!entities) {
                console.error(`Failed to extract entities for job ${job._id}`);
                continue; // Move on to next job
            }

            const entityDoc = new Entity({
                jobId: job._id,
                ...entities,
            });

            await entityDoc.save();
            console.log(`Saved entity for job ${job._id}`);
        }

        if (aborted) {
            res.status(499).json({ error: "Client disconnected" });
        } else {
            res.json({ status: "success", message: "Processed all jobs" });
        }
    } catch (error) {
        if (aborted) {
            console.log("Error occurred but client was disconnected, no response sent.");
        } else if (error.name === "AbortError") {
            console.log(`Processing aborted`);
            res.status(499).json({ error: "Processing aborted" });
        } else {
            console.error("Error processing jobs:", error.message);
            res.status(500).json({ error: "Failed to process jobs" });
        }
    }
});


module.exports = router;
