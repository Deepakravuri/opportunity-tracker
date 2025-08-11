import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  CircularProgress, 
  Alert, 
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Calendar as BigCalendar, 
  dateFnsLocalizer 
} from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { 
  Favorite, 
  Delete, 
  Link as LinkIcon,
  Work as WorkIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const Calendar = () => {
  const [interests, setInterests] = useState([]);
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [interestsResponse, applicationsResponse] = await Promise.all([
        axios.get('https://opportunity-tracker-xta8.onrender.com/api/interests'),
        axios.get('https://opportunity-tracker-xta8.onrender.com/api/job-applications')
      ]);
      
      setInterests(interestsResponse.data.interests);
      setJobApplications(applicationsResponse.data.applications);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load your interests and applications');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveInterest = async (opportunityId, opportunityType) => {
    try {
      await axios.post('https://opportunity-tracker-xta8.onrender.com/api/interests', {
        opportunityId,
        opportunityType,
        opportunityName: '', // Not needed for removal
        platform: '',
        link: '',
        deadline: ''
      });
      
      // Refresh the interests list
      fetchData();
    } catch (error) {
      console.error('Error removing interest:', error);
      setError('Failed to remove interest');
    }
  };

  const handleRemoveApplication = async (jobId) => {
    try {
      await axios.delete(`https://opportunity-tracker-xta8.onrender.com/api/job-applications/${jobId}`);
      fetchData(); // Refresh the job applications list
    } catch (error) {
      console.error('Error removing job application:', error);
      setError('Failed to remove job application');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDeadline = (deadline) => {
    if (!deadline) return null;
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getPriorityColor = (days) => {
    if (days <= 0) return 'error';
    if (days <= 3) return 'warning';
    if (days <= 7) return 'info';
    return 'success';
  };

  const getJobApplicationColor = (status) => {
    switch (status) {
      case 'accepted': return 'success';
      case 'rejected': return 'error';
      case 'interview': return 'warning';
      case 'pending': return 'info';
      default: return 'primary';
    }
  };

  const interestEvents = interests
    .filter(interest => interest.deadline && !isNaN(new Date(interest.deadline).getTime()))
    .map(interest => ({
      id: interest.opportunityId,
      title: `${interest.opportunityName} (${interest.platform})`,
      start: new Date(interest.deadline),
      end: new Date(interest.deadline),
      type: 'interest',
      data: {
        platform: interest.platform,
        link: interest.link,
        opportunityName: interest.opportunityName
      }
    }));

  // Convert job applications to calendar events
  const applicationEvents = jobApplications
    .filter(app => app.applicationDate && !isNaN(new Date(app.applicationDate).getTime()))
    .map(app => ({
      id: app.jobId,
      title: `${app.jobTitle} at ${app.company}`,
      start: new Date(app.applicationDate),
      end: new Date(app.applicationDate),
      type: 'application',
      data: {
        company: app.company,
        sourceUrl: app.sourceUrl,
        jobTitle: app.jobTitle,
        status: app.status
      }
    }));

  const allEvents = [...interestEvents, ...applicationEvents];

  if (!isAuthenticated) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Please login to view your calendar
        </Typography>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading your calendar...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={fetchData} variant="outlined">
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
        📅 My Calendar
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        View all your interests and job applications in one place
      </Typography>

      <Box sx={{ height: 600, mb: 4 }}>
        <BigCalendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          views={['month', 'week', 'day', 'agenda']}
          defaultView="month"
          toolbar={true}
          components={{
            event: (props) => (
              <span style={{ fontSize: '12px', padding: '2px 4px' }}>
                {props.title}
                <Button
                  size="small"
                  variant="text"
                  href={getGoogleCalendarLink({
                    title: props.title,
                    details: props.event?.data?.platform || props.event?.data?.company || '',
                    location: props.event?.data?.link || props.event?.data?.sourceUrl || '',
                    start: props.event.start,
                    end: props.event.end,
                  })}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ ml: 1 }}
                >
                  Add to Google Calendar
                </Button>
              </span>
            ),
          }}
        />
      </Box>

      {/* Interests Section */}
      {interests.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Favorite color="error" />
            My Interests ({interests.length})
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {interests.filter(interest => interest.opportunityName).map((interest, index) => (
              <Grid item xs={12} sm={6} key={interest.opportunityId || index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    border: `2px solid ${getPriorityColor(getDaysUntilDeadline(interest.deadline))}`,
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {interest.opportunityName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {interest.platform}
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Deadline: {formatDate(interest.deadline)}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: getPriorityColor(getDaysUntilDeadline(interest.deadline)),
                        fontWeight: 600,
                        mb: 2
                      }}
                    >
                      {getDaysUntilDeadline(interest.deadline)} days left
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => window.open(interest.link, '_blank')}
                        startIcon={<LinkIcon />}
                      >
                        View
                      </Button>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveInterest(interest.opportunityId, interest.opportunityType)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Job Applications Section */}
      {jobApplications.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WorkIcon color="primary" />
            Job Applications ({jobApplications.length})
          </Typography>
          
          <Grid container spacing={3} sx={{ mt: 2 }}>
            {jobApplications.filter(app => app.jobTitle && app.company).map((application, index) => (
              <Grid item xs={12} sm={6} key={application.jobId || index}>
                <Card 
                  sx={{ 
                    height: '100%',
                    border: `2px solid ${getJobApplicationColor(application.status)}`,
                    '&:hover': {
                      boxShadow: 4,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s ease'
                  }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                      {application.jobTitle}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {application.company}
                    </Typography>
                    <Chip 
                      label={application.status} 
                      color={getJobApplicationColor(application.status)}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    <Typography variant="body2" sx={{ mb: 2 }}>
                      Applied: {formatDate(application.applicationDate)}
                    </Typography>
                    {application.notes && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Notes: {application.notes}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      {application.sourceUrl && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => window.open(application.sourceUrl, '_blank')}
                          startIcon={<LinkIcon />}
                        >
                          View Job
                        </Button>
                      )}
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveApplication(application.jobId)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Summary */}
      <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • {interests.length} interests saved
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • {jobApplications.length} job applications tracked
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • {allEvents.length} total events in calendar
        </Typography>
      </Box>
    </Container>
  );
};

// Helper function for Google Calendar link
function getGoogleCalendarLink({ title, details, location, start, end }) {
  const formatDate = (date) =>
    new Date(date).toISOString().replace(/-|:|\.\d\d\d/g, '');

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: details,
    location: location,
    dates: `${formatDate(start)}/${formatDate(end)}`,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export default Calendar; 