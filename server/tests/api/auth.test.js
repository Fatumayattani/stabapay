const request = require('supertest');
const app = require('../../index');
const db = require('../../db');

describe('Auth API', () => {
  beforeEach(async () => {
    // Clear test database before each test
    await db.query('DELETE FROM users');
  });

  describe('POST /api/auth/verify', () => {
    it('should verify a valid auth token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          token: 'valid-test-token'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('verified', true);
      expect(response.body).toHaveProperty('user');
    });

    it('should reject an invalid auth token', async () => {
      const response = await request(app)
        .post('/api/auth/verify')
        .send({
          token: 'invalid-token'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});
