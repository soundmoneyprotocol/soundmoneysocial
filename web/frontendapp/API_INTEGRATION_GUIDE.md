# SoundMoney API Integration Guide

## Overview

This guide explains how to integrate the centralized SoundMoney API (`api.soundmoneyprotocol.xyz`) into your applications:

- 📱 **Mobile App** (React Native) - soundmoneyapp
- 🌐 **PWA Web App** (React) - soundmoneysocial at `app.soundmoneyprotocol.xyz`

The API services are **platform-agnostic** and work seamlessly on both mobile and web.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│         api.soundmoneyprotocol.xyz (Backend)            │
├─────────────────────────────────────────────────────────┤
│  • Auth (signup, signin, token refresh)                │
│  • Artist Dashboard (streaming, copyright, DeFi)       │
│  • User profiles, notifications, transactions          │
│  • Wallet operations, token management                 │
│  • Payment processing (Stripe webhooks)                │
└─────────────────────────────────────────────────────────┘
           ▲              ▲              ▲
           │              │              │
    ┌──────┴──┐    ┌──────┴──┐    ┌────┴──────┐
    │  Mobile │    │   PWA   │    │  Other    │
    │   App   │    │   App   │    │   Apps    │
    └─────────┘    └─────────┘    └───────────┘
```

---

## Quick Start

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js  # Still needed for Supabase (if using)
```

### 2. Initialize in Your App

#### For React PWA (soundmoneysocial)

**In `src/main.tsx` or `src/index.tsx`:**

```typescript
import { initializeApiServices } from '@/services/api';

// Initialize all API services
const { apiClient, authService, dashboardService } = initializeApiServices(
  'https://api.soundmoneyprotocol.xyz'
);

// Services are now ready to use globally
// Access via: AuthService.getInstance(), ArtistDashboardService.getInstance()
```

**Or in your Root Component:**

```typescript
import { useEffect } from 'react';
import { initializeApiServices } from '@/services/api';

function App() {
  useEffect(() => {
    // Initialize API services
    initializeApiServices('https://api.soundmoneyprotocol.xyz');
  }, []);

  return (
    // Your app components
  );
}
```

#### For Mobile App (React Native)

```typescript
import { initializeApiServices } from '@/services/api';

// In your app entry point
const { apiClient, authService, dashboardService } = initializeApiServices(
  'https://api.soundmoneyprotocol.xyz'
);

// Identical API to PWA!
```

---

## Usage Examples

### Authentication

#### Sign Up

```typescript
import { AuthService } from '@/services/api';

const authService = AuthService.getInstance();

const response = await authService.signUp({
  email: 'artist@example.com',
  password: 'securePassword',
  username: 'my_artist_name',
  displayName: 'My Artist Name',
});

if (response.success) {
  console.log('User created:', response.data?.user);
  // User is automatically authenticated
} else {
  console.error('Signup failed:', response.error);
}
```

#### Sign In

```typescript
const response = await authService.signIn({
  email: 'artist@example.com',
  password: 'securePassword',
});

if (response.success) {
  // Token is automatically stored and set in API client
  console.log('Signed in as:', response.data?.user.username);
} else {
  console.error('Login failed:', response.error);
}
```

#### Check Authentication

```typescript
const isLoggedIn = authService.isAuthenticated();
const currentUser = authService.getCurrentUserSync();

if (isLoggedIn) {
  console.log('Logged in as:', currentUser?.username);
}
```

#### Sign Out

```typescript
await authService.signOut();
console.log('Signed out successfully');
```

### Artist Dashboard

#### Get Streaming Metrics

```typescript
import { ArtistDashboardService } from '@/services/api';

const dashboardService = ArtistDashboardService.getInstance();

const response = await dashboardService.getStreamingMetrics('30d');

if (response.success) {
  const metrics = response.data;
  console.log(`Total earnings: $${metrics.totalEarnings}`);
  console.log(`Total streams: ${metrics.totalStreams}`);
  console.log('Top tracks:', metrics.topTracks);
}
```

#### Get Dashboard Overview

```typescript
const response = await dashboardService.getDashboardSummary();

if (response.success) {
  const { profile, analytics, streaming } = response.data;

  console.log('Profile:', profile);
  console.log('Analytics:', analytics);
  console.log('Streaming:', streaming);
}
```

#### Update Profile

```typescript
const response = await dashboardService.updateUserProfile({
  displayName: 'Updated Artist Name',
  bio: 'New bio here',
  website: 'https://mywebsite.com',
  socialLinks: {
    twitter: 'https://twitter.com/myartist',
    instagram: 'https://instagram.com/myartist',
  },
});

if (response.success) {
  console.log('Profile updated:', response.data);
}
```

#### Get Copyright Reports

```typescript
const response = await dashboardService.getCopyrightReports('pending');

if (response.success) {
  const reports = response.data;
  console.log(`Pending copyright reports: ${reports.length}`);

  reports.forEach(report => {
    console.log(`- ${report.platform}: ${report.status} (${report.rewardAmount} SOUND)`);
  });
}
```

#### Submit Copyright Claim

```typescript
const response = await dashboardService.submitCopyrightClaim({
  trackId: 'track_123',
  platform: 'soundcloud',
  url: 'https://soundcloud.com/user/infringing-track',
  violationType: 'unauthorized_use',
  description: 'Someone is using my track without permission',
  evidenceUrls: [
    'https://proof.example.com/evidence1.jpg',
    'https://proof.example.com/evidence2.jpg',
  ],
});

if (response.success) {
  console.log('Copyright claim submitted:', response.data);
}
```

#### Claim Copyright Rewards

```typescript
const response = await dashboardService.claimCopyrightRewards('report_123');

if (response.success) {
  console.log('Rewards claimed:', response.data);
  console.log('Transaction:', response.data.transactionSignature);
}
```

#### Get DeFi Positions

```typescript
const response = await dashboardService.getDefiPositions();

if (response.success) {
  const positions = response.data;

  positions.forEach(position => {
    console.log(`${position.poolName}: ${position.currentValue} (${position.apy}% APY)`);
  });
}
```

#### Deposit to DeFi Pool

```typescript
const response = await dashboardService.depositToPool({
  poolId: 'pool_bezy_usdc',
  amount: 1000, // 1000 USDC
});

if (response.success) {
  console.log('Deposited to pool:', response.data);
}
```

#### Get Notifications

```typescript
const response = await dashboardService.getNotifications(10);

if (response.success) {
  const notifications = response.data;
  console.log(`You have ${notifications.length} recent notifications`);
}
```

---

## API Client Features

### Error Handling

All API methods return an `ApiResponse` object:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}
```

**Best Practice:**

```typescript
const response = await authService.signIn({...});

if (response.success) {
  // Access response.data
  console.log('User:', response.data?.user);
} else {
  // Handle error
  console.error('Error:', response.error);
  console.log('Status:', response.statusCode);
}
```

### Authentication Token Management

Tokens are automatically managed:

1. **Saved to localStorage** after login
2. **Restored from localStorage** on app startup
3. **Included in all requests** via Authorization header
4. **Cleared on logout**

### Request Configuration

```typescript
const apiClient = SoundMoneyApiClient.getInstance();

// Get base URL
const baseUrl = apiClient.getBaseURL();

// Get current token
const token = apiClient.getAuthToken();

// Set new token programmatically
apiClient.setAuthToken('new_token_here');

// Check API health
const isHealthy = await apiClient.health();
```

---

## Environment Configuration

### React PWA (.env)

```env
# API Configuration
REACT_APP_API_BASE_URL=https://api.soundmoneyprotocol.xyz
REACT_APP_API_TIMEOUT=30000

# Supabase (if still using for real-time)
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_KEY=your-key

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_key
```

### Usage

```typescript
const baseURL = process.env.REACT_APP_API_BASE_URL || 'https://api.soundmoneyprotocol.xyz';

const { apiClient, authService, dashboardService } = initializeApiServices(baseURL);
```

---

## API Endpoints Reference

### Authentication Endpoints

```
POST   /auth/signup              - Create new account
POST   /auth/signin              - Login user
POST   /auth/signout             - Logout user
POST   /auth/refresh             - Refresh auth token
GET    /auth/me                  - Get current user
POST   /auth/verify-email        - Verify email with code
POST   /auth/reset-password      - Request password reset
POST   /auth/reset-password-confirm - Confirm new password
```

### Artist Dashboard Endpoints

```
GET    /dashboard/profile        - Get user profile
PATCH  /dashboard/profile        - Update user profile
GET    /dashboard/analytics      - Get dashboard analytics
GET    /dashboard/streaming-metrics - Get streaming data
GET    /dashboard/copyright-reports - Get copyright reports
POST   /dashboard/copyright-claims  - Submit copyright claim
POST   /dashboard/copyright-reports/{id}/claim-rewards - Claim copyright rewards
GET    /dashboard/defi-positions  - Get DeFi positions
POST   /dashboard/defi-positions  - Deposit to pool
POST   /dashboard/defi-positions/{id}/withdraw - Withdraw from pool
POST   /dashboard/defi-positions/{id}/claim-rewards - Claim DeFi rewards
GET    /dashboard/streaming-sessions - Get streaming sessions
GET    /dashboard/top-tracks     - Get top performing tracks
GET    /dashboard/notifications  - Get notifications
POST   /dashboard/notifications/{id}/read - Mark notification as read
GET    /dashboard/notification-preferences - Get notification settings
PATCH  /dashboard/notification-preferences - Update notification settings
GET    /dashboard/transactions   - Get transaction history
GET    /dashboard/export         - Export data (CSV/PDF)
GET    /dashboard/summary        - Get full dashboard summary
```

---

## Common Patterns

### React Hook for Authentication

```typescript
import { useEffect, useState } from 'react';
import { AuthService, User } from '@/services/api';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const authService = AuthService.getInstance();
    setUser(authService.getCurrentUserSync());
    setIsLoading(false);
  }, []);

  return { user, isLoading };
}
```

### React Hook for Dashboard Data

```typescript
import { useEffect, useState } from 'react';
import { ArtistDashboardService, DashboardAnalytics } from '@/services/api';

export function useDashboardAnalytics() {
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      const dashboardService = ArtistDashboardService.getInstance();
      const response = await dashboardService.getDashboardAnalytics('30d');

      if (response.success) {
        setAnalytics(response.data || null);
      } else {
        setError(response.error || 'Failed to load analytics');
      }
      setLoading(false);
    };

    loadAnalytics();
  }, []);

  return { analytics, loading, error };
}
```

---

## Testing

### Test Sign In/Out

```typescript
import { AuthService, initializeApiServices } from '@/services/api';

describe('Auth Service', () => {
  beforeAll(() => {
    initializeApiServices('https://api.soundmoneyprotocol.xyz');
  });

  test('should sign in user', async () => {
    const authService = AuthService.getInstance();
    const response = await authService.signIn({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(response.success).toBe(true);
    expect(response.data?.user).toBeDefined();
  });

  test('should sign out user', async () => {
    const authService = AuthService.getInstance();
    const response = await authService.signOut();

    expect(response.success).toBe(true);
    expect(authService.isAuthenticated()).toBe(false);
  });
});
```

---

## Troubleshooting

### Issue: "API Client not initialized"

**Solution:** Call `initializeApiServices()` before using services:

```typescript
const { authService } = initializeApiServices();
await authService.signIn({...});
```

### Issue: Unauthorized (401) errors

**Solution:** Ensure auth token is being saved/restored:

```typescript
const authService = AuthService.getInstance();
const isAuthenticated = authService.isAuthenticated();

if (!isAuthenticated) {
  // Redirect to login
}
```

### Issue: CORS errors

**Solution:** Backend must be configured to accept requests from your domain:

```
ALLOWED_ORIGINS=https://app.soundmoneyprotocol.xyz,http://localhost:3000
```

### Issue: Timeout errors

**Solution:** Increase timeout for slow connections:

```typescript
const { apiClient } = initializeApiServices();
// Timeout is set to 30 seconds by default
```

---

## Migration from Old Services

### Before (Old Approach)

```typescript
import { supabase } from './services/supabase';
import { SolanaBlockchainService } from './services/solana';

// Scattered, hard to maintain
const { data } = await supabase.from('users').select('*');
```

### After (API-First Approach)

```typescript
import { AuthService, ArtistDashboardService } from '@/services/api';

// Centralized, consistent
const authService = AuthService.getInstance();
const user = await authService.getCurrentUser();
```

---

## Next Steps

1. ✅ Copy API services to your projects
2. ✅ Initialize services in your app
3. ✅ Update authentication flows to use AuthService
4. ✅ Build artist dashboard with ArtistDashboardService
5. ✅ Test all workflows
6. ✅ Deploy to production

---

## Support

For API endpoint details and requirements, contact your backend team or check:
- `https://api.soundmoneyprotocol.xyz/docs` (if available)
- Your backend API documentation
- Postman collection (if available)
