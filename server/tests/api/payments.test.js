const request = require('supertest');
const app = require('../../index');
const db = require('../../db');
const { ethers } = require('ethers');

describe('Payments API', () => {
  let testUser;

  beforeEach(async () => {
    // Clear test database and create test user
    await db.query('DELETE FROM transactions');
    await db.query('DELETE FROM users');
    
    testUser = await db.createUser(
      'test-privy-id',
      'Test User',
      'test@example.com',
      '0x1234567890123456789012345678901234567890'
    );
  });

  describe('POST /api/payments/send', () => {
    it('should create a new USDC payment transaction', async () => {
      const amount = ethers.parseUnits('10', 6).toString(); // 10 USDC
      
      const response = await request(app)
        .post('/api/payments/send')
        .send({
          recipientAddress: '0x2234567890123456789012345678901234567890',
          amount,
          senderPrivyWallet: testUser.wallet_address
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('transactionHash');

      // Verify transaction was recorded in database
      const transactions = await db.query(
        'SELECT * FROM transactions WHERE sender_id = $1',
        [testUser.id]
      );
      expect(transactions.rows).toHaveLength(1);
      expect(transactions.rows[0].amount).toBe('10.000000');
    });

    it('should reject invalid recipient address', async () => {
      const response = await request(app)
        .post('/api/payments/send')
        .send({
          recipientAddress: 'invalid-address',
          amount: '10000000',
          senderPrivyWallet: testUser.wallet_address
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/payments/balance/:address', () => {
    it('should return USDC balance for valid address', async () => {
      const response = await request(app)
        .get(`/api/payments/balance/${testUser.wallet_address}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('address', testUser.wallet_address);
      expect(response.body).toHaveProperty('balance');
    });

    it('should handle invalid address', async () => {
      const response = await request(app)
        .get('/api/payments/balance/invalid-address');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });
});
