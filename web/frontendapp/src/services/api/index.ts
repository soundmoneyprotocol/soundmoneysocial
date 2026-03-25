/**
 * SoundMoney API Services
 * Centralized API client and services for app.soundmoneyprotocol.xyz
 * Works for both Mobile (React Native) and Web (PWA)
 */

import { SoundMoneyApiClient, type ApiConfig, type ApiResponse, type ApiError } from './apiClient';
import {
  AuthService,
  type SignUpRequest,
  type SignInRequest,
  type User,
  type AuthResponse,
} from './authService';
import {
  ArtistDashboardService,
  type StreamingMetrics,
  type CopyrightReport,
  type DeFiPosition,
  type UserProfile,
  type DashboardAnalytics,
  type NotificationPreferences,
} from './artistDashboardService';

// Re-export types and classes
export { SoundMoneyApiClient, type ApiConfig, type ApiResponse, type ApiError };
export {
  AuthService,
  type SignUpRequest,
  type SignInRequest,
  type User,
  type AuthResponse,
};
export {
  ArtistDashboardService,
  type StreamingMetrics,
  type CopyrightReport,
  type DeFiPosition,
  type UserProfile,
  type DashboardAnalytics,
  type NotificationPreferences,
};

/**
 * Initialize all API services
 * Call this once in your app's initialization code
 *
 * Example usage in React app:
 * ```typescript
 * import { SoundMoneyApiClient, AuthService, ArtistDashboardService } from '@/services/api';
 *
 * // In your App.tsx or main.tsx
 * const apiClient = SoundMoneyApiClient.initialize({
 *   baseURL: 'https://os.soundmoneyprotocol.xyz',
 *   timeout: 30000,
 * });
 *
 * const authService = AuthService.initialize(apiClient);
 * const dashboardService = ArtistDashboardService.initialize(apiClient);
 *
 * // Later in your app
 * const response = await authService.signIn({
 *   email: 'user@example.com',
 *   password: 'password',
 * });
 * ```
 */
export function initializeApiServices(baseURL: string = 'https://os.soundmoneyprotocol.xyz') {
  // Initialize API client
  const apiClient = SoundMoneyApiClient.initialize({
    baseURL,
    timeout: 30000,
  });

  // Initialize services
  const authService = AuthService.initialize(apiClient);
  const dashboardService = ArtistDashboardService.initialize(apiClient);

  return {
    apiClient,
    authService,
    dashboardService,
  };
}

/**
 * Get service instances (after initialization)
 */
export function getApiServices() {
  return {
    apiClient: SoundMoneyApiClient.getInstance(),
    authService: AuthService.getInstance(),
    dashboardService: ArtistDashboardService.getInstance(),
  };
}
