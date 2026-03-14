import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Button from './Button';
import Modal from './Modal';
import { theme } from '../theme/theme';

export interface CheckoutFlowProps {
  priceId: string;
  planName: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const CheckoutFlow: React.FC<CheckoutFlowProps> = ({
  priceId,
  planName,
  amount,
  onSuccess,
  onCancel,
  isOpen = true,
  onClose,
}) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = async () => {
    if (!isAuthenticated || !user) {
      setError('Please log in to upgrade');
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

      // Get the current URL for success/cancel redirects
      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/billing/success`;
      const cancelUrl = `${baseUrl}/billing`;

      // Create checkout session
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/payments/checkout-session`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            price_id: priceId,
            success_url: successUrl,
            cancel_url: cancelUrl,
          }),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create checkout session');
      }

      const data = await response.json();

      // Redirect to Stripe checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Checkout failed';
      setError(errorMessage);
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose || (() => {})} title={`Upgrade to ${planName}`}>
      <div
        style={{
          padding: theme.spacing.lg,
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.lg,
        }}
      >
        {/* Summary */}
        <div
          style={{
            padding: theme.spacing.lg,
            backgroundColor: `${theme.colors.primary}10`,
            borderLeft: `4px solid ${theme.colors.primary}`,
            borderRadius: theme.borderRadius.md,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing.sm,
            }}
          >
            <span style={{ color: theme.colors.gray[300] }}>Plan:</span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                color: theme.colors.primary,
              }}
            >
              {planName}
            </span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
            }}
          >
            <span style={{ color: theme.colors.gray[300] }}>Monthly Cost:</span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: theme.colors.primary,
              }}
            >
              ${amount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* User info */}
        <div>
          <label
            style={{
              display: 'block',
              marginBottom: theme.spacing.sm,
              color: theme.colors.gray[300],
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Email
          </label>
          <div
            style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.gray[900],
              borderRadius: theme.borderRadius.md,
              color: theme.colors.gray[100],
              border: `1px solid ${theme.colors.gray[800]}`,
            }}
          >
            {user?.email}
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            style={{
              padding: theme.spacing.md,
              backgroundColor: `${theme.colors.danger}20`,
              border: `1px solid ${theme.colors.danger}`,
              borderRadius: theme.borderRadius.md,
              color: theme.colors.danger,
              fontSize: '14px',
            }}
          >
            {error}
          </div>
        )}

        {/* Info message */}
        <div
          style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.gray[800],
            borderRadius: theme.borderRadius.md,
            color: theme.colors.gray[300],
            fontSize: '14px',
            lineHeight: '1.6',
          }}
        >
          <strong>Next Steps:</strong>
          <ol style={{ marginLeft: theme.spacing.md, marginTop: theme.spacing.sm }}>
            <li>Click "Proceed to Checkout"</li>
            <li>Enter your payment details</li>
            <li>Confirm your subscription</li>
            <li>You'll be redirected back automatically</li>
          </ol>
        </div>

        {/* Action buttons */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            justifyContent: 'flex-end',
          }}
        >
          <Button
            variant="outline"
            onClick={() => {
              onCancel?.();
              onClose?.();
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleCheckout}
            isLoading={loading}
            disabled={loading || !isAuthenticated}
          >
            {loading ? 'Processing...' : 'Proceed to Checkout'}
          </Button>
        </div>

        {/* Stripe info */}
        <div
          style={{
            textAlign: 'center',
            fontSize: '12px',
            color: theme.colors.gray[500],
          }}
        >
          Powered by Stripe • Secure Payment
        </div>
      </div>
    </Modal>
  );
};

export default CheckoutFlow;
