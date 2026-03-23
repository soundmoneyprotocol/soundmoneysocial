import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { mockAuthService } from '../services/mockAuthService';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL for soundmoneymusic-main auth endpoints
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3000';

/**
 * API calls to soundmoneymusic-main auth endpoints
 */
const authApi = {
  async signup(email: string, password: string, username: string, referralCode?: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password, username, referralCode }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Signup failed');
    }
    return response.json();
  },

  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Login failed');
    }
    return response.json();
  },

  async logout(refreshToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      console.error('Logout failed:', response.statusText);
    }
    return response.json();
  },

  async getSession(accessToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      headers: { 'Authorization': `Bearer ${accessToken}` },
      credentials: 'include',
    });
    if (!response.ok) {
      throw new Error('Session check failed');
    }
    return response.json();
  },

  async refreshToken(refreshToken: string) {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) {
      throw new Error('Token refresh failed');
    }
    return response.json();
  },
};

/**
 * Token management helpers
 */
const tokenManager = {
  getAccessToken(): string | null {
    return sessionStorage.getItem('soundmoney_access_token');
  },

  getRefreshToken(): string | null {
    return sessionStorage.getItem('soundmoney_refresh_token');
  },

  setTokens(accessToken: string, refreshToken: string): void {
    sessionStorage.setItem('soundmoney_access_token', accessToken);
    sessionStorage.setItem('soundmoney_refresh_token', refreshToken);
  },

  clearTokens(): void {
    sessionStorage.removeItem('soundmoney_access_token');
    sessionStorage.removeItem('soundmoney_refresh_token');
    sessionStorage.removeItem('soundmoney_user');
  },

  setUser(user: User): void {
    sessionStorage.setItem('soundmoney_user', JSON.stringify(user));
  },

  getUser(): User | null {
    const user = sessionStorage.getItem('soundmoney_user');
    return user ? JSON.parse(user) : null;
  },
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from stored tokens
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const accessToken = tokenManager.getAccessToken();
        const storedUser = tokenManager.getUser();

        if (accessToken && storedUser) {
          try {
            // Validate token with server (skip for mock tokens)
            if (!accessToken.startsWith('mock_')) {
              const sessionData = await authApi.getSession(accessToken);
              setUser(sessionData.user);
            } else {
              setUser(storedUser);
            }
            setIsAuthenticated(true);
          } catch (error) {
            // Token might be expired, try to refresh
            const refreshToken = tokenManager.getRefreshToken();
            if (refreshToken && !refreshToken.startsWith('mock_')) {
              try {
                const newSession = await authApi.refreshToken(refreshToken);
                tokenManager.setTokens(newSession.access_token, newSession.refresh_token);
                const sessionData = await authApi.getSession(newSession.access_token);
                setUser(sessionData.user);
                setIsAuthenticated(true);
              } catch (refreshError) {
                // Refresh failed, clear tokens
                tokenManager.clearTokens();
                setUser(null);
                setIsAuthenticated(false);
              }
            } else if (refreshToken && refreshToken.startsWith('mock_')) {
              // Mock token, just restore user
              setUser(storedUser);
              setIsAuthenticated(true);
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      let response;
      
      try {
        // Try API first
        response = await authApi.login(email, password);
      } catch (apiError) {
        console.warn('API login failed, using mock auth:', apiError);
        // Fallback to mock auth
        const mockResponse = await mockAuthService.login(email, password);
        response = {
          user: mockResponse.user,
          session: {
            access_token: mockResponse.access_token,
            refresh_token: mockResponse.refresh_token,
          },
        };
      }

      if (response.user && response.session) {
        tokenManager.setTokens(response.session.access_token, response.session.refresh_token);
        tokenManager.setUser(response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      let response;
      
      try {
        // Try API first
        response = await authApi.signup(email, password, username);
      } catch (apiError) {
        console.warn('API signup failed, using mock auth:', apiError);
        // Fallback to mock auth
        const mockResponse = await mockAuthService.signup(email, password, username);
        response = {
          user: mockResponse.user,
          session: {
            access_token: mockResponse.access_token,
            refresh_token: mockResponse.refresh_token,
          },
        };
      }

      if (response.user && response.session) {
        tokenManager.setTokens(response.session.access_token, response.session.refresh_token);
        tokenManager.setUser(response.user);
        setUser(response.user);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const refreshToken = tokenManager.getRefreshToken();
      if (refreshToken && !refreshToken.startsWith('mock_')) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
    }
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
    tokenManager.setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
