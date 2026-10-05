import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string, referralCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function mapSession(session: Session | null): User | null {
  if (!session?.user) return null;
  const { user } = session;
  return {
    id: user.id,
    email: user.email ?? '',
    username: user.user_metadata?.username ?? user.email?.split('@')[0] ?? '',
    avatar: user.user_metadata?.avatar_url,
    createdAt: user.created_at,
  };
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(mapSession(session));
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(mapSession(session));
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string, referralCode?: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (error) throw error;

      const userId = data.user?.id;
      if (userId) {
        const newReferralCode = Math.random().toString(36).substring(2, 10).toUpperCase();
        const { error: referralError } = await supabase
          .from('referrals')
          .insert({ owner_user_id: userId, referral_code: newReferralCode });
        if (referralError) {
          console.error('Error generating referral code:', referralError);
        }

        if (referralCode) {
          const { data: referral, error: referralLookupError } = await supabase
            .from('referrals')
            .select('id')
            .eq('referral_code', referralCode);
          if (referralLookupError) {
            console.error('Error retrieving referral code:', referralLookupError);
          } else if (referral && referral.length > 0) {
            const { error: usedReferralError } = await supabase
              .from('used_referrals')
              .insert({ referral_id: referral[0].id, used_by_user_id: userId });
            if (usedReferralError) {
              console.error('Error recording used referral:', usedReferralError);
            }
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
