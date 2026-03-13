# Mobile Wallet Adapter - Quick Start Testing Guide

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Dependencies
```bash
cd /Users/casmirpatterson/soundmoney/soundmoneysocial/web/frontendapp
npm install
```

### Step 2: Start Dev Server
```bash
npm start
```
App opens at `http://localhost:3000`

### Step 3: Inject Mock Wallets

#### Option A: URL Parameter (Easiest)
Open: `http://localhost:3000/?inject-wallets=true`

Add this to `src/App.tsx` or any component:

```typescript
useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('inject-wallets') === 'true') {
    import('@/services/walletInjectionService').then(({ walletInjectionService }) => {
      walletInjectionService.injectAllWallets({ autoApprove: true });
      console.log('✅ Wallets injected for testing');
    });
  }
}, []);
```

#### Option B: Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Paste:

```javascript
(function() {
  const config = {};

  // Mock Phantom
  const mockPhantom = {
    isConnected: false,
    publicKey: null,
    connect: async function() {
      this.isConnected = true;
      this.publicKey = { toString: () => 'PhantomTestKey123456789' };
      console.log('✅ Phantom connected');
    },
    disconnect: async function() {
      this.isConnected = false;
      this.publicKey = null;
      console.log('✅ Phantom disconnected');
    },
    signTransaction: async function(tx) { return tx; },
    signAndSendTransaction: async function(tx) {
      return { signature: 'mock' + Math.random().toString(36).substring(7) };
    },
    signMessage: async function(msg) {
      return { signature: new Uint8Array(64) };
    }
  };

  window.phantom = {
    solana: mockPhantom,
    isPhantom: true
  };

  // Mock Mobile Wallet Adapter
  window.solanaOnUI = {
    name: 'MobileWalletAdapter',
    account: null,
    connect: async function() {
      this.account = { address: 'MobileWalletKey123456789' };
      console.log('✅ Mobile Wallet Adapter connected');
    },
    disconnect: async function() {
      this.account = null;
      console.log('✅ Mobile Wallet Adapter disconnected');
    },
    signTransaction: async function(tx) { return tx; },
    signAndSendTransaction: async function(tx) {
      return { signature: 'mock' + Math.random().toString(36).substring(7) };
    },
    signMessage: async function(msg) {
      return { signature: new Uint8Array(64) };
    }
  };

  console.log('✅ All mock wallets injected!');
  console.log('Available: window.phantom.solana, window.solanaOnUI');
})();
```

4. Press Enter
5. Wallets are now injected!

## 🧪 Testing Wallet Availability

In console, run:

```javascript
// Check available wallets
console.log(window.phantom?.solana ? '✅ Phantom' : '❌ Phantom not found');
console.log(window.solanaOnUI ? '✅ Mobile Wallet Adapter' : '❌ MWA not found');

// Check connection status
console.log('Phantom connected:', window.phantom?.solana?.isConnected);
console.log('MWA account:', window.solanaOnUI?.account?.address);
```

## 📱 Test On Mobile

### Using Android Chrome:

1. **Using localhost (same machine):**
   - Get your machine's IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
   - Replace `localhost:3000` with `YOUR_IP:3000`
   - Example: `http://192.168.1.100:3000/?inject-wallets=true`

2. **Using Android emulator:**
   - Run: `npm start` on your machine
   - In emulator, open Chrome and go to: `http://10.0.2.2:3000/?inject-wallets=true`
   - (10.0.2.2 is the host machine from Android emulator)

3. **Using Vercel deployment:**
   - Deploy with: `npm run build` then commit and push
   - Wait for Vercel deployment
   - Access: `https://social.soundmoneyprotocol.xyz/?inject-wallets=true`
   - Mock wallets will be available

## 🔍 Verify Injection

After injecting, run in console:

```javascript
// Get wallet status
if (window.phantom?.solana) {
  console.log('✅ Phantom wallet detected');
  console.log('  - Connected:', window.phantom.solana.isConnected);
  console.log('  - Has publicKey:', !!window.phantom.solana.publicKey);
}

if (window.solanaOnUI) {
  console.log('✅ Mobile Wallet Adapter detected');
  console.log('  - Account:', window.solanaOnUI.account?.address || 'Not connected');
}
```

## 🧩 Test Wallet Operations

### Test Connection
```javascript
// Phantom
await window.phantom.solana.connect();
console.log('Address:', window.phantom.solana.publicKey.toString());

// MWA
await window.solanaOnUI.connect();
console.log('Address:', window.solanaOnUI.account.address);
```

### Test Transaction Signing
```javascript
// Create a dummy transaction
const tx = { signature: null };

// Phantom
const signedPhantom = await window.phantom.solana.signTransaction(tx);
console.log('✅ Phantom signed:', signedPhantom);

// MWA
const signedMWA = await window.solanaOnUI.signTransaction(tx);
console.log('✅ MWA signed:', signedMWA);
```

### Test Message Signing
```javascript
const message = new Uint8Array([0, 1, 2, 3]);

// Phantom
const msgPhantom = await window.phantom.solana.signMessage(message);
console.log('✅ Phantom message signed:', msgPhantom);

// MWA
const msgMWA = await window.solanaOnUI.signMessage(message);
console.log('✅ MWA message signed:', msgMWA);
```

## 💡 Common Issues & Fixes

### Wallets Don't Appear in Console

**Problem:** `window.phantom is undefined`

**Solution:** Make sure you:
1. Pasted the entire injection script
2. Pressed Enter after pasting
3. Check for console errors

**Check with:**
```javascript
console.log(typeof window.phantom); // Should be 'object', not 'undefined'
```

### Wallets Don't Persist on Reload

**Expected behavior!** You need to inject after every page reload. Use the URL parameter method instead:
- Open: `http://localhost:3000/?inject-wallets=true`
- Wallets are injected automatically

### Getting "User rejected" Errors

**Expected behavior!** The `autoApprove: false` setting makes wallets ask for permission.

**To auto-approve:**
```javascript
walletInjectionService.injectAllWallets({ autoApprove: true });
```

## 🎯 Use in Components

### Create a Wallet Connect Button

```typescript
import { useWalletAdapter } from '@/hooks/useWalletAdapter';

function WalletButton() {
  const { connected, publicKey, loading, connect, disconnect, balance } = useWalletAdapter();

  if (!connected) {
    return <button onClick={connect}>{loading ? 'Connecting...' : 'Connect Wallet'}</button>;
  }

  return (
    <div>
      <p>Address: {publicKey?.toBase58().substring(0, 8)}...</p>
      <p>Balance: {balance?.formatted}</p>
      <button onClick={disconnect}>Disconnect</button>
    </div>
  );
}
```

## 📊 Testing Flow

1. ✅ Start dev server: `npm start`
2. ✅ Inject wallets (URL or console)
3. ✅ Verify in console: `window.phantom?.solana` exists
4. ✅ Test connect: `await window.phantom.solana.connect()`
5. ✅ Test sign: `await window.phantom.solana.signMessage(...)`
6. ✅ Use in component: Add `useWalletAdapter` hook
7. ✅ Deploy to Vercel when ready

## 🚀 Deploy to Production

### Build for Web
```bash
npm run build
npm run pwa:build
```

### Deploy to Vercel
```bash
# Login to Vercel
npm i -g vercel

# Deploy
vercel --prod
```

Set custom domain at Vercel: `social.soundmoneyprotocol.xyz`

### Create Android APK
```bash
npm run pwa:bubblewrap
```

This creates an Android app wrapper you can install on devices.

## 📝 Testing Checklist

- [ ] Wallets injected and visible in window object
- [ ] Can connect to Phantom wallet
- [ ] Can connect to Mobile Wallet Adapter
- [ ] Can sign transactions
- [ ] Can sign messages
- [ ] Balance displays correctly
- [ ] Works on mobile Chrome
- [ ] Works on Android emulator
- [ ] PWA installs from home screen
- [ ] App works offline with cached data

## 🆘 Need Help?

Check logs:
```javascript
// Enable verbose logging
localStorage.setItem('DEBUG', 'soundmoney:*');
location.reload();
```

See main documentation:
- [WALLET_ADAPTER_IMPLEMENTATION.md](./WALLET_ADAPTER_IMPLEMENTATION.md) - Full implementation guide
- [Solana Docs](https://docs.solana.com/)
- [PWA Docs](https://web.dev/progressive-web-apps/)

---

**Next Steps:**
1. Inject wallets with `?inject-wallets=true`
2. Test connection in console
3. Add `useWalletAdapter` hook to components
4. Deploy to Vercel
5. Test on mobile devices
