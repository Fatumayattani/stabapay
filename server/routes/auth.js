const express = require('express');
const router = express.Router();
const { PrivyClient } = require('@privy-io/server-auth');

const privyClient = new PrivyClient(
  process.env.PRIVY_APP_ID,
  process.env.PRIVY_SECRET_KEY
);

// Verify user authentication
router.post('/verify', async (req, res) => {
  try {
    const { token } = req.body;
    const verified = await privyClient.verifyAuthToken(token);
    
    if (verified) {
      res.json({ verified: true, user: verified });
    } else {
      res.status(401).json({ error: 'Invalid authentication' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
});

module.exports = router;
