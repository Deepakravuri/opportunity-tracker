import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box } from '@mui/material';
import PageHeader from './PageHeader';
import SearchBar from './SearchBar';
import OpportunityList from './OpportunityList';

const HackathonList = ({ currentTab, categoryLabels }) => {
  const [hackathons, setHackathons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchHackathons = async () => {
      try {
        const response = await axios.get('https://opportunity-tracker-xta8.onrender.com/api/hackathons/all');
        setHackathons(response.data);
      } catch (error) {
        console.error('Error fetching hackathons:', error);
      }
    };

    fetchHackathons();
  }, []);

  // Filter opportunities for the selected tab
  const filteredOpportunities = (() => {
    if (categoryLabels[currentTab] === 'Hackathons') {
      return hackathons.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  })();

  // Group hackathons by category
  const groupedHackathons = {
    open: filteredOpportunities.filter(item => item.category === 'open'),
    upcoming: filteredOpportunities.filter(item => item.category === 'upcoming'),
    closed: filteredOpportunities.filter(item => item.category === 'closed')
  };

  const renderSection = (title, hackathons, color) => {
    if (hackathons.length === 0) return null;
    
    return (
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h5" 
          fontWeight="600" 
          sx={{ 
            mb: 2, 
            color: color,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {title}
          <Typography 
            variant="caption" 
            sx={{ 
              backgroundColor: color, 
              color: 'white', 
              px: 1, 
              py: 0.5, 
              borderRadius: 1,
              fontSize: '0.7rem'
            }}
          >
            {hackathons.length}
          </Typography>
        </Typography>
        <OpportunityList opportunities={hackathons} />
      </Box>
    );
  };

  return (
    <Container sx={{ mt: 4 }}>
      <PageHeader title={categoryLabels[currentTab]} />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      
      {categoryLabels[currentTab] === 'Hackathons' ? (
        <Box>
          {renderSection('🚀 Open Hackathons', groupedHackathons.open, '#2e7d32')}
          {renderSection('⏰ Upcoming Hackathons', groupedHackathons.upcoming, '#f57c00')}
          {renderSection('🏁 Closed Hackathons', groupedHackathons.closed, '#c62828')}
          
          {Object.values(groupedHackathons).every(arr => arr.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                No hackathons found matching your search.
              </Typography>
            </Box>
          )}
        </Box>
      ) : (
        <OpportunityList opportunities={filteredOpportunities} />
      )}
    </Container>
  );
};

export default HackathonList;
