import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  CardActions, 
  Button, 
  Chip, 
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const OpportunityCard = ({ item }) => {
  const [isInterested, setIsInterested] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const { isAuthenticated } = useAuth();

  // Debug logging for contests
  console.log('🎯 OpportunityCard item:', item);
  console.log('🎯 Item platform:', item.platform);
  console.log('🎯 Item start:', item.start);
  console.log('🎯 Item end:', item.end);
  console.log('🎯 Item link:', item.link);
  console.log('🎯 All item keys:', Object.keys(item));

  // For hackathons, filter out redundant types
  const filteredTypes = item.types ? item.types.filter(type => 
    !['hackathon', 'theme'].includes(type.toLowerCase())
  ) : [];

  // Determine button text based on category
  const getButtonText = () => {
    if (item.category === 'closed') {
      return 'See Projects';
    }
    return 'Apply Now';
  };

  // Check if this is a contest from clist_contests (has start, end, duration, link)
  // Platform might be missing, so we'll make it optional
  const isClistContest = item.start && item.end && item.duration && item.link;
  console.log('🎯 Is Clist Contest:', isClistContest);

  // Get opportunity ID
  const getOpportunityId = () => {
    if (isClistContest) return item.id?.toString() || item.name;
    return item._id || item.name;
  };

  // Get opportunity type
  const getOpportunityType = () => {
    if (isClistContest) return 'contest';
    return 'hackathon';
  };

  // Get start date from types array for hackathons
  const getStartDate = () => {
    if (item.types && item.types.length >= 7) {
      const startDateText = item.types[6]; // 7th index (0-based)
      if (startDateText && startDateText.toLowerCase().includes('starts')) {
        const dateMatch = startDateText.match(/starts\s+(\d{2}\/\d{2}\/\d{2})/i);
        if (dateMatch) {
          return dateMatch[1];
        }
      }
    }
    return null;
  };

  // Convert date format to proper date object for calendar
  const getFormattedDeadline = () => {
    const deadline = getDeadline();
    
    if (isClistContest) {
      // For contests, return the ISO date string
      return deadline;
    } else {
      // For hackathons, check if we have a start date in types array
      if (item.types && item.types.length >= 7) {
        const startDateText = item.types[6]; // 7th index (0-based)
        if (startDateText && startDateText.toLowerCase().includes('starts')) {
          const dateMatch = startDateText.match(/starts\s+(\d{2}\/\d{2}\/\d{2})/i);
          if (dateMatch) {
            const dateStr = dateMatch[1]; // "24/08/25" (DD/MM/YY format)
            // Convert DD/MM/YY to YYYY-MM-DD format
            const [day, month, year] = dateStr.split('/');
            const fullYear = `20${year}`; // Convert YY to YYYY
            return `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
          }
        }
      }
      // Fallback to last_updated for hackathons
      return deadline;
    }
  };

  // Get deadline/end date - Simplified logic
  const getDeadline = () => {
    if (isClistContest) {
      // For contests, use the end date
      return item.end;
    } else {
      // For hackathons, check if we have a start date in types array (7th index)
      if (item.types && item.types.length >= 7) {
        const startDateText = item.types[6]; // 7th index (0-based)
        if (startDateText && startDateText.toLowerCase().includes('starts')) {
          // Extract date from "starts 04/09/25" format
          const dateMatch = startDateText.match(/starts\s+(\d{2}\/\d{2}\/\d{2})/i);
          if (dateMatch) {
            return dateMatch[1]; // Return the date part
          }
        }
      }
      // Fallback to last_updated for hackathons
      return item.last_updated;
    }
  };

  // Check if user is interested in this opportunity
  useEffect(() => {
    const checkInterest = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await axios.get(
          `http://localhost:5000/api/interests/check/${getOpportunityId()}/${getOpportunityType()}`
        );
        setIsInterested(response.data.isInterested);
      } catch (error) {
        console.error('Error checking interest:', error);
      }
    };

    checkInterest();
  }, [isAuthenticated, item]);

  const handleInterestToggle = async () => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please login to save interests',
        severity: 'warning'
      });
      return;
    }

    if (loading) return;

    setLoading(true);
    try {
      const formattedDeadline = getFormattedDeadline();
      console.log('🎯 Original deadline:', getDeadline());
      console.log('🎯 Formatted deadline:', formattedDeadline);
      console.log('🎯 Item types:', item.types);
      
      const response = await axios.post('http://localhost:5000/api/interests', {
        opportunityId: getOpportunityId(),
        opportunityType: getOpportunityType(),
        opportunityName: item.name,
        platform: item.platform || 'unknown',
        link: item.link || item.devfolio_link || (item.external_links && item.external_links[0]),
        deadline: formattedDeadline
      });

      setIsInterested(response.data.isInterested);
      setSnackbar({
        open: true,
        message: response.data.message,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error toggling interest:', error);
      setSnackbar({
        open: true,
        message: 'Error saving interest',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Card
        variant="outlined"
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRadius: 2,
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid #e8eaf6',
          backgroundColor: '#ffffff',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
          },
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            borderColor: '#667eea',
          },
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: 2 }}>
          {/* Interest button */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
            <Tooltip title={isInterested ? 'Remove from interests' : 'Add to interests'}>
              <IconButton
                onClick={handleInterestToggle}
                disabled={loading}
                size="small"
                sx={{
                  color: isInterested ? '#e91e63' : '#9e9e9e',
                  backgroundColor: isInterested ? '#fce4ec' : 'transparent',
                  '&:hover': {
                    color: isInterested ? '#c2185b' : '#e91e63',
                    backgroundColor: isInterested ? '#f8bbd9' : '#fce4ec',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                  borderRadius: '50%',
                  p: 0.5,
                }}
              >
                {isInterested ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>

          {/* Contest/Event Name - Allow wrapping */}
          <Typography 
            variant="h6" 
            fontWeight="600" 
            gutterBottom 
            sx={{ 
              fontSize: '1rem',
              lineHeight: 1.3,
              mb: 1.5,
              minHeight: '2.6rem', // Fixed height for 2 lines
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              wordBreak: 'break-word',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {item.name}
          </Typography>

          {/* Clist contest details - Show after title */}
          {isClistContest && (
            <Box sx={{ 
              mb: 1.5, 
              p: 1, 
              backgroundColor: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: 1.5,
              border: '1px solid #e9ecef',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            }}>
              {item.platform && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ marginRight: '4px' }}>🌐</span>
                  <strong>Platform:</strong> {item.platform}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ marginRight: '4px' }}>🗓️</span>
                <strong>Start:</strong> {new Date(item.start).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ marginRight: '4px' }}>🏁</span>
                <strong>End:</strong> {new Date(item.end).toLocaleDateString()}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', fontSize: '0.75rem' }}>
                <span style={{ marginRight: '4px' }}>⏳</span>
                <strong>Duration:</strong> {item.duration}
              </Typography>
              {item.host && (
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0, display: 'flex', alignItems: 'center', fontSize: '0.75rem' }}>
                  <span style={{ marginRight: '4px' }}>🔗</span>
                  <strong>Host:</strong> {item.host}
                </Typography>
              )}
            </Box>
          )}

          {/* Hackathon types and tags */}
          {filteredTypes.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                Types:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {filteredTypes.slice(0, 3).map((type, index) => (
                  <Chip
                    key={index}
                    label={type}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.65rem',
                      height: '20px',
                      backgroundColor: '#f0f4ff',
                      borderColor: '#667eea',
                      color: '#667eea',
                      fontWeight: '500',
                      '&:hover': {
                        backgroundColor: '#667eea',
                        color: '#ffffff',
                      }
                    }}
                  />
                ))}
                {filteredTypes.length > 3 && (
                  <Chip
                    label={`+${filteredTypes.length - 3} more`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.65rem',
                      height: '20px',
                      backgroundColor: '#f5f5f5',
                      borderColor: '#9e9e9e',
                      color: '#757575',
                      fontWeight: '500',
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

          {/* Start Date for Open Hackathons */}
          {!isClistContest && item.category === 'open' && getStartDate() && (
            <Box sx={{ mb: 1.5, p: 1, backgroundColor: '#e8f5e8', borderRadius: 1.5, border: '1px solid #4caf50' }}>
              <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontWeight: '600', fontSize: '0.8rem' }}>
                <span style={{ marginRight: '6px' }}>📅</span>
                <strong>Start Date:</strong> {getStartDate()}
              </Typography>
            </Box>
          )}

          {item.tags && item.tags.length > 0 && (
            <Box sx={{ mb: 1.5 }}>
              <Typography variant="caption" color="text.secondary" fontWeight="600" sx={{ mb: 0.5, display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontSize: '0.7rem' }}>
                Tags:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {item.tags.slice(0, 2).map((tag, index) => (
                  <Chip
                    key={index}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.65rem',
                      height: '20px',
                      backgroundColor: '#fff3e0',
                      borderColor: '#ff9800',
                      color: '#f57c00',
                      fontWeight: '500',
                      '&:hover': {
                        backgroundColor: '#ff9800',
                        color: '#ffffff',
                      }
                    }}
                  />
                ))}
                {item.tags.length > 2 && (
                  <Chip
                    label={`+${item.tags.length - 2} more`}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontSize: '0.65rem',
                      height: '20px',
                      backgroundColor: '#f5f5f5',
                      borderColor: '#9e9e9e',
                      color: '#757575',
                      fontWeight: '500',
                    }}
                  />
                )}
              </Box>
            </Box>
          )}

          {item.category && (
            <Box sx={{ mt: 'auto', pt: 1 }}>
              <Chip
                label={item.category}
                size="small"
                sx={{
                  backgroundColor: 
                    item.category === 'open' ? '#e8f5e8' :
                    item.category === 'upcoming' ? '#fff3e0' : '#ffebee',
                  color: 
                    item.category === 'open' ? '#2e7d32' :
                    item.category === 'upcoming' ? '#f57c00' : '#c62828',
                  fontWeight: '600',
                  textTransform: 'capitalize',
                  fontSize: '0.7rem',
                  height: '24px',
                  border: '1px solid',
                  borderColor: 
                    item.category === 'open' ? '#4caf50' :
                    item.category === 'upcoming' ? '#ff9800' : '#f44336',
                }}
              />
            </Box>
          )}
        </CardContent>

        <CardActions sx={{ justifyContent: 'center', p: 2, pt: 0 }}>
          <Button
            size="medium"
            variant="contained"
            color="primary"
            href={item.link || item.devfolio_link || (item.external_links && item.external_links[0])}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ 
              borderRadius: 2, 
              textTransform: 'none', 
              fontWeight: 600,
              px: 3,
              py: 1,
              fontSize: '0.85rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
                transform: 'translateY(-1px)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {isClistContest ? 'Go to Contest' : getButtonText()}
          </Button>
        </CardActions>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default OpportunityCard;
