import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import TimerIcon from '@mui/icons-material/Timer';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import SecurityIcon from '@mui/icons-material/Security';
import Navbar from '@/components/Navbar';
import SecretForm from '@/components/SecretForm';

export default function Home() {
  return (
    <Box>
      <Navbar />
      
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box sx={{ mb: 6, textAlign: 'center' }}>
          <Typography variant="h2" component="h1" gutterBottom>
            SecretChit
          </Typography>
          
          <Typography variant="h5" color="text.secondary" sx={{ mb: 4 }}>
            Share sensitive information securely and temporarily
          </Typography>
        </Box>
        
        <SecretForm />
        
        <Box sx={{ my: 8 }}>
          <Typography variant="h4" component="h2" gutterBottom textAlign="center">
            How It Works
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4, mt: 2 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  <LockIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Create Your Secret
                </Typography>
                <Typography variant="body2">
                  Enter the sensitive information you want to share. 
                  Add an optional password for an extra layer of security.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  <TimerIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Set Expiration
                </Typography>
                <Typography variant="body2">
                  Choose how long your secret should be available before it self-destructs.
                  Once expired, the secret is permanently deleted.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="h6" component="h3" gutterBottom>
                  <VisibilityOffIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Share Securely
                </Typography>
                <Typography variant="body2">
                  Send the generated link to your recipient through any channel.
                  Once viewed or expired, the secret is gone forever.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
        
        <Paper sx={{ p: 4, mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom>
            <SecurityIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Privacy & Security
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon><LockIcon /></ListItemIcon>
              <ListItemText 
                primary="End-to-End Encryption" 
                secondary="All secrets are encrypted before being stored in our database"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><VisibilityOffIcon /></ListItemIcon>
              <ListItemText 
                primary="One-Time Access" 
                secondary="Secrets can be configured to self-destruct after being viewed once"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon><TimerIcon /></ListItemIcon>
              <ListItemText 
                primary="Auto-Expiration" 
                secondary="All secrets have an expiration date after which they're permanently deleted"
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
      
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="body2" color="text.secondary" align="center">
          &copy; {new Date().getFullYear()} SecretChit
        </Typography>
      </Box>
    </Box>
  );
}
