import { supabase } from './supabaseService';

// Backend API configuration
const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

interface PaymentIntentRequest {
  amount: number;
  currency?: string;
  paymentMethodId?: string;
  bezyTokens?: number;
}

interface PaymentIntentResponse {
  client_secret: string;
  amount: number;
  currency: string;
  transaction_id: string;
  bezy_tokens: number;
}

interface BezyPriceResponse {
  price_usd: number;
  last_updated: string;
}

interface TransactionHistory {
  id: string;
  amount_usd: number;
  bezy_tokens: number;
  status: string;
  transaction_type: string;
  created_at: string;
  processed_at?: string;
}

interface BezyBalanceResponse {
  balance: number;
  locked_balance: number;
  total_earned: number;
  total_spent: number;
  last_updated: string;
}

class ApiService {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      const responseText = await response.text();
      let data;

      try {
        data = JSON.parse(responseText);
      } catch {
        data = responseText;
      }

      if (!response.ok) {
        return {
          success: false,
          error: data?.error?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
        };
      }

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network request failed',
      };
    }
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<{ status: string; timestamp: string }>> {
    return this.makeRequest('/health');
  }

  // BEZY Token Operations
  // COMMENTED OUT: BZY price API requests - will be re-enabled when BZY is live on mainnet
  // async getBezyPrice(): Promise<ApiResponse<BezyPriceResponse>> {
  //   return this.makeRequest('/bezy/price');
  // }

  async getBezyBalance(userId: string): Promise<ApiResponse<BezyBalanceResponse>> {
    return this.makeRequest(`/bezy/balance/${userId}`);
  }

  // Payment Operations
  async createPaymentIntent(request: PaymentIntentRequest): Promise<ApiResponse<PaymentIntentResponse>> {
    return this.makeRequest('/payments/create-intent', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async confirmPayment(paymentIntentId: string, paymentMethodId: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify({
        payment_intent_id: paymentIntentId,
        payment_method_id: paymentMethodId,
      }),
    });
  }

  // Transaction History
  async getTransactionHistory(userId: string, limit = 20, offset = 0): Promise<ApiResponse<TransactionHistory[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return this.makeRequest(`/payments/transactions/${userId}?${params.toString()}`);
  }

  // User Operations
  async getCurrentUser(): Promise<ApiResponse<any>> {
    return this.makeRequest('/users/profile');
  }

  async updateUserProfile(updates: Partial<any>): Promise<ApiResponse<any>> {
    return this.makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  // Payment Methods
  async getPaymentMethods(): Promise<ApiResponse<any[]>> {
    return this.makeRequest('/payments/methods');
  }

  async addPaymentMethod(paymentMethodId: string): Promise<ApiResponse<any>> {
    return this.makeRequest('/payments/methods', {
      method: 'POST',
      body: JSON.stringify({ payment_method_id: paymentMethodId }),
    });
  }

  async deletePaymentMethod(paymentMethodId: string): Promise<ApiResponse<any>> {
    return this.makeRequest(`/payments/methods/${paymentMethodId}`, {
      method: 'DELETE',
    });
  }

  // Utility methods for BEZY calculations
  calculateBezyTokens(usdAmount: number, pricePerToken = 0.10): number {
    return Math.floor(usdAmount / pricePerToken);
  }

  calculateUsdAmount(bezyTokens: number, pricePerToken = 0.10): number {
    return bezyTokens * pricePerToken;
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

export const apiService = new ApiService();
export type {
  PaymentIntentRequest,
  PaymentIntentResponse,
  BezyPriceResponse,
  TransactionHistory,
  BezyBalanceResponse,
  ApiResponse
};
