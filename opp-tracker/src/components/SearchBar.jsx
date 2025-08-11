// src/components/SearchBar.jsx
import React from 'react';
import { TextField, Box, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ searchQuery, setSearchQuery }) => {
  return (
    <Box sx={{ my: 3 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search opportunities..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            backgroundColor: '#fafafa',
            '&:hover': {
              backgroundColor: '#f5f5f5',
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.2)',
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '14px 16px',
            fontSize: '1rem',
          },
        }}
      />
    </Box>
  );
};

export default SearchBar;
