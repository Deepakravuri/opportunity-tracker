const express = require("express");
const mongoose = require("mongoose");
const { 
  OpenHackathon, 
  ClosedHackathon, 
  UpcomingHackathon, 
  ClistContest, 
  IndeedJob 
} = require("../config/database");

const router = express.Router();

// Get all hackathons
router.get("/hackathons/all", async (req, res) => {
  try {
    const open = await OpenHackathon.find().lean();
    const closed = await ClosedHackathon.find().lean();
    const upcoming = await UpcomingHackathon.find().lean();

    // Add category field
    const allData = [
      ...open.map(item => ({ ...item, category: "open" })),
      ...closed.map(item => ({ ...item, category: "closed" })),
      ...upcoming.map(item => ({ ...item, category: "upcoming" })),
    ];

    res.json(allData);
  } catch (err) {
    console.error("Error fetching hackathons:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all contests
router.get("/contests/all", async (req, res) => {
  try {
    const contests = await ClistContest.find().lean();
    res.json(contests);
  } catch (err) {
    console.error("Error fetching clist contests:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all jobs
router.get("/jobs/all", async (req, res) => {
  try {
    // Check if the collection exists first
    const collections = await mongoose.connection.db.listCollections().toArray();
    const indeedJobsExists = collections.some(col => col.name === 'indeedjobs');
    
    if (!indeedJobsExists) {
      console.log("IndeedJobs collection not found, returning empty array");
      return res.json([]);
    }

    // Connect to the IndeedJobs collection
    const jobs = await IndeedJob.find().lean();
    console.log(`Found ${jobs.length} jobs from IndeedJobs collection`);
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err);
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

module.exports = router; 