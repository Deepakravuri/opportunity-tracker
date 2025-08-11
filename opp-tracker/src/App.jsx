import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import NavBar from './components/NavBar';
import TabContent from './components/TabContent';
import Login from './components/Login';
import Register from './components/Register';
import Calendar from './components/Calendar';

const AppContent = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [authMode, setAuthMode] = useState('login'); 
  const [showCalendar, setShowCalendar] = useState(false);
  const { isAuthenticated, loading } = useAuth();

  const categoryLabels = [
    'Hackathons',
    'Contests / Challenges',
    'Jobs / Internships'
  ];

  // Handle tab change - if in calendar view, exit calendar and show selected tab
  const handleTabChange = (newTab) => {
    setCurrentTab(newTab);
    if (showCalendar) {
      setShowCalendar(false);
    }
  };

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ 
          color: 'white', 
          fontSize: '1.2rem',
          textAlign: 'center'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  // Show authentication forms if not authenticated
  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <Login onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <Register onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  // Show calendar view if requested
  if (showCalendar) {
    return (
      <>
        <NavBar 
          currentTab={currentTab} 
          setCurrentTab={handleTabChange} 
          onShowCalendar={() => setShowCalendar(false)}
        />
        <Calendar />
      </>
    );
  }

  // Show main app if authenticated
  return (
    <>
      <NavBar 
        currentTab={currentTab} 
        setCurrentTab={handleTabChange} 
        onShowCalendar={() => setShowCalendar(true)}
      />
      <TabContent currentTab={currentTab} categoryLabels={categoryLabels} />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
