import React, { useState, useEffect } from 'react';
import { Container, Grid, Typography, Box, CircularProgress, Alert, Fab } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';
import PageHeader from './PageHeader';
import SearchBar from './SearchBar';
import JobCard from './JobCard';
import AddJobDialog from './AddJobDialog';

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [addJobDialogOpen, setAddJobDialogOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('https://opportunity-tracker-xta8.onrender.com/api/jobs/all');
      setJobs(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (job.job_title || job.title)?.toLowerCase().includes(searchLower) ||
      job.company?.toLowerCase().includes(searchLower) ||
      (job.job_location || job.location)?.toLowerCase().includes(searchLower) ||
      job.skill?.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading jobs...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <PageHeader 
        title="Jobs & Internships" 
        subtitle="Discover amazing opportunities from top companies worldwide"
      />
      
      <SearchBar 
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Search jobs by title, company, or location..."
      />

      {filteredJobs.length === 0 ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No jobs found matching your search.' : 'No jobs available at the moment.'}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {filteredJobs.map((job, index) => (
            <Grid item xs={12} sm={6} key={job._id || index}>
              <JobCard job={job} />
            </Grid>
          ))}
        </Grid>
      )}

      <Box sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Showing {filteredJobs.length} of {jobs.length} jobs
        </Typography>
      </Box>

      {/* Floating Action Button to Add Job */}
      <Fab
        color="primary"
        aria-label="add job"
        onClick={() => setAddJobDialogOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
          }
        }}
      >
        <AddIcon />
      </Fab>

      {/* Add Job Dialog */}
      <AddJobDialog
        open={addJobDialogOpen}
        onClose={() => setAddJobDialogOpen(false)}
        onSuccess={(newApplication) => {
          // You can add a success message here if needed
          console.log('Job application added:', newApplication);
        }}
      />
    </Container>
  );
};

export default JobList; 