import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import './userProfileForm.css';

const UserProfileForm = () => {
  const webcamRef = useRef(null);
  const [formData, setFormData] = useState({ username: '', bio: '', photo: null });

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setFormData((prev) => ({ ...prev }));
  }, [webcamRef]);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form Submitted:', formData);
  };

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1 className="title">Create Profile</h1>
          <p className="subtitle">Set up your identity</p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <div className="input-group">
            <label className="label">Username</label>
            <input
              className="input"
              type="text"
              placeholder="e.g. alex_dev"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label className="label">Bio</label>
            <textarea
              className="input"
              style={{ minHeight: '80px' }}
              placeholder="Tell us about yourself..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              required
            />
          </div>

          <div className="input-group">
            <label className="label">Profile Picture</label>
            <div className="webcam-wrapper">
              {!formData.photo ? (
                <>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="webcam-preview"
                  />
                  <button type="button" onClick={capture} className="capture-btn">
                    Capture
                  </button>
                </>
              ) : (
                <>
                  <img src={formData.photo} alt="Selfie" className="webcam-preview" />
                  <button 
                    type="button" 
                    onClick={() => setFormData({ ...formData, photo: null })} 
                    className="retake-btn"
                  >
                    Retake
                  </button>
                </>
              )}
            </div>
          </div>

          <button type="submit" disabled={!formData.photo} className="submit-btn">
            Create Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserProfileForm;