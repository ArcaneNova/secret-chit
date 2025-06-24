'use client';

import { Box, Container, Typography, Paper, Button, Alert } from '@mui/material';
import Navbar from '@/components/Navbar';
import ErrorIcon from '@mui/icons-material/Error';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

// Error content component that uses useSearchParams
function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  
  // Map error codes to human-readable messages
  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification link may have been used or expired.",
    Default: "An unexpected error occurred while trying to authenticate."
  };
  
  const errorMessage = error ? errorMessages[error] || errorMessages.Default : errorMessages.Default;
    return (
    <Box>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            
            <Typography variant="h5" component="h1" gutterBottom>
              Authentication Error
            </Typography>
          </Box>
          
          <Alert severity="error" sx={{ mb: 3 }}>
            {errorMessage}
          </Alert>
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button 
              variant="contained" 
              color="primary"
              href="/api/auth/signin"
            >
              Try Again
            </Button>
            
            <Button 
              variant="outlined"
              href="/"
            >
              Return to Home
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

// Main page component with Suspense boundary
export default function AuthError() {
  return (
    <Suspense fallback={
      <Box>
        <Navbar />
        <Container maxWidth="sm" sx={{ mt: 8 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <ErrorIcon sx={{ fontSize: 60, color: 'error.main', mb: 2 }} />
            <Typography variant="h5">Loading error details...</Typography>
          </Paper>
        </Container>
      </Box>
    }>
      <ErrorContent />
    </Suspense>
  );
}
