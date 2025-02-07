import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Avatar,
  Grid,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { usePrivy } from '@privy-io/react-auth';
import { useAuth } from '../context/AuthContext';
import { transactionAPI } from '../services/api';
import { Transaction } from '../services/api';

const Profile: React.FC = () => {
  const { user: privyUser } = usePrivy();
  const { user, updateProfile } = useAuth();
  
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    setLoadingTransactions(true);
    try {
      const { data } = await transactionAPI.getUserTransactions();
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await updateProfile({ username, email });
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount: string) => {
    return (parseInt(amount) / 1e6).toFixed(2);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h1" gutterBottom>
              Profile Settings
            </Typography>

            <Card>
              <CardContent>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    sx={{ width: 100, height: 100 }}
                    src={privyUser?.avatar?.url}
                  />
                </Box>

                <form onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    label="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                  />

                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    margin="normal"
                    variant="outlined"
                    disabled={loading}
                  />

                  {error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      {error}
                    </Alert>
                  )}

                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={loading}
                    sx={{ mt: 3 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Changes'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h4" component="h2" gutterBottom>
              Transaction History
            </Typography>

            <Card>
              <CardContent>
                {loadingTransactions ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : transactions.length > 0 ? (
                  <Box>
                    {transactions.map((tx) => (
                      <Box
                        key={tx.id}
                        sx={{
                          py: 2,
                          borderBottom: '1px solid',
                          borderColor: 'divider',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Typography variant="subtitle1">
                          {tx.senderId === user?.id ? 'Sent to' : 'Received from'}:{' '}
                          {tx.senderId === user?.id
                            ? tx.recipient?.username || tx.recipient?.walletAddress
                            : tx.sender?.username || tx.sender?.walletAddress}
                        </Typography>
                        <Typography
                          variant="h6"
                          color={tx.senderId === user?.id ? 'error' : 'success'}
                        >
                          {tx.senderId === user?.id ? '-' : '+'}${formatAmount(tx.amount)} USDC
                        </Typography>
                        {tx.note && (
                          <Typography variant="body2" color="text.secondary">
                            Note: {tx.note}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          {new Date(tx.createdAt).toLocaleString()}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography color="text.secondary" align="center">
                    No transactions yet
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        message={success}
      />
    </Container>
  );
};

export default Profile;
