/**
 * Session Management Service
 *
 * Handles persistent session storage, token refresh, and prevents unwanted logouts.
 * Ensures users stay logged in until they explicitly sign out.
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredSession {
  accessToken: string;
  refreshToken: string;
  userId: string;
  email: string;
  expiresAt: string;
  createdAt: string;
  lastRefreshedAt: string;
}

export interface SessionConfig {
  autoRefresh: boolean;
  refreshThresholdMinutes: number;
  maxSessionDurationHours: number;
  storeCredentials: boolean;
}

export interface StoredCredentials {
  email: string;
  encryptedPassword: string; // Simple base64 encoding (not truly secure - for demo)
  lastUsed: string;
}

class SessionManagementService {
  private sessionConfig: SessionConfig = {
    autoRefresh: true,
    refreshThresholdMinutes: 5, // Refresh if less than 5 min before expiry
    maxSessionDurationHours: 72, // Session valid for 72 hours max
    storeCredentials: false, // Disabled by default for security
  };

  private sessionCheckInterval: NodeJS.Timeout | null = null;
  private currentSession: StoredSession | null = null;

  constructor() {
    this.initializeSession();
  }

  /**
   * Initialize session on app start
   */
  private async initializeSession(): Promise<void> {
    try {
      const session = await this.getStoredSession();
      if (session) {
        this.currentSession = session;
        await this.validateSession();
      }
    } catch (error) {
      console.error('Failed to initialize session:', error);
    }
  }

  /**
   * Store session securely
   */
  async storeSession(
    accessToken: string,
    refreshToken: string,
    userId: string,
    email: string,
    expiresInSeconds: number = 3600
  ): Promise<boolean> {
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + expiresInSeconds * 1000);

      const session: StoredSession = {
        accessToken,
        refreshToken,
        userId,
        email,
        expiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString(),
        lastRefreshedAt: now.toISOString(),
      };

      // Store in SecureStore
      await SecureStore.setItemAsync(
        'soundmoney_session',
        JSON.stringify(session)
      );

      // Also store basic session info in AsyncStorage for quick access
      await AsyncStorage.setItem(
        'soundmoney_session_info',
        JSON.stringify({
          userId,
          email,
          expiresAt: expiresAt.toISOString(),
        })
      );

      this.currentSession = session;
      console.log('✅ Session stored successfully');
      return true;
    } catch (error) {
      console.error('Failed to store session:', error);
      return false;
    }
  }

  /**
   * Retrieve stored session
   */
  async getStoredSession(): Promise<StoredSession | null> {
    try {
      const sessionData = await SecureStore.getItemAsync('soundmoney_session');

      if (!sessionData) {
        return null;
      }

      return JSON.parse(sessionData);
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  }

  /**
   * Get session info (non-sensitive)
   */
  async getSessionInfo(): Promise<{ userId: string; email: string } | null> {
    try {
      const info = await AsyncStorage.getItem('soundmoney_session_info');
      if (info) {
        return JSON.parse(info);
      }
      return null;
    } catch (error) {
      console.error('Failed to get session info:', error);
      return null;
    }
  }

  /**
   * Check if session is still valid
   */
  async isSessionValid(): Promise<boolean> {
    try {
      const session = await this.getStoredSession();

      if (!session) {
        return false;
      }

      const now = new Date();
      const expiresAt = new Date(session.expiresAt);

      // Check if session has expired
      if (now >= expiresAt) {
        console.warn('❌ Session expired');
        await this.clearSession();
        return false;
      }

      // Check if session exceeds max duration
      const createdAt = new Date(session.createdAt);
      const maxDurationMs = this.sessionConfig.maxSessionDurationHours * 60 * 60 * 1000;

      if (now.getTime() - createdAt.getTime() > maxDurationMs) {
        console.warn('❌ Session max duration exceeded');
        await this.clearSession();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Validate session and refresh if needed
   */
  async validateSession(): Promise<boolean> {
    try {
      const session = await this.getStoredSession();

      if (!session) {
        return false;
      }

      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      const minutesUntilExpiry = (expiresAt.getTime() - now.getTime()) / (1000 * 60);

      // Refresh if less than threshold minutes remaining
      if (
        this.sessionConfig.autoRefresh &&
        minutesUntilExpiry < this.sessionConfig.refreshThresholdMinutes
      ) {
        console.log(`⚡ Session expiring soon (${minutesUntilExpiry.toFixed(1)} min), attempting refresh...`);
        return await this.refreshSession();
      }

      return await this.isSessionValid();
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  }

  /**
   * Refresh session token
   */
  async refreshSession(): Promise<boolean> {
    try {
      const session = await this.getStoredSession();

      if (!session || !session.refreshToken) {
        console.warn('⚠️ No refresh token available');
        return false;
      }

      // In production, you would call your backend to refresh the token
      // For now, we'll just extend the current session
      const now = new Date();
      const newExpiresAt = new Date(now.getTime() + 3600 * 1000); // 1 hour

      const refreshedSession: StoredSession = {
        ...session,
        expiresAt: newExpiresAt.toISOString(),
        lastRefreshedAt: now.toISOString(),
      };

      await SecureStore.setItemAsync(
        'soundmoney_session',
        JSON.stringify(refreshedSession)
      );

      this.currentSession = refreshedSession;
      console.log('✅ Session refreshed successfully');
      return true;
    } catch (error) {
      console.error('Failed to refresh session:', error);
      return false;
    }
  }

  /**
   * Start automatic session validation
   */
  startSessionValidation(intervalMinutes: number = 5): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }

    this.sessionCheckInterval = setInterval(async () => {
      const isValid = await this.validateSession();
      if (!isValid) {
        console.warn('⚠️ Session is no longer valid');
        this.stopSessionValidation();
      }
    }, intervalMinutes * 60 * 1000);

    console.log(`✅ Session validation started (every ${intervalMinutes} minutes)`);
  }

  /**
   * Stop automatic session validation
   */
  stopSessionValidation(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
      this.sessionCheckInterval = null;
      console.log('⏸️ Session validation stopped');
    }
  }

  /**
   * Clear session
   */
  async clearSession(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('soundmoney_session');
      await AsyncStorage.removeItem('soundmoney_session_info');
      this.currentSession = null;
      this.stopSessionValidation();
      console.log('✅ Session cleared');
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  /**
   * Store credentials for re-authentication (optional, encrypted)
   */
  async storeCredentials(email: string, password: string): Promise<boolean> {
    try {
      if (!this.sessionConfig.storeCredentials) {
        console.log('⚠️ Credential storage is disabled for security');
        return false;
      }

      // Simple base64 encoding (not truly secure - for demo only)
      // In production, use proper encryption like TweetNaCl.js
      const encryptedPassword = Buffer.from(password).toString('base64');

      const credentials: StoredCredentials = {
        email,
        encryptedPassword,
        lastUsed: new Date().toISOString(),
      };

      await SecureStore.setItemAsync(
        'soundmoney_credentials',
        JSON.stringify(credentials)
      );

      console.log('✅ Credentials stored');
      return true;
    } catch (error) {
      console.error('Failed to store credentials:', error);
      return false;
    }
  }

  /**
   * Retrieve stored credentials
   */
  async getStoredCredentials(): Promise<StoredCredentials | null> {
    try {
      if (!this.sessionConfig.storeCredentials) {
        return null;
      }

      const credentialsData = await SecureStore.getItemAsync(
        'soundmoney_credentials'
      );

      if (!credentialsData) {
        return null;
      }

      const credentials = JSON.parse(credentialsData);

      // Decrypt password (decode from base64)
      credentials.password = Buffer.from(
        credentials.encryptedPassword,
        'base64'
      ).toString('utf-8');

      return credentials;
    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      return null;
    }
  }

  /**
   * Clear stored credentials
   */
  async clearCredentials(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('soundmoney_credentials');
      console.log('✅ Credentials cleared');
    } catch (error) {
      console.error('Failed to clear credentials:', error);
    }
  }

  /**
   * Configure session settings
   */
  setSessionConfig(config: Partial<SessionConfig>): void {
    this.sessionConfig = {
      ...this.sessionConfig,
      ...config,
    };
    console.log('⚙️ Session config updated:', this.sessionConfig);
  }

  /**
   * Get session config
   */
  getSessionConfig(): SessionConfig {
    return this.sessionConfig;
  }

  /**
   * Get time until session expiry
   */
  async getTimeUntilExpiry(): Promise<number | null> {
    try {
      const session = await this.getStoredSession();

      if (!session) {
        return null;
      }

      const now = new Date();
      const expiresAt = new Date(session.expiresAt);
      const minutesRemaining = (expiresAt.getTime() - now.getTime()) / (1000 * 60);

      return Math.max(0, minutesRemaining);
    } catch (error) {
      console.error('Failed to get expiry time:', error);
      return null;
    }
  }

  /**
   * Get session metadata
   */
  async getSessionMetadata(): Promise<{
    isValid: boolean;
    expiresIn: number; // minutes
    createdAt: string;
    lastRefreshedAt: string;
    userId: string;
    email: string;
  } | null> {
    try {
      const session = await this.getStoredSession();

      if (!session) {
        return null;
      }

      const expiresIn = await this.getTimeUntilExpiry();
      const isValid = await this.isSessionValid();

      return {
        isValid,
        expiresIn: expiresIn || 0,
        createdAt: session.createdAt,
        lastRefreshedAt: session.lastRefreshedAt,
        userId: session.userId,
        email: session.email,
      };
    } catch (error) {
      console.error('Failed to get session metadata:', error);
      return null;
    }
  }
}

export const sessionManagementService = new SessionManagementService();
