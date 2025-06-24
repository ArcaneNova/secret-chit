'use client';

import { Box, Container } from '@mui/material';
import { useParams } from 'next/navigation';
import SecretViewer from '@/components/SecretViewer';
import Navbar from '@/components/Navbar';

export default function SecretPage() {
  const params = useParams();
  const secretId = params.id as string;

  return (
    <Box>
      <Navbar />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <SecretViewer secretId={secretId} />
      </Container>
    </Box>
  );
}
