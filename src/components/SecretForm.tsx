'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Alert,
  Stack,
  Divider
} from '@mui/material';
import { trpc } from '@/app/_trpc/client';

const expiryOptions = [
  { value: 3600, label: '1 Hour' },
  { value: 86400, label: '24 Hours' },
  { value: 604800, label: '7 Days' },
  { value: 2592000, label: '30 Days' },
];

export default function SecretForm() {
  const router = useRouter();
  const [secretText, setSecretText] = useState('');
  const [password, setPassword] = useState('');
  const [oneTime, setOneTime] = useState(true);
  const [expiryTime, setExpiryTime] = useState(86400); // 24 hours default
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{id: string, url: string} | null>(null);
  
  const createSecret = trpc.secret.create.useMutation({
    onSuccess: (data) => {
      const secretUrl = `${window.location.origin}/s/${data.id}`;
      setSuccess({ id: data.id, url: secretUrl });
      setSecretText('');
      setPassword('');
    },
    onError: (err) => {
      setError(err.message);
    }
  });
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!secretText.trim()) {
      setError('Secret text cannot be empty');
      return;
    }
    
    createSecret.mutate({
      text: secretText,
      oneTime,
      expiresIn: expiryTime,
      password: password.length > 0 ? password : undefined,
    });
  };
  
  const copyToClipboard = () => {
    if (success) {
      navigator.clipboard.writeText(success.url);
    }
  };
  
  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 600, mx: 'auto', mt: 4 }}>
      {success ? (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>
            Your secret has been created successfully!
          </Alert>
          
          <Typography variant="h6" gutterBottom>
            Secret URL
          </Typography>
          
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <TextField
              fullWidth
              value={success.url}
              variant="outlined"
              InputProps={{ readOnly: true }}
            />
            <Button variant="contained" onClick={copyToClipboard}>
              Copy
            </Button>
          </Stack>
          
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Share this URL with the intended recipient. It will expire according to your settings.
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Button 
              variant="outlined" 
              onClick={() => {
                setSuccess(null);
                router.refresh();
              }}
            >
              Create Another Secret
            </Button>
          </Box>
        </Box>
      ) : (
        <form onSubmit={handleSubmit}>
          <Typography variant="h5" component="h2" gutterBottom>
            Create a New Secret
          </Typography>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Enter the sensitive information you want to share securely.
          </Typography>
          
          <TextField
            label="Secret Text"
            fullWidth
            multiline
            rows={4}
            value={secretText}
            onChange={(e) => setSecretText(e.target.value)}
            required
            sx={{ mb: 3 }}
          />
          
          <Divider sx={{ my: 3 }}>Security Options</Divider>
          
          <FormControlLabel
            control={
              <Switch 
                checked={oneTime} 
                onChange={(e) => setOneTime(e.target.checked)} 
              />
            }
            label="One-time access (automatically delete after being viewed)"
            sx={{ mb: 3, display: 'block' }}
          />
          
          <TextField
            label="Optional Password"
            fullWidth
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="Leave blank for no password protection"
            sx={{ mb: 3 }}
          />
          
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel>Expiration Time</InputLabel>
            <Select
              value={expiryTime}
              label="Expiration Time"
              onChange={(e) => setExpiryTime(Number(e.target.value))}
            >
              {expiryOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Button            type="submit" 
            variant="contained" 
            fullWidth 
            size="large"
            disabled={createSecret.isPending}
          >
            {createSecret.isPending ? 'Creating...' : 'Create Secret'}
          </Button>
        </form>
      )}
    </Paper>
  );
}
