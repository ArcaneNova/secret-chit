'use client';

import { Box, Container, Typography, Paper, Button } from '@mui/material';
import Navbar from '@/components/Navbar';
import EmailIcon from '@mui/icons-material/Email';

// Define the verify request page component
export default function VerifyRequest() {
  return (
    <Box>
      <Navbar />
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <EmailIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h5" component="h1" gutterBottom>
            Check your email
          </Typography>
          
          <Typography variant="body1" paragraph>
            A sign in link has been sent to your email address.
          </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
            If you don&apos;t see it, check your spam folder. The link will expire after 24 hours.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary"
            href="/"
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Container>
    </Box>
  );
}
