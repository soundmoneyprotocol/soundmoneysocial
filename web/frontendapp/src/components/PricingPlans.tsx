import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Card from './Card';
import Button from './Button';
import Loading from './Loading';
import { theme } from '../theme/theme';

export interface Plan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  stripe_price_id?: string;
}

export interface PricingPlansProps {
  onSelectPlan?: (plan: Plan) => void;
  currentPlan?: string;
}

export const PricingPlans: React.FC<PricingPlansProps> = ({
  onSelectPlan,
  currentPlan,
}) => {
  const { isAuthenticated } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/payments/plans`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch plans');
        }

        const data = await response.json();
        setPlans(data.plans || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load plans');
        console.error('Error fetching plans:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div
        style={{
          padding: theme.spacing.lg,
          color: theme.colors.error,
          textAlign: 'center',
        }}
      >
        Error loading plans: {error}
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: theme.spacing.xl,
        padding: theme.spacing.lg,
      }}
    >
      {plans.map((plan) => {
        const isCurrentPlan = currentPlan === plan.id;
        const isFree = plan.price === 0;

        return (
          <Card
            key={plan.id}
            hoverable
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              border:
                isCurrentPlan
                  ? `2px solid ${theme.colors.primary}`
                  : undefined,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Popular badge */}
            {plan.name === 'Team' && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: theme.colors.primary,
                  color: 'white',
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  fontSize: '12px',
                  fontWeight: 'bold',
                }}
              >
                MOST POPULAR
              </div>
            )}

            {/* Plan name */}
            <div style={{ marginBottom: theme.spacing.md }}>
              <h3
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  marginBottom: theme.spacing.xs,
                }}
              >
                {plan.name}
              </h3>

              {/* Price */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: theme.spacing.xs,
                  marginBottom: theme.spacing.md,
                }}
              >
                <span
                  style={{
                    fontSize: '36px',
                    fontWeight: 'bold',
                    color: theme.colors.primary,
                  }}
                >
                  ${plan.price.toFixed(2)}
                </span>
                {!isFree && (
                  <span style={{ color: theme.colors.gray[400] }}>
                    / {plan.interval}
                  </span>
                )}
              </div>

              {/* Current plan indicator */}
              {isCurrentPlan && (
                <div
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    backgroundColor: `${theme.colors.success}20`,
                    border: `1px solid ${theme.colors.success}`,
                    borderRadius: theme.borderRadius.md,
                    color: theme.colors.success,
                    fontSize: '12px',
                    fontWeight: 'bold',
                    marginBottom: theme.spacing.md,
                    textAlign: 'center',
                  }}
                >
                  Current Plan
                </div>
              )}
            </div>

            {/* Features list */}
            <div
              style={{
                flex: 1,
                marginBottom: theme.spacing.lg,
              }}
            >
              <ul
                style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing.sm,
                }}
              >
                {plan.features.map((feature, index) => (
                  <li
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.sm,
                      fontSize: '14px',
                      color: theme.colors.gray[200],
                    }}
                  >
                    <span
                      style={{
                        color: theme.colors.primary,
                        fontWeight: 'bold',
                      }}
                    >
                      ✓
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Action button */}
            {!isCurrentPlan && (
              <Button
                variant={plan.name === 'Team' ? 'primary' : 'outline'}
                size="lg"
                onClick={() => {
                  if (onSelectPlan) {
                    onSelectPlan(plan);
                  }
                }}
                disabled={!isAuthenticated && !isFree}
                style={{ width: '100%' }}
              >
                {isFree ? 'Current Plan' : `Upgrade to ${plan.name}`}
              </Button>
            )}

            {isCurrentPlan && (
              <Button
                variant="ghost"
                size="lg"
                style={{ width: '100%' }}
                disabled
              >
                Current Plan
              </Button>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default PricingPlans;
