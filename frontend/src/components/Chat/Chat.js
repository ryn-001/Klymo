import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { io } from 'socket.io-client';
import Matching from '../Matching/Matching';
import { 
  Box, Typography, TextField, IconButton, Divider, 
  Paper, Chip, Button, Stack, useMediaQuery, useTheme, Drawer 
} from '@mui/material';
import { 
  Send, FiberManualRecord, Shield, ExitToApp, NavigateNext, 
  Terminal, Menu as MenuIcon 
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router';
import { config } from "../../index";

const CENSORED_WORDS = ["fuck", "shit", "ass", "asshole", "bitch", "bastard", "nigger", "faggot", "retard", "slut", "whore", "porn", "pussy", "dick", "penis", "vagina", "cum"];

class ChatFilter {
  constructor(words = CENSORED_WORDS) {
    this.words = words;
    this.map = { 'a': '[a@4*]', 'e': '[e3*]', 'i': '[i1!|*]', 'o': '[o0*]', 'u': '[u*]', 's': '[s5$]', 't': '[t7+]' };
    this.regex = new RegExp(this.words.map(w => this.buildPattern(w)).join('|'), 'gi');
  }
  buildPattern(word) { return '\\b' + word.split('').map(char => this.map[char] || char).join('[\\W_]*') + '\\b'; }
  normalize(text) { return text.replace(/[\W_]/g, '').toLowerCase(); }
  isClean(message) { return !this.regex.test(message); }
  cleanMessage(message) { return message.replace(this.regex, (match) => '*'.repeat(match.length)); }
}

const Chat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const filter = useMemo(() => new ChatFilter(), []);
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  const [roomId, setRoomId] = useState(null);
  const [isMatchmaking, setIsMatchmaking] = useState(true);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [partner, setPartner] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const user = useMemo(() => {
    const raw = localStorage.getItem('aegis_user');
    return raw ? JSON.parse(raw) : null;
  }, []);

  const userId = user?._id || user?.data?._id;
  const userAvatar = location.state?.avatar || user?.avatar;

  const handleNext = useCallback(() => {
    if (socketRef.current) {
      if (roomId) localStorage.removeItem(`aegis_chat_${roomId}`);
      setIsMatchmaking(true);
      setMessages([]);
      setPartner(null);
      setRoomId(null);
      setDrawerOpen(false);
      socketRef.current.emit('requeue');
    }
  }, [roomId]);

  const handleTerminate = useCallback(() => {
    if (roomId) localStorage.removeItem(`aegis_chat_${roomId}`);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    navigate('/');
  }, [navigate, roomId]);

  useEffect(() => {
    const initSession = async () => {
      const fp = await FingerprintJS.load();
      const result = await fp.get();

      if (!socketRef.current) {
        socketRef.current = io(config.backendPoint, { withCredentials: true });
      }

      socketRef.current.off('connect');
      socketRef.current.off('match_found');
      socketRef.current.off('receive_message');
      socketRef.current.off('partner_disconnected');

      socketRef.current.on('connect', () => {
        socketRef.current.emit("join_queue", {
          userId: userId,
          deviceId: result.visitorId,
          username: user?.username || "Guest",
          bio: user?.bio || "",
          interests: user?.interests || [],
          avatar: userAvatar
        });
      });

      socketRef.current.on('match_found', (data) => {
        setRoomId(data.roomId);
        setPartner(data.partner);
        setIsMatchmaking(false);
        const existingChat = localStorage.getItem(`aegis_chat_${data.roomId}`);
        if (existingChat) {
            setMessages(JSON.parse(existingChat).messages);
        } else {
            setMessages([{ text: data.notice, sender: 'system', time: new Date().toLocaleTimeString() }]);
        }
      });

      socketRef.current.on('receive_message', (msg) => {
        setMessages((prev) => [...prev, { ...msg, sender: 'them' }]);
      });

      socketRef.current.on('partner_disconnected', () => {
        if (roomId) localStorage.removeItem(`aegis_chat_${roomId}`);
        setMessages((prev) => [...prev, { text: "SIGNAL_LOST_TERMINATING", sender: 'system' }]);
        setTimeout(() => handleNext(), 2000);
      });
    };

    initSession();

    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('match_found');
        socketRef.current.off('receive_message');
        socketRef.current.off('partner_disconnected');
      }
    };
  }, [userId, user, userAvatar, handleNext, roomId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isMatchmaking]);

  const handleSendMessage = () => {
    if (!input.trim() || !socketRef.current || !roomId) return;
    const normalizedInput = filter.normalize(input);
    if (!filter.isClean(input) || !filter.isClean(normalizedInput)) {
      alert("Blocked.");
      setInput("");
      return;
    }
    const safeText = filter.cleanMessage(input);
    const msgData = { roomId, text: safeText, sender: 'me', time: new Date().toLocaleTimeString() };
    socketRef.current.emit('send_message', msgData);
    setMessages((prev) => [...prev, msgData]);
    setInput(""); 
  };

  const SidebarContent = (
    <Box sx={{ width: isMobile ? 280 : 300, bgcolor: '#111', height: '100%', display: 'flex', flexDirection: 'column', p: 3, color: '#fff' }}>
      <Typography variant="h6" fontWeight="900" sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Terminal sx={{ color: '#00ff88' }} />
        AEGIS<span style={{ background: 'linear-gradient(45deg, #007bff, #00ff88)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>.CHAT</span>
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box sx={{ width: 32, height: 32, mr: 1.5, borderRadius: '50%', overflow: 'hidden', bgcolor: '#222' }} dangerouslySetInnerHTML={{ __html: userAvatar }} />
        <Box>
          <Typography variant="body2" fontWeight="600">{user?.username || 'Guest'}</Typography>
          <Typography variant="caption" color="success.main" sx={{ display: 'flex', alignItems: 'center', fontSize: '0.65rem' }}>
            <FiberManualRecord sx={{ fontSize: 6, mr: 0.5 }} /> ONLINE
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ bgcolor: '#222', mb: 3 }} />
      <Box sx={{ p: 2, bgcolor: '#161616', borderRadius: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <Box sx={{ width: 32, height: 32, mr: 1.5, borderRadius: '50%', overflow: 'hidden' }} dangerouslySetInnerHTML={{ __html: partner?.avatar || '' }} />
          <Typography variant="body2" fontWeight="bold">{partner?.username || 'Searching...'}</Typography>
        </Box>
        <Typography variant="caption" sx={{ color: '#888' }}>{partner?.bio || 'Establishing link...'}</Typography>
      </Box>
      <Stack spacing={1.5}>
        <Button variant="contained" fullWidth startIcon={<NavigateNext />} onClick={handleNext} sx={{ background: 'linear-gradient(45deg, #007bff, #00ff88)', color: '#000', fontWeight: 'bold' }}>New Session</Button>
        <Button variant="outlined" fullWidth startIcon={<ExitToApp />} onClick={handleTerminate} sx={{ borderColor: '#333', color: '#888' }}>Terminate</Button>
      </Stack>
    </Box>
  );

  if (isMatchmaking) return <Matching />;

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw', bgcolor: '#0a0a0a', color: '#fff', overflow: 'hidden' }}>
      {!isMobile && SidebarContent}
      <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ '& .MuiDrawer-paper': { bgcolor: 'transparent' } }}>{SidebarContent}</Drawer>
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', width: '100%' }}>
        <Box sx={{ p: 2, bgcolor: '#111', borderBottom: '1px solid #222', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               {isMobile && <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: '#fff' }}><MenuIcon /></IconButton>}
               <Shield sx={{ color: '#00ff88', fontSize: 18 }} />
               <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>Session_Tunnel_v1</Typography>
            </Box>
            <Chip label="E2EE" size="small" sx={{ color: '#00ff88', borderColor: '#00ff88' }} variant="outlined" />
        </Box>
        <Box ref={scrollRef} sx={{ flexGrow: 1, overflowY: 'auto', p: isMobile ? 2 : 3, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flexGrow: 1 }} />
          {messages.map((msg, i) => (
            <Box key={i} sx={{ alignSelf: msg.sender === 'me' ? 'flex-end' : (msg.sender === 'system' ? 'center' : 'flex-start'), mb: 2, maxWidth: '85%' }}>
              <Paper elevation={0} sx={{ p: '10px 16px', bgcolor: msg.sender === 'me' ? '#007bff' : (msg.sender === 'system' ? 'transparent' : '#161616'), color: msg.sender === 'system' ? '#00ff88' : '#fff', borderRadius: '12px' }}>
                <Typography variant="body2">{msg.text}</Typography>
              </Paper>
            </Box>
          ))}
        </Box>
        <Box sx={{ p: isMobile ? 1.5 : 3, bgcolor: '#111' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: '#000', border: '1px solid #333', borderRadius: '24px', px: 2 }}>
            <TextField fullWidth variant="standard" placeholder="Type message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} InputProps={{ disableUnderline: true, sx: { color: '#fff', py: 1.2 } }} />
            <IconButton onClick={handleSendMessage} disabled={!input.trim()} sx={{ color: '#00ff88' }}><Send /></IconButton>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Chat;