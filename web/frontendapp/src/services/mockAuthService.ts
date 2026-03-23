/**
 * Mock Auth Service for testing
 * Provides local authentication without backend API
 */

export interface MockUser {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  user: MockUser;
}

// Mock database
const mockUsers: Record<string, { password: string; user: MockUser }> = {
  'test@example.com': {
    password: 'password123',
    user: {
      id: 'user-test-001',
      email: 'test@example.com',
      username: 'testuser',
      createdAt: new Date().toISOString(),
    },
  },
};

export const mockAuthService = {
  /**
   * Mock login - checks against local test credentials
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const account = mockUsers[email.toLowerCase()];
        
        if (!account) {
          reject(new Error('User not found'));
          return;
        }
        
        if (account.password !== password) {
          reject(new Error('Invalid password'));
          return;
        }
        
        // Generate mock tokens
        const accessToken = `mock_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const refreshToken = `mock_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        resolve({
          access_token: accessToken,
          refresh_token: refreshToken,
          user: account.user,
        });
      }, 500); // Simulate network delay
    });
  },

  /**
   * Mock signup - creates new mock user
   */
  async signup(email: string, password: string, username: string): Promise<AuthResponse> {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (mockUsers[email.toLowerCase()]) {
          reject(new Error('User already exists'));
          return;
        }
        
        const newUser: MockUser = {
          id: `user-${Date.now()}`,
          email,
          username,
          createdAt: new Date().toISOString(),
        };
        
        mockUsers[email.toLowerCase()] = {
          password,
          user: newUser,
        };
        
        const accessToken = `mock_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const refreshToken = `mock_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        resolve({
          access_token: accessToken,
          refresh_token: refreshToken,
          user: newUser,
        });
      }, 500);
    });
  },

  /**
   * Mock session validation
   */
  async getSession(accessToken: string): Promise<{ user: MockUser }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // For mock, just return a user based on token
        const firstUser = Object.values(mockUsers)[0];
        resolve({ user: firstUser.user });
      }, 100);
    });
  },

  /**
   * Mock token refresh
   */
  async refreshToken(): Promise<{ access_token: string; refresh_token: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          access_token: `mock_access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          refresh_token: `mock_refresh_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        });
      }, 100);
    });
  },
};
