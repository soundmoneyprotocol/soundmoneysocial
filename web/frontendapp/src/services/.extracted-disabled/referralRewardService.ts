/**
 * Referral Reward Service
 * Manages user referrals and 100 BEZY bonus distribution system
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseService';

export interface ReferralCode {
  id: string;
  user_id: string;
  code: string;
  created_at: string;
  is_active: boolean;
  total_referrals: number;
  total_rewards_earned: number;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  referral_code: string;
  referrer_reward: number;
  referred_reward: number;
  status: 'pending' | 'completed' | 'expired';
  created_at: string;
  completed_at?: string;
}

export interface ReferralStats {
  total_referrals: number;
  total_rewards_earned: number;
  pending_rewards: number;
  active_referral_code: string;
  referrals: Referral[];
}

export interface ReferralReward {
  amount: number;
  type: 'referrer' | 'referred';
  referral_id: string;
  user_id: string;
  status: 'pending' | 'distributed';
}

class ReferralRewardService {
  private readonly BEZY_REWARD_AMOUNT = 100;
  private readonly REFERRAL_CODE_LENGTH = 8;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  constructor() {
    console.log('🎁 Referral Reward Service initialized');
  }

  // Generate unique referral code for user
  async generateReferralCode(userId: string): Promise<ReferralCode> {
    try {
      // Check if user already has an active referral code
      const existingCode = await this.getUserReferralCode(userId);
      if (existingCode) {
        return existingCode;
      }

      // Generate unique code
      const code = this.generateUniqueCode();

      const referralCode: ReferralCode = {
        id: `ref_${Date.now()}_${userId.slice(-6)}`,
        user_id: userId,
        code: code,
        created_at: new Date().toISOString(),
        is_active: true,
        total_referrals: 0,
        total_rewards_earned: 0
      };

      // Save to storage (mock implementation)
      await this.saveReferralCode(referralCode);

      console.log(`✅ Generated referral code ${code} for user ${userId}`);
      return referralCode;
    } catch (error) {
      console.error('Error generating referral code:', error);
      throw error;
    }
  }

  // Process referral when user signs up with code
  async processReferralSignup(
    referralCode: string,
    newUserId: string
  ): Promise<{ success: boolean; referral?: Referral; error?: string }> {
    try {
      // Find referrer by code
      const referrerCode = await this.getReferralCodeByCode(referralCode);
      if (!referrerCode) {
        return { success: false, error: 'Invalid referral code' };
      }

      // Check if user is trying to refer themselves
      if (referrerCode.user_id === newUserId) {
        return { success: false, error: 'Cannot refer yourself' };
      }

      // Create referral record
      const referral: Referral = {
        id: `referral_${Date.now()}_${newUserId.slice(-6)}`,
        referrer_id: referrerCode.user_id,
        referred_user_id: newUserId,
        referral_code: referralCode,
        referrer_reward: this.BEZY_REWARD_AMOUNT,
        referred_reward: this.BEZY_REWARD_AMOUNT,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      // Save referral
      await this.saveReferral(referral);

      // Mark referral as completed immediately (in production, might have conditions)
      await this.completeReferral(referral.id);

      console.log(`🎉 Referral processed: ${referrerCode.user_id} referred ${newUserId}`);
      return { success: true, referral };
    } catch (error) {
      console.error('Error processing referral signup:', error);
      return { success: false, error: 'Failed to process referral' };
    }
  }

  // Complete referral and distribute rewards
  async completeReferral(referralId: string): Promise<void> {
    try {
      const referral = await this.getReferral(referralId);
      if (!referral || referral.status === 'completed') {
        return;
      }

      // Distribute BEZY rewards to both users
      await Promise.all([
        this.distributeBEZYReward(referral.referrer_id, this.BEZY_REWARD_AMOUNT, 'referrer'),
        this.distributeBEZYReward(referral.referred_user_id, this.BEZY_REWARD_AMOUNT, 'referred')
      ]);

      // Update referral status
      const updatedReferral = {
        ...referral,
        status: 'completed' as const,
        completed_at: new Date().toISOString()
      };

      await this.saveReferral(updatedReferral);

      // Update referrer's stats
      await this.updateReferrerStats(referral.referrer_id);

      console.log(`💰 Referral completed: ${this.BEZY_REWARD_AMOUNT} BEZY distributed to both users`);
    } catch (error) {
      console.error('Error completing referral:', error);
    }
  }

  // Get referral statistics for user
  async getReferralStats(userId: string): Promise<ReferralStats> {
    try {
      const cached = await this.getCachedData(`referral_stats_${userId}`);
      if (cached) {
        return cached;
      }

      const referralCode = await this.getUserReferralCode(userId);
      const referrals = await this.getUserReferrals(userId);

      const stats: ReferralStats = {
        total_referrals: referrals.filter(r => r.status === 'completed').length,
        total_rewards_earned: referrals.filter(r => r.status === 'completed').length * this.BEZY_REWARD_AMOUNT,
        pending_rewards: referrals.filter(r => r.status === 'pending').length * this.BEZY_REWARD_AMOUNT,
        active_referral_code: referralCode?.code || '',
        referrals: referrals
      };

      // Cache for 10 minutes
      await this.setCachedData(`referral_stats_${userId}`, stats);

      return stats;
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      return {
        total_referrals: 0,
        total_rewards_earned: 0,
        pending_rewards: 0,
        active_referral_code: '',
        referrals: []
      };
    }
  }

  // Generate shareable referral link
  generateReferralLink(referralCode: string): string {
    const baseUrl = 'https://soundmoney.app'; // Replace with actual app URL
    return `${baseUrl}/signup?ref=${referralCode}`;
  }

  // Validate referral code format
  validateReferralCode(code: string): boolean {
    return /^[A-Z0-9]{8}$/.test(code);
  }

  // Private helper methods
  private generateUniqueCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < this.REFERRAL_CODE_LENGTH; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  private async getUserReferralCode(userId: string): Promise<ReferralCode | null> {
    try {
      const codes = await this.getStoredReferralCodes();
      return codes.find(code => code.user_id === userId && code.is_active) || null;
    } catch (error) {
      console.error('Error getting user referral code:', error);
      return null;
    }
  }

  private async getReferralCodeByCode(code: string): Promise<ReferralCode | null> {
    try {
      const codes = await this.getStoredReferralCodes();
      return codes.find(c => c.code === code && c.is_active) || null;
    } catch (error) {
      console.error('Error getting referral code:', error);
      return null;
    }
  }

  private async getUserReferrals(userId: string): Promise<Referral[]> {
    try {
      const referrals = await this.getStoredReferrals();
      return referrals.filter(r => r.referrer_id === userId);
    } catch (error) {
      console.error('Error getting user referrals:', error);
      return [];
    }
  }

  private async getReferral(referralId: string): Promise<Referral | null> {
    try {
      const referrals = await this.getStoredReferrals();
      return referrals.find(r => r.id === referralId) || null;
    } catch (error) {
      console.error('Error getting referral:', error);
      return null;
    }
  }

  private async distributeBEZYReward(userId: string, amount: number, type: 'referrer' | 'referred'): Promise<void> {
    try {
      // TODO: Integrate with actual BEZY token distribution system
      console.log(`💰 Distributing ${amount} BEZY to ${userId} (${type})`);

      // Mock reward distribution - replace with real token transfer
      const reward: ReferralReward = {
        amount,
        type,
        referral_id: `temp_ref_${Date.now()}`,
        user_id: userId,
        status: 'distributed'
      };

      // In production, this would:
      // 1. Call blockchain service to transfer BEZY tokens
      // 2. Update user's token balance in database
      // 3. Create transaction record
      // 4. Send notification to user

    } catch (error) {
      console.error('Error distributing BEZY reward:', error);
    }
  }

  private async updateReferrerStats(referrerId: string): Promise<void> {
    try {
      const referralCode = await this.getUserReferralCode(referrerId);
      if (!referralCode) return;

      const referrals = await this.getUserReferrals(referrerId);
      const completedReferrals = referrals.filter(r => r.status === 'completed');

      const updatedCode: ReferralCode = {
        ...referralCode,
        total_referrals: completedReferrals.length,
        total_rewards_earned: completedReferrals.length * this.BEZY_REWARD_AMOUNT
      };

      await this.saveReferralCode(updatedCode);
    } catch (error) {
      console.error('Error updating referrer stats:', error);
    }
  }

  // Storage methods (mock implementation)
  private async saveReferralCode(referralCode: ReferralCode): Promise<void> {
    try {
      const codes = await this.getStoredReferralCodes();
      const existingIndex = codes.findIndex(c => c.id === referralCode.id);

      if (existingIndex >= 0) {
        codes[existingIndex] = referralCode;
      } else {
        codes.push(referralCode);
      }

      await AsyncStorage.setItem('referral_codes', JSON.stringify(codes));
    } catch (error) {
      console.error('Error saving referral code:', error);
    }
  }

  private async saveReferral(referral: Referral): Promise<void> {
    try {
      const referrals = await this.getStoredReferrals();
      const existingIndex = referrals.findIndex(r => r.id === referral.id);

      if (existingIndex >= 0) {
        referrals[existingIndex] = referral;
      } else {
        referrals.push(referral);
      }

      await AsyncStorage.setItem('referrals', JSON.stringify(referrals));
    } catch (error) {
      console.error('Error saving referral:', error);
    }
  }

  private async getStoredReferralCodes(): Promise<ReferralCode[]> {
    try {
      const stored = await AsyncStorage.getItem('referral_codes');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored referral codes:', error);
      return [];
    }
  }

  private async getStoredReferrals(): Promise<Referral[]> {
    try {
      const stored = await AsyncStorage.getItem('referrals');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting stored referrals:', error);
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
}

export const referralRewardService = new ReferralRewardService();