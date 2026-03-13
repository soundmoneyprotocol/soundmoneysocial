/**
 * Stripe Adapter
 * Provides Stripe functionality for web using Stripe.js (instead of React Native Stripe SDK)
 * Handles payment processing, card tokenization, and payment methods
 */

interface StripeError {
  code: string;
  message: string;
  type: string;
  param?: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  card?: {
    brand: string;
    last4: string;
    exp_month: number;
    exp_year: number;
  };
}

interface PaymentIntent {
  id: string;
  client_secret: string;
  status: string;
  amount: number;
  currency: string;
}

/**
 * Stripe adapter for web environment
 * Requires @stripe/stripe-js to be installed and initialized
 *
 * NOTE: Stripe integration is disabled - install @stripe/stripe-js to enable
 */
export const stripeAdapter = {
  /**
   * Initialize Stripe instance
   * @param publishableKey Stripe publishable key
   * @returns Stripe instance
   *
   * DISABLED: Requires @stripe/stripe-js package
   */
  async initStripe(publishableKey: string) {
    throw new Error('Stripe integration is not enabled. Install @stripe/stripe-js to use this feature.');
  },

  /**
   * Create a payment method from card details
   * @param stripe Stripe instance
   * @param elements Stripe Elements instance
   * @param billingDetails Billing information
   * @returns Payment method object
   */
  async createPaymentMethod(
    stripe: any,
    elements: any,
    billingDetails?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: {
        line1?: string;
        line2?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
      };
    }
  ): Promise<{ paymentMethod?: PaymentMethod; error?: StripeError }> {
    try {
      const cardElement = elements.getElement('card');

      if (!cardElement) {
        return {
          error: {
            code: 'card_element_missing',
            message: 'Card element not found',
            type: 'invalid_request_error',
          },
        };
      }

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: billingDetails,
      });

      if (error) {
        return { error: error as StripeError };
      }

      return { paymentMethod: paymentMethod as PaymentMethod };
    } catch (error) {
      console.error('Create payment method error:', error);
      return {
        error: {
          code: 'unknown_error',
          message: 'Failed to create payment method',
          type: 'api_error',
        },
      };
    }
  },

  /**
   * Confirm payment with payment intent
   * @param stripe Stripe instance
   * @param clientSecret Client secret from payment intent
   * @param confirmParams Confirmation parameters
   * @returns Confirmation result
   */
  async confirmCardPayment(
    stripe: any,
    clientSecret: string,
    confirmParams?: {
      return_url?: string;
      payment_method?: string;
      setup_future_usage?: string;
    }
  ): Promise<{ paymentIntent?: PaymentIntent; error?: StripeError }> {
    try {
      const { paymentIntent, error } = await stripe.confirmCardPayment(
        clientSecret,
        confirmParams
      );

      if (error) {
        return { error: error as StripeError };
      }

      return { paymentIntent: paymentIntent as PaymentIntent };
    } catch (error) {
      console.error('Confirm card payment error:', error);
      return {
        error: {
          code: 'unknown_error',
          message: 'Failed to confirm payment',
          type: 'api_error',
        },
      };
    }
  },

  /**
   * Handle card setup (tokenize without charging)
   * @param stripe Stripe instance
   * @param clientSecret Client secret from setup intent
   * @param confirmParams Confirmation parameters
   * @returns Setup intent result
   */
  async confirmCardSetup(
    stripe: any,
    clientSecret: string,
    confirmParams?: {
      return_url?: string;
      payment_method?: string;
    }
  ): Promise<{ setupIntent?: any; error?: StripeError }> {
    try {
      const { setupIntent, error } = await stripe.confirmCardSetup(
        clientSecret,
        confirmParams
      );

      if (error) {
        return { error: error as StripeError };
      }

      return { setupIntent };
    } catch (error) {
      console.error('Confirm card setup error:', error);
      return {
        error: {
          code: 'unknown_error',
          message: 'Failed to setup payment method',
          type: 'api_error',
        },
      };
    }
  },

  /**
   * Tokenize card details (legacy API)
   * @param stripe Stripe instance
   * @param cardData Card data object
   * @returns Token result
   */
  async createToken(
    stripe: any,
    cardData: {
      number: string;
      exp_month: number;
      exp_year: number;
      cvc: string;
      name?: string;
    }
  ): Promise<{ token?: any; error?: StripeError }> {
    try {
      const { token, error } = await stripe.createToken(cardData);

      if (error) {
        return { error: error as StripeError };
      }

      return { token };
    } catch (error) {
      console.error('Create token error:', error);
      return {
        error: {
          code: 'unknown_error',
          message: 'Failed to create token',
          type: 'api_error',
        },
      };
    }
  },

  /**
   * Retrieve payment intent details
   * @param stripe Stripe instance
   * @param clientSecret Client secret from payment intent
   * @returns Payment intent object
   */
  async retrievePaymentIntent(
    stripe: any,
    clientSecret: string
  ): Promise<{ paymentIntent?: PaymentIntent; error?: StripeError }> {
    try {
      const { paymentIntent, error } = await stripe.retrievePaymentIntent(
        clientSecret
      );

      if (error) {
        return { error: error as StripeError };
      }

      return { paymentIntent: paymentIntent as PaymentIntent };
    } catch (error) {
      console.error('Retrieve payment intent error:', error);
      return {
        error: {
          code: 'unknown_error',
          message: 'Failed to retrieve payment intent',
          type: 'api_error',
        },
      };
    }
  },
};

export default stripeAdapter;
