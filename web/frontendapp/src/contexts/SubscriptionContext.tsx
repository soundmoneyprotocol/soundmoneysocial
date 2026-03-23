import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SubscriptionTier = 'trial-24h' | 'trial-48h' | 'soundmoney-ai' | 'artist-pro' | 'team';

export interface SubscriptionContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  bezyMultiplier: number;
  teamMembersLimit: number;
  isTeamPlan: boolean;
  isProPlan: boolean;
  upgradePlan: (newTier: SubscriptionTier) => void;
  trial?: boolean;
  trialTimeRemaining?: number;
  extendTrial?: () => void;
  isOnTrial?: boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<SubscriptionTier>('soundmoney-ai');

  // Load subscription tier from localStorage on mount
  useEffect(() => {
    const storedTier = localStorage.getItem('soundmoney_subscription_tier') as SubscriptionTier | null;
    const validTiers: SubscriptionTier[] = ['trial-24h', 'trial-48h', 'soundmoney-ai', 'artist-pro', 'team'];
    if (storedTier && validTiers.includes(storedTier)) {
      setTierState(storedTier);
    }
  }, []);

  const setTier = (newTier: SubscriptionTier) => {
    setTierState(newTier);
    localStorage.setItem('soundmoney_subscription_tier', newTier);
  };

  const upgradePlan = (newTier: SubscriptionTier) => {
    if (tier === newTier) {
      console.log(`Already on ${newTier} plan`);
      return;
    }
    setTier(newTier);
  };

  const bezyMultipliers: Record<SubscriptionTier, number> = {
    'trial-24h': 1,
    'trial-48h': 1,
    'soundmoney-ai': 1,
    'artist-pro': 1.5,
    'team': 2,
  };

  const teamMembersLimits: Record<SubscriptionTier, number> = {
    'trial-24h': 1,
    'trial-48h': 1,
    'soundmoney-ai': 1,
    'artist-pro': 5,
    'team': 999,
  };

  const isTeamPlan = tier === 'team';
  const isProPlan = tier === 'artist-pro';

  const value: SubscriptionContextType = {
    tier,
    setTier,
    bezyMultiplier: bezyMultipliers[tier],
    teamMembersLimit: teamMembersLimits[tier],
    isTeamPlan,
    isProPlan,
    upgradePlan,
    trial: tier.startsWith('trial'),
    isOnTrial: tier.startsWith('trial'),
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = (): SubscriptionContextType => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
