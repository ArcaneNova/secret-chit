'use client';

import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

interface PasswordPromptProps {
  onSubmit: (password: string) => void;
  error?: string;
  isLoading: boolean;
}

export default function PasswordPrompt({ onSubmit, error, isLoading }: PasswordPromptProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 400, mx: 'auto', mt: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Box sx={{ m: 1, bgcolor: 'primary.main', p: 2, borderRadius: '50%' }}>
          <LockOutlinedIcon fontSize="large" sx={{ color: 'white' }} />
        </Box>
        
        <Typography component="h1" variant="h5" sx={{ mt: 1 }}>
          Password Protected
        </Typography>
        
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2, textAlign: 'center' }}>
          This secret is protected with a password.
          Enter the password to view it.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? 'Verifying...' : 'View Secret'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
