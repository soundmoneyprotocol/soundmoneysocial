/**
 * SoundMoney API Client
 * Centralized HTTP client for os.soundmoneyprotocol.xyz
 * Used by: Mobile app (React Native) + PWA (soundmoneysocial)
 */

export interface ApiConfig {
  baseURL: string;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface ApiError extends Error {
  statusCode?: number;
  data?: any;
}

/**
 * SoundMoney API Client
 * Handles all HTTP requests to the central API
 */
export class SoundMoneyApiClient {
  private static instance: SoundMoneyApiClient;
  private baseURL: string;
  private timeout: number;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

  private constructor(config: ApiConfig) {
    this.baseURL = config.baseURL;
    this.timeout = config.timeout || 30000; // 30 second default timeout
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Initialize API client (call once in your app startup)
   */
  static initialize(config: ApiConfig): SoundMoneyApiClient {
    if (!SoundMoneyApiClient.instance) {
      SoundMoneyApiClient.instance = new SoundMoneyApiClient(config);
    }
    return SoundMoneyApiClient.instance;
  }

  /**
   * Get singleton instance
   */
  static getInstance(): SoundMoneyApiClient {
    if (!SoundMoneyApiClient.instance) {
      throw new Error('API Client not initialized. Call initialize() first.');
    }
    return SoundMoneyApiClient.instance;
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string | null): void {
    this.authToken = token;
  }

  /**
   * Get authentication token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Build request headers
   */
  private getHeaders(): Record<string, string> {
    const headers = { ...this.defaultHeaders };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return headers;
  }

  /**
   * Make HTTP GET request
   */
  async get<T = any>(
    endpoint: string,
    options?: { params?: Record<string, any>; headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * Make HTTP POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('POST', endpoint, data, options);
  }

  /**
   * Make HTTP PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', endpoint, data, options);
  }

  /**
   * Make HTTP PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options?: { headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', endpoint, data, options);
  }

  /**
   * Make HTTP DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options?: { headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Generic request method
   */
  private async request<T = any>(
    method: string,
    endpoint: string,
    data?: any,
    options?: { params?: Record<string, any>; headers?: Record<string, string> }
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint, options?.params);
    const headers = { ...this.getHeaders(), ...(options?.headers || {}) };

    const fetchOptions: RequestInit = {
      method,
      headers,
      signal: AbortSignal.timeout(this.timeout),
    };

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, fetchOptions);
      return await this.handleResponse<T>(response);
    } catch (error) {
      return this.handleError<T>(error);
    }
  }

  /**
   * Build full URL with query parameters
   */
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseURL}${endpoint}`;

    if (params && Object.keys(params).length > 0) {
      const queryString = new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== null && value !== undefined) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();

      url = `${url}?${queryString}`;
    }

    return url;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    let data: any;

    try {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (error) {
      console.error('Error parsing response:', error);
      data = null;
    }

    if (!response.ok) {
      const apiError: ApiError = new Error(
        data?.error || data?.message || `HTTP ${response.status}`
      );
      apiError.statusCode = response.status;
      apiError.data = data;

      console.error(`API Error [${response.status}]:`, apiError.message);

      return {
        success: false,
        error: apiError.message,
        statusCode: response.status,
      };
    }

    return {
      success: true,
      data: data?.data || data,
      message: data?.message,
      statusCode: response.status,
    };
  }

  /**
   * Handle request errors
   */
  private handleError<T>(error: any): ApiResponse<T> {
    const message = error instanceof Error ? error.message : 'Unknown error';

    console.error('API Request Error:', message);

    return {
      success: false,
      error: message,
      statusCode: 0,
    };
  }

  /**
   * Get base URL
   */
  getBaseURL(): string {
    return this.baseURL;
  }

  /**
   * Health check
   */
  async health(): Promise<boolean> {
    try {
      const response = await this.get('/health');
      return response.success;
    } catch {
      return false;
    }
  }
}

export default SoundMoneyApiClient;
