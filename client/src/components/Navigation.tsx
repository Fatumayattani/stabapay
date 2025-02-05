import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Typography,
  Box,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { usePrivy } from '@privy-io/react-auth';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Navigation: React.FC = () => {
  const { login, logout, authenticated, user } = usePrivy();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" color="transparent" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'primary.main',
            fontWeight: 'bold',
          }}
        >
          StabaPay
        </Typography>

        {authenticated ? (
          <>
            <Button
              component={RouterLink}
              to="/send"
              color="primary"
              sx={{ mx: 1 }}
            >
              Send
            </Button>
            <Button
              component={RouterLink}
              to="/contacts"
              color="primary"
              sx={{ mx: 1 }}
            >
              Contacts
            </Button>
            <IconButton
              color="primary"
              sx={{ mx: 1 }}
              component={RouterLink}
              to="/wallet"
            >
              <AccountBalanceWalletIcon />
            </IconButton>
            <IconButton onClick={handleMenu} sx={{ ml: 1 }}>
              <Avatar
                src={user?.avatar?.url}
                sx={{ width: 32, height: 32 }}
              />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem
                component={RouterLink}
                to="/profile"
                onClick={handleClose}
              >
                Profile
              </MenuItem>
              <MenuItem onClick={() => { handleClose(); logout(); }}>
                Logout
              </MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            color="primary"
            variant="contained"
            onClick={() => login()}
          >
            Connect Wallet
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
