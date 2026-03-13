/**
 * usesolanaBalance Hook
 * Manages real-time SOL balance fetching and updates for connected Phantom wallet
 * Automatically refetches at specified intervals
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { solanaRpcService } from '../services/solanaRpcService';
import { phantomWalletService } from '../services/phantomWalletService';
import { walletManagementService } from '../services/walletManagementService';

export interface BalanceData {
  solBalance: number | null;
  loading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  isStale: boolean;
}

interface UsesolanaBalanceOptions {
  refreshInterval?: number; // ms between refreshes (default: 10000)
  walletAddress?: string; // Optional specific wallet address
  autoRefresh?: boolean; // Auto refresh on mount (default: true)
  enableStaleCheck?: boolean; // Check if balance is stale (default: true)
  staleThreshold?: number; // ms before balance considered stale (default: 60000)
}

const DEFAULT_OPTIONS: Required<UsesolanaBalanceOptions> = {
  refreshInterval: 10000,
  walletAddress: undefined,
  autoRefresh: true,
  enableStaleCheck: true,
  staleThreshold: 60000,
};

export const useSolanaBalance = (options: UsesolanaBalanceOptions = {}) => {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Calculate if balance is stale
   */
  const isStale = useCallback((): boolean => {
    if (!opts.enableStaleCheck || !lastUpdated) {
      return false;
    }
    return Date.now() - lastUpdated.getTime() > opts.staleThreshold;
  }, [lastUpdated, opts.enableStaleCheck, opts.staleThreshold]);

  /**
   * Get wallet address - from options, Phantom service, or wallet management
   */
  const getWalletAddress = useCallback((): string | null => {
    // Use explicit wallet address if provided
    if (opts.walletAddress) {
      return opts.walletAddress;
    }

    // Try Phantom wallet service
    const phantomKey = phantomWalletService.getPublicKey();
    if (phantomKey) {
      return phantomKey;
    }

    // Try wallet management service
    const primaryWallet = walletManagementService.getPrimaryWallet();
    if (primaryWallet) {
      return primaryWallet.then((wallet) => wallet?.address || null);
    }

    return null;
  }, [opts.walletAddress]);

  /**
   * Fetch balance from Solana RPC
   */
  const fetchBalance = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const walletAddress = await Promise.resolve(getWalletAddress());

      if (!walletAddress) {
        setBalance(null);
        if (isMountedRef.current) {
          setError(new Error('No wallet address available'));
        }
        return;
      }

      console.log(`💰 Fetching balance for: ${walletAddress.substring(0, 12)}...`);

      const solBalance = await solanaRpcService.getBalance(walletAddress);

      if (isMountedRef.current) {
        setBalance(solBalance);
        setLastUpdated(new Date());
        setError(null);
        console.log(`✅ Balance updated: ${solBalance} SOL`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch balance');
      console.error('❌ Failed to fetch balance:', error);

      if (isMountedRef.current) {
        setError(error);
        setBalance(null);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [getWalletAddress]);

  /**
   * Refetch balance manually
   */
  const refetch = useCallback(async () => {
    console.log('🔄 Manually refreshing balance...');
    await fetchBalance();
  }, [fetchBalance]);

  /**
   * Start auto-refresh interval
   */
  const startAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      console.log('⏱️ Auto-refresh interval triggered');
      fetchBalance();
    }, opts.refreshInterval);

    console.log(`🔄 Auto-refresh started every ${opts.refreshInterval}ms`);
  }, [fetchBalance, opts.refreshInterval]);

  /**
   * Stop auto-refresh interval
   */
  const stopAutoRefresh = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.log('⏸️ Auto-refresh stopped');
    }
  }, []);

  /**
   * Effect: Initialize on mount and setup auto-refresh
   */
  useEffect(() => {
    isMountedRef.current = true;

    if (opts.autoRefresh) {
      // Initial fetch
      fetchBalance();
      // Start auto-refresh
      startAutoRefresh();
    }

    return () => {
      isMountedRef.current = false;
      stopAutoRefresh();
    };
  }, [opts.autoRefresh, fetchBalance, startAutoRefresh, stopAutoRefresh]);

  /**
   * Effect: Listen to wallet connection changes
   */
  useEffect(() => {
    const unsubscribeConnection = phantomWalletService.onConnectionChange((isConnected) => {
      console.log(`👻 Phantom connection changed: ${isConnected}`);
      if (isConnected) {
        // Wallet connected, fetch balance
        fetchBalance();
      } else {
        // Wallet disconnected
        setBalance(null);
        setError(null);
      }
    });

    return () => {
      unsubscribeConnection();
    };
  }, [fetchBalance]);

  /**
   * Effect: Listen to network changes
   */
  useEffect(() => {
    const unsubscribeNetwork = phantomWalletService.onNetworkChange((network) => {
      console.log(`🌐 Network changed to: ${network}`);
      // Refresh balance when network changes
      fetchBalance();
    });

    return () => {
      unsubscribeNetwork();
    };
  }, [fetchBalance]);

  /**
   * Compute balance data
   */
  const balanceData: BalanceData = {
    solBalance: balance,
    loading,
    error,
    lastUpdated,
    isStale: isStale(),
  };

  return {
    ...balanceData,
    // Actions
    refetch,
    startAutoRefresh,
    stopAutoRefresh,
    // Formatted balance strings
    formattedBalance: balance !== null ? balance.toFixed(4) : '0.0000',
    formattedBalanceShort: balance !== null ? balance.toFixed(2) : '0.00',
    // USD approximation (assuming $150 per SOL - update as needed)
    estimatedUsd: balance !== null ? (balance * 150).toFixed(2) : '0.00',
  };
};

/**
 * Hook for fetching and managing token balances
 */
export const useSolanaTokenBalances = (
  options: UsesolanaBalanceOptions & { autoRefresh?: boolean } = {}
) => {
  const opts = { ...DEFAULT_OPTIONS, ...options, autoRefresh: options.autoRefresh ?? true };

  const [tokens, setTokens] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  const fetchTokens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let walletAddress = opts.walletAddress;

      if (!walletAddress) {
        walletAddress = phantomWalletService.getPublicKey() || undefined;
      }

      if (!walletAddress) {
        setTokens([]);
        if (isMountedRef.current) {
          setError(new Error('No wallet address available'));
        }
        return;
      }

      console.log(`🪙 Fetching tokens for: ${walletAddress.substring(0, 12)}...`);

      const tokenList = await solanaRpcService.getTokenBalances(walletAddress);

      if (isMountedRef.current) {
        setTokens(tokenList);
        setLastUpdated(new Date());
        setError(null);
        console.log(`✅ Found ${tokenList.length} tokens`);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch tokens');
      console.error('❌ Failed to fetch tokens:', error);

      if (isMountedRef.current) {
        setError(error);
        setTokens([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [opts.walletAddress]);

  const refetch = useCallback(async () => {
    console.log('🔄 Manually refreshing tokens...');
    await fetchTokens();
  }, [fetchTokens]);

  useEffect(() => {
    isMountedRef.current = true;

    if (opts.autoRefresh) {
      fetchTokens();

      intervalRef.current = setInterval(() => {
        console.log('⏱️ Token auto-refresh triggered');
        fetchTokens();
      }, opts.refreshInterval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [opts.autoRefresh, opts.refreshInterval, fetchTokens]);

  return {
    tokens,
    loading,
    error,
    lastUpdated,
    refetch,
    tokenCount: tokens.length,
  };
};
