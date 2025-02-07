import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { TransactionService } from '../services/transaction.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { ethers } from 'ethers';

const transactionService = new TransactionService();

export const transactionValidation = [
  body('recipientAddress')
    .isString()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage('Invalid Ethereum address'),
  body('amount')
    .isString()
    .matches(/^\d+$/)
    .withMessage('Amount must be a valid number in wei'),
  body('note').optional().isString().trim(),
];

export class TransactionController {
  async createTransaction(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError(400, 'Invalid input');
      }

      const { recipientAddress, amount, note } = req.body;
      const senderId = req.user?.id;

      if (!senderId) {
        throw new AppError(401, 'User not authenticated');
      }

      const transaction = await transactionService.createTransaction(
        senderId,
        recipientAddress,
        amount,
        note
      );

      res.status(201).json({
        status: 'success',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async executeTransaction(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { transactionId } = req.params;
      const { privateKey } = req.body;

      if (!privateKey) {
        throw new AppError(400, 'Private key is required');
      }

      // Create wallet from private key
      const wallet = new ethers.Wallet(privateKey);

      const transaction = await transactionService.executeTransaction(
        transactionId,
        wallet
      );

      res.json({
        status: 'success',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUserTransactions(
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError(401, 'User not authenticated');
      }

      const transactions = await transactionService.getTransactionsByUser(userId);

      res.json({
        status: 'success',
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTransaction(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { id } = req.params;
      const transaction = await transactionService.getTransactionById(id);

      if (!transaction) {
        throw new AppError(404, 'Transaction not found');
      }

      res.json({
        status: 'success',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }
}
