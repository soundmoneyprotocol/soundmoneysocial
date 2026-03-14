import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import { theme } from '../theme/theme';

export interface BillingPortalProps {
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'outline' | 'ghost';
}

export const BillingPortal: React.FC<BillingPortalProps> = ({
  label = 'Manage Billing',
  size = 'md',
  variant = 'outline',
}) => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpenPortal = async () => {
    if (!isAuthenticated) {
      setError('Please log in to manage billing');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const accessToken = sessionStorage.getItem('soundmoney_access_token');
      if (!accessToken) {
        setError('Authentication required');
        return;
      }

      // Create billing portal session
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/payments/billing-portal`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to open billing portal');
      }

      const data = await response.json();

      // Redirect to Stripe billing portal
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No billing portal URL received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to open billing portal';
      setError(errorMessage);
      console.error('Billing portal error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Button
        variant={variant}
        size={size}
        onClick={handleOpenPortal}
        isLoading={loading}
        disabled={!isAuthenticated || loading}
        title={!isAuthenticated ? 'Please log in to manage billing' : label}
      >
        {label}
      </Button>
      {error && (
        <div
          style={{
            marginTop: theme.spacing.sm,
            padding: theme.spacing.sm,
            backgroundColor: `${theme.colors.error}20`,
            border: `1px solid ${theme.colors.error}`,
            borderRadius: theme.borderRadius.sm,
            color: theme.colors.error,
            fontSize: '12px',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
};

export default BillingPortal;
