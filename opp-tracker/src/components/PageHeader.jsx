import React from 'react';
import { Typography, Box } from '@mui/material';

const PageHeader = ({ title }) => {
  return (
    <Box sx={{ textAlign: 'center', mb: 5, mt: 2 }}>
      <Typography 
        variant="h3" 
        fontWeight="800" 
        sx={{ 
          mb: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontSize: { xs: '2rem', md: '2.5rem' },
          letterSpacing: '-0.5px'
        }}
      >
        {title}
      </Typography>
      <Typography 
        variant="body1" 
        color="text.secondary"
        sx={{ 
          fontSize: '1.2rem',
          fontWeight: 400,
          maxWidth: '600px',
          margin: '0 auto',
          lineHeight: 1.6,
          opacity: 0.8
        }}
      >
        Discover and apply to amazing opportunities that match your interests
      </Typography>
    </Box>
  );
};

export default PageHeader; 