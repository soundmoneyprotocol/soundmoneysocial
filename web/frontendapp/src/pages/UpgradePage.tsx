import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { PricingPlans } from '../components/PricingPlans';
import { theme } from '../theme/theme';
import trialCheckoutService from '../services/trialCheckoutService';

export const UpgradePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { tier, trial, trialTimeRemaining, extendTrial } = useSubscription();

  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const reason = searchParams.get('reason');
  const suggestedTier = searchParams.get('tier');
  const successParam = searchParams.get('success');
  const cancelledParam = searchParams.get('cancelled');
  const trialExtendedParam = searchParams.get('trial');

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Handle success/cancelled from Stripe
  useEffect(() => {
    if (successParam === 'true' && trialExtendedParam === 'extended') {
      setSuccess(true);
      extendTrial();
      setShowBanner(false);
      // Show success message for 3 seconds then redirect
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } else if (cancelledParam === 'true') {
      setError('Payment cancelled. Your trial extension was not processed.');
      setTimeout(() => setError(null), 5000);
    }
  }, [successParam, trialExtendedParam, cancelledParam, extendTrial, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
    }
  }, [isAuthenticated, navigate]);

  const handleExtendTrial = async () => {
    if (!user?.email) {
      setError('Email not found. Please login again.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await trialCheckoutService.redirectToCheckout(user.email);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: theme.colors.background.secondary,
        padding: theme.spacing.lg,
      }}
    >
      {/* Success Banner */}
      {success && (
        <div
          style={{
            marginBottom: theme.spacing.xl,
            padding: theme.spacing.lg,
            backgroundColor: `${theme.colors.success}20`,
            border: `2px solid ${theme.colors.success}`,
            borderRadius: theme.borderRadius.lg,
          }}
        >
          <h2
            style={{
              color: theme.colors.success,
              marginBottom: theme.spacing.md,
              fontSize: '20px',
            }}
          >
            ✅ Trial Extended Successfully!
          </h2>
          <p style={{ color: theme.colors.gray[200], marginBottom: theme.spacing.md }}>
            Your trial has been extended by 24 hours. Redirecting to feed...
          </p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          style={{
            marginBottom: theme.spacing.xl,
            padding: theme.spacing.lg,
            backgroundColor: `${theme.colors.danger}20`,
            border: `2px solid ${theme.colors.danger}`,
            borderRadius: theme.borderRadius.lg,
          }}
        >
          <h3
            style={{
              color: theme.colors.danger,
              marginBottom: theme.spacing.md,
            }}
          >
            ❌ {error}
          </h3>
        </div>
      )}

      {/* Trial Expired Banner */}
      {showBanner && reason === 'trial-expired' && (
        <div
          style={{
            marginBottom: theme.spacing.xl,
            padding: theme.spacing.lg,
            backgroundColor: `${theme.colors.warning}20`,
            border: `2px solid ${theme.colors.warning}`,
            borderRadius: theme.borderRadius.lg,
          }}
        >
          <h2
            style={{
              color: theme.colors.warning,
              marginBottom: theme.spacing.md,
              fontSize: '20px',
            }}
          >
            ⏰ Your 24-Hour Trial Has Ended
          </h2>
          <p style={{ color: theme.colors.gray[200], marginBottom: theme.spacing.lg }}>
            Upgrade now to continue enjoying unlimited streaming and creator tools.
          </p>

          {/* Quick Actions */}
          <div
            style={{
              display: 'flex',
              gap: theme.spacing.md,
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={handleExtendTrial}
              disabled={loading}
              style={{
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                backgroundColor: loading ? theme.colors.gray[600] : theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius.md,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
                opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? '⏳ Processing...' : '💳 Extend Trial +24h for $9'}
            </button>

            <button
              onClick={() => navigate('/')}
              disabled={loading}
              style={{
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                backgroundColor: 'transparent',
                color: theme.colors.primary,
                border: `1px solid ${theme.colors.primary}`,
                borderRadius: theme.borderRadius.md,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: 'bold',
                fontSize: '14px',
              }}
            >
              ← Back to Feed
            </button>
          </div>
        </div>
      )}

      {/* Trial Time Remaining */}
      {trial && trialTimeRemaining > 0 && reason !== 'trial-expired' && (
        <div
          style={{
            marginBottom: theme.spacing.xl,
            padding: theme.spacing.md,
            backgroundColor: `${theme.colors.success}10`,
            border: `1px solid ${theme.colors.success}`,
            borderRadius: theme.borderRadius.md,
            textAlign: 'center',
          }}
        >
          <p style={{ color: theme.colors.success, fontWeight: 'bold' }}>
            ✅ Trial Active: {formatTimeRemaining(trialTimeRemaining)} remaining
          </p>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: theme.spacing.xl, textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: theme.spacing.md,
            color: 'white',
          }}
        >
          Choose Your Plan
        </h1>
        <p style={{ fontSize: '16px', color: theme.colors.gray[300] }}>
          Unlock unlimited streaming, creator tools, and earn more BEZY tokens
        </p>
      </div>

      {/* Pricing Plans */}
      <PricingPlans
        currentPlan={tier}
        onSelectPlan={(plan) => {
          // TODO: Trigger checkout for selected plan
          console.log('Selected plan:', plan);
        }}
      />

      {/* FAQ Section */}
      <div
        style={{
          marginTop: 'calc(32px * 2)',
          maxWidth: '800px',
          margin: '64px auto 0',
          padding: theme.spacing.lg,
          backgroundColor: `${theme.colors.primary}10`,
          borderRadius: theme.borderRadius.lg,
        }}
      >
        <h3
          style={{
            color: 'white',
            marginBottom: theme.spacing.md,
            fontSize: '18px',
          }}
        >
          📖 Frequently Asked Questions
        </h3>

        {[
          {
            q: 'Can I extend my trial multiple times?',
            a: 'You can extend your trial once for $9 to get 48 hours total. After that, you\'ll need to subscribe to a paid plan.',
          },
          {
            q: 'What payment methods do you accept?',
            a: 'We accept all major credit cards, debit cards, and digital wallets via Stripe.',
          },
          {
            q: 'Is there a cancellation fee?',
            a: 'No cancellation fees. You can cancel your subscription anytime, and it will end at the end of your billing period.',
          },
          {
            q: 'What happens after my trial ends?',
            a: 'Your account will be paused. You can extend your trial for $9 or upgrade to any paid plan to continue.',
          },
          {
            q: 'How do I get support?',
            a: 'Email us at support@soundmoney.io or use the chat widget at the bottom right.',
          },
        ].map((item, idx) => (
          <div key={idx} style={{ marginBottom: theme.spacing.lg }}>
            <p
              style={{
                color: 'white',
                fontWeight: 'bold',
                marginBottom: theme.spacing.sm,
              }}
            >
              {item.q}
            </p>
            <p style={{ color: theme.colors.gray[300], fontSize: '14px' }}>{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpgradePage;
