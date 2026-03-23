/**
 * Trial Extension Checkout Service
 * Handles $9 trial extension payments via Stripe
 */

export interface TrialCheckoutSession {
  session_id: string;
  url: string;
  client_secret: string;
}

export interface TrialCheckoutError {
  error: string;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

export const trialCheckoutService = {
  /**
   * Create a checkout session for $9 trial extension
   */
  async createCheckoutSession(email: string): Promise<TrialCheckoutSession> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payments/trial-extension`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          successUrl: `${window.location.origin}/upgrade?success=true&trial=extended`,
          cancelUrl: `${window.location.origin}/upgrade?cancelled=true`,
        }),
      });

      if (!response.ok) {
        const error = await response.json() as TrialCheckoutError;
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json() as TrialCheckoutSession;
      return data;
    } catch (error) {
      throw error instanceof Error ? error : new Error('Trial checkout failed');
    }
  },

  /**
   * Redirect to Stripe Checkout
   */
  async redirectToCheckout(email: string): Promise<void> {
    try {
      const session = await this.createCheckoutSession(email);

      if (session.url) {
        // Redirect to Stripe Checkout
        window.location.href = session.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      console.error('Checkout redirect error:', error);
      throw error;
    }
  },
};

export default trialCheckoutService;
