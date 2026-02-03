import { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Close } from '@mui/icons-material';
import { useNavigate } from 'react-router';
import './Matching.css';

const Matching = () => {
  const navigate = useNavigate();
  const [elapsedTime, setElapsedTime] = useState(0);

  const localUser = (() => {
    try {
      const data = localStorage.getItem('aegis_user');
      if (!data) return null;
      const parsed = JSON.parse(data);
      return parsed.data ? parsed.data : parsed;
    } catch (err) {
      return null;
    }
  })();

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const userAvatar = localUser?.avatar || "";

  return (
    <Box className="matching-layout">
      <Box className="matching-content">
        <Box className="radar-system">
          <Box className="pulse-ring" />
          <Box className="pulse-ring-2" />
          
          <Box className="avatar-preview-container">
            {userAvatar.startsWith('<svg') ? (
              <Box 
                className="svg-avatar-matching"
                dangerouslySetInnerHTML={{ __html: userAvatar }} 
              />
            ) : (
              <Box className="initials-avatar">
                {localUser?.username?.charAt(0) || '?'}
              </Box>
            )}
          </Box>
        </Box>

        <Typography variant="h5" className="matching-title">
          Searching for a match...
        </Typography>
        
        <Typography className="matching-subtitle">
          Securely connecting to the Aegis network
        </Typography>

        <Box className="timer-badge">
          {Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}
        </Box>

        <Button
          className="cancel-search-btn"
          startIcon={<Close />}
          onClick={() => navigate('/')}
        >
          Cancel Search
        </Button>
      </Box>
    </Box>
  );
};

export default Matching;