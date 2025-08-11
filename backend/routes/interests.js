const express = require("express");
const { User } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Add/Remove user interest
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { opportunityId, opportunityType, opportunityName, platform, link, deadline } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if interest already exists
    const existingInterest = user.interests.find(
      interest => interest.opportunityId === opportunityId && interest.opportunityType === opportunityType
    );

    if (existingInterest) {
      // Remove interest if it already exists
      user.interests = user.interests.filter(
        interest => !(interest.opportunityId === opportunityId && interest.opportunityType === opportunityType)
      );
      await user.save();

      res.json({
        success: true,
        isInterested: false,
        message: 'Removed from interests'
      });
    } else {
      // Add new interest
      const newInterest = {
        opportunityId,
        opportunityType,
        opportunityName,
        platform: platform || 'unknown',
        link,
        deadline
      };

      user.interests.push(newInterest);
      await user.save();

      res.json({
        success: true,
        isInterested: true,
        message: 'Added to interests'
      });
    }

  } catch (error) {
    console.error('Interest toggle error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user interests (protected route)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('interests');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ interests: user.interests });
  } catch (error) {
    console.error('Get interests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if user is interested in a specific opportunity (protected route)
router.get("/check/:opportunityId/:opportunityType", authenticateToken, async (req, res) => {
  try {
    const { opportunityId, opportunityType } = req.params;

    const user = await User.findById(req.user._id).select('interests');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isInterested = user.interests.some(
      interest => interest.opportunityId === opportunityId && interest.opportunityType === opportunityType
    );

    res.json({ isInterested });
  } catch (error) {
    console.error('Check interest error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 