const express = require("express");
const { User } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Add job application
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { jobId, jobTitle, company, applicationDate, notes, status, sourceUrl } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if application already exists
    const existingApplication = user.jobApplications.find(
      app => app.jobId === jobId
    );

    if (existingApplication) {
      return res.status(400).json({ error: 'Job application already exists' });
    }

    // Add new job application
    const newApplication = {
      jobId,
      jobTitle,
      company,
      applicationDate: new Date(applicationDate),
      notes: notes || "",
      status: status || 'applied',
      sourceUrl
    };

    user.jobApplications.push(newApplication);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Job application added successfully',
      application: newApplication
    });

  } catch (error) {
    console.error('Add job application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's job applications (protected route)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('jobApplications');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ applications: user.jobApplications });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update job application (protected route)
router.put("/:jobId", authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { applicationDate, notes, status } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const application = user.jobApplications.find(app => app.jobId === jobId);
    if (!application) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    // Update fields
    if (applicationDate) application.applicationDate = new Date(applicationDate);
    if (notes !== undefined) application.notes = notes;
    if (status) application.status = status;

    await user.save();

    res.json({
      success: true,
      message: 'Job application updated successfully',
      application
    });

  } catch (error) {
    console.error('Update job application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete job application (protected route)
router.delete("/:jobId", authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const applicationIndex = user.jobApplications.findIndex(app => app.jobId === jobId);
    if (applicationIndex === -1) {
      return res.status(404).json({ error: 'Job application not found' });
    }

    user.jobApplications.splice(applicationIndex, 1);
    await user.save();

    res.json({
      success: true,
      message: 'Job application deleted successfully'
    });

  } catch (error) {
    console.error('Delete job application error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 