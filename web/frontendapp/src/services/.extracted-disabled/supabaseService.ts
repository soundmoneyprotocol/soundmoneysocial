import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

// Supabase Configuration
const SUPABASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Disable auto refresh for React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for database tables
export interface User {
  id: string;
  wallet_address?: string;
  email?: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  stripe_payment_intent_id?: string;
  superfluid_stream_id?: string;
  amount_usd: number;
  bezy_tokens: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  transaction_type: 'purchase' | 'stream' | 'reward';
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface BezyBalance {
  id: string;
  user_id: string;
  balance: number;
  locked_balance: number;
  total_earned: number;
  total_spent: number;
  last_updated: string;
}

// Supabase Service Class
class SupabaseService {
  // Authentication Methods
  async signUp(email: string, password: string, metadata?: Record<string, any>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) throw error;
      return { success: true, user: data.user };
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed'
      };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { success: true, user: data.user, session: data.session };
    } catch (error) {
      console.error('Signin error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signin failed'
      };
    }
  }

  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Signout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signout failed'
      };
    }
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  // User Profile Methods
  async createUserProfile(userId: string, profileData: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          id: userId,
          ...profileData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, profile: data };
    } catch (error) {
      console.error('Create profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create profile'
      };
    }
  }

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { success: true, profile: data };
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get profile'
      };
    }
  }

  async updateUserProfile(userId: string, updates: Partial<User>) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, profile: data };
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update profile'
      };
    }
  }

  // Transaction Methods
  async createTransaction(transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          ...transactionData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, transaction: data };
    } catch (error) {
      console.error('Create transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create transaction'
      };
    }
  }

  async updateTransaction(transactionId: string, updates: Partial<Transaction>) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', transactionId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, transaction: data };
    } catch (error) {
      console.error('Update transaction error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update transaction'
      };
    }
  }

  async getUserTransactions(userId: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { success: true, transactions: data };
    } catch (error) {
      console.error('Get transactions error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get transactions'
      };
    }
  }

  // BEZY Balance Methods
  async getBezyBalance(userId: string) {
    try {
      const { data, error } = await supabase
        .from('bezy_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If no balance exists, create one
        if (error.code === 'PGRST116') {
          return this.createBezyBalance(userId);
        }
        throw error;
      }
      return { success: true, balance: data };
    } catch (error) {
      console.error('Get balance error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get balance'
      };
    }
  }

  async createBezyBalance(userId: string) {
    try {
      const { data, error } = await supabase
        .from('bezy_balances')
        .insert([{
          user_id: userId,
          balance: 0,
          locked_balance: 0,
          total_earned: 0,
          total_spent: 0,
          last_updated: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;
      return { success: true, balance: data };
    } catch (error) {
      console.error('Create balance error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create balance'
      };
    }
  }

  async updateBezyBalance(userId: string, balanceChange: number, type: 'earn' | 'spend') {
    try {
      // Get current balance
      const currentBalance = await this.getBezyBalance(userId);
      if (!currentBalance.success || !currentBalance.balance) {
        throw new Error('Failed to get current balance');
      }

      const newBalance = currentBalance.balance.balance + balanceChange;
      const totalEarned = type === 'earn'
        ? currentBalance.balance.total_earned + Math.abs(balanceChange)
        : currentBalance.balance.total_earned;
      const totalSpent = type === 'spend'
        ? currentBalance.balance.total_spent + Math.abs(balanceChange)
        : currentBalance.balance.total_spent;

      const { data, error } = await supabase
        .from('bezy_balances')
        .update({
          balance: newBalance,
          total_earned: totalEarned,
          total_spent: totalSpent,
          last_updated: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return { success: true, balance: data };
    } catch (error) {
      console.error('Update balance error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update balance'
      };
    }
  }

  // Real-time subscriptions
  subscribeToTransactions(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`transactions_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }

  subscribeToBalance(userId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`balance_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bezy_balances',
          filter: `user_id=eq.${userId}`,
        },
        callback
      )
      .subscribe();
  }
}

export const supabaseService = new SupabaseService();
export default supabaseService;