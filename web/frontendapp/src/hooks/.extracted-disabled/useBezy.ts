import { useState, useEffect, useCallback } from 'react';
import { supabaseService, Transaction, BezyBalance } from '../services/supabaseService';
import { useAuth } from './useAuth';

interface BezyState {
  balance: BezyBalance | null;
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}

export const useBezy = () => {
  const { user, isAuthenticated } = useAuth();
  const [bezyState, setBezyState] = useState<BezyState>({
    balance: null,
    transactions: [],
    loading: false,
    error: null,
  });

  // Load initial data when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadBezyData();
    } else {
      // Clear data when user logs out
      setBezyState({
        balance: null,
        transactions: [],
        loading: false,
        error: null,
      });
    }
  }, [isAuthenticated, user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const balanceSubscription = supabaseService.subscribeToBalance(
      user.id,
      (payload) => {
        console.log('Balance updated:', payload);
        if (payload.eventType === 'UPDATE' && payload.new) {
          setBezyState(prev => ({ ...prev, balance: payload.new }));
        }
      }
    );

    const transactionsSubscription = supabaseService.subscribeToTransactions(
      user.id,
      (payload) => {
        console.log('Transaction updated:', payload);
        if (payload.eventType === 'INSERT' && payload.new) {
          setBezyState(prev => ({
            ...prev,
            transactions: [payload.new, ...prev.transactions]
          }));
        } else if (payload.eventType === 'UPDATE' && payload.new) {
          setBezyState(prev => ({
            ...prev,
            transactions: prev.transactions.map(t =>
              t.id === payload.new.id ? payload.new : t
            )
          }));
        }
      }
    );

    return () => {
      balanceSubscription.unsubscribe();
      transactionsSubscription.unsubscribe();
    };
  }, [user]);

  const loadBezyData = async () => {
    if (!user) return;

    try {
      setBezyState(prev => ({ ...prev, loading: true, error: null }));

      // Load balance and transactions in parallel
      const [balanceResult, transactionsResult] = await Promise.all([
        supabaseService.getBezyBalance(user.id),
        supabaseService.getUserTransactions(user.id, 50)
      ]);

      if (!balanceResult.success) {
        throw new Error(balanceResult.error || 'Failed to load balance');
      }

      if (!transactionsResult.success) {
        throw new Error(transactionsResult.error || 'Failed to load transactions');
      }

      setBezyState({
        balance: balanceResult.balance!,
        transactions: transactionsResult.transactions!,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error('Error loading BEZY data:', error);
      setBezyState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load BEZY data'
      }));
    }
  };

  const refreshBalance = useCallback(async () => {
    if (!user) return { success: false, error: 'No user authenticated' };

    try {
      const result = await supabaseService.getBezyBalance(user.id);

      if (result.success && result.balance) {
        setBezyState(prev => ({ ...prev, balance: result.balance! }));
        return { success: true, balance: result.balance };
      }

      return { success: false, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh balance';
      return { success: false, error: errorMessage };
    }
  }, [user]);

  const refreshTransactions = useCallback(async () => {
    if (!user) return { success: false, error: 'No user authenticated' };

    try {
      const result = await supabaseService.getUserTransactions(user.id, 50);

      if (result.success && result.transactions) {
        setBezyState(prev => ({ ...prev, transactions: result.transactions! }));
        return { success: true, transactions: result.transactions };
      }

      return { success: false, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh transactions';
      return { success: false, error: errorMessage };
    }
  }, [user]);

  const getTransactionById = useCallback((transactionId: string) => {
    return bezyState.transactions.find(t => t.id === transactionId) || null;
  }, [bezyState.transactions]);

  const getPendingTransactions = useCallback(() => {
    return bezyState.transactions.filter(t =>
      t.status === 'pending' || t.status === 'processing'
    );
  }, [bezyState.transactions]);

  const getCompletedTransactions = useCallback(() => {
    return bezyState.transactions.filter(t => t.status === 'completed');
  }, [bezyState.transactions]);

  const getFailedTransactions = useCallback(() => {
    return bezyState.transactions.filter(t => t.status === 'failed');
  }, [bezyState.transactions]);

  const getTransactionsByType = useCallback((type: Transaction['transaction_type']) => {
    return bezyState.transactions.filter(t => t.transaction_type === type);
  }, [bezyState.transactions]);

  // Calculate derived stats
  const stats = {
    totalBalance: bezyState.balance?.balance || 0,
    lockedBalance: bezyState.balance?.locked_balance || 0,
    availableBalance: (bezyState.balance?.balance || 0) - (bezyState.balance?.locked_balance || 0),
    totalEarned: bezyState.balance?.total_earned || 0,
    totalSpent: bezyState.balance?.total_spent || 0,
    totalTransactions: bezyState.transactions.length,
    pendingTransactions: getPendingTransactions().length,
    completedTransactions: getCompletedTransactions().length,
    failedTransactions: getFailedTransactions().length,
  };

  const clearError = () => {
    setBezyState(prev => ({ ...prev, error: null }));
  };

  return {
    ...bezyState,
    stats,
    refreshBalance,
    refreshTransactions,
    getTransactionById,
    getPendingTransactions,
    getCompletedTransactions,
    getFailedTransactions,
    getTransactionsByType,
    clearError,
    reload: loadBezyData,
  };
};