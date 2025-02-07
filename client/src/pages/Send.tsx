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
  Snackbar,
} from '@mui/material';
import { usePrivy } from '@privy-io/react-auth';
import { ethers } from 'ethers';
import { transactionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Send: React.FC = () => {
  const { user: privyUser } = usePrivy();
  const { user } = useAuth();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
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

      // Create transaction
      const { data: transaction } = await transactionAPI.createTransaction({
        recipientAddress: recipient,
        amount: usdcAmount.toString(),
        note,
      });

      // Get signature from user's wallet
      if (!privyUser?.wallet) {
        throw new Error('Wallet not connected');
      }

      // Execute transaction
      const { data: executedTransaction } = await transactionAPI.executeTransaction(
        transaction.id,
        await privyUser.wallet.getPrivateKey()
      );

      setSuccess('Payment sent successfully!');
      setRecipient('');
      setAmount('');
      setNote('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Send Payment
        </Typography>

        <Card>
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
                required
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
                required
              />

              <TextField
                fullWidth
                label="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                margin="normal"
                variant="outlined"
                multiline
                rows={2}
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
                size="large"
                disabled={loading}
                sx={{ mt: 3 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Send Payment'}
              </Button>
            </form>
          </CardContent>
        </Card>
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

export default Send;
