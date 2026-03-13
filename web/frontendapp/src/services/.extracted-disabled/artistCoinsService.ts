/**
 * Artist Coins Service
 * Integration with Audius artist coins, leaderboard, and trading data
 * Fetches trending coins, new coins, leaderboard rankings, and coin metadata
 */

import { audiusService } from './audiusService';

export interface ArtistCoin {
  id: string;
  name: string;
  symbol: string;
  artist_id: string;
  artist_name: string;
  artist_handle: string;
  artist_image_url?: string;
  created_at: string;
  market_cap: number;
  supply: number;
  price_usd: number;
  price_change_24h: number;
  trading_volume_24h: number;
  holders_count: number;
  rank: number;
  description?: string;
  logo_url?: string;
  solana_mint_address?: string;
}

export interface LeaderboardEntry extends ArtistCoin {
  metric_value: number; // Volume, holders, or other metric
  metric_type: 'volume' | 'market_cap' | 'holders' | 'price_change' | 'time';
}

export interface CoinTrade {
  coin_id: string;
  coin_symbol: string;
  artist_name: string;
  timestamp: number;
  type: 'buy' | 'sell';
  amount: number;
  price_usd: number;
  total_value: number;
}

class ArtistCoinsService {
  private baseUrl = 'https://api.audius.co/v1';
  private coinsCache: Map<string, ArtistCoin> = new Map();
  private leaderboardCache: LeaderboardEntry[] = [];
  private cacheExpiry = 5 * 60 * 1000; // 5 minutes
  private lastCacheFetch = 0;

  constructor() {
    console.log('🎵 Artist Coins Service initialized');
  }

  /**
   * Get trending artist coins (top by volume)
   */
  async getTrendingCoins(limit: number = 20): Promise<ArtistCoin[]> {
    try {
      console.log(`📈 Fetching trending coins (limit: ${limit})...`);

      // In production, this would call the Audius API
      // For now, we'll return mock data that matches the structure
      const mockCoins = await this.fetchMockTrendingCoins(limit);

      console.log(`✅ Retrieved ${mockCoins.length} trending coins`);
      return mockCoins;
    } catch (error) {
      console.error('❌ Failed to fetch trending coins:', error);
      return [];
    }
  }

  /**
   * Get newly launched artist coins
   */
  async getNewCoins(limit: number = 20, days: number = 7): Promise<ArtistCoin[]> {
    try {
      console.log(
        `🆕 Fetching new coins from last ${days} days (limit: ${limit})...`
      );

      // Production endpoint would be something like:
      // GET /v1/coins/new?limit=${limit}&days_since=${days}

      const newCoins = await this.fetchMockNewCoins(limit, days);

      console.log(`✅ Retrieved ${newCoins.length} new coins`);
      return newCoins;
    } catch (error) {
      console.error('❌ Failed to fetch new coins:', error);
      return [];
    }
  }

  /**
   * Get leaderboard data sorted by various metrics
   */
  async getLeaderboard(
    sortBy: 'volume' | 'market_cap' | 'holders' | 'price_change' | 'time' = 'volume',
    limit: number = 50,
    timeframe: '24h' | '7d' | '30d' | 'all' = '24h'
  ): Promise<LeaderboardEntry[]> {
    try {
      console.log(
        `🏆 Fetching ${sortBy} leaderboard (${timeframe}, limit: ${limit})...`
      );

      // Check cache
      if (
        this.leaderboardCache.length > 0 &&
        Date.now() - this.lastCacheFetch < this.cacheExpiry
      ) {
        console.log('📦 Using cached leaderboard');
        return this.leaderboardCache.slice(0, limit);
      }

      // Production endpoint:
      // GET /v1/coins/leaderboard?sort_by=${sortBy}&limit=${limit}&timeframe=${timeframe}

      const leaderboard = await this.fetchMockLeaderboard(
        sortBy,
        limit,
        timeframe
      );

      this.leaderboardCache = leaderboard;
      this.lastCacheFetch = Date.now();

      console.log(`✅ Retrieved ${leaderboard.length} leaderboard entries`);
      return leaderboard;
    } catch (error) {
      console.error('❌ Failed to fetch leaderboard:', error);
      return [];
    }
  }

  /**
   * Get detailed coin information
   */
  async getCoinDetails(coinId: string): Promise<ArtistCoin | null> {
    try {
      // Check cache first
      if (this.coinsCache.has(coinId)) {
        console.log('📦 Using cached coin data');
        return this.coinsCache.get(coinId)!;
      }

      // Production endpoint:
      // GET /v1/coins/${coinId}

      const coin = await this.fetchMockCoinDetails(coinId);

      if (coin) {
        this.coinsCache.set(coinId, coin);
      }

      console.log(`✅ Retrieved coin details for ${coinId}`);
      return coin;
    } catch (error) {
      console.error('❌ Failed to fetch coin details:', error);
      return null;
    }
  }

  /**
   * Get trading history for a specific coin
   */
  async getCoinTradingHistory(coinId: string, limit: number = 50): Promise<CoinTrade[]> {
    try {
      console.log(`📊 Fetching trading history for ${coinId}...`);

      // Production endpoint:
      // GET /v1/coins/${coinId}/trades?limit=${limit}

      const trades = await this.fetchMockTradingHistory(coinId, limit);

      console.log(`✅ Retrieved ${trades.length} trades for ${coinId}`);
      return trades;
    } catch (error) {
      console.error('❌ Failed to fetch trading history:', error);
      return [];
    }
  }

  // ============= MOCK DATA GENERATORS =============

  private async fetchMockTrendingCoins(limit: number): Promise<ArtistCoin[]> {
    return Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
      id: `coin_${i}`,
      name: `Artist ${i}`,
      symbol: `ART${i}`,
      artist_id: `artist_${i}`,
      artist_name: `Artist Name ${i}`,
      artist_handle: `artist${i}`,
      market_cap: Math.random() * 1000000,
      supply: Math.random() * 10000000,
      price_usd: Math.random() * 100,
      price_change_24h: Math.random() * 50 - 25,
      trading_volume_24h: Math.random() * 500000,
      holders_count: Math.floor(Math.random() * 10000),
      rank: i + 1,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
    }));
  }

  private async fetchMockNewCoins(limit: number, days: number): Promise<ArtistCoin[]> {
    return Array.from({ length: Math.min(limit, 20) }, (_, i) => ({
      id: `new_coin_${i}`,
      name: `New Artist ${i}`,
      symbol: `NEW${i}`,
      artist_id: `new_artist_${i}`,
      artist_name: `New Artist ${i}`,
      artist_handle: `newartist${i}`,
      market_cap: Math.random() * 500000,
      supply: Math.random() * 5000000,
      price_usd: Math.random() * 50,
      price_change_24h: Math.random() * 100 - 50,
      trading_volume_24h: Math.random() * 100000,
      holders_count: Math.floor(Math.random() * 1000),
      rank: Math.floor(Math.random() * 100),
      created_at: new Date(
        Date.now() - Math.random() * days * 24 * 60 * 60 * 1000
      ).toISOString(),
    }));
  }

  private async fetchMockLeaderboard(
    sortBy: string,
    limit: number,
    timeframe: string
  ): Promise<LeaderboardEntry[]> {
    return Array.from({ length: Math.min(limit, 50) }, (_, i) => ({
      id: `leaderboard_${i}`,
      name: `Leaderboard Artist ${i}`,
      symbol: `LEAD${i}`,
      artist_id: `lead_artist_${i}`,
      artist_name: `Leaderboard Artist ${i}`,
      artist_handle: `leadartist${i}`,
      market_cap: Math.random() * 2000000,
      supply: Math.random() * 20000000,
      price_usd: Math.random() * 200,
      price_change_24h: Math.random() * 50 - 25,
      trading_volume_24h: Math.random() * 1000000,
      holders_count: Math.floor(Math.random() * 50000),
      rank: i + 1,
      created_at: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString(),
      metric_value: Math.random() * 1000000,
      metric_type: (sortBy as any) || 'volume',
    }));
  }

  private async fetchMockCoinDetails(coinId: string): Promise<ArtistCoin | null> {
    return {
      id: coinId,
      name: `Artist from ${coinId}`,
      symbol: coinId.toUpperCase(),
      artist_id: `artist_${coinId}`,
      artist_name: `Artist Name ${coinId}`,
      artist_handle: `artist${coinId}`,
      market_cap: Math.random() * 5000000,
      supply: Math.random() * 100000000,
      price_usd: Math.random() * 500,
      price_change_24h: Math.random() * 100 - 50,
      trading_volume_24h: Math.random() * 5000000,
      holders_count: Math.floor(Math.random() * 100000),
      rank: Math.floor(Math.random() * 500),
      description: `Artist ${coinId} description`,
      created_at: new Date().toISOString(),
    };
  }

  private async fetchMockTradingHistory(
    coinId: string,
    limit: number
  ): Promise<CoinTrade[]> {
    return Array.from({ length: Math.min(limit, 50) }, (_, i) => ({
      coin_id: coinId,
      coin_symbol: coinId.toUpperCase(),
      artist_name: `Artist ${coinId}`,
      timestamp: Date.now() - i * 60000,
      type: Math.random() > 0.5 ? 'buy' : 'sell',
      amount: Math.random() * 1000,
      price_usd: Math.random() * 100,
      total_value: Math.random() * 100000,
    }));
  }
}

export const artistCoinsService = new ArtistCoinsService();
