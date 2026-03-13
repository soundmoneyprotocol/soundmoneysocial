import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SubscriptionTier = 'free' | 'pro' | 'team';

export interface SubscriptionContextType {
  tier: SubscriptionTier;
  setTier: (tier: SubscriptionTier) => void;
  bezyMultiplier: number;
  teamMembersLimit: number;
  isTeamPlan: boolean;
  isProPlan: boolean;
  upgradePlan: (newTier: SubscriptionTier) => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tier, setTierState] = useState<SubscriptionTier>('free');

  // Load subscription tier from localStorage on mount
  useEffect(() => {
    const storedTier = localStorage.getItem('soundmoney_subscription_tier') as SubscriptionTier | null;
    if (storedTier && ['free', 'pro', 'team'].includes(storedTier)) {
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
    free: 1,
    pro: 1.5,
    team: 2,
  };

  const teamMembersLimits: Record<SubscriptionTier, number> = {
    free: 1,
    pro: 5,
    team: 999,
  };

  const isTeamPlan = tier === 'team';
  const isProPlan = tier === 'pro' || isTeamPlan;

  const value: SubscriptionContextType = {
    tier,
    setTier,
    bezyMultiplier: bezyMultipliers[tier],
    teamMembersLimit: teamMembersLimits[tier],
    isTeamPlan,
    isProPlan,
    upgradePlan,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};
