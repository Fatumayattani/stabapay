import React, { useState, useEffect } from 'react';
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
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { usePrivy } from '@privy-io/react-auth';
import SendIcon from '@mui/icons-material/Send';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { ethers } from 'ethers';

interface Contact {
  id: string;
  name: string;
  address: string;
  avatar?: string;
}

const Contacts: React.FC = () => {
  const { user } = usePrivy();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newContact, setNewContact] = useState({
    name: '',
    address: '',
  });

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const response = await fetch(`/api/users/${user?.id}/contacts`);
      if (!response.ok) {
        throw new Error('Failed to fetch contacts');
      }
      const data = await response.json();
      setContacts(data.contacts);
    } catch (err: any) {
      setError(err.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddContact = async () => {
    if (!ethers.isAddress(newContact.address)) {
      setError('Invalid wallet address');
      return;
    }

    try {
      const response = await fetch(`/api/users/${user?.id}/contacts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContact),
      });

      if (!response.ok) {
        throw new Error('Failed to add contact');
      }

      await fetchContacts();
      setOpenDialog(false);
      setNewContact({ name: '', address: '' });
    } catch (err: any) {
      setError(err.message || 'Failed to add contact');
    }
  };

  const handleSendPayment = (address: string) => {
    navigate('/send', { state: { recipient: address } });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Contacts
          </Typography>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Add Contact
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Card>
          <CardContent>
            <List>
              {contacts.map((contact) => (
                <ListItem key={contact.id}>
                  <ListItemAvatar>
                    <Avatar src={contact.avatar}>
                      {contact.name[0].toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={contact.name}
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: 'monospace',
                          fontSize: '0.8rem',
                        }}
                      >
                        {contact.address}
                      </Typography>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleSendPayment(contact.address)}
                      color="primary"
                    >
                      <SendIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {!loading && contacts.length === 0 && (
                <ListItem>
                  <ListItemText
                    primary="No contacts yet"
                    secondary="Add your first contact to get started"
                  />
                </ListItem>
              )}
            </List>
          </CardContent>
        </Card>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              label="Name"
              value={newContact.name}
              onChange={(e) =>
                setNewContact({ ...newContact, name: e.target.value })
              }
              margin="normal"
            />
            <TextField
              fullWidth
              label="Wallet Address"
              value={newContact.address}
              onChange={(e) =>
                setNewContact({ ...newContact, address: e.target.value })
              }
              margin="normal"
              placeholder="0x..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button onClick={handleAddContact} variant="contained">
              Add Contact
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
};

export default Contacts;
