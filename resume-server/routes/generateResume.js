const express = require("express");
const Job = require("../db/models/job");
const Entity = require("../db/models/entity");
const { processJobContent } = require("../utils/openaiClient");
const { AbortController } = require("node-abort-controller");

const router = express.Router();

router.post("/generateResume", async (req, res) => {
  const jobId = req.query.id;
  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  const controller = new AbortController();
  const signal = controller.signal;
  let aborted = false;

  req.on("close", () => {
    console.log("Client disconnected");
    aborted = true;
    controller.abort();
  });

  try {
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    console.log(`Processing job ${jobId}`);

    const trimmedContent = trimJobPosting(job.content);

    const entities = await processJobContent(trimmedContent, { signal });

    if (aborted) {
      console.log(`Processing aborted for job ${jobId}`);
      return;
    }

    if (!entities) {
      return res.status(500).json({ error: "Failed to extract entities" });
    }

    const entity = new Entity({
      jobId,
      entities,
    });

    await entity.save();

    res.status(201).json(entity);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
