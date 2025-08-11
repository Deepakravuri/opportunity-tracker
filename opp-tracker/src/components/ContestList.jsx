import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Container, Typography, Box } from '@mui/material';
import PageHeader from './PageHeader';
import SearchBar from './SearchBar';
import OpportunityList from './OpportunityList';

const ContestList = ({ currentTab, categoryLabels }) => {
  const [contests, setContests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchContests = async () => {
      try {
        const response = await axios.get('https://opportunity-tracker-xta8.onrender.com/api/contests/all');
        console.log('🎯 Contests API response:', response.data);
        setContests(response.data);
      } catch (error) {
        console.error('Error fetching contests:', error);
      }
    };

    fetchContests();
  }, []);

  // Filter opportunities for the selected tab
  const filteredOpportunities = (() => {
    if (categoryLabels[currentTab] === 'Contests / Challenges') {
      return contests.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return [];
  })();

  return (
    <Container sx={{ mt: 4 }}>
      <PageHeader title={categoryLabels[currentTab]} />
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {categoryLabels[currentTab] === 'Contests / Challenges' ? (
        filteredOpportunities.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No contests found matching your search.
            </Typography>
          </Box>
        ) : (
          <OpportunityList opportunities={filteredOpportunities} />
        )
      ) : (
        <OpportunityList opportunities={filteredOpportunities} />
      )}
    </Container>
  );
};

export default ContestList; 