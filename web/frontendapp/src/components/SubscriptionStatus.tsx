import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from './Card';
import Button from './Button';
import Loading from './Loading';
import { theme } from '../theme/theme';

export interface Subscription {
  id: string;
  status: string;
  plan_id: string;
  current_period_start: number;
  current_period_end: number;
  amount: number;
  currency: string;
}

export interface SubscriptionStatusProps {
  onOpenBilling?: () => void;
  onOpenPlans?: () => void;
}

const PLAN_NAMES: { [key: string]: string } = {
  price_free: 'Free',
  price_pro: 'Pro',
  price_team: 'Team',
};

export const SubscriptionStatus: React.FC<SubscriptionStatusProps> = ({
  onOpenBilling,
  onOpenPlans,
}) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const accessToken = sessionStorage.getItem('soundmoney_access_token');

        if (!accessToken) {
          setSubscription(null);
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/payments/subscription`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch subscription');
        }

        const data = await response.json();
        setSubscription(data.subscription);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load subscription');
        console.error('Error fetching subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  if (!user) {
    return (
      <Card>
        <p style={{ color: theme.colors.gray[400] }}>
          Please log in to view your subscription
        </p>
      </Card>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <Card>
        <p style={{ color: theme.colors.danger }}>
          Error loading subscription: {error}
        </p>
      </Card>
    );
  }

  const planName = subscription
    ? PLAN_NAMES[subscription.plan_id] || 'Unknown'
    : 'Free';

  const isActive = subscription?.status === 'active';
  const currentPeriodEnd = subscription
    ? new Date(subscription.current_period_end * 1000).toLocaleDateString()
    : null;

  return (
    <Card
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: theme.spacing.lg,
      }}
    >
      {/* Left side - subscription info */}
      <div>
        <h3
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            marginBottom: theme.spacing.sm,
          }}
        >
          Current Plan
        </h3>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: theme.spacing.md,
            marginBottom: theme.spacing.md,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.sm,
            }}
          >
            <span
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: theme.colors.primary,
              }}
            >
              {planName}
            </span>
            {isActive && (
              <span
                style={{
                  display: 'inline-block',
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.success,
                  boxShadow: `0 0 8px ${theme.colors.success}`,
                }}
              />
            )}
          </div>

          {subscription?.amount && (
            <span
              style={{
                color: theme.colors.gray[400],
                fontSize: '14px',
              }}
            >
              (${(subscription.amount / 100).toFixed(2)}/month)
            </span>
          )}
        </div>

        {/* Status and period */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.sm,
            fontSize: '14px',
            color: theme.colors.gray[300],
          }}
        >
          <div>
            Status:{' '}
            <span
              style={{
                color: isActive ? theme.colors.success : theme.colors.gray[400],
                fontWeight: 'bold',
              }}
            >
              {subscription?.status.toUpperCase() || 'FREE'}
            </span>
          </div>

          {currentPeriodEnd && (
            <div>
              Renewal Date:{' '}
              <span style={{ fontWeight: 'bold' }}>
                {currentPeriodEnd}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right side - action buttons */}
      <div
        style={{
          display: 'flex',
          gap: theme.spacing.md,
          flexWrap: 'wrap',
        }}
      >
        {subscription && isActive ? (
          <>
            <Button
              variant="outline"
              size="md"
              onClick={onOpenBilling}
            >
              Manage Billing
            </Button>
            <Button
              variant="ghost"
              size="md"
              onClick={onOpenPlans}
            >
              Change Plan
            </Button>
          </>
        ) : (
          <Button
            variant="primary"
            size="md"
            onClick={onOpenPlans}
          >
            Upgrade Plan
          </Button>
        )}
      </div>
    </Card>
  );
};

export default SubscriptionStatus;
