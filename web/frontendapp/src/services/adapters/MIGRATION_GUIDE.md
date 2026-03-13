# Migration Guide: React Native Services to Web Adapters

This guide explains how to update extracted React Native services to use the web compatibility adapters.

## Quick Reference

| React Native Import | Web Replacement | Adapter |
|---|---|---|
| `import AsyncStorage from '@react-native-async-storage/async-storage'` | `import { storageAdapter } from '@/services/adapters'` | storageAdapter |
| `import { Alert } from 'react-native'` | `import { alertAdapter } from '@/services/adapters'` | alertAdapter |
| `import { Platform } from 'react-native'` | `import { platformAdapter } from '@/services/adapters'` | platformAdapter |
| `import { initStripe } from '@stripe/stripe-react-native'` | `import { stripeAdapter } from '@/services/adapters'` | stripeAdapter |

## Migration Examples

### 1. AsyncStorage → storageAdapter

**Before (React Native):**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

export const sessionManagementService = {
  async saveSession(token: string) {
    await AsyncStorage.setItem('authToken', token);
  },

  async getSession(): Promise<string | null> {
    return await AsyncStorage.getItem('authToken');
  },
};
```

**After (Web):**
```typescript
import { storageAdapter } from '@/services/adapters';

export const sessionManagementService = {
  async saveSession(token: string) {
    await storageAdapter.setItem('authToken', token);
  },

  async getSession(): Promise<string | null> {
    return await storageAdapter.getItem('authToken');
  },
};
```

**Key Changes:**
- Replace `AsyncStorage` with `storageAdapter`
- API remains the same (getItem, setItem, removeItem, etc.)
- No logic changes needed - adapters handle the platform differences

### 2. Alert → alertAdapter

**Before (React Native):**
```typescript
import { Alert } from 'react-native';

export const authService = {
  async login(email: string, password: string) {
    try {
      // login logic
    } catch (error) {
      Alert.alert('Login Failed', 'Invalid email or password');
    }
  },
};
```

**After (Web):**
```typescript
import { alertAdapter } from '@/services/adapters';

export const authService = {
  async login(email: string, password: string) {
    try {
      // login logic
    } catch (error) {
      alertAdapter.error('Invalid email or password', 'Login Failed');
    }
  },
};
```

**Key Changes:**
- Replace `Alert.alert()` with `alertAdapter.alert()` or `alertAdapter.error()`
- Web uses `window.alert()` which has different parameter order
- Use `alertAdapter.error()`, `alertAdapter.warn()`, `alertAdapter.success()`, `alertAdapter.info()` for semantic clarity

### 3. Platform → platformAdapter

**Before (React Native):**
```typescript
import { Platform } from 'react-native';

export const intercomService = {
  async initialize() {
    if (Platform.OS === 'ios') {
      // iOS-specific setup
    } else if (Platform.OS === 'android') {
      // Android-specific setup
    }
  },
};
```

**After (Web):**
```typescript
import { platformAdapter } from '@/services/adapters';

export const intercomService = {
  async initialize() {
    // Remove platform-specific branches since this is web-only
    // Or use platform detection for responsive behavior:
    if (platformAdapter.isMobile) {
      // Mobile web-specific setup
    } else if (platformAdapter.isDesktop) {
      // Desktop web-specific setup
    }
  },
};
```

**Key Changes:**
- Remove iOS/Android-specific code (not applicable to web)
- Replace with web-appropriate alternatives (isMobile, isDesktop, etc.)
- For universal logic, simply remove the condition

### 4. Stripe React Native → stripeAdapter

**Before (React Native):**
```typescript
import { initStripe, createPaymentMethod } from '@stripe/stripe-react-native';

export const stripeService = {
  async initializePayment(publishableKey: string) {
    const { publicKey } = await initStripe({
      publishableKey,
      merchantIdentifier: 'com.soundmoney.app',
    });
  },

  async processPayment(cardData: any) {
    const { paymentMethod, error } = await createPaymentMethod({
      paymentMethodType: 'Card',
      paymentMethodData: cardData,
    });
  },
};
```

**After (Web):**
```typescript
import { stripeAdapter } from '@/services/adapters';

export const stripeService = {
  async initializePayment(publishableKey: string) {
    const stripe = await stripeAdapter.initStripe(publishableKey);
    return stripe;
  },

  async processPayment(stripe: any, elements: any, billingDetails: any) {
    const { paymentMethod, error } = await stripeAdapter.createPaymentMethod(
      stripe,
      elements,
      billingDetails
    );

    if (error) {
      console.error('Payment error:', error);
      return null;
    }

    return paymentMethod;
  },
};
```

**Key Changes:**
- Use `stripeAdapter.initStripe()` instead of `initStripe()`
- Parameters and return values differ - see stripeAdapter documentation
- Web requires Stripe Elements for card input (not included in adapter)
- Error handling is similar but error object structure may differ

## Files Affected by Migration

### Files using AsyncStorage (20):
- earningsEnrollmentService.ts
- creatorTokenService.ts
- privacySecurityService.ts
- tokenCuratedPlaylistService.ts
- solanaService.ts
- phantomWalletService.ts
- intercomService.ts
- communityService.ts
- referralRewardService.ts
- subscriptionService.ts
- activityTrackingService.ts
- sessionManagementService.ts
- creatorFundingService.ts
- walletManagementService.ts
- profileService.ts
- feedDiscoveryService.ts
- multiChainService.ts
- (3 additional files)

### Files using Alert (1):
- authService.ts

### Files using Platform (1):
- intercomService.ts

### Files using Stripe React Native (1):
- stripeService.ts

## Best Practices

1. **Test after each migration**: Verify that storage persists, alerts display, and payments work
2. **Keep imports consistent**: Always import from `@/services/adapters` to maintain consistency
3. **Remove platform conditionals**: Web-only code doesn't need iOS/Android branches
4. **Handle storage errors**: AsyncStorage on web returns null on error - always check for null
5. **Use TypeScript types**: Adapters include proper TypeScript types, leverage them

## Async Consistency

All adapters return Promises even where localStorage is synchronous. This maintains API compatibility:

```typescript
// Even though localStorage is sync, storage adapter returns Promise
const value = await storageAdapter.getItem('key'); // Returns Promise
```

## Additional Resources

- [storageAdapter Documentation](./storageAdapter.ts) - Full storage API with JSON support
- [alertAdapter Documentation](./alertAdapter.ts) - Alert types and confirmation dialogs
- [platformAdapter Documentation](./platformAdapter.ts) - Device detection and browser info
- [stripeAdapter Documentation](./stripeAdapter.ts) - Payment processing API

## Questions or Issues?

If a service doesn't fit the adapter pattern:
1. Check if the feature is essential for web (sometimes mobile-only features can be removed)
2. Create a custom adapter if needed
3. Mark unsupported features with `TODO` comments for future reference
