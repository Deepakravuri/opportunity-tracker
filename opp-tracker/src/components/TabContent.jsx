import React from 'react';
import { Container, Typography } from '@mui/material';
import HackathonList from './HackathonList';
import ContestList from './ContestList';
import JobList from './JobList';

const TabContent = ({ currentTab, categoryLabels }) => {
  // Render different content based on the current tab
  const renderTabContent = () => {
    switch (categoryLabels[currentTab]) {
      case 'Hackathons':
        return <HackathonList currentTab={currentTab} categoryLabels={categoryLabels} />;
      
      case 'Contests / Challenges':
        return <ContestList currentTab={currentTab} categoryLabels={categoryLabels} />;
      
      case 'Jobs / Internships':
        return <JobList />;
      
      default:
        return (
          <Container sx={{ mt: 4 }}>
            <Typography variant="h5" align="center" sx={{ mb: 3 }}>
              Select a category
            </Typography>
          </Container>
        );
    }
  };

  return renderTabContent();
};

export default TabContent;
