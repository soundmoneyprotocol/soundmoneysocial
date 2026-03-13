# Mobile Wallet Adapter Integration Guide

## Overview

This document covers the integration of Solana Mobile Wallet Adapter (MWA) for testing and mobile wallet support on the SoundMoney Social web app.

## What's Implemented

### 1. Mobile Wallet Adapter Services

#### `walletAdapterService.ts`
Core service for wallet management and operations:

```typescript
import { walletAdapterService } from '@/services/walletAdapterService';

// Get wallet configuration
const config = walletAdapterService.getWalletConfig('mainnet-beta');

// Check available wallets
const wallets = walletAdapterService.getAvailableWallets();
const recommended = walletAdapterService.getRecommendedWallet();

// Format SOL amounts
const sol = walletAdapterService.formatSol(1000000000); // 1 SOL
const lamports = walletAdapterService.toLamports(1); // 1e9 lamports

// Format addresses
const short = walletAdapterService.getShortAddress(publicKeyString);
```

#### `walletInjectionService.ts`
Testing utilities for injecting mock wallets:

```typescript
import { walletInjectionService } from '@/services/walletInjectionService';

// Inject mock wallets for testing
walletInjectionService.injectPhantomWallet({
  publicKey: 'PhantomTestKey123456789',
  autoApprove: true
});

walletInjectionService.injectMobileWalletAdapter({
  publicKey: 'MobileWalletTestKey123456789',
  autoApprove: true
});

// Or inject all at once
walletInjectionService.injectAllWallets();

// Get console injection script
const script = walletInjectionService.getConsoleInjectionScript();
console.log(script); // Can be pasted directly into browser console

// Clean up
walletInjectionService.cleanup();
```

### 2. Custom React Hook

#### `useWalletAdapter.ts`
React hook for wallet integration in components:

```typescript
import { useWalletAdapter } from '@/hooks/useWalletAdapter';

function MyWalletComponent() {
  const {
    connected,
    publicKey,
    wallet,
    balance,
    loading,
    error,
    formattedAddress,
    connect,
    disconnect,
    getBalance,
    signTransaction,
    sendTransaction,
  } = useWalletAdapter();

  return (
    <div>
      {!connected ? (
        <button onClick={connect} disabled={loading}>
          {loading ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <>
          <p>Address: {formattedAddress}</p>
          <p>Balance: {balance?.formatted}</p>
          <button onClick={disconnect}>Disconnect</button>
        </>
      )}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
```

### 3. PWA Configuration

#### `manifest.json`
Complete PWA manifest with:
- Mobile optimizations
- App icons (192x512px)
- Shortcuts for quick access to Feed, Dashboard, Analytics, Community
- Share target for native sharing
- Display mode: standalone
- Theme colors for light/dark mode

#### `service-worker.js`
Service Worker implementation:
- **Cache Strategies:**
  - Static assets: Cache-first (CSS, JS, images, fonts)
  - API calls: Network-first with fallback to cache
  - Navigation: Network-first with offline fallback
- **Background Sync:** Wallet and post synchronization
- **Push Notifications:** Message and engagement notifications
- **Offline Support:** Full app functionality offline

#### Updated `index.html`
- PWA meta tags and manifest link
- Mobile viewport optimization
- Theme color configuration
- Apple-specific mobile web app tags
- Service Worker auto-registration script
- Standalone mode detection
- Install prompt handling

### 4. Bubblewrap Configuration

#### `bubblewrap.json`
Android PWA wrapper configuration:
- Package ID: `xyz.soundmoney.social`
- Minimum SDK: 21 (Android 5.0)
- Target SDK: 33 (Android 13)
- App shortcuts for quick navigation
- Share target for media sharing
- Offline support enabled
- Payment capabilities enabled

## Installation & Setup

### 1. Install Dependencies

```bash
cd /Users/casmirpatterson/soundmoney/soundmoneysocial/web/frontendapp
npm install
```

This installs:
- `@solana-mobile/wallet-standard-mobile` - MWA standard
- `@solana/wallet-adapter-react` - React integration
- `@solana/wallet-adapter-react-ui` - Pre-built UI components
- `@solana/web3.js` - Solana blockchain client
- `workbox-cli` - PWA caching utilities
- `@bubblewrap/cli` - Android PWA wrapper

### 2. Build for Production

```bash
npm run build
```

### 3. Build PWA with Service Worker

```bash
npm run pwa:build
```

### 4. Create Android App (Bubblewrap)

```bash
# Initialize Bubblewrap project
npm run pwa:bubblewrap

# Or manually:
npx @bubblewrap/cli init \
  --manifest public/manifest.json \
  --package-id xyz.soundmoney.social \
  --app-name "SoundMoney Social"
```

## Testing Mobile Wallet Adapter

### Method 1: Console Injection (Easiest)

1. Open SoundMoney Social in Chrome
2. Open Chrome DevTools (F12)
3. Go to Console tab
4. Get the injection script:

```javascript
// In your app, call:
const script = walletInjectionService.getConsoleInjectionScript({
  publicKey: 'YourTestPublicKey123456789'
});
console.log(script);
```

5. Copy the output and paste it directly into Chrome console
6. Press Enter to inject mock wallets

### Method 2: Programmatic Injection

In a React component or during app initialization:

```typescript
import { walletInjectionService } from '@/services/walletInjectionService';

// In a development/test environment component
if (process.env.NODE_ENV === 'development') {
  useEffect(() => {
    // Check for test flag in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('inject-wallets') === 'true') {
      walletInjectionService.injectAllWallets({
        autoApprove: true,
      });

      walletInjectionService.logWalletStatus();
    }
  }, []);
}
```

Then access with: `http://localhost:3000/?inject-wallets=true`

### Method 3: Browser Extension

Create a Chrome extension for convenient testing:

1. Create extension directory:
```bash
mkdir wallet-injector-extension
cd wallet-injector-extension
```

2. Create `manifest.json` (from `walletInjectionService.getBrowserExtensionManifest()`)

3. Create `content.js`:
```javascript
// Inject wallets when page loads
window.addEventListener('load', () => {
  console.log('Injecting wallets...');
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('inject.js');
  document.documentElement.appendChild(script);
});
```

4. Create `inject.js` with wallet injection code

5. Load in Chrome:
   - Visit `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension directory

### Method 4: Android Mobile Testing

#### On Android Device with Chrome:

1. Build the PWA:
```bash
npm run build
npm run pwa:build
```

2. Deploy to `https://social.soundmoneyprotocol.xyz` (Vercel)

3. Open on Android Chrome:
   - Navigate to `https://social.soundmoneyprotocol.xyz/?inject-wallets=true`
   - You should see install prompt
   - Install to home screen
   - Mock wallets will be available

#### Using Android Emulator:

1. Start Android Studio emulator
2. Open Chrome in emulator
3. Navigate to `http://10.0.2.2:3000/?inject-wallets=true` (localhost tunnel)
4. Wallets will be injected

#### Using Bubblewrap Native App:

1. Build APK:
```bash
npx @bubblewrap/cli build
```

2. Sign and install:
```bash
npx @bubblewrap/cli install
```

3. Open on device - mock wallets available

## Testing Wallet Functionality

### Test Checklist

```typescript
// In browser console or test component:

// 1. Check wallet availability
console.log(walletAdapterService.getAvailableWallets());
// Output: ['Phantom', 'MobileWalletAdapter'] (if injected)

// 2. Check device detection
console.log(walletAdapterService.isMobileDevice());
// Output: true/false

// 3. Get recommended wallet
console.log(walletAdapterService.getRecommendedWallet());
// Output: 'MobileWalletAdapter' or 'Phantom'

// 4. Test wallet injection
walletInjectionService.logWalletStatus();
// Shows which wallets are available

// 5. Test connection (in React component with hook)
// See code example above with useWalletAdapter
```

### Testing Transactions

```typescript
import { useWalletAdapter } from '@/hooks/useWalletAdapter';
import { SystemProgram, Transaction } from '@solana/web3.js';

function TestTransaction() {
  const { publicKey, sendTransaction, connected } = useWalletAdapter();

  const handleTestTransaction = async () => {
    if (!publicKey) return;

    // Create a simple test transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: publicKey,
        lamports: 1000, // 0.000001 SOL
      })
    );

    const result = await sendTransaction(transaction);
    console.log('Transaction result:', result);
  };

  return (
    <button onClick={handleTestTransaction} disabled={!connected}>
      Send Test Transaction
    </button>
  );
}
```

## PWA Features Testing

### Install Prompt

```typescript
// Listen for install prompt
window.addEventListener('pwa-install-prompt', (e) => {
  console.log('Install prompt available');
  // Show custom install button
});

// Handle installation
window.addEventListener('pwa-installed', () => {
  console.log('App installed successfully');
});
```

### Offline Support

1. Open DevTools → Application tab
2. Go to Service Workers
3. Check "Offline" checkbox
4. Reload page
5. App should still work with cached data

### Background Sync

```typescript
// Request background sync when online again
if ('serviceWorker' in navigator && 'SyncManager' in window) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.sync.register('sync-wallet');
  });
}
```

## Deployment

### To Vercel

```bash
# Build
npm run build

# Build PWA
npm run pwa:build

# Deploy to Vercel
# (Vercel auto-detects and deploys)
```

Update environment at: `social.soundmoneyprotocol.xyz`

### To Android (via Bubblewrap)

```bash
# Initialize
npm run pwa:bubblewrap

# Build APK
cd app && ./gradlew build

# Install on device
adb install app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

### Wallets Not Injecting

```javascript
// Check if injection service is available
console.log(typeof walletInjectionService);
// Should output: 'object'

// Log wallet status
walletInjectionService.logWalletStatus();

// Try manual injection
walletInjectionService.injectAllWallets({ autoApprove: true });
```

### Service Worker Issues

```javascript
// Check registration
navigator.serviceWorker.getRegistrations().then((regs) => {
  console.log('Service Workers:', regs);
});

// Unregister and reload
navigator.serviceWorker.getRegistrations().then((regs) => {
  regs.forEach((reg) => reg.unregister());
});
```

### APK Not Installing

1. Check minimum SDK version (should be 21+)
2. Ensure manifest has internet permission
3. Sign APK properly before installing
4. Check Android device supports required features

## Next Steps

1. **Integrate into Components:** Use `useWalletAdapter` hook in auth/wallet components
2. **Add Transaction Support:** Implement BEZY token transfers
3. **Add Payment Flow:** Enable Stripe + Solana hybrid payments
4. **Mobile Optimizations:** Add mobile-specific UI/UX
5. **Push Notifications:** Enable for messages and engagement
6. **Share Integration:** Handle native share functionality

## Resources

- [Solana Mobile Wallet Adapter](https://github.com/solana-mobile/mobile-wallet-adapter)
- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Service Worker Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## Files Created

```
src/
├── services/
│   ├── walletAdapterService.ts      (Core wallet service)
│   └── walletInjectionService.ts    (Testing/injection utilities)
├── hooks/
│   └── useWalletAdapter.ts          (React hook)
public/
├── manifest.json                     (PWA manifest)
├── service-worker.js                 (Service Worker)
├── index.html                        (Updated with PWA meta tags)
├── browserconfig.xml                 (Windows PWA config)
├── bubblewrap.json                   (Android PWA config)
└── [icon files needed]

Root:
└── WALLET_ADAPTER_IMPLEMENTATION.md  (This file)
```

## Summary

The implementation provides:

✅ **Mobile Wallet Adapter Integration**
- React hooks for wallet connection
- Wallet detection and device-specific recommendations
- Transaction signing and sending

✅ **Testing Utilities**
- Mock wallet injection for testing without real wallets
- Console injection script for quick testing
- Browser extension setup

✅ **PWA Support**
- Complete manifest with app shortcuts
- Service Worker with offline support
- Background sync for wallet operations
- Push notifications ready

✅ **Android Native**
- Bubblewrap configuration for native APK
- Optimized splash screen and navigation
- Share target for media
- Native installability

All components are ready for testing on mobile devices, web, and native Android platforms.
