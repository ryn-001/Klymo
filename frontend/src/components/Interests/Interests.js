import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Box, Typography, Button, Paper, Chip, Stack, Modal, Switch, TextField, IconButton, CircularProgress } from '@mui/material';
import { config } from "../../index";
import { ChatBubble, Close, Add, ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import axios from 'axios';
import './Interests.css';

const AVATARS = [
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#e3f2fd"/><path d="M18 30c-4-10 2-20 14-22 12 2 18 12 14 22" fill="#1565c0"/><path d="M22 24c0 12 5 18 10 20s10-8 10-20h-20z" fill="#ffe0b2"/><g fill="#1e88e5"><circle cx="27" cy="33" r="2.5"/><circle cx="37" cy="33" r="2.5"/></g><g fill="#fff"><circle cx="26" cy="32" r="1"/><circle cx="36" cy="32" r="1"/></g><path d="M30 40l2 1 2-1" stroke="#8d6e63" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M20 22l6 8 6-6 6 6 6-8v-6h-24v6z" fill="#1976d2"/></svg>`,
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#eceff1"/><path d="M16 32c0-12 8-20 16-20s16 8 16 20" fill="#263238"/><path d="M22 24c0 12 5 18 10 20s10-8 10-20h-20z" fill="#ffe0b2"/><path d="M24 32l4-1 2 1" stroke="#263238" stroke-width="1.5" fill="none"/><path d="M34 32l4-1 2 1" stroke="#263238" stroke-width="1.5" fill="none"/><circle cx="27" cy="34" r="1.5" fill="#263238"/><circle cx="37" cy="34" r="1.5" fill="#263238"/><path d="M31 41h2" stroke="#8d6e63" stroke-width="1.5" stroke-linecap="round"/><path d="M18 20c4 8 10 14 20 10l-6-10h-14z" fill="#37474f"/></svg>`,
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#fff3e0"/><path d="M14 28c0-10 6-18 18-18s18 8 18 18c0 6-4 10-8 10" fill="#d84315"/><path d="M22 26c0 10 5 16 10 18s10-6 10-18h-20z" fill="#ffe0b2"/><circle cx="25" cy="36" r="2" fill="#ffccbc" opacity="0.6"/><circle cx="39" cy="36" r="2" fill="#ffccbc" opacity="0.6"/><circle cx="27" cy="33" r="3" fill="#4e342e"/><circle cx="37" cy="33" r="3" fill="#4e342e"/><circle cx="26" cy="32" r="1.2" fill="#fff"/><circle cx="36" cy="32" r="1.2" fill="#fff"/><path d="M29 40q3 3 6 0" stroke="#8d6e63" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M18 24l4 6 8-4 8 4 6-6v-8h-26v8z" fill="#f4511e"/></svg>`,
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#e8f5e9"/><path d="M20 24c0-8 6-12 12-12s12 4 12 12" fill="#388e3c"/> <path d="M23 25c0 11 4 17 9 19s9-7 9-19h-18z" fill="#ffe0b2"/><g stroke="#333" stroke-width="1.5" fill="none"><circle cx="28" cy="34" r="3.5"/><circle cx="36" cy="34" r="3.5"/><path d="M31.5 34h1"/></g><circle cx="28" cy="34" r="1.5" fill="#333"/><circle cx="36" cy="34" r="1.5" fill="#333"/><path d="M31 42h2" stroke="#8d6e63" stroke-width="1.5" stroke-linecap="round"/><path d="M22 22l10 2 10-2v-6h-20v6z" fill="#4caf50"/> </svg>`,
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#ede7f6"/><path d="M16 30c0-12 8-20 16-20s16 8 16 20v10h-32v-10z" fill="#bdbdbd"/> <path d="M24 28c0 10 4 15 8 17s8-5 8-17h-16z" fill="#ffe0b2"/><path d="M24 32h16" stroke="#9e9e9e" stroke-width="2"/><path d="M30 41l2 1 2-1" stroke="#8d6e63" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M18 20l14 16 14-16v-8h-28v8z" fill="#e0e0e0"/></svg>`,
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#fce4ec"/><path d="M16 26c0 12 4 20 8 20h16c4 0 8-8 8-20V18H16v8z" fill="#ec407a"/><path d="M23 26c0 10 4 16 9 18s9-6 9-18h-18z" fill="#ffe0b2"/><g fill="#ad1457"><ellipse cx="27" cy="34" rx="3" ry="4"/><ellipse cx="37" cy="34" rx="3" ry="4"/></g><g fill="#fff"><circle cx="26" cy="32" r="1.5"/><circle cx="36" cy="32" r="1.5"/><circle cx="28" cy="36" r="0.8"/><circle cx="38" cy="36" r="0.8"/></g><path d="M30 41q2 2 4 0" stroke="#8d6e63" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M18 20l5 7 5-5 4 5 4-5 6 7v-8h-24v8z" fill="#f48fb1"/></svg>`,
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#f3e5f5"/><path d="M14 20c0-8 8-12 18-12s18 4 18 12v30c0 4-6 6-10 2l-8-8-8 8c-4 4-10 2-10-2V20z" fill="#7b1fa2"/><path d="M23 26c0 10 4 16 9 18s9-6 9-18h-18z" fill="#ffe0b2"/><path d="M25 33q2-3 5 0" stroke="#4a148c" stroke-width="1.5" fill="none"/><path d="M34 33q2-3 5 0" stroke="#4a148c" stroke-width="1.5" fill="none"/><circle cx="32" cy="42" r="1" fill="#8d6e63"/><path d="M20 20v12l4-2 8 2 8-2 4 2v-12h-24z" fill="#9c27b0"/></svg>`,
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#fffde7"/><path d="M38 14l8 4 4 12c2 6-4 8-8 4l-4-8" fill="#fbc02d"/><circle cx="38" cy="16" r="3" fill="#f57f17"/> <path d="M20 22c0-6 6-8 12-8s12 2 12 8v10H20v-10z" fill="#fbc02d"/><path d="M23 26c0 10 4 16 9 18s9-6 9-18h-18z" fill="#ffe0b2"/><g fill="#e65100"><circle cx="28" cy="34" r="2.5"/><circle cx="36" cy="34" r="2.5"/></g><g fill="#fff"><circle cx="27" cy="33" r="1"/><circle cx="35" cy="33" r="1"/></g><path d="M30 41l2-1 2 1" stroke="#8d6e63" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="M22 20l10 6 10-6v-4h-20v4z" fill="#fdd835"/></svg>`,
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#e0f2f1"/><path d="M18 22c0-8 6-12 14-12s14 4 14 12v14c0 4-4 6-8 6h-12c-4 0-8-2-8-6V22z" fill="#00695c"/><path d="M24 28c0 9 4 15 8 17s8-6 8-17h-16z" fill="#ffe0b2"/><path d="M25 38l2 2M27 38l-2 2" stroke="#ff8a80" stroke-width="1"/><path d="M37 38l2 2M39 38l-2 2" stroke="#ff8a80" stroke-width="1"/><path d="M26 35q2 1 4 0" stroke="#004d40" stroke-width="1.5" fill="none"/><path d="M34 35q2 1 4 0" stroke="#004d40" stroke-width="1.5" fill="none"/><circle cx="32" cy="41" r="0.8" fill="#8d6e63"/><path d="M20 20l12 4 12-4v-6h-24v6z" fill="#00897b"/></svg>`,
  `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#f1f8e9"/><path d="M18 32l-4-4-2 8 6 2z" fill="#ffe0b2"/><path d="M46 32l4-4 2 8-6 2z" fill="#ffe0b2"/><path d="M16 24c0-10 6-14 16-14s16 4 16 14v24l-8-4-8 4-8-4-8 4V24z" fill="#558b2f"/><path d="M23 26c0 10 4 16 9 18s9-6 9-18h-18z" fill="#ffe0b2"/><g fill="#76ff03"><circle cx="28" cy="34" r="3"/><circle cx="36" cy="34" r="3"/></g><g fill="#fff"><circle cx="27" cy="33" r="1.2"/><circle cx="35" cy="33" r="1.2"/></g><path d="M31 41h2" stroke="#8d6e63" stroke-width="1.5" stroke-linecap="round"/><path d="M32 18l-12 8v6l12-4 12 4v-6z" fill="#7cb342"/></svg>`
];

const Interests = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = location.state?.user;

  const [interests, setInterests] = useState(['Gaming', 'Anime', 'Politics']);
  const [genderFilter, setGenderFilter] = useState('Both');
  const [openModal, setOpenModal] = useState(false);
  const [useInterests, setUseInterests] = useState(true);
  const [newInterest, setNewInterest] = useState('');
  const [loading, setLoading] = useState(false);
  const [avatarIndex, setAvatarIndex] = useState(0);

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
      const selectedAvatar = AVATARS[avatarIndex];
      
      const svgBase64 = `data:image/svg+xml;base64,${btoa(selectedAvatar)}`;

      const payload = {
        username: user?.username || "Guest",
        bio: user?.bio || "",
        gender: user?.gender || "Male",
        interests: useInterests ? interests : [genderFilter],
        avatar: svgBase64 
      };

      const response = await axios.post(`${config.backendPoint}/api/users/register`, payload);
      
      if (response.data) {
        localStorage.setItem('aegis_user', JSON.stringify(response.data));
        navigate('/chat', { state: { avatar: response.data.avatar } });
      }
    } catch (error) {
      console.error("Chat Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="aegis-flat-bg">
      <Box className="aegis-flat-container">
        <Box className="brand-header">
          <Typography onClick={() => navigate('/')} variant="h3" className="brand-text-flat">
            Aegis<span className="dot">.chat</span>
          </Typography>
        </Box>

        <Paper className="flat-card" elevation={0}>
          <Box className="flat-section" sx={{ textAlign: 'center' }}>
            <Typography className="flat-label">Choose Avatar</Typography>
            <Box className="avatar-slider-premium">
              <IconButton onClick={prevAvatar} className="slider-arrow"><ArrowBackIos /></IconButton>
              <Box className="avatar-frame">
                <Box 
                  className="avatar-inner"
                  dangerouslySetInnerHTML={{ __html: AVATARS[avatarIndex] }} 
                />
              </Box>
              <IconButton onClick={nextAvatar} className="slider-arrow"><ArrowForwardIos /></IconButton>
            </Box>
          </Box>

          <Box className="flat-section">
            <Box className="section-header">
              <Typography className="flat-label">Interests</Typography>
              <Typography className="edit-link" onClick={() => setOpenModal(true)}>Edit</Typography>
            </Box>
            <Box className="interests-grid" onClick={() => setOpenModal(true)}>
              {interests.map((item) => (
                <Chip key={item} label={item} className="flat-chip" />
              ))}
              <Chip label="+ Add" className="flat-chip-add" variant="outlined" />
            </Box>
          </Box>

          <Box className="flat-section">
            <Typography className="flat-label">Match Preference</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              {['Male', 'Both', 'Female'].map((type) => (
                <Box
                  key={type}
                  className={`selection-box ${genderFilter === type ? 'selected' : ''}`}
                  onClick={() => setGenderFilter(type)}
                >
                  <Typography className="selection-emoji">
                    {type === 'Male' && '♂️'}
                    {type === 'Both' && '👥'}
                    {type === 'Female' && '♀️'}
                  </Typography>
                  <Typography className="selection-text">{type}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>

          <Button 
            className="flat-start-btn" 
            fullWidth 
            disableElevation 
            startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ChatBubble />}
            onClick={handleStartChatting}
            disabled={loading}
          >
            {loading ? 'Finding Match...' : 'Start Chatting'}
          </Button>
        </Paper>

        <Typography className="flat-footer">
          Verified as <strong>{user?.gender || 'Guest'}</strong>. Safe and anonymous.
        </Typography>
      </Box>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
         <Box className="modal-style">
           <Box className="modal-header">
             <Typography variant="h6" fontWeight={700}>Manage Interests</Typography>
             <IconButton onClick={() => setOpenModal(false)} className="close-btn"><Close /></IconButton>
           </Box>
           <Box className="modal-toggle-row">
             <Typography fontWeight={600}>Filter by Interests</Typography>
             <Switch checked={useInterests} onChange={(e) => setUseInterests(e.target.checked)} color="primary" />
           </Box>
           <Box className="modal-input-section">
             <Typography className="flat-label">Add New</Typography>
             <Box className="input-group">
               <TextField
                fullWidth
                size="small"
                placeholder="Coding, Music..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddInterest()}
                className="modal-input"
              />
              <Button onClick={handleAddInterest} variant="contained" className="add-btn-flat"><Add /></Button>
            </Box>
          </Box>
          <Typography className="flat-label">Active Interests</Typography>
          <Box className="modal-interests-list">
            {interests.map((item) => (
              <Chip key={item} label={item} onDelete={() => handleDeleteInterest(item)} className="flat-chip-modal" />
            ))}
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default Interests;