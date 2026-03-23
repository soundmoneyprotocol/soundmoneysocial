import React from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useNavigate } from 'react-router-dom';
import { theme } from '../theme/theme';

export const TrialBanner: React.FC = () => {
  const { isOnTrial, trialTimeRemaining, tier } = useSubscription();
  const navigate = useNavigate();

  if (!isOnTrial || !trialTimeRemaining || trialTimeRemaining <= 0) {
    return null;
  }

  const hours = Math.floor(trialTimeRemaining / (1000 * 60 * 60));
  const minutes = Math.floor((trialTimeRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const isWarning = trialTimeRemaining < 2 * 60 * 60 * 1000; // Less than 2 hours

  return (
    <div
      style={{
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        backgroundColor: isWarning ? `${theme.colors.warning}20` : `${theme.colors.primary}20`,
        border: `1px solid ${isWarning ? theme.colors.warning : theme.colors.primary}`,
        borderRadius: theme.borderRadius.sm,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
      }}
    >
      <span
        style={{
          color: isWarning ? theme.colors.warning : theme.colors.primary,
          fontWeight: 'bold',
          fontSize: '14px',
        }}
      >
        {isWarning ? '⏰' : '✨'} {tier === 'trial-48h' ? '48-Hour' : '24-Hour'} Trial:{' '}
        {hours}h {minutes}m remaining
      </span>
      <button
        onClick={() => navigate('/upgrade')}
        style={{
          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
          backgroundColor: theme.colors.primary,
          color: 'white',
          border: 'none',
          borderRadius: theme.borderRadius.sm,
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: 'bold',
        }}
      >
        Upgrade Now
      </button>
    </div>
  );
};

export default TrialBanner;
