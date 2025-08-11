import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Tabs, 
  Tab, 
  Box,
  Button,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Tooltip
} from '@mui/material';
import { AccountCircle, Logout, Person, Settings, CalendarMonth } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const NavBar = ({ currentTab, setCurrentTab, onShowCalendar }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, isAuthenticated, logout } = useAuth();

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const handleShowCalendar = () => {
    onShowCalendar();
    handleClose();
  };

  return (
    <AppBar position="static" sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 0, 
            mr: 4,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #fff, #e3f2fd)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '1.5rem'
          }}
        >
          Opportunity Tracker
        </Typography>

        <Box sx={{ flexGrow: 1 }}>
          <Tabs 
            value={currentTab} 
            onChange={handleTabChange}
            sx={{
              '& .MuiTab-root': {
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 500,
                textTransform: 'none',
                fontSize: '0.9rem',
                minHeight: 48,
                '&.Mui-selected': {
                  color: '#fff',
                  fontWeight: 600,
                },
                '&:hover': {
                  color: '#fff',
                  opacity: 0.9,
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#fff',
                height: 3,
                borderRadius: '2px 2px 0 0',
              },
            }}
          >
            <Tab label="Hackathons" />
            <Tab label="Contests / Challenges" />
            <Tab label="Jobs / Internships" />
          </Tabs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isAuthenticated ? (
            <>
              <Typography variant="body2" sx={{ 
                color: 'rgba(255, 255, 255, 0.9)', 
                mr: 1,
                fontWeight: 500
              }}>
                Welcome, {user?.firstName || user?.username}!
              </Typography>
              <Tooltip title="Account settings">
                <IconButton
                  size="large"
                  aria-label="account of current user"
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  sx={{ 
                    color: '#fff',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 36, 
                      height: 36, 
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 100%)',
                      fontSize: '1rem',
                      fontWeight: 600,
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {user?.firstName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                sx={{
                  '& .MuiPaper-root': {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    minWidth: 200,
                    mt: 1,
                  },
                }}
              >
                <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                  <Person sx={{ mr: 2, fontSize: 20 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={handleClose} sx={{ py: 1.5 }}>
                  <Settings sx={{ mr: 2, fontSize: 20 }} />
                  Settings
                </MenuItem>
                <MenuItem onClick={handleShowCalendar} sx={{ py: 1.5 }}>
                  <CalendarMonth sx={{ mr: 2, fontSize: 20 }} />
                  Calendar
                </MenuItem>
                <MenuItem onClick={handleLogout} sx={{ py: 1.5, color: '#d32f2f' }}>
                  <Logout sx={{ mr: 2, fontSize: 20 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button 
              color="inherit" 
              startIcon={<AccountCircle />}
              sx={{ 
                textTransform: 'none',
                fontWeight: 500,
                borderRadius: 2,
                px: 2,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                },
              }}
            >
              Sign In
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default NavBar;
