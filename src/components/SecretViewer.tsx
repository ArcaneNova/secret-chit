'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  Button, 
  Alert,
  Divider,
  TextField
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import PasswordPrompt from './PasswordPrompt';
import { trpc } from '@/app/_trpc/client';

interface SecretViewerProps {
  secretId: string;
}

export default function SecretViewer({ secretId }: SecretViewerProps) {
  const [password, setPassword] = useState<string | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  const { 
    data, 
    error, 
    isLoading,
    refetch
  } = trpc.secret.getById.useQuery(
    { 
      id: secretId,
      password: password || undefined
    },
    {
      retry: false,
      enabled: !!secretId,
      refetchOnWindowFocus: false,
    }
  );
  
  // Reset password error when changing password
  useEffect(() => {
    setPasswordError(null);
  }, [password]);
  
  const handlePasswordSubmit = (enteredPassword: string) => {
    setPassword(enteredPassword);
    refetch();
  };
  
  const copyToClipboard = () => {
    if (data?.text) {
      navigator.clipboard.writeText(data.text);
    }
  };
  
  // Show error states
  if (error) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.message}
        </Alert>        <Typography variant="body1" sx={{ mt: 2 }}>
          This secret may have expired, been viewed already, or doesn&apos;t exist.
        </Typography>
      </Paper>
    );
  }
  
  // If secret requires password and no password entered or incorrect password
  if (data?.requiresPassword && !data?.text) {
    return (
      <PasswordPrompt 
        onSubmit={handlePasswordSubmit}
        error={passwordError || undefined}
        isLoading={isLoading}
      />
    );
  }
  
  // Loading state
  if (isLoading) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="body1">Loading secret...</Typography>
      </Paper>
    );
  }
  
  // Display the secret
  if (data?.text) {
    return (
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Alert severity="success" sx={{ mb: 3 }}>
          Secret successfully retrieved
        </Alert>
        
        {data.oneTime && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            This is a one-time secret. It will be permanently deleted after you close this page.
          </Alert>
        )}
        
        <Typography variant="h6" gutterBottom>
          Secret Content
        </Typography>
        
        <Box sx={{ position: 'relative' }}>
          <TextField
            multiline
            rows={6}
            fullWidth
            variant="outlined"
            value={showSecret ? data.text : '••••••••••••••••••••••••••••••'}
            InputProps={{ readOnly: true }}
            sx={{ mb: 3 }}
          />
          
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              display: 'flex',
              gap: 1
            }}
          >
            <Button
              size="small"
              startIcon={showSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
              onClick={() => setShowSecret(!showSecret)}
              variant="contained"
              color="secondary"
            >
              {showSecret ? 'Hide' : 'Show'}
            </Button>
            
            <Button
              size="small"
              startIcon={<ContentCopyIcon />}
              onClick={copyToClipboard}
              variant="contained"
              disabled={!showSecret}
            >
              Copy
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" color="text.secondary">
          Expires: {new Date(data.expiresAt).toLocaleString()}
        </Typography>
      </Paper>
    );
  }
  
  // Fallback for other cases
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Alert severity="error">
        Unable to retrieve the secret. It may have been deleted or never existed.
      </Alert>
    </Paper>
  );
}
