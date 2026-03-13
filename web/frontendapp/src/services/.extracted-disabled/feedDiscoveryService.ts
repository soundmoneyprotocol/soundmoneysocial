/**
 * Feed Discovery & Algorithmic Promotion Service
 * Smart feed curation with BEZY Boost monetization for track promotion
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseService';

export interface Track {
  id: string;
  title: string;
  artist_id: string;
  artist_name: string;
  artist_follower_count: number;
  duration: number;
  file_url: string;
  cover_image_url?: string;
  genre: string;
  created_at: string;
  play_count: number;
  like_count: number;
  share_count: number;
  comment_count: number;

  // Promotion data
  boost_active: boolean;
  boost_tier: 'basic' | 'premium' | 'viral' | null;
  boost_expires_at?: string;
  promotion_score: number;

  // Algorithm metrics
  engagement_rate: number;
  velocity_score: number; // Recent engagement vs historical
  discovery_potential: number; // Algorithm prediction for virality
  trending_score: number;
}

export interface FeedFilter {
  type: 'curated' | 'all_uploads' | 'trending' | 'new' | 'boosted';
  genre?: string;
  artist_tier?: 'emerging' | 'established' | 'verified';
  time_range?: 'hour' | 'day' | 'week' | 'month';
  min_quality_score?: number;
}

export interface BoostTier {
  id: string;
  name: string;
  price_bezy: number;
  duration_hours: number;
  promotion_multiplier: number;
  guaranteed_impressions: number;
  features: {
    priority_placement: boolean;
    cross_genre_promotion: boolean;
    trending_boost: boolean;
    email_notifications: boolean;
    analytics_dashboard: boolean;
  };
}

export interface AlgorithmWeights {
  recency: number;
  engagement: number;
  artist_follower_count: number;
  track_quality: number;
  user_interaction_history: number;
  boost_multiplier: number;
  discovery_potential: number;
}

export interface UserFeedPreferences {
  user_id: string;
  preferred_genres: string[];
  discovery_tolerance: number; // 0-1, how much new vs familiar content
  boost_content_tolerance: number; // 0-1, how much promoted content to show
  algorithm_weights: AlgorithmWeights;
  blocked_artists: string[];
  followed_artists: string[];
}

export interface FeedAnalytics {
  track_id: string;
  impressions: number;
  clicks: number;
  plays: number;
  likes: number;
  shares: number;
  skip_rate: number;
  completion_rate: number;
  boost_contribution: number; // % of metrics from boost vs organic
  revenue_generated: number; // From streams/tips/token purchases
}

class FeedDiscoveryService {
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private readonly BOOST_TIERS: BoostTier[] = [
    {
      id: 'basic',
      name: 'Basic Boost',
      price_bezy: 10,
      duration_hours: 24,
      promotion_multiplier: 2.0,
      guaranteed_impressions: 1000,
      features: {
        priority_placement: true,
        cross_genre_promotion: false,
        trending_boost: false,
        email_notifications: false,
        analytics_dashboard: false,
      }
    },
    {
      id: 'premium',
      name: 'Premium Boost',
      price_bezy: 25,
      duration_hours: 72,
      promotion_multiplier: 4.0,
      guaranteed_impressions: 5000,
      features: {
        priority_placement: true,
        cross_genre_promotion: true,
        trending_boost: true,
        email_notifications: true,
        analytics_dashboard: true,
      }
    },
    {
      id: 'viral',
      name: 'Viral Boost',
      price_bezy: 50,
      duration_hours: 168, // 1 week
      promotion_multiplier: 8.0,
      guaranteed_impressions: 15000,
      features: {
        priority_placement: true,
        cross_genre_promotion: true,
        trending_boost: true,
        email_notifications: true,
        analytics_dashboard: true,
      }
    }
  ];

  private readonly DEFAULT_ALGORITHM_WEIGHTS: AlgorithmWeights = {
    recency: 0.15,
    engagement: 0.25,
    artist_follower_count: 0.10,
    track_quality: 0.20,
    user_interaction_history: 0.15,
    boost_multiplier: 0.10,
    discovery_potential: 0.05
  };

  async getFeed(
    userId: string,
    filter: FeedFilter,
    limit: number = 50,
    offset: number = 0
  ): Promise<Track[]> {
    try {
      const preferences = await this.getUserFeedPreferences(userId);
      const tracks = await this.fetchTracksBasedOnFilter(filter, limit + offset * 2); // Fetch more for better algorithm results

      const scoredTracks = await this.scoreTracksForUser(tracks, userId, preferences);
      const rankedTracks = this.applyAlgorithmicRanking(scoredTracks, preferences.algorithm_weights);

      // Apply boost placement logic
      const finalFeed = this.integratePromotedContent(rankedTracks, preferences.boost_content_tolerance);

      return finalFeed.slice(offset, offset + limit);
    } catch (error) {
      console.error('Error fetching feed:', error);
      return this.getFallbackFeed();
    }
  }

  private async fetchTracksBasedOnFilter(filter: FeedFilter, limit: number): Promise<Track[]> {
    // TODO: Replace with actual database queries when tables are available
    // For now, returning comprehensive mock data

    const mockTracks: Track[] = [
      {
        id: '1',
        title: 'Midnight Dreams',
        artist_id: 'artist_1',
        artist_name: 'Luna Eclipse',
        artist_follower_count: 850, // Below 1000 threshold
        duration: 210,
        file_url: 'https://example.com/track1.mp3',
        cover_image_url: 'https://example.com/cover1.jpg',
        genre: 'Electronic',
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        play_count: 45,
        like_count: 12,
        share_count: 3,
        comment_count: 8,
        boost_active: true,
        boost_tier: 'premium',
        boost_expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        promotion_score: 0.85,
        engagement_rate: 0.27,
        velocity_score: 0.92, // High recent engagement
        discovery_potential: 0.78,
        trending_score: 0.65
      },
      {
        id: '2',
        title: 'Sunrise Vibes',
        artist_id: 'artist_2',
        artist_name: 'Solar Phoenix',
        artist_follower_count: 1250, // Above threshold
        duration: 185,
        file_url: 'https://example.com/track2.mp3',
        genre: 'Indie Pop',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        play_count: 234,
        like_count: 67,
        share_count: 15,
        comment_count: 23,
        boost_active: false,
        boost_tier: null,
        promotion_score: 0.42,
        engagement_rate: 0.29,
        velocity_score: 0.55,
        discovery_potential: 0.34,
        trending_score: 0.78
      },
      {
        id: '3',
        title: 'Neon Nights',
        artist_id: 'artist_3',
        artist_name: 'Cyber Pulse',
        artist_follower_count: 320, // Well below threshold - needs boost
        duration: 195,
        file_url: 'https://example.com/track3.mp3',
        genre: 'Synthwave',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        play_count: 12,
        like_count: 4,
        share_count: 1,
        comment_count: 2,
        boost_active: true,
        boost_tier: 'basic',
        boost_expires_at: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
        promotion_score: 0.72,
        engagement_rate: 0.33,
        velocity_score: 0.88,
        discovery_potential: 0.91, // High potential despite low followers
        trending_score: 0.12
      }
    ];

    // Filter based on type
    switch (filter.type) {
      case 'boosted':
        return mockTracks.filter(track => track.boost_active);
      case 'trending':
        return mockTracks.sort((a, b) => b.trending_score - a.trending_score);
      case 'new':
        return mockTracks.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default:
        return mockTracks;
    }
  }

  private async scoreTracksForUser(tracks: Track[], userId: string, preferences: UserFeedPreferences): Promise<Track[]> {
    // Apply user-specific scoring based on interaction history and preferences
    return tracks.map(track => {
      let baseScore = 0.5;

      // Genre preference boost
      if (preferences.preferred_genres.includes(track.genre)) {
        baseScore += 0.2;
      }

      // Discovery tolerance - new artists vs familiar ones
      const isNewArtist = !preferences.followed_artists.includes(track.artist_id);
      if (isNewArtist) {
        baseScore += preferences.discovery_tolerance * 0.3;
      } else {
        baseScore += (1 - preferences.discovery_tolerance) * 0.2;
      }

      // Quality bonus for high engagement
      if (track.engagement_rate > 0.25) {
        baseScore += 0.15;
      }

      return { ...track, promotion_score: Math.min(1.0, baseScore) };
    });
  }

  private applyAlgorithmicRanking(tracks: Track[], weights: AlgorithmWeights): Track[] {
    return tracks.map(track => {
      const recencyScore = this.calculateRecencyScore(track.created_at);
      const followerScore = Math.min(1.0, track.artist_follower_count / 10000); // Normalize to 10k followers
      const qualityScore = track.engagement_rate;

      const algorithmScore =
        recencyScore * weights.recency +
        track.engagement_rate * weights.engagement +
        followerScore * weights.artist_follower_count +
        qualityScore * weights.track_quality +
        track.discovery_potential * weights.discovery_potential +
        (track.boost_active ? track.promotion_score * weights.boost_multiplier : 0);

      return { ...track, trending_score: algorithmScore };
    }).sort((a, b) => b.trending_score - a.trending_score);
  }

  private calculateRecencyScore(createdAt: string): number {
    const hoursAgo = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);

    if (hoursAgo < 1) return 1.0;
    if (hoursAgo < 6) return 0.9;
    if (hoursAgo < 24) return 0.7;
    if (hoursAgo < 168) return 0.4; // 1 week
    return 0.1;
  }

  private integratePromotedContent(tracks: Track[], boostTolerance: number): Track[] {
    const promoted = tracks.filter(track => track.boost_active);
    const organic = tracks.filter(track => !track.boost_active);

    // Calculate how many promoted tracks to include
    const maxPromoted = Math.floor(tracks.length * boostTolerance);
    const selectedPromoted = promoted.slice(0, maxPromoted);

    // Merge organically, inserting promoted content at strategic positions
    const result = [];
    let promotedIndex = 0;

    for (let i = 0; i < organic.length; i++) {
      result.push(organic[i]);

      // Insert promoted content every 5-7 tracks
      if (promotedIndex < selectedPromoted.length && (i + 1) % 6 === 0) {
        result.push(selectedPromoted[promotedIndex]);
        promotedIndex++;
      }
    }

    return result;
  }

  private async getUserFeedPreferences(userId: string): Promise<UserFeedPreferences> {
    try {
      const cached = await AsyncStorage.getItem(`feed_preferences_${userId}`);
      if (cached) {
        const preferences = JSON.parse(cached);
        if (Date.now() - preferences.timestamp < this.CACHE_DURATION) {
          return preferences.data;
        }
      }
    } catch (error) {
      console.error('Error loading cached preferences:', error);
    }

    // Return default preferences - in production, fetch from database
    const defaultPreferences: UserFeedPreferences = {
      user_id: userId,
      preferred_genres: ['Electronic', 'Indie Pop'],
      discovery_tolerance: 0.7,
      boost_content_tolerance: 0.3,
      algorithm_weights: this.DEFAULT_ALGORITHM_WEIGHTS,
      blocked_artists: [],
      followed_artists: []
    };

    // Cache preferences
    try {
      await AsyncStorage.setItem(`feed_preferences_${userId}`, JSON.stringify({
        timestamp: Date.now(),
        data: defaultPreferences
      }));
    } catch (error) {
      console.error('Error caching preferences:', error);
    }

    return defaultPreferences;
  }

  private getFallbackFeed(): Track[] {
    return [
      {
        id: 'fallback_1',
        title: 'Popular Track',
        artist_id: 'fallback_artist',
        artist_name: 'SoundMoney Artist',
        artist_follower_count: 5000,
        duration: 180,
        file_url: '',
        genre: 'Pop',
        created_at: new Date().toISOString(),
        play_count: 1000,
        like_count: 150,
        share_count: 30,
        comment_count: 45,
        boost_active: false,
        boost_tier: null,
        promotion_score: 0.5,
        engagement_rate: 0.15,
        velocity_score: 0.3,
        discovery_potential: 0.2,
        trending_score: 0.4
      }
    ];
  }

  // BEZY Boost Purchase System
  async purchaseBoost(trackId: string, userId: string, boostTierId: string): Promise<{
    success: boolean;
    boost?: any;
    error?: string;
  }> {
    try {
      const tier = this.BOOST_TIERS.find(t => t.id === boostTierId);
      if (!tier) {
        return { success: false, error: 'Invalid boost tier' };
      }

      // TODO: Verify user has enough BEZY tokens
      // TODO: Process payment transaction

      const boost = {
        id: `boost_${Date.now()}`,
        track_id: trackId,
        user_id: userId,
        tier_id: boostTierId,
        tier_details: tier,
        started_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + tier.duration_hours * 60 * 60 * 1000).toISOString(),
        impressions_guaranteed: tier.guaranteed_impressions,
        impressions_delivered: 0,
        cost_bezy: tier.price_bezy,
        status: 'active'
      };

      // TODO: Store in database
      console.log('Boost purchased:', boost);

      return { success: true, boost };
    } catch (error) {
      console.error('Error purchasing boost:', error);
      return { success: false, error: 'Failed to purchase boost' };
    }
  }

  getBoostTiers(): BoostTier[] {
    return this.BOOST_TIERS;
  }

  async getBoostAnalytics(trackId: string): Promise<FeedAnalytics | null> {
    // TODO: Implement real analytics when database is available
    return {
      track_id: trackId,
      impressions: 2500,
      clicks: 180,
      plays: 145,
      likes: 23,
      shares: 8,
      skip_rate: 0.15,
      completion_rate: 0.78,
      boost_contribution: 0.65, // 65% of metrics from boost
      revenue_generated: 12.50
    };
  }

  // Algorithm to help artists reach 1000 followers
  async getPromotion1000Strategy(artistId: string): Promise<{
    current_followers: number;
    target_followers: number;
    estimated_reach_date: string;
    recommended_actions: string[];
    suggested_boost_tier: string;
    potential_roi: number;
  }> {
    // TODO: Fetch real artist data
    const currentFollowers = 320;
    const targetFollowers = 1000;
    const followersNeeded = targetFollowers - currentFollowers;

    // Algorithm to calculate optimal promotion strategy
    const dailyOrganicGrowth = 2; // followers per day without boost
    const boostMultiplier = 8; // from viral boost tier
    const daysToReach = Math.ceil(followersNeeded / (dailyOrganicGrowth * boostMultiplier));

    const estimatedDate = new Date(Date.now() + daysToReach * 24 * 60 * 60 * 1000);

    return {
      current_followers: currentFollowers,
      target_followers: targetFollowers,
      estimated_reach_date: estimatedDate.toISOString(),
      recommended_actions: [
        'Upload 2-3 tracks per week for consistent content',
        'Engage with comments within 2 hours of posting',
        'Use trending hashtags in your genre',
        'Collaborate with artists who have 800-1200 followers',
        'Purchase Viral Boost for your best performing track'
      ],
      suggested_boost_tier: 'viral',
      potential_roi: 2.4 // Expected return on investment
    };
  }
}

export const feedDiscoveryService = new FeedDiscoveryService();