/**
 * useArtistCoins Hook
 * ⏳ BACKLOGGED - Artist coins feature coming in Phase 2
 *
 * This module is disabled until the artist coins service is implemented.
 * For now, using stub implementations to prevent build errors.
 */

import { useState } from 'react';

// Type stubs
export interface ArtistCoin {
  id: string;
  symbol: string;
  name: string;
  price: number;
  market_cap: number;
  volume_24h: number;
  price_change_24h: number;
  holders: number;
  image: string;
  description?: string;
  website?: string;
  twitter?: string;
}

export interface LeaderboardEntry {
  rank: number;
  coin: ArtistCoin;
  score: number;
  change: number;
}

export interface UseArtistCoinsState {
  trendingCoins: ArtistCoin[];
  newCoins: ArtistCoin[];
  leaderboard: LeaderboardEntry[];
  loading: boolean;
  error: Error | null;
  selectedCoin: ArtistCoin | null;
  refreshing: boolean;
}

interface UseArtistCoinsOptions {
  autoFetch?: boolean;
  refreshInterval?: number;
  leaderboardSortBy?: 'volume' | 'market_cap' | 'holders' | 'price_change' | 'time';
  leaderboardTimeframe?: '24h' | '7d' | '30d' | 'all';
  coinsLimit?: number;
}

/**
 * Hook for fetching trending coins (DISABLED)
 */
export const useTrendingCoins = (limit: number = 20, autoFetch: boolean = true) => {
  const [coins] = useState<ArtistCoin[]>([]);
  const [loading] = useState(false);
  const [error] = useState<Error | null>(null);

  return {
    coins,
    loading,
    error,
    refetch: async () => console.warn('useTrendingCoins: Feature backlogged'),
  };
};

/**
 * Hook for new coins (DISABLED)
 */
export const useNewCoins = (limit: number = 20, autoFetch: boolean = true) => {
  const [coins] = useState<ArtistCoin[]>([]);
  const [loading] = useState(false);
  const [error] = useState<Error | null>(null);

  return {
    coins,
    loading,
    error,
    refetch: async () => console.warn('useNewCoins: Feature backlogged'),
  };
};

/**
 * Hook for leaderboard (DISABLED)
 */
export const useLeaderboard = (options: UseArtistCoinsOptions = {}) => {
  const [leaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading] = useState(false);
  const [error] = useState<Error | null>(null);

  return {
    leaderboard,
    loading,
    error,
    sortBy: options.leaderboardSortBy || 'volume',
    timeframe: options.leaderboardTimeframe || '24h',
    refetch: async () => console.warn('useLeaderboard: Feature backlogged'),
  };
};

/**
 * Main hook for artist coins (DISABLED)
 */
export const useArtistCoins = (options: UseArtistCoinsOptions = {}) => {
  const [state] = useState<UseArtistCoinsState>({
    trendingCoins: [],
    newCoins: [],
    leaderboard: [],
    loading: false,
    error: null,
    selectedCoin: null,
    refreshing: false,
  });

  return {
    ...state,
    selectCoin: (coin: ArtistCoin | null) => console.warn('selectCoin: Feature backlogged'),
    refresh: async () => console.warn('useArtistCoins.refresh: Feature backlogged'),
  };
};
