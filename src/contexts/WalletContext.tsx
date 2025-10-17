import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { walletService } from '@/services/walletService';
import type { Wallet, Transaction } from '@/types';
import toast from 'react-hot-toast';

interface WalletContextType {
  wallet: Wallet | null;
  transactions: Transaction[];
  isLoading: boolean;
  refreshWallet: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
  addMoney: (amount: number) => Promise<{ orderId: string; paymentSessionId: string }>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      const walletData = await walletService.getWallet();
      setWallet(walletData);
    } catch (error: any) {
      console.error('Failed to fetch wallet:', error);
      // Don't show error toast - handled by interceptor
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshTransactions = useCallback(async () => {
    try {
      const response = await walletService.getTransactions(1, 20);
      setTransactions(response.data);
    } catch (error: any) {
      console.error('Failed to fetch transactions:', error);
      // Don't show error toast - handled by interceptor
    }
  }, []);

  const addMoney = useCallback(async (amount: number) => {
    try {
      const paymentData = await walletService.addMoney(amount);
      toast.success('Payment initiated');
      return paymentData;
    } catch (error: any) {
      toast.error(error.message || 'Failed to initiate payment');
      throw error;
    }
  }, []);

  // DO NOT load wallet on mount - let pages call refreshWallet when needed
  // This prevents infinite loops when user is not authenticated

  const value: WalletContextType = {
    wallet,
    transactions,
    isLoading,
    refreshWallet,
    refreshTransactions,
    addMoney,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
