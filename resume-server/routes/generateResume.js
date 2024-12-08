const express = require("express");
const Entity = require("../db/models/entity");

const router = express.Router();

router.post("/generateResume", async (req, res) => {
  const jobId = req.query.id;
  if (!jobId) {
    return res.status(400).json({ error: "Job ID is required" });
  }

  req.on("close", () => {
    console.log("Client disconnected");
    aborted = true;
    controller.abort();
  });

  try {
    const job = await Entity.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    console.log(`Processing job ${jobId}`);

    res.status(201);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
