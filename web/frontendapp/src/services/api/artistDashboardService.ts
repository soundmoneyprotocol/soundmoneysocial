/**
 * Artist Dashboard Service
 * Provides data and operations for the artist dashboard at app.soundmoneyprotocol.xyz
 * Used for metrics, earnings, streaming stats, copyright management, and more
 */

import { SoundMoneyApiClient, ApiResponse } from './apiClient';

export interface StreamingMetrics {
  totalStreams: number;
  totalEarnings: number;
  averageEarningsPerStream: number;
  topTracks: Array<{
    id: string;
    title: string;
    streams: number;
    earnings: number;
  }>;
  chartData: Array<{
    date: string;
    streams: number;
    earnings: number;
  }>;
}

export interface CopyrightReport {
  id: string;
  platform: string;
  violationType: string;
  confidenceScore: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'claimed';
  rewardAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DeFiPosition {
  poolId: string;
  poolName: string;
  depositAmount: number;
  currentValue: number;
  dailyYield: number;
  apy: number;
  claimableRewards: number;
  status: 'active' | 'pending' | 'withdrawn';
}

export interface UserProfile {
  id: string;
  username: string;
  displayName: string;
  email: string;
  bio?: string;
  avatar?: string;
  walletAddress?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
  };
  subscriptionTier: 'free' | 'artist' | 'label' | 'enterprise';
  isVerified: boolean;
  followerCount: number;
  followingCount: number;
}

export interface DashboardAnalytics {
  timeframe: '24h' | '7d' | '30d' | '90d';
  totalRevenue: number;
  streamingRevenue: number;
  copyrightRevenue: number;
  defiYield: number;
  growthRate: number;
  newFollowers: number;
  engagementRate: number;
  topMarkets: Array<{
    country: string;
    streams: number;
    percentage: number;
  }>;
}

export interface NotificationPreferences {
  emailOnNewStream: boolean;
  emailOnCopyrightMatch: boolean;
  emailOnRewardClaim: boolean;
  emailOnNewFollower: boolean;
  emailWeeklySummary: boolean;
  emailMonthlySummary: boolean;
  pushNotificationsEnabled: boolean;
}

/**
 * Artist Dashboard Service
 */
export class ArtistDashboardService {
  private static instance: ArtistDashboardService;
  private api: SoundMoneyApiClient;

  private constructor(api: SoundMoneyApiClient) {
    this.api = api;
  }

  static initialize(api: SoundMoneyApiClient): ArtistDashboardService {
    if (!ArtistDashboardService.instance) {
      ArtistDashboardService.instance = new ArtistDashboardService(api);
    }
    return ArtistDashboardService.instance;
  }

  static getInstance(): ArtistDashboardService {
    if (!ArtistDashboardService.instance) {
      throw new Error('ArtistDashboardService not initialized. Call initialize() first.');
    }
    return ArtistDashboardService.instance;
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<ApiResponse<UserProfile>> {
    return this.api.get<UserProfile>('/dashboard/profile');
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<ApiResponse<UserProfile>> {
    return this.api.patch<UserProfile>('/dashboard/profile', updates);
  }

  /**
   * Get streaming metrics
   */
  async getStreamingMetrics(
    timeframe: '24h' | '7d' | '30d' | '90d' = '30d'
  ): Promise<ApiResponse<StreamingMetrics>> {
    return this.api.get<StreamingMetrics>('/dashboard/streaming-metrics', {
      params: { timeframe },
    });
  }

  /**
   * Get dashboard analytics overview
   */
  async getDashboardAnalytics(
    timeframe: '24h' | '7d' | '30d' | '90d' = '30d'
  ): Promise<ApiResponse<DashboardAnalytics>> {
    return this.api.get<DashboardAnalytics>('/dashboard/analytics', {
      params: { timeframe },
    });
  }

  /**
   * Get copyright reports
   */
  async getCopyrightReports(status?: string): Promise<ApiResponse<CopyrightReport[]>> {
    return this.api.get<CopyrightReport[]>('/dashboard/copyright-reports', {
      params: { status },
    });
  }

  /**
   * Submit copyright claim
   */
  async submitCopyrightClaim(data: {
    trackId: string;
    platform: string;
    url: string;
    violationType: 'unauthorized_use' | 'monetization' | 'redistribution' | 'sampling';
    description?: string;
    evidenceUrls?: string[];
  }): Promise<ApiResponse<CopyrightReport>> {
    return this.api.post<CopyrightReport>('/dashboard/copyright-claims', data);
  }

  /**
   * Claim copyright rewards
   */
  async claimCopyrightRewards(reportId: string): Promise<ApiResponse<{ transactionSignature: string; amount: number }>> {
    return this.api.post(`/dashboard/copyright-reports/${reportId}/claim-rewards`);
  }

  /**
   * Get DeFi positions
   */
  async getDefiPositions(): Promise<ApiResponse<DeFiPosition[]>> {
    return this.api.get<DeFiPosition[]>('/dashboard/defi-positions');
  }

  /**
   * Deposit to DeFi pool
   */
  async depositToPool(data: {
    poolId: string;
    amount: number;
  }): Promise<ApiResponse<DeFiPosition>> {
    return this.api.post<DeFiPosition>('/dashboard/defi-positions', data);
  }

  /**
   * Withdraw from DeFi pool
   */
  async withdrawFromPool(positionId: string, amount: number): Promise<ApiResponse<DeFiPosition>> {
    return this.api.post<DeFiPosition>(`/dashboard/defi-positions/${positionId}/withdraw`, {
      amount,
    });
  }

  /**
   * Claim DeFi rewards
   */
  async claimDefiRewards(positionId: string): Promise<ApiResponse<{ transactionSignature: string; amount: number }>> {
    return this.api.post(`/dashboard/defi-positions/${positionId}/claim-rewards`);
  }

  /**
   * Get streaming sessions
   */
  async getStreamingSessions(limit: number = 50, offset: number = 0): Promise<ApiResponse<any[]>> {
    return this.api.get('/dashboard/streaming-sessions', {
      params: { limit, offset },
    });
  }

  /**
   * Get top tracks
   */
  async getTopTracks(limit: number = 10): Promise<ApiResponse<any[]>> {
    return this.api.get('/dashboard/top-tracks', {
      params: { limit },
    });
  }

  /**
   * Get notifications
   */
  async getNotifications(limit: number = 50): Promise<ApiResponse<any[]>> {
    return this.api.get('/dashboard/notifications', {
      params: { limit },
    });
  }

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<ApiResponse<void>> {
    return this.api.post(`/dashboard/notifications/${notificationId}/read`);
  }

  /**
   * Get notification preferences
   */
  async getNotificationPreferences(): Promise<ApiResponse<NotificationPreferences>> {
    return this.api.get<NotificationPreferences>('/dashboard/notification-preferences');
  }

  /**
   * Update notification preferences
   */
  async updateNotificationPreferences(
    preferences: Partial<NotificationPreferences>
  ): Promise<ApiResponse<NotificationPreferences>> {
    return this.api.patch<NotificationPreferences>('/dashboard/notification-preferences', preferences);
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(
    type?: 'all' | 'streaming' | 'copyright' | 'defi' | 'subscription',
    limit: number = 50
  ): Promise<ApiResponse<any[]>> {
    return this.api.get('/dashboard/transactions', {
      params: { type, limit },
    });
  }

  /**
   * Export data (CSV/PDF)
   */
  async exportData(format: 'csv' | 'pdf', dataType: 'all' | 'streaming' | 'copyright' | 'financial'): Promise<Blob> {
    const response = await fetch(
      `${this.api.getBaseURL()}/dashboard/export?format=${format}&dataType=${dataType}`,
      {
        headers: {
          Authorization: `Bearer ${this.api.getAuthToken() || ''}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Export failed: ${response.statusText}`);
    }

    return response.blob();
  }

  /**
   * Get dashboard summary
   */
  async getDashboardSummary(): Promise<
    ApiResponse<{
      profile: UserProfile;
      analytics: DashboardAnalytics;
      streaming: StreamingMetrics;
      pendingClaims: number;
      unreadNotifications: number;
    }>
  > {
    return this.api.get('/dashboard/summary');
  }
}

export default ArtistDashboardService;
