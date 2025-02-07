import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { authAPI, userAPI, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  updateProfile: (data: { username?: string; email?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { ready, authenticated, user: privyUser } = usePrivy();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      if (!ready || !authenticated || !privyUser?.wallet?.address) {
        setIsLoading(false);
        return;
      }

      try {
        // Get nonce
        const { data: { nonce } } = await authAPI.getNonce();

        // Sign message with wallet
        const message = nonce;
        const signature = await privyUser.wallet?.sign(message);

        // Authenticate with backend
        const { data: { user: userData } } = await authAPI.authenticate(
          privyUser.wallet.address,
          signature,
          message
        );

        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [ready, authenticated, privyUser]);

  const updateProfile = async (data: { username?: string; email?: string }) => {
    try {
      const { data: { user: updatedUser } } = await userAPI.updateProfile(data);
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        error,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
