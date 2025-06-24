'use client';

import { useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Avatar from '@mui/material/Avatar';
import LockIcon from '@mui/icons-material/Lock';

export default function Navbar() {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleCloseMenu = () => {
    setAnchorEl(null);
  };
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="home"
            sx={{ mr: 2 }}
            component={Link}
            href="/"
          >
            <LockIcon />
          </IconButton>
          
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            SecretChit
          </Typography>
          
          {!session && (
            <Button color="inherit" onClick={() => signIn()}>
              Login
            </Button>
          )}
          
          {session?.user && (
            <>
              <Button color="inherit" component={Link} href="/dashboard">
                Dashboard
              </Button>
              
              <IconButton onClick={handleOpenMenu} sx={{ ml: 2 }}>
                <Avatar 
                  alt={session.user.name || 'User'} 
                  src={session.user.image || undefined}
                  sx={{ width: 32, height: 32 }}
                />
              </IconButton>
              
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
              >
                <MenuItem disabled>
                  {session.user.email}
                </MenuItem>
                <MenuItem onClick={() => signOut()}>
                  Sign Out
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
