import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const JobApplicationDialog = ({ open, onClose, job, onSuccess }) => {
  const [applicationDate, setApplicationDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('applied');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('Please login to add job applications');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post('https://opportunity-tracker-xta8.onrender.com/api/job-applications', {
        jobId: job._id,
        jobTitle: job.job_title || job.title,
        company: job.company,
        applicationDate: applicationDate.toISOString(),
        notes,
        status,
        sourceUrl: job.source_url || job.url || job.link
      });

      onSuccess(response.data.application);
      onClose();
    } catch (error) {
      console.error('Error adding job application:', error);
      setError(error.response?.data?.error || 'Failed to add job application');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setApplicationDate(new Date());
    setNotes('');
    setStatus('applied');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add Job Application
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            {job?.job_title || job?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {job?.company}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Application Date"
            value={applicationDate}
            onChange={(newValue) => setApplicationDate(newValue)}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
          />
        </LocalizationProvider>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={status}
            label="Status"
            onChange={(e) => setStatus(e.target.value)}
          >
            <MenuItem value="applied">Applied</MenuItem>
            <MenuItem value="interview">Interview</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Notes"
          multiline
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          fullWidth
          placeholder="Add any notes about this application..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
            }
          }}
        >
          {loading ? 'Adding...' : 'Add Application'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobApplicationDialog; 