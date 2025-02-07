import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth.service';
import { AppError } from '../middleware/errorHandler';

const authService = new AuthService();

export const authValidation = [
  body('walletAddress')
    .isString()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address'),
  body('signature').isString(),
  body('message').isString(),
];

export class AuthController {
  async getNonce(req: Request, res: Response, next: NextFunction) {
    try {
      const nonce = authService.generateNonce();
      
      res.json({
        status: 'success',
        data: {
          nonce,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(400, 'Invalid input');
      }

      const { walletAddress, signature, message } = req.body;

      const auth = await authService.authenticate(
        walletAddress,
        signature,
        message
      );

      res.json({
        status: 'success',
        data: auth,
      });
    } catch (error) {
      next(error);
    }
  }
}
