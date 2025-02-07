import { Router } from 'express';
import { TransactionController, transactionValidation } from '../controllers/transaction.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const transactionController = new TransactionController();

// Apply authentication middleware to all routes
router.use(authenticate);

// Create a new transaction
router.post(
  '/',
  transactionValidation,
  transactionController.createTransaction
);

// Execute a transaction
router.post(
  '/:transactionId/execute',
  transactionController.executeTransaction
);

// Get user's transactions
router.get(
  '/user',
  transactionController.getUserTransactions
);

// Get specific transaction
router.get(
  '/:id',
  transactionController.getTransaction
);

export const transactionRoutes = router;
