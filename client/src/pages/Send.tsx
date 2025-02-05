import React, { useState } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';

const Send: React.FC = () => {
  const { user } = usePrivy();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate input
      if (!ethers.isAddress(recipient)) {
        throw new Error('Invalid recipient address');
      }
      
      if (isNaN(Number(amount)) || Number(amount) <= 0) {
        throw new Error('Invalid amount');
      }

      // Convert amount to USDC units (6 decimals)
      const usdcAmount = ethers.parseUnits(amount, 6);

      // Send payment
      const response = await fetch('/api/payments/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientAddress: recipient,
          amount: usdcAmount.toString(),
          senderPrivyWallet: user?.wallet?.address,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payment failed');
      }

      setSuccess('Payment sent successfully!');
      setRecipient('');
      setAmount('');
    } catch (err: any) {
      setError(err.message || 'Failed to send payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Send USDC
        </Typography>

        <Card sx={{ mt: 2 }}>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Recipient Address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                margin="normal"
                variant="outlined"
                placeholder="0x..."
                disabled={loading}
              />

              <TextField
                fullWidth
                label="Amount (USDC)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                margin="normal"
                variant="outlined"
                type="number"
                inputProps={{ min: "0", step: "0.000001" }}
                disabled={loading}
              />

              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  {success}
                </Alert>
              )}

              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Send Payment'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default Send;
