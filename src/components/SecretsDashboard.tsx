'use client';

import { useState } from 'react';
import { 
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  TextField,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  InputAdornment,
} from '@mui/material';
import { ChipProps } from '@mui/material/Chip';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SearchIcon from '@mui/icons-material/Search';
import LockIcon from '@mui/icons-material/Lock';
import { trpc } from '@/app/_trpc/client';

interface Secret {
  id: string;
  createdAt: Date;
  expiresAt: Date;
  viewed: boolean;
  oneTime: boolean;
  hasPassword: boolean;
  status: 'active' | 'expired' | 'viewed';
}

export default function SecretsDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
    const { data: secrets, isLoading, refetch } = trpc.secret.getMySecrets.useQuery(
    { search: searchTerm.length > 0 ? searchTerm : undefined },
    { 
      refetchOnWindowFocus: true,
    }
  ) as { data: Secret[] | undefined, isLoading: boolean, refetch: () => void };
  
  const deleteSecret = trpc.secret.delete.useMutation({
    onSuccess: () => {
      handleDeleteClose();
      refetch();
    }
  });
  
  const handleDeleteOpen = (id: string) => {
    setDeleteId(id);
  };
  
  const handleDeleteClose = () => {
    setDeleteId(null);
  };
  
  const confirmDelete = () => {
    if (deleteId) {
      deleteSecret.mutate({ id: deleteId });
    }
  };
  
  const copyToClipboard = (id: string) => {
    const url = `${window.location.origin}/s/${id}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 3000);
  };
    const getStatusColor = (status: 'active' | 'expired' | 'viewed' | string): ChipProps['color'] => {
    switch(status) {
      case 'active': return 'success';
      case 'viewed': return 'warning';
      case 'expired': return 'error';
      default: return 'default';
    }
  };
  
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  if (isLoading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading your secrets...</Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Your Secrets
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <TextField
          label="Search secrets"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>
        {secrets && secrets.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">You haven&apos;t created any secrets yet.</Typography>
          <Button variant="contained" href="/" sx={{ mt: 2 }}>
            Create Your First Secret
          </Button>
        </Paper>
      ): (
        <TableContainer component={Paper}>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell>Secret ID</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Expires</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Security</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {secrets?.map((secret: Secret) => (
                <TableRow key={secret.id}>
                  <TableCell component="th" scope="row">
                    {secret.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{formatDate(secret.createdAt)}</TableCell>
                  <TableCell>{formatDate(secret.expiresAt)}</TableCell>
                  <TableCell>
                    <Chip
                      label={secret.status}
                      color={getStatusColor(secret.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {secret.oneTime && <Chip label="One-time" size="small" sx={{ mr: 0.5 }} />}
                    {secret.hasPassword && <LockIcon fontSize="small" color="info" />}
                  </TableCell>
                  <TableCell>
                    <IconButton 
                      aria-label="copy" 
                      onClick={() => copyToClipboard(secret.id)}
                      color={copySuccess === secret.id ? "success" : "default"}
                    >
                      <ContentCopyIcon />
                    </IconButton>
                    <IconButton 
                      aria-label="delete" 
                      onClick={() => handleDeleteOpen(secret.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteId}
        onClose={handleDeleteClose}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Secret?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will permanently delete this secret. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            disabled={deleteSecret.isPending}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
