import React, { useState } from 'react';
import { Modal, Box, Typography, RadioGroup, FormControlLabel, Radio, Button, IconButton } from '@mui/material';
import { Close, ReportProblem } from '@mui/icons-material';
import './ReportModal.css';

const ReportModal = ({ open, onClose, onConfirm }) => {
  const [reason, setReason] = useState('Abusive language');

  const handleSubmit = () => {
    onConfirm(reason);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} className="aegis-modal-container">
      <Box className="report-modal-content">
        <div className="modal-header">
          <Typography variant="h6" className="modal-title">
            <ReportProblem sx={{ mr: 1, color: '#ff4444' }} />
            SUBMIT_REPORT
          </Typography>
          <IconButton onClick={onClose} sx={{ color: '#888' }}>
            <Close />
          </IconButton>
        </div>

        <Typography variant="body2" sx={{ mb: 3, color: '#aaa' }}>
          Select the violation type to initiate disciplinary protocols.
        </Typography>

        <RadioGroup value={reason} onChange={(e) => setReason(e.target.value)} className="report-radio-group">
          <FormControlLabel 
            value="Abusive language" 
            control={<Radio className="aegis-radio" />} 
            label="Abusive language" 
          />
          <FormControlLabel 
            value="Privacy" 
            control={<Radio className="aegis-radio" />} 
            label="Privacy Violation" 
          />
          <FormControlLabel 
            value="Others" 
            control={<Radio className="aegis-radio" />} 
            label="Others" 
          />
        </RadioGroup>

        <div className="modal-actions">
          <Button onClick={onClose} className="btn-cancel">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" className="btn-confirm">
            Submit Report
          </Button>
        </div>
      </Box>
    </Modal>
  );
};

export default ReportModal;