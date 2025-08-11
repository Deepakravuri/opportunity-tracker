import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Work as WorkIcon,
  LocationOn as LocationIcon,
  Business as BusinessIcon,
  OpenInNew as OpenInNewIcon,
  Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import JobApplicationDialog from './JobApplicationDialog';

const JobCard = ({ job }) => {
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleApply = () => {
    if (job.source_url || job.url || job.link) {
      window.open(job.source_url || job.url || job.link, '_blank');
    }
  };

  const handleAddApplication = () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please login to add job applications',
        severity: 'info'
      });
      return;
    }
    setApplicationDialogOpen(true);
  };

  const handleApplicationSuccess = (application) => {
    setSnackbar({
      open: true,
      message: 'Job application added successfully!',
      severity: 'success'
    });
  };

  const getJobTypeColor = (type) => {
    const typeLower = type?.toLowerCase() || '';
    if (typeLower.includes('full-time')) return 'success';
    if (typeLower.includes('part-time')) return 'warning';
    if (typeLower.includes('intern')) return 'info';
    if (typeLower.includes('contract')) return 'secondary';
    return 'default';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Card
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
          },
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 3 }}>
          {/* Header with title */}
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="h6"
              component="h3"
              sx={{
                fontWeight: 600,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {job.job_title || job.title || 'Job Title'}
            </Typography>
          </Box>

          {/* Company and Location */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <BusinessIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                {job.company || 'Company Name'}
              </Typography>
            </Box>
            
            {(job.job_location || job.location) && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {job.job_location || job.location}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Skills */}
          {job.skill && (
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Chip
                label={job.skill}
                size="small"
                color="primary"
                sx={{
                  borderRadius: 2,
                  fontWeight: 500,
                  '&:hover': {
                    transform: 'scale(1.05)',
                  }
                }}
              />
            </Box>
          )}

          {/* Description */}
          {job.description && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                lineHeight: 1.4
              }}
            >
              {job.description}
            </Typography>
          )}

          {/* Salary/Compensation */}
          {job.salary && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500, color: 'success.main' }}>
                💰 {job.salary}
              </Typography>
            </Box>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleApply}
              startIcon={<OpenInNewIcon />}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                }
              }}
            >
              Apply Now
            </Button>
            <Button
              variant="outlined"
              onClick={handleAddApplication}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#667eea',
                color: '#667eea',
                '&:hover': {
                  borderColor: '#5a6fd8',
                  backgroundColor: 'rgba(102, 126, 234, 0.04)',
                }
              }}
            >
              Track
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <JobApplicationDialog
        open={applicationDialogOpen}
        onClose={() => setApplicationDialogOpen(false)}
        job={job}
        onSuccess={handleApplicationSuccess}
      />
    </>
  );
};

export default JobCard; 