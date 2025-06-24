'use client';

import { Box, Container, Typography, Paper, Button } from '@mui/material';
import Navbar from '@/components/Navbar';
import SecretsDashboard from '@/components/SecretsDashboard';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <Box>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography>Loading...</Typography>
        </Container>
      </Box>
    );
  }

  if (!session) {
    return (
      <Box>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>Authentication Required</Typography>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Please sign in to view your dashboard.
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              href="/api/auth/signin"
            >
              Sign In
            </Button>
          </Paper>
        </Container>
      </Box>
    );
  }

  return (
    <Box>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <SecretsDashboard />
      </Container>
    </Box>
  );
}
