/**
 * Profile Management Service
 * Handles user profiles, photo uploads, bio editing, social links, and content management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseService';
// Temporarily disabled to prevent app crashes
// import * as ImagePicker from 'expo-image-picker';
// Temporarily disabled to prevent app crashes
// import * as Sharing from 'expo-sharing';

export interface SocialLink {
  id: string;
  platform: 'twitter' | 'instagram' | 'tiktok' | 'youtube' | 'spotify' | 'website' | 'soundcloud';
  username: string;
  url: string;
  is_verified?: boolean;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  profile_image_url?: string;
  banner_image_url?: string;
  social_links: SocialLink[];
  content_count: number;
  total_streams: number;
  follower_count: number;
  following_count: number;
  verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ContentItem {
  id: string;
  title: string;
  type: 'track' | 'album' | 'playlist';
  play_count: number;
  like_count: number;
  share_count: number;
  created_at: string;
  cover_image_url?: string;
  duration?: number;
  is_promoted: boolean;
  promotion_tier?: 'basic' | 'premium' | 'viral';
}

export interface ProfileStats {
  total_uploads: number;
  total_streams: number;
  total_likes: number;
  total_shares: number;
  monthly_listeners: number;
  top_tracks: ContentItem[];
  recent_activity: string[];
}

export interface FeedCustomization {
  user_id: string;
  theme: 'default' | 'minimal' | 'artist' | 'creator';
  show_stats: boolean;
  featured_content_ids: string[];
  custom_sections: {
    id: string;
    title: string;
    content_ids: string[];
    order: number;
  }[];
}

export interface PromotionCampaign {
  id: string;
  content_id: string;
  content_title: string;
  investment_goal: number;
  current_investment: number;
  investor_count: number;
  roi_percentage: number;
  campaign_status: 'active' | 'completed' | 'paused';
  end_date: string;
  promotion_tier: 'basic' | 'premium' | 'viral';
}

class ProfileService {
  private readonly MAX_SOCIAL_LINKS = 3;
  private readonly MAX_BIO_LENGTH = 500;
  private readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  constructor() {
    console.log('👤 Profile Service initialized');
  }

  // Profile Management
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const cached = await this.getCachedData(`profile_${userId}`);
      if (cached) {
        return cached;
      }

      // Mock profile data - replace with actual database fetch
      const mockProfile: UserProfile = {
        id: `profile_${userId}`,
        user_id: userId,
        display_name: 'SoundMoney Artist',
        bio: 'Electronic music producer from LA. Creating the future of music on the blockchain. 🎵✨',
        profile_image_url: undefined,
        banner_image_url: undefined,
        social_links: [
          {
            id: 'social_1',
            platform: 'twitter',
            username: '@soundmoneyartist',
            url: 'https://twitter.com/soundmoneyartist'
          },
          {
            id: 'social_2',
            platform: 'instagram',
            username: '@soundmoneymusic',
            url: 'https://instagram.com/soundmoneymusic'
          }
        ],
        content_count: 12,
        total_streams: 125000,
        follower_count: 1850,
        following_count: 420,
        verified: false,
        created_at: new Date('2024-01-15').toISOString(),
        updated_at: new Date().toISOString()
      };

      await this.setCachedData(`profile_${userId}`, mockProfile);
      return mockProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  async updateProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const existingProfile = await this.getUserProfile(userId);
      if (!existingProfile) {
        throw new Error('Profile not found');
      }

      const updatedProfile: UserProfile = {
        ...existingProfile,
        ...updates,
        updated_at: new Date().toISOString()
      };

      // Save to storage
      await this.saveProfile(updatedProfile);

      // Clear cache
      await this.clearCachedData(`profile_${userId}`);

      console.log(`✅ Profile updated for user ${userId}`);
      return updatedProfile;
    } catch (error) {
      console.error('Error updating profile:', error);
      return null;
    }
  }

  // Photo Upload Management
  async uploadProfilePhoto(userId: string): Promise<string | null> {
    try {
      console.log('📸 Image picker temporarily disabled, using mock profile photo');

      // Mock implementation - return a placeholder URL
      const mockPhotoUrl = 'https://via.placeholder.com/150x150/007ACC/FFFFFF?text=Profile';

      // Update user profile
      await this.updateProfile(userId, {
        profile_image_url: mockPhotoUrl
      });

      console.log(`📸 Mock profile photo set for user ${userId}`);
      return mockPhotoUrl;
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      return null;
    }
  }

  async uploadBannerPhoto(userId: string): Promise<string | null> {
    try {
      console.log('📸 Image picker temporarily disabled, using mock banner photo');

      // Mock implementation - return a placeholder URL
      const mockBannerUrl = 'https://via.placeholder.com/640x360/007ACC/FFFFFF?text=Banner';

      await this.updateProfile(userId, {
        banner_image_url: mockBannerUrl
      });

      console.log(`🖼️ Mock banner photo set for user ${userId}`);
      return mockBannerUrl;
    } catch (error) {
      console.error('Error uploading banner photo:', error);
      return null;
    }
  }

  // Social Links Management
  async addSocialLink(userId: string, socialLink: Omit<SocialLink, 'id'>): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      if (profile.social_links.length >= this.MAX_SOCIAL_LINKS) {
        throw new Error(`Maximum ${this.MAX_SOCIAL_LINKS} social links allowed`);
      }

      const newLink: SocialLink = {
        ...socialLink,
        id: `social_${Date.now()}_${socialLink.platform}`,
      };

      const updatedLinks = [...profile.social_links, newLink];

      await this.updateProfile(userId, {
        social_links: updatedLinks
      });

      console.log(`🔗 Added social link: ${socialLink.platform} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error adding social link:', error);
      return false;
    }
  }

  async updateSocialLink(userId: string, linkId: string, updates: Partial<SocialLink>): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      const updatedLinks = profile.social_links.map(link =>
        link.id === linkId ? { ...link, ...updates } : link
      );

      await this.updateProfile(userId, {
        social_links: updatedLinks
      });

      console.log(`🔄 Updated social link ${linkId} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error updating social link:', error);
      return false;
    }
  }

  async removeSocialLink(userId: string, linkId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        throw new Error('Profile not found');
      }

      const updatedLinks = profile.social_links.filter(link => link.id !== linkId);

      await this.updateProfile(userId, {
        social_links: updatedLinks
      });

      console.log(`🗑️ Removed social link ${linkId} for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error removing social link:', error);
      return false;
    }
  }

  // Content and Stats
  async getProfileStats(userId: string): Promise<ProfileStats> {
    try {
      const cached = await this.getCachedData(`stats_${userId}`);
      if (cached) {
        return cached;
      }

      // Mock stats - replace with real data
      const stats: ProfileStats = {
        total_uploads: 15,
        total_streams: 125000,
        total_likes: 8500,
        total_shares: 1200,
        monthly_listeners: 12000,
        top_tracks: [
          {
            id: 'track_1',
            title: 'Midnight Vibes',
            type: 'track',
            play_count: 25000,
            like_count: 1800,
            share_count: 320,
            created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            is_promoted: true,
            promotion_tier: 'premium'
          },
          {
            id: 'track_2',
            title: 'Digital Dreams',
            type: 'track',
            play_count: 18000,
            like_count: 1200,
            share_count: 180,
            created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
            is_promoted: false
          }
        ],
        recent_activity: [
          'Released new track "Midnight Vibes"',
          'Gained 100 new followers',
          'Reached 125K total streams',
          'Featured on Electronic playlist'
        ]
      };

      await this.setCachedData(`stats_${userId}`, stats);
      return stats;
    } catch (error) {
      console.error('Error fetching profile stats:', error);
      return {
        total_uploads: 0,
        total_streams: 0,
        total_likes: 0,
        total_shares: 0,
        monthly_listeners: 0,
        top_tracks: [],
        recent_activity: []
      };
    }
  }

  // Token Promotion for Investment
  async getPromotionCampaigns(userId: string): Promise<PromotionCampaign[]> {
    try {
      // Mock promotion campaigns - replace with real data
      return [
        {
          id: 'campaign_1',
          content_id: 'track_1',
          content_title: 'Midnight Vibes',
          investment_goal: 50000,
          current_investment: 32000,
          investor_count: 24,
          roi_percentage: 15.5,
          campaign_status: 'active',
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          promotion_tier: 'premium'
        },
        {
          id: 'campaign_2',
          content_id: 'track_2',
          content_title: 'Digital Dreams',
          investment_goal: 25000,
          current_investment: 25000,
          investor_count: 18,
          roi_percentage: 22.3,
          campaign_status: 'completed',
          end_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          promotion_tier: 'basic'
        }
      ];
    } catch (error) {
      console.error('Error fetching promotion campaigns:', error);
      return [];
    }
  }

  async createPromotionCampaign(
    userId: string,
    contentId: string,
    investmentGoal: number,
    promotionTier: 'basic' | 'premium' | 'viral'
  ): Promise<PromotionCampaign | null> {
    try {
      const campaign: PromotionCampaign = {
        id: `campaign_${Date.now()}`,
        content_id: contentId,
        content_title: `Track ${contentId}`,
        investment_goal: investmentGoal,
        current_investment: 0,
        investor_count: 0,
        roi_percentage: 0,
        campaign_status: 'active',
        end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        promotion_tier: promotionTier
      };

      // Save campaign (mock implementation)
      console.log(`🚀 Created promotion campaign for content ${contentId}`);
      return campaign;
    } catch (error) {
      console.error('Error creating promotion campaign:', error);
      return null;
    }
  }

  // Content Sharing
  async shareProfile(userId: string): Promise<boolean> {
    try {
      const profile = await this.getUserProfile(userId);
      if (!profile) {
        return false;
      }

      const shareUrl = `https://soundmoney.app/profile/${userId}`;
      const shareMessage = `Check out ${profile.display_name} on SoundMoney! 🎵\n${shareUrl}`;

      // Mock sharing implementation
      console.log(`📤 Mock sharing profile for ${profile.display_name}`);
      console.log(`📱 Share message: ${shareMessage}`);
      return true;
    } catch (error) {
      console.error('Error sharing profile:', error);
      return false;
    }
  }

  async shareContent(contentId: string, contentTitle: string): Promise<boolean> {
    try {
      const shareUrl = `https://soundmoney.app/track/${contentId}`;
      const shareMessage = `🎵 Listen to "${contentTitle}" on SoundMoney!\n${shareUrl}`;

      // Mock sharing implementation
      console.log(`📤 Mock sharing content: ${contentTitle}`);
      console.log(`📱 Share message: ${shareMessage}`);
      return true;
    } catch (error) {
      console.error('Error sharing content:', error);
      return false;
    }
  }

  // Feed Customization
  async getFeedCustomization(userId: string): Promise<FeedCustomization> {
    try {
      const cached = await this.getCachedData(`feed_custom_${userId}`);
      if (cached) {
        return cached;
      }

      // Default customization
      const customization: FeedCustomization = {
        user_id: userId,
        theme: 'default',
        show_stats: true,
        featured_content_ids: [],
        custom_sections: []
      };

      await this.setCachedData(`feed_custom_${userId}`, customization);
      return customization;
    } catch (error) {
      console.error('Error fetching feed customization:', error);
      return {
        user_id: userId,
        theme: 'default',
        show_stats: true,
        featured_content_ids: [],
        custom_sections: []
      };
    }
  }

  async updateFeedCustomization(userId: string, customization: Partial<FeedCustomization>): Promise<boolean> {
    try {
      const existing = await this.getFeedCustomization(userId);
      const updated = { ...existing, ...customization };

      await this.setCachedData(`feed_custom_${userId}`, updated);
      console.log(`🎨 Updated feed customization for user ${userId}`);
      return true;
    } catch (error) {
      console.error('Error updating feed customization:', error);
      return false;
    }
  }

  // Private helper methods
  private async uploadImageToStorage(imageUri: string, type: 'profile' | 'banner'): Promise<string> {
    // Mock implementation - replace with actual cloud storage upload
    const mockUrl = `https://storage.soundmoney.app/${type}/${Date.now()}.jpg`;
    console.log(`📤 Uploading ${type} image: ${imageUri} -> ${mockUrl}`);
    return mockUrl;
  }

  private async saveProfile(profile: UserProfile): Promise<void> {
    try {
      const profiles = await this.getStoredProfiles();
      const existingIndex = profiles.findIndex(p => p.user_id === profile.user_id);

      if (existingIndex >= 0) {
        profiles[existingIndex] = profile;
      } else {
        profiles.push(profile);
      }

      await AsyncStorage.setItem('user_profiles', JSON.stringify(profiles));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  private async getStoredProfiles(): Promise<UserProfile[]> {
    try {
      const stored = await AsyncStorage.getItem('user_profiles');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      return [];
    }
  }

  private async getCachedData(key: string): Promise<any> {
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (!cached) return null;

      const { timestamp, data } = JSON.parse(cached);
      if (Date.now() - timestamp > this.CACHE_DURATION) {
        await AsyncStorage.removeItem(`cache_${key}`);
        return null;
      }

      return data;
    } catch (error) {
      return null;
    }
  }

  private async setCachedData(key: string, data: any): Promise<void> {
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify({
        timestamp: Date.now(),
        data
      }));
    } catch (error) {
      console.error('Error caching data:', error);
    }
  }

  private async clearCachedData(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Error clearing cached data:', error);
    }
  }
}

export const profileService = new ProfileService();