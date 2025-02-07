# StabaPay - USDC Payment App

StabaPay is a modern web application that enables seamless peer-to-peer payments using USDC stablecoins. Built with security and user experience in mind, it leverages Privy for wallet management and Bridge for fiat-to-USDC conversions.

## Features

- 🔐 Seamless wallet creation and management with Privy
- 💸 Send and receive USDC payments
- 💱 Easy fiat-to-USDC conversion using Bridge
- 👥 User-friendly contact management
- 📱 Mobile-responsive design

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Authentication: Privy
- Blockchain: Ethereum (USDC)
- Fiat On-ramp: Bridge API
- Database: PostgreSQL

## Environment Variables

Create a `.env` file with the following variables:

```
PRIVY_APP_ID=your_privy_app_id
PRIVY_SECRET_KEY=your_privy_secret_key
BRIDGE_API_KEY=your_bridge_api_key
DATABASE_URL=your_database_url

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```


## Architecture

The application follows a modern web architecture:
- React frontend for responsive UI
- Express backend for API handling
- Privy SDK for wallet management
- Bridge API integration for fiat-to-USDC conversion
- PostgreSQL for storing user data and transaction history

## Security Considerations

- All sensitive data is encrypted
- Private keys are managed securely through Privy
- API keys and secrets are stored as environment variables
- Input validation and sanitization
- Rate limiting for API endpoints

## Contributors
- [adugyimah6776@gmail.com](mailto:adugyimah6776@gmail.com)  
- [fredyomoke@gmail.com](mailto:fredyomoke@gmail.com)  
- [fyattani@gmail.com](mailto:fyattani@gmail.com)  







