import { initStripe, createPaymentMethod } from '@stripe/stripe-react-native';
import Constants from 'expo-constants';
import { supabaseService } from './supabaseService';

// Stripe Configuration
const STRIPE_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const BEZY_TOKEN_PRICE_USD = 0.10; // $0.10 per BEZY token

interface PaymentIntent {
  client_secret: string;
  amount: number;
  currency: string;
}

interface BezyPurchaseData {
  amount_usd: number;
  bezy_tokens: number;
  user_email: string;
  payment_method_id: string;
}

class StripeService {
  private initialized = false;

  async initialize() {
    if (!this.initialized) {
      await initStripe({
        publishableKey: STRIPE_PUBLISHABLE_KEY,
        merchantIdentifier: 'merchant.com.bezy.app',
      });
      this.initialized = true;
    }
  }

  calculateBezyTokens(usdAmount: number): number {
    return Math.floor(usdAmount / BEZY_TOKEN_PRICE_USD);
  }

  calculateUsdAmount(bezyTokens: number): number {
    return bezyTokens * BEZY_TOKEN_PRICE_USD;
  }

  async createPaymentIntent(amountUsd: number, paymentMethodId?: string): Promise<PaymentIntent & { transaction_id?: string; bezy_tokens?: number }> {
    const { apiService } = await import('./apiService');

    const bezyTokens = this.calculateBezyTokens(amountUsd);

    const result = await apiService.createPaymentIntent({
      amount: amountUsd,
      currency: 'usd',
      paymentMethodId,
      bezyTokens,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create payment intent');
    }

    return {
      client_secret: result.data!.client_secret,
      amount: Math.round(amountUsd * 100), // Convert to cents for compatibility
      currency: result.data!.currency,
      transaction_id: result.data!.transaction_id,
      bezy_tokens: result.data!.bezy_tokens,
    };
  }

  async processBezyPurchase(purchaseData: BezyPurchaseData): Promise<{
    success: boolean;
    transaction_id?: string;
    bezy_tokens?: number;
    error?: string;
  }> {
    try {
      await this.initialize();
      const { apiService } = await import('./apiService');

      // Create payment intent via backend API
      const paymentIntent = await this.createPaymentIntent(
        purchaseData.amount_usd,
        purchaseData.payment_method_id
      );

      // The backend has already created the transaction record
      // and will handle the payment processing via webhooks

      return {
        success: true,
        transaction_id: paymentIntent.transaction_id,
        bezy_tokens: paymentIntent.bezy_tokens,
      };
    } catch (error) {
      console.error('BEZY purchase error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  async createSetupIntent(): Promise<{ client_secret: string }> {
    // For saving payment methods for future use
    return {
      client_secret: 'seti_test_1234567890_secret_1234567890',
    };
  }

  formatCurrency(amount: number, currency = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  }

  formatTokens(tokens: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(tokens);
  }
}

export const stripeService = new StripeService();
export { BEZY_TOKEN_PRICE_USD };