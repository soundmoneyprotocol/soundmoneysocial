/**
 * Wallet Injection Service
 * Provides utilities for injecting and testing Mobile Wallet Adapter
 * Useful for testing on web apps that haven't integrated wallet support
 *
 * ⚠️ WARNING: This is for testing/development only!
 * Do not use in production environments.
 */

interface MockWalletConfig {
  name?: string;
  publicKey?: string;
  autoApprove?: boolean;
}

/**
 * Mock Solana wallet for testing
 * Simulates the Solana Mobile Wallet Adapter interface
 */
interface MockWallet {
  isConnected: boolean;
  publicKey: {
    toString(): string;
  } | null;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  signTransaction(transaction: any): Promise<any>;
  signAndSendTransaction(transaction: any): Promise<{ signature: string }>;
  signMessage(message: Uint8Array): Promise<{ signature: Uint8Array }>;
}

/**
 * Mobile Wallet Adapter Test Injection Service
 * Allows developers to test MWA without a real wallet
 */
export const walletInjectionService = {
  /**
   * Inject a mock Phantom wallet for testing
   * @param config Mock wallet configuration
   */
  injectPhantomWallet(config: MockWalletConfig = {}): void {
    const mockWallet: MockWallet = {
      isConnected: false,
      publicKey: config.publicKey
        ? {
            toString: () => config.publicKey!,
          }
        : null,
      async connect() {
        console.log('[Mock Phantom] Connecting...');
        this.isConnected = true;
        this.publicKey = config.publicKey
          ? {
              toString: () => config.publicKey!,
            }
          : {
              toString: () => 'PhantomTestPublicKey123456789',
            };
      },
      async disconnect() {
        console.log('[Mock Phantom] Disconnecting...');
        this.isConnected = false;
        this.publicKey = null;
      },
      async signTransaction(transaction: any) {
        console.log('[Mock Phantom] Signing transaction...');
        if (!config.autoApprove) {
          throw new Error('User rejected transaction');
        }
        return transaction;
      },
      async signAndSendTransaction(transaction: any) {
        console.log('[Mock Phantom] Signing and sending transaction...');
        if (!config.autoApprove) {
          throw new Error('User rejected transaction');
        }
        return {
          signature: 'MockSignature' + Math.random().toString(36).substring(7),
        };
      },
      async signMessage(message: Uint8Array) {
        console.log('[Mock Phantom] Signing message...');
        if (!config.autoApprove) {
          throw new Error('User rejected message signing');
        }
        return {
          signature: new Uint8Array(64),
        };
      },
    };

    // Inject into window.phantom
    (window as any).phantom = {
      solana: mockWallet,
      isPhantom: true,
    };

    console.log('✅ Mock Phantom wallet injected');
  },

  /**
   * Inject Mobile Wallet Adapter Standard interface
   * @param config Mock wallet configuration
   */
  injectMobileWalletAdapter(config: MockWalletConfig = {}): void {
    const mockMWA = {
      name: config.name || 'MobileWalletAdapter',
      icon: '📱',
      account: config.publicKey
        ? {
            address: config.publicKey,
            label: 'Mobile Wallet',
          }
        : null,

      features: {
        'solana:signAndSendTransaction': {},
        'solana:signTransaction': {},
        'solana:signMessage': {},
      },

      async connect() {
        console.log('[Mock MWA] Connecting...');
        this.account = config.publicKey
          ? {
              address: config.publicKey,
              label: 'Mobile Wallet',
            }
          : {
              address: 'MobileWalletAdapterTestKey123456789',
              label: 'Mobile Wallet',
            };
      },

      async disconnect() {
        console.log('[Mock MWA] Disconnecting...');
        this.account = null;
      },

      async signTransaction(transaction: any) {
        console.log('[Mock MWA] Signing transaction...');
        if (!config.autoApprove) {
          throw new Error('User rejected transaction');
        }
        return transaction;
      },

      async signAndSendTransaction(transaction: any) {
        console.log('[Mock MWA] Signing and sending transaction...');
        if (!config.autoApprove) {
          throw new Error('User rejected transaction');
        }
        return {
          signature: 'MockMWASignature' + Math.random().toString(36).substring(7),
        };
      },

      async signMessage(message: Uint8Array) {
        console.log('[Mock MWA] Signing message...');
        if (!config.autoApprove) {
          throw new Error('User rejected message signing');
        }
        return {
          signature: new Uint8Array(64),
        };
      },
    };

    // Inject into window
    (window as any).solanaOnUI = mockMWA;
    (window as any).__SOLANA_MOBILE__ = {
      adapter: mockMWA,
    };

    console.log('✅ Mock Mobile Wallet Adapter injected');
  },

  /**
   * Inject all standard Solana wallets for comprehensive testing
   * @param config Mock wallet configuration
   */
  injectAllWallets(config: MockWalletConfig = {}): void {
    console.log('🔌 Injecting all mock wallets...');
    this.injectPhantomWallet(config);
    this.injectMobileWalletAdapter(config);
    console.log('✅ All wallets injected and ready for testing');
  },

  /**
   * Create a console injection script for Chrome DevTools
   * Can be pasted directly into the browser console for testing
   * @returns JavaScript code to inject wallets
   */
  getConsoleInjectionScript(config: MockWalletConfig = {}): string {
    const configStr = JSON.stringify(config);
    return `
// SoundMoney Wallet Injection Script for Testing
// Paste this into Chrome DevTools Console to inject mock wallets

(function() {
  const config = ${configStr};

  // Inject Mock Phantom
  const mockPhantom = {
    isConnected: false,
    publicKey: null,
    connect: async function() {
      this.isConnected = true;
      this.publicKey = { toString: () => '${config.publicKey || 'PhantomTestKey123456789'}' };
      console.log('✅ Phantom connected');
    },
    disconnect: async function() {
      this.isConnected = false;
      this.publicKey = null;
      console.log('✅ Phantom disconnected');
    },
    signTransaction: async function(tx) {
      console.log('📝 Signing transaction...');
      return tx;
    },
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

  // Inject Mock Mobile Wallet Adapter
  window.solanaOnUI = {
    name: 'MobileWalletAdapter',
    account: null,
    connect: async function() {
      this.account = { address: '${config.publicKey || 'MobileWalletKey123456789'}' };
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

  console.log('✅ All mock wallets injected! Available:');
  console.log('  - window.phantom (Phantom wallet)');
  console.log('  - window.solanaOnUI (Mobile Wallet Adapter)');
})();
`;
  },

  /**
   * Create a browser extension manifest for wallet injection
   * Can be packaged as a Chrome extension for easy testing
   * @returns Manifest.json content
   */
  getBrowserExtensionManifest(): string {
    return JSON.stringify(
      {
        manifest_version: 3,
        name: 'SoundMoney Wallet Injector',
        version: '1.0.0',
        description: 'Inject mock Solana wallets for testing on SoundMoney Social',
        permissions: ['scripting', 'activeTab'],
        action: {
          default_popup: 'popup.html',
          default_title: 'SoundMoney Wallet Injector',
        },
        content_scripts: [
          {
            matches: ['https://social.soundmoneyprotocol.xyz/*'],
            js: ['content.js'],
            run_at: 'document_start',
          },
        ],
      },
      null,
      2
    );
  },

  /**
   * Log current wallet status to console
   */
  logWalletStatus(): void {
    console.group('🪙 Wallet Status');
    console.log('Phantom:', (window as any).phantom?.solana ? '✅ Injected' : '❌ Not found');
    console.log(
      'Mobile Wallet Adapter:',
      (window as any).solanaOnUI ? '✅ Injected' : '❌ Not found'
    );

    if ((window as any).phantom?.solana?.publicKey) {
      console.log(
        'Phantom Address:',
        (window as any).phantom.solana.publicKey.toString()
      );
    }
    if ((window as any).solanaOnUI?.account?.address) {
      console.log('MWA Address:', (window as any).solanaOnUI.account.address);
    }
    console.groupEnd();
  },

  /**
   * Clean up injected wallets
   */
  cleanup(): void {
    console.log('🧹 Cleaning up injected wallets...');
    delete (window as any).phantom;
    delete (window as any).solanaOnUI;
    delete (window as any).__SOLANA_MOBILE__;
    console.log('✅ Cleanup complete');
  },
};

export default walletInjectionService;
