const express = require('express');
const router = express.Router();
const { ethers } = require('ethers');

// USDC contract ABI (minimal for transfers)
const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)'
];

// Send USDC payment
router.post('/send', async (req, res) => {
  try {
    const { recipientAddress, amount, senderPrivyWallet } = req.body;
    
    // Initialize provider and contract
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const usdcContract = new ethers.Contract(
      process.env.USDC_CONTRACT_ADDRESS,
      USDC_ABI,
      provider
    );

    // Create transaction
    const tx = await usdcContract.transfer(recipientAddress, amount);
    await tx.wait();

    res.json({
      success: true,
      transactionHash: tx.hash
    });
  } catch (error) {
    res.status(500).json({ error: 'Payment failed' });
  }
});

// Get USDC balance
router.get('/balance/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
    const usdcContract = new ethers.Contract(
      process.env.USDC_CONTRACT_ADDRESS,
      USDC_ABI,
      provider
    );

    const balance = await usdcContract.balanceOf(address);
    
    res.json({
      address,
      balance: balance.toString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch balance' });
  }
});

// Bridge API integration for fiat to USDC conversion
router.post('/bridge/convert', async (req, res) => {
  try {
    const { amount, userAddress } = req.body;
    
    // Bridge API integration would go here
    // This is a placeholder for the actual Bridge API implementation
    
    res.json({
      success: true,
      message: 'Conversion initiated'
    });
  } catch (error) {
    res.status(500).json({ error: 'Conversion failed' });
  }
});

module.exports = router;
