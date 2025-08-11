import React, { useState } from 'react';
import { Box, Button, Typography, Alert, Paper } from '@mui/material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const DebugInfo = () => {
  const [testResults, setTestResults] = useState([]);
  const { user, isAuthenticated, token } = useAuth();

  const runTests = async () => {
    const results = [];
    
    // Test 1: Check if backend is reachable
    try {
      const response = await axios.get('http://localhost:5000/api/hackathons/all');
      results.push({ test: 'Backend Connection', status: '✅ Success', data: 'Backend is reachable' });
    } catch (error) {
      results.push({ 
        test: 'Backend Connection', 
        status: '❌ Failed', 
        data: `Error: ${error.message}` 
      });
    }

    // Test 2: Check authentication
    if (isAuthenticated && token) {
      try {
        const response = await axios.get('http://localhost:5000/api/auth/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        results.push({ test: 'Authentication', status: '✅ Success', data: 'User is authenticated' });
      } catch (error) {
        results.push({ 
          test: 'Authentication', 
          status: '❌ Failed', 
          data: `Error: ${error.response?.data?.error || error.message}` 
        });
      }
    } else {
      results.push({ test: 'Authentication', status: '⚠️ Skipped', data: 'User not authenticated' });
    }

    // Test 3: Check interests API
    if (isAuthenticated && token) {
      try {
        const response = await axios.get('http://localhost:5000/api/interests', {
          headers: { Authorization: `Bearer ${token}` }
        });
        results.push({ 
          test: 'Interests API', 
          status: '✅ Success', 
          data: `Found ${response.data.interests?.length || 0} interests` 
        });
      } catch (error) {
        results.push({ 
          test: 'Interests API', 
          status: '❌ Failed', 
          data: `Error: ${error.response?.data?.error || error.message}` 
        });
      }
    } else {
      results.push({ test: 'Interests API', status: '⚠️ Skipped', data: 'User not authenticated' });
    }

    setTestResults(results);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Debug Information
      </Typography>
      
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1">
          <strong>Authentication Status:</strong> {isAuthenticated ? '✅ Logged In' : '❌ Not Logged In'}
        </Typography>
        {user && (
          <Typography variant="body2" color="text.secondary">
            User: {user.firstName} {user.lastName} ({user.email})
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary">
          Token: {token ? '✅ Present' : '❌ Missing'}
        </Typography>
      </Box>

      <Button variant="contained" onClick={runTests} sx={{ mb: 2 }}>
        Run API Tests
      </Button>

      {testResults.map((result, index) => (
        <Paper key={index} sx={{ p: 2, mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
            {result.test}: {result.status}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {result.data}
          </Typography>
        </Paper>
      ))}
    </Box>
  );
};

export default DebugInfo; 