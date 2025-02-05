import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Container,
} from '@mui/material';
import { usePrivy } from '@privy-io/react-auth';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Home: React.FC = () => {
  const { login, authenticated, user } = usePrivy();
  const navigate = useNavigate();

  const [balance, setBalance] = React.useState<string>('0.00');

  React.useEffect(() => {
    // Fetch USDC balance when authenticated
    if (authenticated && user?.wallet?.address) {
      fetchBalance(user.wallet.address);
    }
  }, [authenticated, user]);

  const fetchBalance = async (address: string) => {
    try {
      const response = await fetch(`/api/payments/balance/${address}`);
      const data = await response.json();
      setBalance(data.balance);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 8, mb: 4 }}>
        {!authenticated ? (
          <Box textAlign="center">
            <Typography variant="h2" component="h1" gutterBottom>
              Send and receive USDC payments instantly
            </Typography>
            <Typography variant="h5" color="text.secondary" paragraph>
              StabaPay makes it easy to manage your USDC payments with a simple,
              secure interface.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => login()}
              startIcon={<AccountBalanceWalletIcon />}
              sx={{ mt: 2 }}
            >
              Get Started
            </Button>
          </Box>
        ) : (
          <Grid container spacing={4}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" color="text.secondary">
                    Your USDC Balance
                  </Typography>
                  <Typography variant="h3" component="div">
                    ${balance}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<SendIcon />}
                    onClick={() => navigate('/send')}
                    sx={{ mt: 2 }}
                  >
                    Send Payment
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Recent Activity
                  </Typography>
                  {/* Add transaction history component here */}
                  <Typography color="text.secondary">
                    No recent transactions
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quick Actions
                  </Typography>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{ mb: 1 }}
                    onClick={() => navigate('/contacts')}
                  >
                    View Contacts
                  </Button>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => navigate('/profile')}
                  >
                    Manage Profile
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Home;
