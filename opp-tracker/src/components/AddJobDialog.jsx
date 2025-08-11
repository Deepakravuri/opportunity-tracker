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
  Alert,
  IconButton
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const AddJobDialog = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    location: '',
    applicationDate: new Date(),
    status: 'applied',
    notes: '',
    sourceUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setError('Please login to add job applications');
      return;
    }

    if (!formData.jobTitle || !formData.company) {
      setError('Job title and company are required');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post('https://opportunity-tracker-xta8.onrender.com/api/job-applications', {
        jobId: `manual_${Date.now()}`, // Generate unique ID for manual entries
        jobTitle: formData.jobTitle,
        company: formData.company,
        applicationDate: formData.applicationDate.toISOString(),
        notes: formData.notes,
        status: formData.status,
        sourceUrl: formData.sourceUrl
      });

      onSuccess(response.data.application);
      handleClose();
    } catch (error) {
      console.error('Error adding job application:', error);
      setError(error.response?.data?.error || 'Failed to add job application');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      jobTitle: '',
      company: '',
      location: '',
      applicationDate: new Date(),
      status: 'applied',
      notes: '',
      sourceUrl: ''
    });
    setError('');
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Add Job Application
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          label="Job Title *"
          value={formData.jobTitle}
          onChange={(e) => handleInputChange('jobTitle', e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          required
        />

        <TextField
          label="Company *"
          value={formData.company}
          onChange={(e) => handleInputChange('company', e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          required
        />

        <TextField
          label="Location"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Application Date *"
            value={formData.applicationDate}
            onChange={(newValue) => handleInputChange('applicationDate', newValue)}
            renderInput={(params) => <TextField {...params} fullWidth sx={{ mb: 2 }} />}
          />
        </LocalizationProvider>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={formData.status}
            label="Status"
            onChange={(e) => handleInputChange('status', e.target.value)}
          >
            <MenuItem value="applied">Applied</MenuItem>
            <MenuItem value="interview">Interview</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
            <MenuItem value="accepted">Accepted</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Job URL (Optional)"
          value={formData.sourceUrl}
          onChange={(e) => handleInputChange('sourceUrl', e.target.value)}
          fullWidth
          sx={{ mb: 2 }}
          placeholder="https://company.com/careers/job..."
        />

        <TextField
          label="Notes"
          multiline
          rows={4}
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
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

export default AddJobDialog; 