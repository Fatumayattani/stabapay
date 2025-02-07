import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { UserService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const userService = new UserService();

export const userUpdateValidation = [
  body('username').optional().isString().trim().isLength({ min: 3, max: 30 }),
  body('email').optional().isEmail().normalizeEmail(),
];

export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { walletAddress, username, email } = req.body;

      if (!walletAddress) {
        throw new AppError(400, 'Wallet address is required');
      }

      const user = await userService.createUser(walletAddress, username, email);

      res.status(201).json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const user = await userService.getUserById(userId);

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(400, 'Invalid input');
      }

      const userId = req.user?.id;
      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const { username, email } = req.body;
      const user = await userService.updateUser(userId, { username, email });

      res.json({
        status: 'success',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  async searchUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.query;

      if (typeof query !== 'string') {
        throw new AppError(400, 'Search query is required');
      }

      const users = await userService.searchUsers(query);

      res.json({
        status: 'success',
        data: users,
      });
    } catch (error) {
      next(error);
    }
  }
}
