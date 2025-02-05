require('dotenv').config({ path: '.env.test' });

// Mock Privy client
jest.mock('@privy-io/server-auth', () => ({
  PrivyClient: jest.fn().mockImplementation(() => ({
    verifyAuthToken: jest.fn().mockResolvedValue({
      id: 'test-user-id',
      email: 'test@example.com',
      wallet: {
        address: '0x1234567890123456789012345678901234567890'
      }
    })
  }))
}));

// Global test setup
beforeAll(async () => {
  // Add any global setup here
});

// Global test teardown
afterAll(async () => {
  // Add any global teardown here
});
