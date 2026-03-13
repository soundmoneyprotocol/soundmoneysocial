/**
 * Mobile Wallet Adapter Service
 * Integrates Solana Mobile Wallet Adapter for web and mobile wallets
 * Supports both standard wallets and mobile wallet protocol
 */

// Wallet adapter imports removed temporarily to get UI running
// import {
//   ConnectionProvider,
//   WalletProvider,
//   useConnection,
//   useWallet,
// } from '@solana/wallet-adapter-react';
// import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
// import { clusterApiUrl } from '@solana/web3.js';

export type WalletNetwork = 'devnet' | 'testnet' | 'mainnet-beta' | 'localhost';

interface WalletConfig {
  network: WalletNetwork;
  autoConnect?: boolean;
  onError?: (error: Error) => void;
}

interface WalletInfo {
  name: string;
  address: string | null;
  publicKey: string | null;
  connected: boolean;
  balance?: number;
}

/**
 * Wallet Adapter Service
 * Manages wallet connections and interactions
 */
export const walletAdapterService = {
  /**
   * Get the appropriate cluster URL based on network
   */
  getClusterUrl(network: WalletNetwork): string {
    if (network === 'localhost') {
      return 'http://localhost:8899';
    }
    // Temporarily stub this out
    return `https://${network}.solana.com`;
  },

  /**
   * Convert network string to WalletAdapterNetwork
   */
  getAdapterNetwork(network: WalletNetwork) {
    return network;
  },

  /**
   * Get wallet configuration for provider setup
   */
  getWalletConfig(network: WalletNetwork = 'mainnet-beta') {
    return {
      network: this.getAdapterNetwork(network),
      endpoint: this.getClusterUrl(network),
    };
  },

  /**
   * Format SOL amount from lamports
   */
  formatSol(lamports: number): number {
    return lamports / 1e9;
  },

  /**
   * Format SOL amount to lamports
   */
  toLamports(sol: number): number {
    return Math.floor(sol * 1e9);
  },

  /**
   * Get short wallet address (first 4 and last 4 characters)
   */
  getShortAddress(address: string): string {
    if (!address || address.length < 8) {
      return address;
    }
    return `${address.substring(0, 4)}...${address.substring(address.length - 4)}`;
  },

  /**
   * Check if wallet is available in current environment
   */
  isWalletAvailable(walletName: string): boolean {
    try {
      // Check for standard wallet adapters
      if (walletName === 'Phantom') {
        return !!(window as any).phantom?.solana?.isPhantom;
      }
      if (walletName === 'Backpack') {
        return !!(window as any).backpack?.isBackpack;
      }
      // Check for Solana Mobile Wallet Adapter
      if (walletName === 'MobileWalletAdapter') {
        return typeof (window as any).solanaOnUI !== 'undefined';
      }
      return false;
    } catch {
      return false;
    }
  },

  /**
   * Get all available wallets
   */
  getAvailableWallets(): string[] {
    const available: string[] = [];

    if (this.isWalletAvailable('Phantom')) {
      available.push('Phantom');
    }
    if (this.isWalletAvailable('Backpack')) {
      available.push('Backpack');
    }
    if (this.isWalletAvailable('MobileWalletAdapter')) {
      available.push('MobileWalletAdapter');
    }

    return available;
  },

  /**
   * Detect if running on mobile device
   */
  isMobileDevice(): boolean {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|mobi/i.test(
      userAgent.toLowerCase()
    );
  },

  /**
   * Detect if running on Android mobile
   */
  isAndroidDevice(): boolean {
    return /android/i.test(navigator.userAgent);
  },

  /**
   * Get recommended wallet for current platform
   */
  getRecommendedWallet(): string | null {
    const available = this.getAvailableWallets();

    if (available.length === 0) {
      return null;
    }

    // Prefer MobileWalletAdapter on mobile
    if (this.isMobileDevice() && available.includes('MobileWalletAdapter')) {
      return 'MobileWalletAdapter';
    }

    // Otherwise prefer Phantom
    if (available.includes('Phantom')) {
      return 'Phantom';
    }

    return available[0];
  },
};

export default walletAdapterService;
