const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import database connection
const { connectDB } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const interestsRoutes = require('./routes/interests');
const jobApplicationsRoutes = require('./routes/jobApplications');
const opportunitiesRoutes = require('./routes/opportunities');

// Middleware
app.use(cors());
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/interests', interestsRoutes);
app.use('/api/job-applications', jobApplicationsRoutes);
app.use('/api', opportunitiesRoutes); // This includes /api/hackathons/all, /api/contests/all, /api/jobs/all

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Opportunity Tracker API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: 'Something went wrong on the server'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});
