import React from 'react';
import { Grid, Box } from '@mui/material';
import OpportunityCard from './OpportunityCard';

const OpportunityList = ({ opportunities }) => {
  return (
    <Box sx={{ mt: 3 }}>
      <Grid 
        container 
        spacing={3} 
        sx={{ 
          justifyContent: 'flex-start',
          alignItems: 'stretch'
        }}
      >
        {opportunities.map((item, index) => (
          <Grid 
            item 
            xs={12} 
            sm={6}
            key={index}
            sx={{
              display: 'flex',
              '& > *': {
                width: '100%'
              }
            }}
          >
            <OpportunityCard item={item} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default OpportunityList; 