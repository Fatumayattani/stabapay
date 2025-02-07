import { PrismaClient, User } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export class UserService {
  async createUser(walletAddress: string, username?: string, email?: string): Promise<User> {
    try {
      return await prisma.user.create({
        data: {
          walletAddress: walletAddress.toLowerCase(),
          username,
          email,
        },
      });
    } catch (error) {
      throw new AppError(400, 'User already exists');
    }
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { walletAddress: walletAddress.toLowerCase() },
    });
  }

  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUser(
    id: string,
    data: {
      username?: string;
      email?: string;
    }
  ): Promise<User> {
    try {
      return await prisma.user.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw new AppError(400, 'Failed to update user');
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    return prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query, mode: 'insensitive' } },
          { walletAddress: { contains: query.toLowerCase() } },
        ],
      },
      take: 10,
    });
  }
}
