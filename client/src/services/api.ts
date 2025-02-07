import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Types
export interface Transaction {
  id: string;
  amount: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  txHash?: string;
  note?: string;
  createdAt: string;
  senderId: string;
  recipientId: string;
  sender?: User;
  recipient?: User;
}

export interface User {
  id: string;
  walletAddress: string;
  username?: string;
  email?: string;
}

// API functions
export const authAPI = {
  getNonce: async () => {
    const response = await api.get('/auth/nonce');
    return response.data;
  },

  authenticate: async (walletAddress: string, signature: string, message: string) => {
    const response = await api.post('/auth/authenticate', {
      walletAddress,
      signature,
      message,
    });
    return response.data;
  },
};

export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: { username?: string; email?: string }) => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  searchUsers: async (query: string) => {
    const response = await api.get('/users/search', { params: { query } });
    return response.data;
  },
};

export const transactionAPI = {
  createTransaction: async (data: {
    recipientAddress: string;
    amount: string;
    note?: string;
  }) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  executeTransaction: async (transactionId: string, privateKey: string) => {
    const response = await api.post(`/transactions/${transactionId}/execute`, {
      privateKey,
    });
    return response.data;
  },

  getUserTransactions: async () => {
    const response = await api.get('/transactions/user');
    return response.data;
  },

  getTransaction: async (id: string) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },
};

export default api;
