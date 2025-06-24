'use client';

import { Box, Container, Typography, Paper, Button, Divider } from '@mui/material';
import { signIn } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import GitHubIcon from '@mui/icons-material/GitHub';
import GoogleIcon from '@mui/icons-material/Google';
import EmailIcon from '@mui/icons-material/Email';
import { useState } from 'react';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn('email', { email, callbackUrl: '/' });
    setIsEmailSent(true);
  };

  return (
    <Box>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" align="center" gutterBottom>
            Sign In to SecretChit
          </Typography>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, my: 3 }}>
            <Button
              variant="contained"
              startIcon={<GoogleIcon />}
              fullWidth
              onClick={() => signIn('google', { callbackUrl: '/' })}
              sx={{ py: 1.5 }}
            >
              Continue with Google
            </Button>
            
            <Button
              variant="contained"
              startIcon={<GitHubIcon />}
              fullWidth
              onClick={() => signIn('github', { callbackUrl: '/' })}
              sx={{ py: 1.5 }}
            >
              Continue with GitHub
            </Button>
          </Box>
          
          <Divider sx={{ my: 3 }}>OR</Divider>
          
          {isEmailSent ? (
            <Box sx={{ textAlign: 'center', my: 2 }}>
              <Typography variant="body1" gutterBottom>
                Check your email!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                We sent you a sign-in link. Please check your email to continue.
              </Typography>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleEmailSignIn} sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Sign in with email
              </Typography>
              
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  style={{
                    padding: '10px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    flex: 1,
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<EmailIcon />}
                >
                  Sign In
                </Button>
              </div>
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                We&apos;ll email you a magic link for password-free sign in.
              </Typography>
            </Box>
          )}
        </Paper>
      </Container>
    </Box>
  );
}
