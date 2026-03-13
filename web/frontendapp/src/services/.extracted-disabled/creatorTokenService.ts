/**
 * Creator Token Service
 * Handles token creation, content linking, and eligibility management
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseService';
import { blockchainService } from './blockchainService';
import { UserTrack } from '../hooks/useMusicLibrary';

export interface TokenLinkedContent {
  id: string;
  token_id: string;
  content_id: string;
  content_type: 'track' | 'album' | 'playlist';
  revenue_share_percentage: number;
  created_at: string;
}

export interface CreatorToken {
  id: string;
  creator_id: string;
  name: string;
  symbol: string;
  description: string;
  total_supply: number;
  initial_price: number;
  current_price: number;
  market_cap: number;
  price_change_24h: number;
  launch_date: string;
  linked_content_count: number;
  is_active: boolean;
  blockchain_address?: string;
  metadata: {
    image_url?: string;
    banner_url?: string;
    social_links?: {
      twitter?: string;
      instagram?: string;
      website?: string;
    };
  };
}

export interface UserEligibility {
  user_id: string;
  follower_count: number;
  following_count: number;
  total_streams: number;
  total_content_created: number;
  account_age_days: number;
  is_eligible_for_token: boolean;
  days_until_eligible: number;
  eligibility_factors: {
    followers: boolean;
    content: boolean;
    account_age: boolean;
  };
}

export interface TokenCreationRequest {
  name: string;
  symbol: string;
  description: string;
  total_supply: number;
  initial_price: number;
  linked_content_ids: string[];
  metadata: CreatorToken['metadata'];
}

class CreatorTokenService {
  private readonly FOLLOWER_THRESHOLD = 1000;
  private readonly MIN_CONTENT_COUNT = 3;
  private readonly MIN_ACCOUNT_AGE_DAYS = 30;

  constructor() {
    console.log('🪙 Creator Token Service initialized');
  }

  // Eligibility Management
  async checkUserEligibility(userId: string): Promise<UserEligibility> {
    try {
      // Fetch user stats from various sources
      const [followerData, contentData, accountData] = await Promise.all([
        this.getUserSocialStats(userId),
        this.getUserContentStats(userId),
        this.getUserAccountAge(userId)
      ]);

      const followerCount = followerData.follower_count || 0;
      const contentCount = contentData.total_tracks || 0;
      const accountAgeDays = accountData.account_age_days || 0;

      const eligibilityFactors = {
        followers: followerCount >= this.FOLLOWER_THRESHOLD,
        content: contentCount >= this.MIN_CONTENT_COUNT,
        account_age: accountAgeDays >= this.MIN_ACCOUNT_AGE_DAYS
      };

      const isEligible = Object.values(eligibilityFactors).every(Boolean);

      // Calculate days until eligible (based on followers primarily)
      const daysUntilEligible = isEligible ? 0 : Math.max(
        Math.ceil((this.FOLLOWER_THRESHOLD - followerCount) / 10), // Assuming 10 followers per day growth
        this.MIN_ACCOUNT_AGE_DAYS - accountAgeDays,
        0
      );

      return {
        user_id: userId,
        follower_count: followerCount,
        following_count: followerData.following_count || 0,
        total_streams: contentData.total_streams || 0,
        total_content_created: contentCount,
        account_age_days: accountAgeDays,
        is_eligible_for_token: isEligible,
        days_until_eligible: daysUntilEligible,
        eligibility_factors: eligibilityFactors
      };
    } catch (error) {
      console.error('Error checking user eligibility:', error);
      throw error;
    }
  }

  private async getUserSocialStats(userId: string) {
    // Mock implementation - replace with real social stats
    return {
      follower_count: 750, // Example: not quite eligible
      following_count: 234
    };
  }

  private async getUserContentStats(userId: string) {
    try {
      // TODO: Implement when user_tracks table is available
      // Returning mock data for now to prevent errors
      return {
        total_tracks: 5,
        total_streams: 1250
      };
    } catch (error) {
      console.error('Error fetching user content stats:', error);
      return { total_tracks: 0, total_streams: 0 };
    }
  }

  private async getUserAccountAge(userId: string) {
    try {
      // Mock implementation - replace with real account creation date
      const mockCreationDate = new Date('2024-01-01');
      const now = new Date();
      const accountAgeDays = Math.floor((now.getTime() - mockCreationDate.getTime()) / (1000 * 60 * 60 * 24));

      return { account_age_days: accountAgeDays };
    } catch (error) {
      console.error('Error calculating account age:', error);
      return { account_age_days: 0 };
    }
  }

  // Token Creation
  async createCreatorToken(
    creatorId: string,
    tokenRequest: TokenCreationRequest
  ): Promise<CreatorToken> {
    try {
      // Check eligibility first
      const eligibility = await this.checkUserEligibility(creatorId);
      if (!eligibility.is_eligible_for_token) {
        throw new Error('User is not eligible to create tokens yet');
      }

      // Validate linked content exists and belongs to user
      await this.validateLinkedContent(creatorId, tokenRequest.linked_content_ids);

      // Create token on blockchain
      const blockchainAddress = await this.deployTokenContract(tokenRequest);

      // Store token in database
      const tokenData: CreatorToken = {
        id: this.generateTokenId(),
        creator_id: creatorId,
        name: tokenRequest.name,
        symbol: tokenRequest.symbol.toUpperCase(),
        description: tokenRequest.description,
        total_supply: tokenRequest.total_supply,
        initial_price: tokenRequest.initial_price,
        current_price: tokenRequest.initial_price,
        market_cap: tokenRequest.total_supply * tokenRequest.initial_price,
        price_change_24h: 0,
        launch_date: new Date().toISOString(),
        linked_content_count: tokenRequest.linked_content_ids.length,
        is_active: true,
        blockchain_address: blockchainAddress,
        metadata: tokenRequest.metadata
      };

      // Save to database (mock implementation)
      await this.saveTokenToDatabase(tokenData);

      // Link content to token
      await this.linkContentToToken(tokenData.id, tokenRequest.linked_content_ids);

      console.log(`✅ Creator token ${tokenRequest.symbol} created successfully`);
      return tokenData;
    } catch (error) {
      console.error('Error creating creator token:', error);
      throw error;
    }
  }

  private async validateLinkedContent(creatorId: string, contentIds: string[]): Promise<void> {
    try {
      // TODO: Implement when user_tracks table is available
      // For now, assuming all content IDs are valid to prevent errors
      console.log('Validating content IDs:', contentIds, 'for creator:', creatorId);
    } catch (error) {
      console.error('Error validating linked content:', error);
      throw error;
    }
  }

  private async deployTokenContract(tokenRequest: TokenCreationRequest): Promise<string> {
    // Mock blockchain deployment - replace with real smart contract deployment
    return `0x${Math.random().toString(16).slice(2, 42)}`;
  }

  private async saveTokenToDatabase(tokenData: CreatorToken): Promise<void> {
    // Mock implementation - replace with real database save
    const tokens = await this.getStoredTokens();
    tokens.push(tokenData);
    await AsyncStorage.setItem('creator_tokens', JSON.stringify(tokens));
  }

  private async linkContentToToken(tokenId: string, contentIds: string[]): Promise<void> {
    const linkedContent: TokenLinkedContent[] = contentIds.map(contentId => ({
      id: `link_${Date.now()}_${contentId}`,
      token_id: tokenId,
      content_id: contentId,
      content_type: 'track' as const,
      revenue_share_percentage: 100, // 100% of streaming revenue goes to token holders
      created_at: new Date().toISOString()
    }));

    // Mock implementation - replace with real database save
    const stored = await this.getStoredTokenLinks();
    stored.push(...linkedContent);
    await AsyncStorage.setItem('token_content_links', JSON.stringify(stored));
  }

  // Token Management
  async getUserTokens(userId: string): Promise<CreatorToken[]> {
    try {
      const tokens = await this.getStoredTokens();
      return tokens.filter(token => token.creator_id === userId);
    } catch (error) {
      console.error('Error fetching user tokens:', error);
      return [];
    }
  }

  async getTokenLinkedContent(tokenId: string): Promise<(TokenLinkedContent & { track?: UserTrack })[]> {
    try {
      const links = await this.getStoredTokenLinks();
      const tokenLinks = links.filter(link => link.token_id === tokenId);

      // Enrich with track data
      // TODO: Implement when user_tracks table is available
      // For now, returning links without enriched track data
      const enrichedLinks = tokenLinks.map(link => ({
        ...link,
        track: {
          id: link.content_id,
          title: 'Sample Track',
          play_count: 100,
          // Mock track data
        }
      }));

      return enrichedLinks;
    } catch (error) {
      console.error('Error fetching token linked content:', error);
      return [];
    }
  }

  async calculateTokenRevenue(tokenId: string, timeframe: 'day' | 'week' | 'month' = 'day'): Promise<{
    streaming_revenue: number;
    token_appreciation: number;
    total_revenue: number;
  }> {
    try {
      const linkedContent = await this.getTokenLinkedContent(tokenId);

      // Calculate streaming revenue from linked content
      let streamingRevenue = 0;
      for (const link of linkedContent) {
        if (link.track) {
          // Mock calculation - replace with real streaming revenue data
          const revenuePerPlay = 0.0015; // BZY per play
          streamingRevenue += link.track.play_count * revenuePerPlay * (link.revenue_share_percentage / 100);
        }
      }

      // Calculate token price appreciation (mock)
      const tokenAppreciation = Math.random() * 100; // Mock appreciation

      return {
        streaming_revenue: streamingRevenue,
        token_appreciation: tokenAppreciation,
        total_revenue: streamingRevenue + tokenAppreciation
      };
    } catch (error) {
      console.error('Error calculating token revenue:', error);
      return {
        streaming_revenue: 0,
        token_appreciation: 0,
        total_revenue: 0
      };
    }
  }

  // Utility Methods
  private generateTokenId(): string {
    return `token_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private async getStoredTokens(): Promise<CreatorToken[]> {
    try {
      const stored = await AsyncStorage.getItem('creator_tokens');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async getStoredTokenLinks(): Promise<TokenLinkedContent[]> {
    try {
      const stored = await AsyncStorage.getItem('token_content_links');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Investment Management
  async investInToken(userId: string, tokenId: string, amount: number): Promise<void> {
    try {
      // Mock implementation - would integrate with actual investment/trading system
      console.log(`💰 User ${userId} investing $${amount} in token ${tokenId}`);

      // Here you would:
      // 1. Validate user has sufficient funds
      // 2. Execute the purchase on blockchain/exchange
      // 3. Update user's token holdings
      // 4. Update token price based on demand
    } catch (error) {
      console.error('Error investing in token:', error);
      throw error;
    }
  }

  async getDiscoverableTokens(limit: number = 20): Promise<CreatorToken[]> {
    try {
      const allTokens = await this.getStoredTokens();
      return allTokens
        .filter(token => token.is_active)
        .sort((a, b) => b.price_change_24h - a.price_change_24h) // Sort by performance
        .slice(0, limit);
    } catch (error) {
      console.error('Error fetching discoverable tokens:', error);
      return [];
    }
  }
}

export const creatorTokenService = new CreatorTokenService();
export default creatorTokenService;