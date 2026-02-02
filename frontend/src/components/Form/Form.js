import { useState, useRef, useCallback } from 'react';
import { Box, TextField, Button, IconButton, CircularProgress, Typography } from '@mui/material';
import { PhotoCamera, Replay } from '@mui/icons-material';
import { useNavigate } from "react-router";
import Webcam from 'react-webcam';
import './Form.css';

const Form = () => {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const navigate = useNavigate();

  const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "user"
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setPhoto(imageSrc);
      }
    }
  }, [webcamRef]);

  const handleStartChat = async () => {
    if (isFormIncomplete) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', photo);
      formData.append('upload_preset', 'aegis_klymo');
      formData.append('folder', 'classification');

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/dpf9ahkft/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const cloudData = await cloudRes.json();

      if (cloudData.secure_url) {
        const aiRes = await fetch('https://schizoooo-klymo-hackathon.hf.space/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: cloudData.secure_url,
            public_id: cloudData.public_id
          })
        });

        const aiResult = await aiRes.json();

        if (aiResult.gender) {
          const userData = {
            username: nickname,
            bio: bio,
            gender: aiResult.gender.charAt(0).toUpperCase() +  aiResult.gender.slice(1).toLowerCase()
          };

          navigate('/interests', { state: { user: userData } });
        }
      }
    } catch (error) {
      console.error("Workflow failed:", error);
      alert("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isFormIncomplete = !photo || nickname.trim() === "" || bio.trim() === "";

  return (
    <Box className="form-card">
      <Typography className="flow-label">AI GENDER CLASSIFICATION</Typography>

      <Box className="webcam-container" sx={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '12px' }}>
        {cameraError && (
          <Typography color="error" sx={{ position: 'absolute', top: 10, zIndex: 20, width: '100%', textAlign: 'center' }}>
            Camera Error: {cameraError}
          </Typography>
        )}

        {!photo ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              mirrored={true}
              className="cam-view"
              onUserMediaError={(err) => setCameraError(err.toString())}
              onUserMedia={() => setCameraError(null)}
              style={{ width: '100%', display: 'block' }}
            />
            <IconButton
              onClick={capture}
              disabled={!!cameraError}
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { backgroundColor: '#fff' },
                boxShadow: 3
              }}
            >
              <PhotoCamera sx={{ fontSize: 32, color: '#000' }} />
            </IconButton>
          </>
        ) : (
          <>
            <img src={photo} alt="Verified Selfie" className="cam-view" style={{ width: '100%', display: 'block' }} />
            <IconButton
              onClick={() => setPhoto(null)}
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': { backgroundColor: '#fff' },
                boxShadow: 3
              }}
            >
              <Replay sx={{ fontSize: 32, color: '#000' }} />
            </IconButton>
          </>
        )}
      </Box>

      <TextField
        fullWidth
        placeholder="Pseudonym Nickname"
        variant="standard"
        className="mui-input"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        autoComplete="off"
        sx={{ mt: 2 }}
        InputProps={{ disableUnderline: true }}
      />

      <TextField
        fullWidth
        placeholder="Short Bio (1-2 lines)"
        multiline
        rows={2}
        variant="standard"
        className="mui-input"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        autoComplete="off"
        sx={{ mt: 1 }}
        InputProps={{ disableUnderline: true }}
      />

      <Button
        fullWidth
        className="btn-join"
        onClick={handleStartChat}
        disabled={isFormIncomplete || loading}
        sx={{
          mt: 2,
          "&.Mui-disabled": {
            backgroundColor: "#cccccc !important",
            color: "#666666 !important",
            cursor: "not-allowed"
          }
        }}
      >
        {loading ? <CircularProgress size={24} color="inherit" /> : 'VERIFY'}
      </Button>
      <Typography className="security-note" sx={{ textAlign: 'center', mt: 1 }}>Images are never stored.</Typography>
    </Box>
  );
};

export default Form;