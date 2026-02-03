import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Box, Typography, Button, Paper, Chip, Stack, Modal, IconButton, CircularProgress, TextField } from '@mui/material';
import { config } from "../../index";
import { ChatBubble, Close, ArrowBackIos, ArrowForwardIos, GppBad } from '@mui/icons-material';
import axios from 'axios';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import './Interests.css';
import { AVATARS } from "../../App";

const Interests = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [interests, setInterests] = useState(['Gaming', 'Anime', 'Politics']);
  const [genderFilter, setGenderFilter] = useState('Both');
  const [openModal, setOpenModal] = useState(false);
  const [newInterest, setNewInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);

  const [isBanned, setIsBanned] = useState(false);
  const [isPermanent, setIsPermanent] = useState(false);
  const [banTimeLeft, setBanTimeLeft] = useState(0);

  useEffect(() => {
    let timer;
    if (isBanned && !isPermanent && banTimeLeft > 0) {
      timer = setInterval(() => {
        setBanTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsBanned(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isBanned, isPermanent, banTimeLeft]);

  const formatTime = (seconds) => {
    if (isPermanent) return "PERMANENT";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDeviceId = async () => {
    try {
      const fp = await FingerprintJS.load();
      const result = await fp.get();
      return result.visitorId;
    } catch {
      return `fallback-${Math.random().toString(36).substr(2, 9)}`;
    }
  };

  const nextAvatar = () => setAvatarIndex((prev) => (prev + 1) % AVATARS.length);
  const prevAvatar = () => setAvatarIndex((prev) => (prev - 1 + AVATARS.length) % AVATARS.length);

  const handleAddInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const handleDeleteInterest = (toDelete) => {
    setInterests(interests.filter((i) => i !== toDelete));
  };

  const handleStartChatting = async () => {
    setLoading(true);
    try {
      const id = await getDeviceId();
      const payload = {
        username: user?.username || "Guest",
        bio: user?.bio || "",
        gender: user?.gender || "Male",
        interests: interests.length > 0 ? interests : [genderFilter],
        avatar: AVATARS[avatarIndex], 
        deviceId: id
      };

      const res = await axios.post(`${config.backendPoint}/api/users/register`, payload);
      
      if (res.data) {
        const userData = {
          ...res.data,
          deviceId: id,
          userId: res.data._id || res.data.id
        };

        localStorage.setItem('deviceId', id);
        localStorage.setItem('aegis_user', JSON.stringify(userData));

        navigate('/chat', { state: { user: userData, avatar: userData.avatar, deviceId: id } });
      }
    } catch (error) {
      if (error.response?.status === 403) {
        const { permanent, until } = error.response.data;
        setIsPermanent(!!permanent);
        setIsBanned(true);

        if (!permanent && until) {
          const remaining = Math.max(0, Math.floor((new Date(until).getTime() - Date.now()) / 1000));
          setBanTimeLeft(remaining);
        }
      } else {
        alert("Connection failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="aegis-flat-bg">
      <Box className="aegis-flat-container">
        <Box className="brand-header">
          <Typography onClick={() => navigate('/')} variant="h3" className="brand-text-flat" sx={{ cursor: 'pointer' }}>
            Aegis<span className="dot">.chat</span>
          </Typography>
        </Box>

        <Paper className="flat-card" elevation={0}>
          <Box className="flat-section" sx={{ textAlign: 'center' }}>
            <Typography className="flat-label">Choose Avatar</Typography>
            <Box className="avatar-slider-premium">
              <IconButton onClick={prevAvatar} className="slider-arrow"><ArrowBackIos /></IconButton>
              <Box className="avatar-frame">
                <Box className="avatar-inner" dangerouslySetInnerHTML={{ __html: AVATARS[avatarIndex] }} />
              </Box>
              <IconButton onClick={nextAvatar} className="slider-arrow"><ArrowForwardIos /></IconButton>
            </Box>
          </Box>

          <Box className="flat-section">
            <Box className="section-header" sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography className="flat-label">Interests</Typography>
              <Typography sx={{ color: '#8b5cf6', cursor: 'pointer', fontSize: '12px' }} onClick={() => setOpenModal(true)}>Edit</Typography>
            </Box>
            <Box className="interests-grid" sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {interests.map((item) => <Chip key={item} label={item} className="flat-chip" />)}
            </Box>
          </Box>

          <Box className="flat-section">
            <Typography className="flat-label">Match Preference</Typography>
            <Stack direction="row" spacing={1.5}>
              {['Male', 'Both', 'Female'].map((type) => (
                <Box key={type} className={`selection-box ${genderFilter === type ? 'selected' : ''}`} onClick={() => setGenderFilter(type)}>
                  <Typography className="selection-text">{type}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Button 
            className="flat-start-btn" 
            fullWidth 
            onClick={handleStartChatting} 
            disabled={loading} 
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ChatBubble />}
          >
            {loading ? 'Connecting...' : 'Start Chatting'}
          </Button>
        </Paper>
      </Box>

      {isBanned && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(10, 15, 25, 0.98)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, p: 3 }}>
          <Box sx={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
            <GppBad sx={{ fontSize: 100, color: '#ef4444', mb: 2 }} />
            <Typography variant="h3" fontWeight={900} color="#fff" sx={{ letterSpacing: -1, mb: 1 }}>ACCESS DENIED</Typography>
            <Typography color="#94a3b8" sx={{ mb: 4, fontSize: '1.1rem' }}>
              {isPermanent ? "Your device has been permanently suspended." : "Your access has been temporarily suspended."}
            </Typography>
            <Box sx={{ bgcolor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', p: 4, borderRadius: 4, mb: 4 }}>
              <Typography variant="overline" color="#ef4444" sx={{ fontWeight: 800 }}>{isPermanent ? "STATUS" : "REMAINING TIME"}</Typography>
              <Typography variant="h2" fontWeight={900} color="#ef4444" sx={{ fontFamily: 'monospace' }}>{formatTime(banTimeLeft)}</Typography>
            </Box>
            {!isPermanent && (
              <Button fullWidth variant="outlined" onClick={() => window.location.reload()} sx={{ borderColor: '#334155', color: '#94a3b8' }}>
                Refresh Status
              </Button>
            )}
          </Box>
        </Box>
      )}

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <Box className="modal-style" sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', bgcolor: '#1e293b', p: 4, borderRadius: 4, width: 350 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" color="#fff">Manage Interests</Typography>
            <IconButton onClick={() => setOpenModal(false)}><Close sx={{ color: '#fff' }} /></IconButton>
          </Box>
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <TextField fullWidth size="small" value={newInterest} onChange={(e) => setNewInterest(e.target.value)} placeholder="Add new..." sx={{ input: { color: '#fff' } }} />
            <Button variant="contained" onClick={handleAddInterest}>Add</Button>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {interests.map(i => <Chip key={i} label={i} onDelete={() => handleDeleteInterest(i)} sx={{ color: '#fff' }} />)}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Interests;