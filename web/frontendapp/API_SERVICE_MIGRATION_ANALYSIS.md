# API Services Migration: React Native → React PWA

## Comparison Analysis

This document outlines the migration of 4 core API services from the React Native soundmoneyapp to the React PWA soundmoneysocial web app.

---

## Services Overview

| Service | Files | Purpose | Platform-Specific Code |
|---------|-------|---------|------------------------|
| **SoundMoney Ecosystem** | soundmoney.ts | Main orchestration layer | None (depends on sub-services) |
| **Supabase** | supabase.ts | Database & auth | Minimal (env vars) |
| **Solana Blockchain** | solana.ts | Wallet & token ops | Heavy (Linking, SecureStore) |
| **Stripe Payment** | stripe.ts | Subscription & payments | Heavy (@stripe/stripe-react-native) |

---

## Detailed Migration Plan

### 1. SoundMoney Ecosystem Service ✅ (Mostly Compatible)

**React Native Code:**
```typescript
// soundmoney.ts (500+ lines)
- SoundMoneyEcosystemService singleton
- Integrates: Supabase, Stripe, Solana services
- Methods: initialize(), completeOnboarding(), startStreamingSession(), etc.
```

**Migration Level:** 90% Compatible
- ✅ Can use as-is
- ⚠️ Depends on updating sub-service imports
- ⚠️ Adjust Stripe error types

**Changes Needed:**
```diff
- import StripePaymentService from './stripe';  // React Native Stripe
+ import StripePaymentService from './stripe-web';  // Web Stripe adapter
```

---

### 2. Supabase Service ✅ (Fully Compatible)

**React Native Code:**
```typescript
// supabase.ts (400+ lines)
- Supabase client initialization
- Auth: SupabaseAuthService
- Database: UserProfileService, StreamingService, CopyrightService, DeFiPoolService, LiveStreamService
- Analytics: AnalyticsService
```

**Migration Level:** 100% Compatible
- ✅ No React Native dependencies
- ✅ @supabase/supabase-js works on web out-of-the-box

**Changes Needed:**
```diff
- const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL
+ const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL
```

Just rename env vars from `EXPO_PUBLIC_*` to `REACT_APP_*`

---

### 3. Solana Blockchain Service ⚠️ (Needs Adaptation)

**React Native Code:**
```typescript
// solana.ts (530+ lines)
- Wallet connection via deep linking
- Secure storage with expo-secure-store
- Connection management
- Token balance fetching
- Transaction simulation
```

**Migration Level:** 70% Compatible

**React Native Dependencies:**
```typescript
import * as SecureStore from 'expo-secure-store';  // ❌ Not available on web
import { Linking } from 'react-native';             // ❌ Not available on web
```

**Web Replacements:**
- `expo-secure-store` → `localStorage` (or IndexedDB for better security)
- `react-native Linking` → Standard wallet adapter protocol

**Key Changes:**
```typescript
// OLD: React Native deep linking
await Linking.openURL(walletUrl);
Linking.addEventListener('url', callback);

// NEW: Web wallet adapter
const walletAdapter = await walletAdapterService.connect();
```

---

### 4. Stripe Payment Service ⚠️ (Needs Rewrite)

**React Native Code:**
```typescript
// stripe.ts (520+ lines)
- Uses @stripe/stripe-react-native
- initPaymentSheet, presentPaymentSheet
- Mobile payment UI
```

**Migration Level:** 50% Compatible

**React Native Dependencies:**
```typescript
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native';
```

**Web Replacement:**
```typescript
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
```

**Key Differences:**
| Aspect | React Native | React PWA |
|--------|--------------|-----------|
| **Setup** | initPaymentSheet() | <Elements provider> |
| **UI** | Native sheet modal | React component |
| **Card Input** | Built-in | CardElement component |
| **Context** | useStripe hook | useStripe hook |

---

## Migration Strategy

### Phase 1: Direct Ports (No Changes)
- ✅ supabase.ts → Copy as-is (env vars only)
- ✅ soundmoney.ts → Copy as-is (update imports)

### Phase 2: Adapter Ports (Small Changes)
- ⚠️ solana.ts → Create solana-web.ts with wallet adapter integration
- ⚠️ stripe.ts → Create stripe-web.ts with React Stripe components

### Phase 3: Integration
- Update imports in soundmoney.ts
- Create wrapper components for Stripe payment flows
- Test all wallet operations

---

## File Structure After Migration

```
src/services/
├── api/
│   ├── soundmoneyEcosystem.ts       ✅ (migrated)
│   ├── supabase.ts                  ✅ (migrated)
│   ├── solanaBlockchain.ts          ⚠️ (adapted)
│   └── stripePayments.ts            ⚠️ (rewritten)
├── extracted/                        (existing)
└── [existing services]
```

---

## API Compatibility

### Supabase Service (100% Compatible)

**Classes:** 6 - All web compatible
- SupabaseAuthService ✅
- UserProfileService ✅
- StreamingService ✅
- CopyrightService ✅
- DeFiPoolService ✅
- LiveStreamService ✅
- AnalyticsService ✅

---

### Solana Service (70% Compatible)

**Classes:** 1 - SolanaBlockchainService

**Methods:**
- `connectMobileWallet()` ⚠️ Needs wallet adapter refactor
- `disconnectWallet()` ⚠️ Needs localStorage update
- `getCurrentWallet()` ⚠️ Needs localStorage update
- `getSolBalance()` ✅ Full compatibility
- `getTokenBalances()` ✅ Full compatibility
- `startStreamingSession()` ✅ Full compatibility
- `endStreamingSession()` ✅ Full compatibility
- `claimStreamingRewards()` ✅ Full compatibility
- `claimCopyrightRewards()` ✅ Full compatibility
- `sendTokens()` ✅ Full compatibility
- `getTransactionHistory()` ✅ Full compatibility

**Not Needed for Web:**
- SecureStore usage → Use localStorage instead
- Linking usage → Use wallet adapter protocol

---

### Stripe Service (50% Compatible)

**Classes:** 1 - StripePaymentService

**Methods:**
- `subscribeToTier()` ⚠️ Payment sheet needs React component
- `processFiatOnramp()` ⚠️ Payment sheet needs React component
- `cancelSubscription()` ✅ Full compatibility
- `getPaymentMethods()` ✅ Full compatibility
- `updateDefaultPaymentMethod()` ✅ Full compatibility
- `getSubscriptionStatus()` ✅ Full compatibility

**React Native → React Changes:**
```typescript
// OLD: Imperative
const { error } = await initPaymentSheet({ ...config });
const { error: presentError } = await presentPaymentSheet();

// NEW: Declarative
<StripePaymentForm
  tierConfig={tier}
  onSuccess={handleSuccess}
  onError={handleError}
/>
```

---

### SoundMoney Service (95% Compatible)

**Classes:** 1 - SoundMoneyEcosystemService

**Methods:** All compatible once sub-services are migrated

**Depends On:**
- SupabaseAuthService ✅
- UserProfileService ✅
- StreamingService ✅
- CopyrightService ✅
- SolanaBlockchainService ⚠️
- StripePaymentService ⚠️

---

## Environment Variables Mapping

### React Native (Expo)
```env
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=...
EXPO_PUBLIC_SOLANA_RPC_URL=...
EXPO_PUBLIC_SOUND_TOKEN_MINT=...
EXPO_PUBLIC_BEZY_TOKEN_MINT=...
EXPO_PUBLIC_SOUNDMONEY_PROGRAM_ID=...
```

### React Web (Create React App)
```env
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_KEY=...
REACT_APP_STRIPE_PUBLISHABLE_KEY=...
REACT_APP_SOLANA_RPC_URL=...
REACT_APP_SOUND_TOKEN_MINT=...
REACT_APP_BEZY_TOKEN_MINT=...
REACT_APP_SOUNDMONEY_PROGRAM_ID=...
```

---

## Dependencies

### To Install
```bash
npm install @stripe/react-stripe-js @stripe/js
npm install @solana/web3.js @solana/wallet-adapter-react
# Already installed: @supabase/supabase-js
```

### To Remove
- `expo-secure-store` (replaced with localStorage)
- `@stripe/stripe-react-native` (replaced with @stripe/react-stripe-js)
- Anything else `expo-` related

---

## Testing Checklist

### Supabase Service
- [ ] Sign up / Sign in / Sign out
- [ ] Get current user
- [ ] Create/update user profile
- [ ] Link wallet
- [ ] Create streaming session
- [ ] Query streaming sessions
- [ ] Subscribe to real-time updates
- [ ] Create copyright report
- [ ] Get pool positions
- [ ] Create/update live streams

### Solana Service
- [ ] Connect wallet (via adapter)
- [ ] Disconnect wallet
- [ ] Get wallet balance
- [ ] Get token balances
- [ ] Fetch transaction history

### Stripe Service
- [ ] Subscribe to tier (via React component)
- [ ] Process fiat onramp
- [ ] Cancel subscription
- [ ] Get payment methods
- [ ] Get subscription status

### SoundMoney Orchestration
- [ ] Complete onboarding (create user + wallet + subscription)
- [ ] Start streaming session
- [ ] End streaming session
- [ ] Submit copyright report
- [ ] Claim rewards
- [ ] Get dashboard analytics

---

## Known Issues & Workarounds

### Issue 1: Wallet Connection
**Problem:** React Native uses deep linking, web doesn't
**Solution:** Use wallet adapter protocol (`?walletAddress=...`)
**Status:** ✅ Solved with walletAdapterService

### Issue 2: Secure Storage
**Problem:** React Native has expo-secure-store
**Solution:** Use localStorage (or IndexedDB for better security)
**Status:** ✅ Solved with storageAdapter

### Issue 3: Payment Sheet
**Problem:** React Native has native payment sheet
**Solution:** React Stripe components
**Status:** ⚠️ Needs new React component wrapper

### Issue 4: Environment Variables
**Problem:** React Native uses EXPO_PUBLIC_*, React uses REACT_APP_*
**Solution:** Update .env file
**Status:** ✅ Simple rename

---

## Timeline

| Phase | Task | Duration | Priority |
|-------|------|----------|----------|
| 1 | Migrate Supabase service | 0.5 hrs | 🔴 Critical |
| 2 | Migrate SoundMoney service | 0.5 hrs | 🔴 Critical |
| 3 | Adapt Solana service | 1.5 hrs | 🔴 Critical |
| 4 | Rewrite Stripe service | 2 hrs | 🟡 High |
| 5 | Create Stripe React components | 1.5 hrs | 🟡 High |
| 6 | Integration testing | 1.5 hrs | 🟡 High |
| 7 | E2E testing | 2 hrs | 🟢 Medium |

**Total Estimated Time:** 8-9 hours

---

## Next Steps

1. ✅ Review this migration analysis
2. ⏳ Migrate supabase.ts (copy + env var changes)
3. ⏳ Migrate soundmoney.ts (copy + import updates)
4. ⏳ Create solana-blockchain-web.ts (adapter)
5. ⏳ Create stripe-payments-web.ts (rewrite)
6. ⏳ Create Stripe React components
7. ⏳ Integration testing

---

## Questions?

Refer to the individual migrated service files for:
- Detailed API documentation
- Usage examples
- Testing procedures
- Troubleshooting guides
