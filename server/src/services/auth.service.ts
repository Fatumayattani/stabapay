import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { UserService } from './user.service';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler';

const userService = new UserService();

export class AuthService {
  generateNonce(): string {
    return `Sign this message to verify your wallet ownership: ${Math.floor(Math.random() * 1000000)}`;
  }

  async verifySignature(
    message: string,
    signature: string,
    walletAddress: string
  ): Promise<boolean> {
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);
      return recoveredAddress.toLowerCase() === walletAddress.toLowerCase();
    } catch (error) {
      return false;
    }
  }

  generateToken(userId: string, walletAddress: string): string {
    return jwt.sign(
      {
        id: userId,
        walletAddress,
      },
      config.jwtSecret,
      {
        expiresIn: '24h',
      }
    );
  }

  async authenticate(
    walletAddress: string,
    signature: string,
    message: string
  ): Promise<{ token: string; user: any }> {
    // Verify signature
    const isValid = await this.verifySignature(message, signature, walletAddress);
    if (!isValid) {
      throw new AppError(401, 'Invalid signature');
    }

    // Get or create user
    let user = await userService.getUserByWalletAddress(walletAddress);
    if (!user) {
      user = await userService.createUser(walletAddress);
    }

    // Generate token
    const token = this.generateToken(user.id, walletAddress);

    return {
      token,
      user,
    };
  }
}
