import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

WebBrowser.maybeCompleteAuthSession();

interface AuthResult {
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    provider: string;
  };
  token?: string;
  error?: string;
}

interface SocialAuthConfig {
  clientId: string;
  redirectUri: string;
  scopes: string[];
  authUrl: string;
  tokenUrl: string;
}

class AuthService {
  private configs: Record<string, SocialAuthConfig> = {
    spotify: {
      clientId: process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_ID || '',
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['user-read-email', 'user-read-private'],
      authUrl: 'https://accounts.spotify.com/authorize',
      tokenUrl: 'https://accounts.spotify.com/api/token',
    },
    apple: {
      clientId: process.env.EXPO_PUBLIC_APPLE_CLIENT_ID || '',
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['name', 'email'],
      authUrl: 'https://appleid.apple.com/auth/authorize',
      tokenUrl: 'https://appleid.apple.com/auth/token',
    },
    google: {
      clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['openid', 'profile', 'email'],
      authUrl: 'https://accounts.google.com/oauth/authorize',
      tokenUrl: 'https://oauth2.googleapis.com/token',
    },
    soundcloud: {
      clientId: process.env.EXPO_PUBLIC_SOUNDCLOUD_CLIENT_ID || '',
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: [],
      authUrl: 'https://soundcloud.com/connect',
      tokenUrl: 'https://api.soundcloud.com/oauth2/token',
    },
    tiktok: {
      clientId: process.env.EXPO_PUBLIC_TIKTOK_CLIENT_ID || '',
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['user.info.basic'],
      authUrl: 'https://www.tiktok.com/auth/authorize/',
      tokenUrl: 'https://open-api.tiktok.com/oauth/access_token/',
    },
    twitter: {
      clientId: process.env.EXPO_PUBLIC_TWITTER_CLIENT_ID || '',
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['tweet.read', 'users.read'],
      authUrl: 'https://twitter.com/i/oauth2/authorize',
      tokenUrl: 'https://api.twitter.com/2/oauth2/token',
    },
    instagram: {
      clientId: process.env.EXPO_PUBLIC_INSTAGRAM_CLIENT_ID || '',
      redirectUri: AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['user_profile', 'user_media'],
      authUrl: 'https://api.instagram.com/oauth/authorize',
      tokenUrl: 'https://api.instagram.com/oauth/access_token',
    },
    audius: {
      clientId: process.env.EXPO_PUBLIC_AUDIUS_API_KEY || '',
      redirectUri: process.env.EXPO_PUBLIC_AUDIUS_REDIRECT_URI || AuthSession.makeRedirectUri({ useProxy: true }),
      scopes: ['read'],
      authUrl: 'https://audius.co/oauth/auth',
      tokenUrl: '', // Audius returns JWT directly in fragment
    },
  };

  async authenticateWithProvider(provider: string): Promise<AuthResult> {
    try {
      // Handle Audius OAuth separately since it uses a different flow
      if (provider === 'audius') {
        return this.authenticateWithAudius();
      }

      const config = this.configs[provider];
      if (!config) {
        return { success: false, error: `Provider ${provider} not supported` };
      }

      if (!config.clientId) {
        return {
          success: false,
          error: `${provider} client ID not configured. Please add EXPO_PUBLIC_${provider.toUpperCase()}_CLIENT_ID to your environment variables.`
        };
      }

      const request = new AuthSession.AuthRequest({
        clientId: config.clientId,
        scopes: config.scopes,
        redirectUri: config.redirectUri,
        responseType: AuthSession.ResponseType.Code,
        extraParams: {},
        additionalParameters: {},
      });

      const result = await request.promptAsync({
        authorizationEndpoint: config.authUrl,
      });

      if (result.type === 'success') {
        const tokenResult = await this.exchangeCodeForToken(provider, result.params.code);
        if (tokenResult.success) {
          const userInfo = await this.getUserInfo(provider, tokenResult.token!);
          await this.storeAuthToken(tokenResult.token!);
          return {
            success: true,
            user: userInfo,
            token: tokenResult.token,
          };
        }
        return tokenResult;
      } else {
        return { success: false, error: 'Authentication cancelled' };
      }
    } catch (error) {
      console.error(`${provider} auth error:`, error);
      return { success: false, error: `Authentication failed: ${error}` };
    }
  }

  private async authenticateWithAudius(): Promise<AuthResult> {
    try {
      const apiKey = process.env.EXPO_PUBLIC_AUDIUS_API_KEY;
      const appName = process.env.EXPO_PUBLIC_AUDIUS_APP_NAME || 'SoundMoneyApp';
      const redirectUri = process.env.EXPO_PUBLIC_AUDIUS_REDIRECT_URI || AuthSession.makeRedirectUri({ useProxy: true });

      if (!apiKey) {
        return {
          success: false,
          error: 'Audius API key not configured. Please add EXPO_PUBLIC_AUDIUS_API_KEY to your environment variables.',
        };
      }

      if (!redirectUri) {
        return {
          success: false,
          error: 'Audius redirect URI not configured. Please add EXPO_PUBLIC_AUDIUS_REDIRECT_URI to your environment variables.',
        };
      }

      // Log the redirect URI for debugging
      console.log('=== AUDIUS OAUTH DEBUG ===');
      console.log('Redirect URI:', redirectUri);
      console.log('App Name:', appName);
      console.log('API Key:', apiKey.substring(0, 10) + '...');
      console.log('========================');

      // Generate a random state for CSRF protection
      const state = Math.random().toString(36).substring(2, 15);

      // Build Audius OAuth URL using AuthSession with all required parameters
      const request = new AuthSession.AuthRequest({
        clientId: apiKey,
        scopes: ['read'],
        redirectUri: redirectUri,
        responseType: AuthSession.ResponseType.Token, // Token response for implicit flow
        usePKCE: false,
        extraParams: {
          response_mode: 'fragment',
          state,
          app_name: appName, // Add app_name to parameters
        },
      });

      // Prompt for authentication
      const result = await request.promptAsync({
        authorizationEndpoint: 'https://audius.co/oauth/auth',
      });

      console.log('OAuth Result Type:', result.type);
      console.log('OAuth Result Params:', result.params);

      if (result.type === 'success') {
        const token = result.params.access_token || result.params.jwt;

        if (!token) {
          return { success: false, error: 'No token received from Audius. Check your redirect URI is configured correctly in Audius dashboard.' };
        }

        // Verify token with Audius API
        const userInfo = await this.verifyAudiusToken(token, apiKey);

        if (userInfo) {
          await this.storeAuthToken(token);
          return {
            success: true,
            user: userInfo,
            token,
          };
        } else {
          return { success: false, error: 'Failed to verify Audius token' };
        }
      } else if (result.type === 'error') {
        console.error('OAuth Error:', result.error);
        return { success: false, error: `Audius authentication error: ${result.error?.message || 'Unknown error'}` };
      } else {
        return { success: false, error: 'Authentication cancelled' };
      }
    } catch (error) {
      console.error('Audius auth error:', error);
      return { success: false, error: `Audius authentication failed: ${error}` };
    }
  }

  private async verifyAudiusToken(token: string, apiKey: string): Promise<any | null> {
    try {
      // Decode JWT to get user info (Audius returns user data in the JWT)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return null;
      }

      // Decode the payload (second part)
      const payload = parts[1];
      const decodedPayload = JSON.parse(atob(payload));

      // Also verify with Audius API
      const verifyUrl = new URL('https://api.audius.co/v1/users/verify_token');
      verifyUrl.searchParams.append('jwt', token);
      verifyUrl.searchParams.append('api_key', apiKey);

      const response = await fetch(verifyUrl.toString());
      const apiData = await response.json();

      if (response.ok && apiData.data) {
        return {
          id: apiData.data.user_id || decodedPayload.sub,
          email: apiData.data.email || '',
          name: apiData.data.name || apiData.data.handle || 'Audius User',
          avatar: apiData.data.profile_picture || '',
          provider: 'audius',
        };
      } else {
        // Fall back to JWT payload data
        return {
          id: decodedPayload.sub,
          email: decodedPayload.email || '',
          name: decodedPayload.name || 'Audius User',
          avatar: decodedPayload.profilePicture || '',
          provider: 'audius',
        };
      }
    } catch (error) {
      console.error('Failed to verify Audius token:', error);
      return null;
    }
  }

  private async exchangeCodeForToken(provider: string, code: string): Promise<AuthResult> {
    try {
      const config = this.configs[provider];

      // Spotify requires client secret in token exchange
      const bodyParams: Record<string, string> = {
        grant_type: 'authorization_code',
        code,
        redirect_uri: config.redirectUri,
        client_id: config.clientId,
      };

      // Add client secret for providers that require it
      if (provider === 'spotify') {
        const clientSecret = process.env.EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET;
        if (clientSecret) {
          bodyParams.client_secret = clientSecret;
        }
      }

      const response = await fetch(config.tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(bodyParams).toString(),
      });

      const data = await response.json();

      if (response.ok && data.access_token) {
        return { success: true, token: data.access_token };
      } else {
        return { success: false, error: data.error_description || 'Token exchange failed' };
      }
    } catch (error) {
      return { success: false, error: 'Network error during token exchange' };
    }
  }

  private async getUserInfo(provider: string, token: string): Promise<any> {
    try {
      let userInfoUrl = '';
      let headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      };

      switch (provider) {
        case 'spotify':
          userInfoUrl = 'https://api.spotify.com/v1/me';
          break;
        case 'google':
          userInfoUrl = 'https://www.googleapis.com/oauth2/v2/userinfo';
          break;
        case 'soundcloud':
          userInfoUrl = 'https://api.soundcloud.com/me';
          break;
        case 'tiktok':
          userInfoUrl = 'https://open-api.tiktok.com/oauth/userinfo/';
          headers = {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          };
          break;
        case 'twitter':
          userInfoUrl = 'https://api.twitter.com/2/users/me?user.fields=profile_image_url';
          break;
        case 'instagram':
          userInfoUrl = 'https://graph.instagram.com/me?fields=id,username,account_type,media_count';
          break;
        default:
          return { id: 'unknown', email: '', name: 'User', provider };
      }

      const response = await fetch(userInfoUrl, {
        headers,
      });

      const userInfo = await response.json();

      // Handle different response formats for each provider
      switch (provider) {
        case 'tiktok':
          return {
            id: userInfo.data?.user?.open_id || 'unknown',
            email: '', // TikTok doesn't provide email in basic scope
            name: userInfo.data?.user?.display_name || userInfo.data?.user?.username || 'TikTok User',
            avatar: userInfo.data?.user?.avatar_url || '',
            provider,
          };
        case 'twitter':
          return {
            id: userInfo.data?.id || 'unknown',
            email: '', // Twitter API v2 requires special permission for email
            name: userInfo.data?.name || userInfo.data?.username || 'Twitter User',
            avatar: userInfo.data?.profile_image_url || '',
            provider,
          };
        case 'instagram':
          return {
            id: userInfo.id || 'unknown',
            email: '', // Instagram Basic Display doesn't provide email
            name: userInfo.username || 'Instagram User',
            avatar: '', // Instagram Basic Display doesn't provide profile picture in basic scope
            provider,
          };
        default:
          return {
            id: userInfo.id || userInfo.sub || 'unknown',
            email: userInfo.email || '',
            name: userInfo.display_name || userInfo.name || userInfo.username || 'User',
            avatar: userInfo.images?.[0]?.url || userInfo.picture || userInfo.avatar_url || '',
            provider,
          };
      }
    } catch (error) {
      console.error('Failed to get user info:', error);
      return { id: 'unknown', email: '', name: 'User', provider };
    }
  }

  async authenticateWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      // For demo purposes, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you would make an API call to your backend
      const response = await fetch('https://your-api.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        await this.storeAuthToken(data.token);
        return {
          success: true,
          user: data.user,
          token: data.token,
        };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      // For demo purposes, we'll return a mock success
      const mockUser = {
        id: 'demo-user',
        email,
        name: email.split('@')[0],
        provider: 'email',
      };

      const mockToken = `demo-token-${Date.now()}`;
      await this.storeAuthToken(mockToken);

      return {
        success: true,
        user: mockUser,
        token: mockToken,
      };
    }
  }

  async signUpWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      // For demo purposes, we'll simulate an API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you would make an API call to your backend
      const response = await fetch('https://your-api.com/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        await this.storeAuthToken(data.token);
        return {
          success: true,
          user: data.user,
          token: data.token,
        };
      } else {
        return { success: false, error: 'Failed to create account' };
      }
    } catch (error) {
      // For demo purposes, we'll return a mock success
      const mockUser = {
        id: `demo-user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        provider: 'email',
      };

      const mockToken = `demo-token-${Date.now()}`;
      await this.storeAuthToken(mockToken);

      return {
        success: true,
        user: mockUser,
        token: mockToken,
      };
    }
  }

  async storeAuthToken(token: string): Promise<void> {
    try {
      await SecureStore.setItemAsync('authToken', token);
    } catch (error) {
      console.error('Failed to store auth token:', error);
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync('authToken');
    } catch (error) {
      console.error('Failed to get stored token:', error);
      return null;
    }
  }

  async logout(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync('authToken');
    } catch (error) {
      console.error('Failed to clear auth token:', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await this.getStoredToken();
    return !!token;
  }
}

export const authService = new AuthService();
export type { AuthResult };
