/**
 * SoundMoney Authentication Service
 * Handles user signup, signin, and session management via API
 * Works for both Mobile (React Native) and Web (PWA)
 */

import { SoundMoneyApiClient, ApiResponse } from './apiClient';

export interface SignUpRequest {
  email: string;
  password: string;
  username: string;
  displayName?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  walletAddress?: string;
  subscriptionTier: 'free' | 'artist' | 'label' | 'enterprise';
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

/**
 * Authentication Service
 * API-based auth (replaces Supabase auth)
 */
export class AuthService {
  private static instance: AuthService;
  private api: SoundMoneyApiClient;
  private currentUser: User | null = null;
  private authToken: string | null = null;

  private constructor(api: SoundMoneyApiClient) {
    this.api = api;
    // Try to restore auth token from storage
    this.restoreAuthToken();
  }

  static initialize(api: SoundMoneyApiClient): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService(api);
    }
    return AuthService.instance;
  }

  static getInstance(): AuthService {
    if (!AuthService.instance) {
      throw new Error('AuthService not initialized. Call initialize() first.');
    }
    return AuthService.instance;
  }

  /**
   * Sign up new user
   */
  async signUp(request: SignUpRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post<AuthResponse>('/auth/signup', request);

    if (response.success && response.data) {
      this.currentUser = response.data.user;
      this.authToken = response.data.token;
      this.api.setAuthToken(this.authToken);
      this.saveAuthToken(this.authToken);
    }

    return response;
  }

  /**
   * Sign in existing user
   */
  async signIn(request: SignInRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post<AuthResponse>('/auth/signin', request);

    if (response.success && response.data) {
      this.currentUser = response.data.user;
      this.authToken = response.data.token;
      this.api.setAuthToken(this.authToken);
      this.saveAuthToken(this.authToken);
    }

    return response;
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<ApiResponse<void>> {
    const response = await this.api.post<void>('/auth/signout');

    if (response.success) {
      this.currentUser = null;
      this.authToken = null;
      this.api.setAuthToken(null);
      this.clearAuthToken();
    }

    return response;
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post<AuthResponse>('/auth/refresh', {
      refreshToken,
    });

    if (response.success && response.data) {
      this.authToken = response.data.token;
      this.api.setAuthToken(this.authToken);
      this.saveAuthToken(this.authToken);
    }

    return response;
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    if (!this.authToken) {
      return {
        success: false,
        error: 'Not authenticated',
      };
    }

    const response = await this.api.get<User>('/auth/me');

    if (response.success && response.data) {
      this.currentUser = response.data;
    }

    return response;
  }

  /**
   * Verify email address
   */
  async verifyEmail(code: string): Promise<ApiResponse<User>> {
    const response = await this.api.post<User>('/auth/verify-email', { code });

    if (response.success && response.data) {
      this.currentUser = response.data;
    }

    return response;
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<ApiResponse<void>> {
    return this.api.post<void>('/auth/reset-password', { email });
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.api.post<void>('/auth/reset-password-confirm', { code, newPassword });
  }

  /**
   * Get currently logged-in user (cached)
   */
  getCurrentUserSync(): User | null {
    return this.currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.authToken && !!this.currentUser;
  }

  /**
   * Get auth token
   */
  getAuthToken(): string | null {
    return this.authToken;
  }

  /**
   * Save auth token to storage
   */
  private saveAuthToken(token: string): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('soundmoney_auth_token', token);
    }
  }

  /**
   * Restore auth token from storage
   */
  private restoreAuthToken(): void {
    if (typeof localStorage !== 'undefined') {
      const token = localStorage.getItem('soundmoney_auth_token');
      if (token) {
        this.authToken = token;
        this.api.setAuthToken(token);
      }
    }
  }

  /**
   * Clear auth token from storage
   */
  private clearAuthToken(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('soundmoney_auth_token');
    }
  }
}

export default AuthService;
