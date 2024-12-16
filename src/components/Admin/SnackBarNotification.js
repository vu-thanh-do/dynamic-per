import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { Box, LinearProgress } from '@mui/material';

const SnackBarNotification = ({ open, handleClose, message, snackType }) => {
  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      autoHideDuration={1500}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={snackType}
        variant="filled"
        sx={{ width: '100%', fontSize: '1.5rem', position: 'relative' }}
      >
        {message}
        <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
          <LinearProgress color="inherit" />
        </Box>
      </Alert>
    </Snackbar>
  );
};

export default SnackBarNotification;
