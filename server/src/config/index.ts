import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  
  // Privy configuration
  privyAppId: process.env.PRIVY_APP_ID,
  privyAppSecret: process.env.PRIVY_APP_SECRET,
  
  // Bridge API configuration
  bridgeApiKey: process.env.BRIDGE_API_KEY,
  bridgeApiUrl: process.env.BRIDGE_API_URL || 'https://api.bridge.xyz',
  
  // USDC contract configuration
  usdcContractAddress: process.env.USDC_CONTRACT_ADDRESS || '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // Mainnet USDC
  
  // Database configuration
  databaseUrl: process.env.DATABASE_URL,
  
  // Blockchain configuration
  rpcUrl: process.env.RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/your-api-key',
  chainId: parseInt(process.env.CHAIN_ID || '1'), // 1 for Ethereum mainnet
} as const;
