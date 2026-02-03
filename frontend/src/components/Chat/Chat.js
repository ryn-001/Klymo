import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { io } from 'socket.io-client';
import Matching from '../Matching/Matching';
import ReportModal from '../ReportModal/ReportModal';
import {
  Box, Typography, TextField, IconButton, Divider,
  Paper, Button, Stack, useMediaQuery, useTheme, Drawer, Avatar, Popover
} from '@mui/material';
import {
  Send, NavigateNext, Menu as MenuIcon, ReportProblem, EmojiEmotions, GppBad
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router';
import { config } from "../../index";
import { CENSORED_WORDS } from "../../App";
import './Chat.css';

const EMOJIS = ['😊', '😂', '🤣', '❤️', '😍', '😒', '😭', '😘', '💀', '🔥', '👍', '🙌', '✨', '👀', '🤔', '🚩'];

const filterText = (text) => {
  if (!text) return "";
  let filtered = text;
  CENSORED_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  });
  return filtered;
};

const AvatarDisplay = ({ data, fallback, size = 44 }) => {
  const sanitized = data?.replace(/["']/g, "").trim() || "";
  if (sanitized.startsWith('<svg')) {
    return (
      <Box
        className="avatar-container-flat"
        sx={{ width: size, height: size }}
        dangerouslySetInnerHTML={{ __html: sanitized }}
      />
    );
  }
  return <Avatar sx={{ width: size, height: size, bgcolor: '#334155' }}>{fallback}</Avatar>;
};

const Chat = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  const [roomId, setRoomId] = useState(null);
  const [isMatchmaking, setIsMatchmaking] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [partner, setPartner] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [emojiAnchor, setEmojiAnchor] = useState(null);
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState({ permanent: false, until: null });

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem('aegis_user');
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.data ? parsed.data : parsed;
    } catch (err) { return null; }
  }, []);

  const currentUserAvatar = user?.avatar || location.state?.avatar;

  const handleNext = useCallback(() => {
    if (socketRef.current) {
      setIsMatchmaking(true);
      setMessages([]);
      setPartner(null);
      setRoomId(null);
      setDrawerOpen(false);
      socketRef.current.emit('requeue');
    }
  }, []);

  const handleReportConfirm = (reason) => {
    if (socketRef.current && partner?.deviceId) {
      socketRef.current.emit("report_user", {
        targetDeviceId: partner.deviceId,
        reason: reason
      });
      handleNext();
    }
    setReportModalOpen(false);
  };

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(config.backendPoint, {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });
    }
    const socket = socketRef.current;

    socket.on('match_found', (data) => {
      setRoomId(data.roomId);
      setPartner(data.partner);
      setMessages([{ text: "Connection Secure • End-to-End Encrypted", sender: 'system' }]);
      setIsMatchmaking(false);
    });

    socket.on('receive_message', (msg) => {
      setMessages((prev) => [{ ...msg, sender: 'them' }, ...prev]);
    });

    socket.on('partner_disconnected', () => {
      setMessages((prev) => [{ text: "Partner left the room.", sender: 'system' }, ...prev]);
      setTimeout(() => handleNext(), 1500);
    });

    socket.on('banned', (data) => {
      setIsBanned(true);
      setBanInfo({ permanent: data.permanent, until: data.until });
      socket.disconnect();
    });

    const joinData = {
      userId: user?._id || user?.id || location.state?.user?.userId,
      deviceId: user?.deviceId || localStorage.getItem('deviceId'),
      username: user?.username || "Guest",
      avatar: currentUserAvatar,
      interests: user?.interests || [],
      gender: user?.gender
    };

    if (joinData.deviceId) {
      socket.emit("join_queue", joinData);
    }

    return () => {
      socket.off('match_found');
      socket.off('receive_message');
      socket.off('partner_disconnected');
      socket.off('banned');
    };
  }, [user, currentUserAvatar, handleNext, location.state]);

  const handleSendMessage = () => {
    if (!input.trim() || !roomId) return;
    const cleanText = filterText(input);
    const msgData = { roomId, text: cleanText, sender: 'me', time: new Date().toLocaleTimeString() };
    socketRef.current.emit('send_message', msgData);
    setMessages((prev) => [msgData, ...prev]);
    setInput("");
  };

  if (isBanned) {
    return (
      <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(10, 15, 25, 0.98)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, p: 3 }}>
        <Box sx={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <GppBad sx={{ fontSize: 100, color: '#ef4444', mb: 2 }} />
          <Typography variant="h3" fontWeight={900} color="#fff">BANNED</Typography>
          <Typography color="#94a3b8" sx={{ mb: 4 }}>
            {banInfo.permanent ? "Permanent suspension for violations." : "Temporary suspension due to reports."}
          </Typography>
          <Button fullWidth variant="contained" onClick={() => navigate('/')}>Home</Button>
        </Box>
      </Box>
    );
  }

  if (isMatchmaking) return <Matching />;

  const SidebarContent = (
    <Box className="chat-sidebar">
      <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 4 }}>Aegis.chat</Typography>
      <Typography className="sidebar-label">YOUR IDENTITY</Typography>
      <Box className="profile-card">
        <AvatarDisplay data={currentUserAvatar} fallback={user?.username?.charAt(0)} />
        <Box sx={{ ml: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>{user?.username || "You"}</Typography>
          <Typography variant="caption" sx={{ color: '#10b981' }}>Online</Typography>
        </Box>
      </Box>
      <Divider className="sidebar-divider" />
      <Typography className="sidebar-label">CHATTING WITH</Typography>
      <Box className="profile-card">
        <AvatarDisplay data={partner?.avatar} fallback={partner?.username?.charAt(0) || '?'} />
        <Box sx={{ ml: 1.5 }}>
          <Typography variant="subtitle2" fontWeight={700}>{partner?.username || 'Searching...'}</Typography>
          <Typography variant="caption" color="#94a3b8">{partner?.gender || 'Pending'}</Typography>
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Stack spacing={1.5}>
        <Button className="action-btn next-btn" fullWidth startIcon={<NavigateNext />} onClick={handleNext}>Next Session</Button>
        <Button className="action-btn report-btn" fullWidth startIcon={<ReportProblem />} onClick={() => setReportModalOpen(true)}>Report Partner</Button>
      </Stack>
    </Box>
  );

  return (
    <Box className="chat-layout">
      {!isMobile && SidebarContent}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} PaperProps={{ sx: { bgcolor: '#0f172a', width: 280, border: 'none' } }}>{SidebarContent}</Drawer>
      <Box className="chat-main">
        {isMobile && (
          <Box className="mobile-header">
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: '#fff' }}><MenuIcon /></IconButton>
            <Typography variant="subtitle1" fontWeight={700}>Aegis.chat</Typography>
            <Box sx={{ width: 40 }} />
          </Box>
        )}
        <Box ref={scrollRef} className="message-area" sx={{ display: 'flex', flexDirection: 'column-reverse' }}>
          {messages.map((msg, i) => (
            <Box key={i} className={`msg-wrapper ${msg.sender}`}>
              <Paper className={`msg-bubble ${msg.sender}`} elevation={0}>
                <Typography variant="body2">{msg.text}</Typography>
              </Paper>
            </Box>
          ))}
        </Box>
        <Box className="input-area">
          <Box className="input-container-flat">
            <IconButton onClick={(e) => setEmojiAnchor(e.currentTarget)} sx={{ color: '#94a3b8' }}><EmojiEmotions /></IconButton>
            <TextField fullWidth placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} InputProps={{ disableUnderline: true, sx: { color: '#fff', px: 1 } }} variant="standard" />
            <IconButton className="send-btn-flat" onClick={handleSendMessage} disabled={!input.trim()}><Send /></IconButton>
          </Box>
        </Box>
      </Box>
      <Popover open={Boolean(emojiAnchor)} anchorEl={emojiAnchor} onClose={() => setEmojiAnchor(null)} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }} PaperProps={{ sx: { bgcolor: '#1e293b', p: 1, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' } }}>
        {EMOJIS.map((emoji) => <IconButton key={emoji} onClick={() => { setInput(p => p + emoji); setEmojiAnchor(null); }}>{emoji}</IconButton>)}
      </Popover>
      <ReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} onConfirm={handleReportConfirm} />
    </Box>
  );
};

export default Chat;