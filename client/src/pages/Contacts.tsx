import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Snackbar,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../context/AuthContext';
import { userAPI, User } from '../services/api';

const Contacts: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await userAPI.searchUsers(query);
      setSearchResults(data.filter((u: User) => u.id !== user?.id));
    } catch (err) {
      setError('Failed to search users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendPayment = (address: string) => {
    navigate('/send', { state: { recipientAddress: address } });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Find Users
        </Typography>

        <Card>
          <CardContent>
            <TextField
              fullWidth
              label="Search by username or wallet address"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: loading && (
                  <InputAdornment position="end">
                    <CircularProgress size={20} />
                  </InputAdornment>
                ),
              }}
            />

            <List sx={{ mt: 2 }}>
              {searchResults.map((result) => (
                <ListItem
                  key={result.id}
                  divider
                  sx={{
                    '&:last-child': {
                      borderBottom: 'none',
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar>
                      {result.username?.[0]?.toUpperCase() || result.walletAddress[2]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={result.username || truncateAddress(result.walletAddress)}
                    secondary={result.username ? truncateAddress(result.walletAddress) : ''}
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={() => handleSendPayment(result.walletAddress)}
                    >
                      <SendIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {searchQuery.length >= 3 && searchResults.length === 0 && !loading && (
                <ListItem>
                  <ListItemText
                    primary="No users found"
                    secondary="Try a different search term"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>
      </Box>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        message={error}
      />
    </Container>
  );
};

export default Contacts;
