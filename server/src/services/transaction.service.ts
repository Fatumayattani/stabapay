import { ethers } from 'ethers';
import { PrismaClient, Transaction } from '@prisma/client';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

// USDC ABI for transfer function
const USDC_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
];

export class TransactionService {
  private provider: ethers.JsonRpcProvider;
  private usdcContract: ethers.Contract;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.usdcContract = new ethers.Contract(
      config.usdcContractAddress,
      USDC_ABI,
      this.provider
    );
  }

  async createTransaction(
    senderId: string,
    recipientAddress: string,
    amount: string,
    note?: string
  ): Promise<Transaction> {
    // Find or create recipient user
    const recipient = await prisma.user.upsert({
      where: { walletAddress: recipientAddress.toLowerCase() },
      update: {},
      create: { walletAddress: recipientAddress.toLowerCase() },
    });

    // Create transaction record
    const transaction = await prisma.transaction.create({
      data: {
        amount,
        status: 'PENDING',
        note,
        senderId,
        recipientId: recipient.id,
      },
    });

    logger.info({
      message: 'Transaction created',
      transactionId: transaction.id,
      amount,
      senderId,
      recipientId: recipient.id,
    });

    return transaction;
  }

  async executeTransaction(
    transactionId: string,
    senderWallet: ethers.Wallet
  ): Promise<Transaction> {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        recipient: true,
      },
    });

    if (!transaction) {
      throw new AppError(404, 'Transaction not found');
    }

    try {
      // Connect wallet to contract
      const connectedContract = this.usdcContract.connect(senderWallet);

      // Send the transaction
      const tx = await connectedContract.transfer(
        transaction.recipient.walletAddress,
        transaction.amount
      );

      // Wait for transaction to be mined
      const receipt = await tx.wait();

      // Update transaction status
      const updatedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'COMPLETED',
          txHash: receipt.hash,
        },
      });

      logger.info({
        message: 'Transaction completed',
        transactionId,
        txHash: receipt.hash,
      });

      return updatedTransaction;
    } catch (error) {
      // Update transaction status to failed
      const failedTransaction = await prisma.transaction.update({
        where: { id: transactionId },
        data: {
          status: 'FAILED',
        },
      });

      logger.error({
        message: 'Transaction failed',
        transactionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw new AppError(400, 'Transaction failed');
    }
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    return prisma.transaction.findMany({
      where: {
        OR: [
          { senderId: userId },
          { recipientId: userId },
        ],
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async getTransactionById(id: string): Promise<Transaction | null> {
    return prisma.transaction.findUnique({
      where: { id },
      include: {
        sender: true,
        recipient: true,
      },
    });
  }
}
