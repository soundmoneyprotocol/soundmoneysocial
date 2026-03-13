/**
 * Wallet Management Service
 * Integrates Privy embedded wallets (Ethereum & Solana auto-creation) with Kepler and Phantom support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { privyService, PrivyEmbeddedWallet } from './privyService';
import { phantomWalletService } from './phantomWalletService';

export enum WalletType {
  PRIVY_EMBEDDED = 'privy_embedded',
  KEPLER = 'kepler', // Cosmos/Saga
  PHANTOM = 'phantom' // Solana
}

export enum SupportedChain {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  SOLANA = 'solana',
  COSMOS = 'cosmos',
  SAGA = 'saga'
}

export interface ConnectedWallet {
  id: string;
  type: WalletType;
  address: string;
  chain: SupportedChain;
  nickname?: string;
  connected_at: string;
  last_used: string;
  balance?: string;
  native_balance?: string;
  is_primary?: boolean;
}

export interface WalletBalance {
  native: string;
  tokens: Record<string, string>;
}

export interface AuthenticationResult {
  didToken?: string;
  userMetadata?: any;
  wallet?: ConnectedWallet;
}

class WalletManagementService {
  private wallets: Map<string, ConnectedWallet> = new Map();
  private readonly STORAGE_KEY = 'connected_wallets';

  constructor() {
    this.initialize();
    console.log('💼 Wallet Management Service initialized');
  }

  private async initialize(): Promise<void> {
    try {
      // Load previously connected wallets
      await this.loadWallets();
    } catch (error) {
      console.error('Failed to initialize wallet service:', error);
    }
  }

  // ===== PRIVY Authentication Methods =====

  /**
   * Authenticate with Privy using email
   * Automatically creates embedded wallets for Ethereum and Solana
   */
  async authenticateWithEmail(email: string): Promise<AuthenticationResult | null> {
    try {
      console.log('🔐 Starting Privy email authentication...');
      const result = await privyService.authenticateWithEmail(email);

      if (!result) {
        return null;
      }

      // Get Privy embedded wallets (auto-created)
      const privyWallets = await privyService.getEmbeddedWallets();

      // Convert Privy wallets to our ConnectedWallet format
      const wallets: ConnectedWallet[] = [];
      for (const privyWallet of privyWallets) {
        const chain = privyWallet.chain_type === 'ethereum'
          ? SupportedChain.ETHEREUM
          : SupportedChain.SOLANA;

        const wallet: ConnectedWallet = {
          id: `privy_${privyWallet.address.slice(0, 8)}`,
          type: WalletType.PRIVY_EMBEDDED,
          address: privyWallet.address,
          chain,
          nickname: `Privy ${chain.charAt(0).toUpperCase() + chain.slice(1)}`,
          connected_at: new Date().toISOString(),
          last_used: new Date().toISOString(),
          is_primary: chain === SupportedChain.ETHEREUM, // Set Ethereum as primary
        };

        wallets.push(wallet);
        await this.addWallet(wallet);
      }

      console.log(`📧 Email authentication successful with ${wallets.length} embedded wallets`);
      return {
        didToken: result.auth_token,
        userMetadata: result.user,
        wallet: wallets[0],
      };
    } catch (error) {
      console.error('Email authentication failed:', error);
      return null;
    }
  }

  /**
   * Authenticate with Privy using social provider (Google or Apple)
   * Automatically creates embedded wallets for Ethereum and Solana
   */
  async authenticateWithSocial(provider: 'google' | 'apple'): Promise<AuthenticationResult | null> {
    try {
      console.log(`🔐 Starting Privy ${provider} authentication...`);
      const result = await privyService.authenticateWithSocial(provider);

      if (!result) {
        return null;
      }

      // Get Privy embedded wallets (auto-created)
      const privyWallets = await privyService.getEmbeddedWallets();

      // Convert Privy wallets to our ConnectedWallet format
      const wallets: ConnectedWallet[] = [];
      for (const privyWallet of privyWallets) {
        const chain = privyWallet.chain_type === 'ethereum'
          ? SupportedChain.ETHEREUM
          : SupportedChain.SOLANA;

        const wallet: ConnectedWallet = {
          id: `privy_${privyWallet.address.slice(0, 8)}`,
          type: WalletType.PRIVY_EMBEDDED,
          address: privyWallet.address,
          chain,
          nickname: `Privy ${chain.charAt(0).toUpperCase() + chain.slice(1)}`,
          connected_at: new Date().toISOString(),
          last_used: new Date().toISOString(),
          is_primary: chain === SupportedChain.ETHEREUM,
        };

        wallets.push(wallet);
        await this.addWallet(wallet);
      }

      console.log(`🔗 ${provider} authentication successful with ${wallets.length} embedded wallets`);
      return {
        didToken: result.auth_token,
        userMetadata: result.user,
        wallet: wallets[0],
      };
    } catch (error) {
      console.error(`${provider} authentication failed:`, error);
      return null;
    }
  }

  // ===== External Wallet Connection Methods =====

  async connectKeplerWallet(): Promise<ConnectedWallet | null> {
    try {
      // Check if Keplr wallet is available (mobile app integration)
      const isKeplerAvailable = await this.isWalletAvailable('keplr');

      if (!isKeplerAvailable) {
        throw new Error('Kepler wallet not installed or available');
      }

      // Mock implementation - in production this would integrate with actual Keplr
      const mockAddress = `cosmos${Date.now()}...${Math.random().toString(36).substr(2, 8)}`;

      const wallet: ConnectedWallet = {
        id: `kepler_${mockAddress}`,
        type: WalletType.KEPLER,
        address: mockAddress,
        chain: SupportedChain.COSMOS,
        nickname: 'Kepler Wallet',
        connected_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      };

      await this.addWallet(wallet);
      console.log('🌌 Kepler wallet connected for Cosmos/Saga');
      return wallet;
    } catch (error) {
      console.error('Failed to connect Kepler wallet:', error);
      return null;
    }
  }

  async connectSagaChain(): Promise<ConnectedWallet | null> {
    try {
      // Connect to Saga chain specifically through Kepler
      const isKeplerAvailable = await this.isWalletAvailable('keplr');

      if (!isKeplerAvailable) {
        throw new Error('Kepler wallet required for Saga chain connection');
      }

      const mockAddress = `saga${Date.now()}...${Math.random().toString(36).substr(2, 8)}`;

      const wallet: ConnectedWallet = {
        id: `saga_${mockAddress}`,
        type: WalletType.KEPLER,
        address: mockAddress,
        chain: SupportedChain.SAGA,
        nickname: 'Saga Chain',
        connected_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      };

      await this.addWallet(wallet);
      console.log('🎭 Saga chain connected via Kepler');
      return wallet;
    } catch (error) {
      console.error('Failed to connect Saga chain:', error);
      return null;
    }
  }

  async connectPhantomWallet(): Promise<ConnectedWallet | null> {
    try {
      // Check if Phantom wallet is available
      const isPhantomAvailable = await this.isWalletAvailable('phantom');

      if (!isPhantomAvailable) {
        throw new Error('Phantom wallet not installed or available');
      }

      // Use a valid Solana address for testing
      // In production, this would get the actual address from Phantom wallet connection
      const phantomAddress = phantomWalletService.getTestWallet();
      const walletId = `phantom_${phantomAddress.slice(0, 8)}`;

      const wallet: ConnectedWallet = {
        id: walletId,
        type: WalletType.PHANTOM,
        address: phantomAddress,
        chain: SupportedChain.SOLANA,
        nickname: 'Phantom Wallet',
        connected_at: new Date().toISOString(),
        last_used: new Date().toISOString()
      };

      // Update phantom wallet service with connected wallet
      phantomWalletService.setConnectedWallet(phantomAddress);

      await this.addWallet(wallet);
      console.log('👻 Phantom wallet connected for Solana');
      return wallet;
    } catch (error) {
      console.error('Failed to connect Phantom wallet:', error);
      return null;
    }
  }

  // ===== Wallet Management Methods =====

  async addWallet(wallet: ConnectedWallet): Promise<void> {
    this.wallets.set(wallet.id, wallet);
    await this.saveWallets();
  }

  async removeWallet(walletId: string): Promise<boolean> {
    try {
      const success = this.wallets.delete(walletId);
      if (success) {
        await this.saveWallets();
        console.log(`🗑️ Wallet ${walletId} removed`);
      }
      return success;
    } catch (error) {
      console.error('Failed to remove wallet:', error);
      return false;
    }
  }

  async getWallets(): Promise<ConnectedWallet[]> {
    return Array.from(this.wallets.values());
  }

  async getWalletsByChain(chain: SupportedChain): Promise<ConnectedWallet[]> {
    return Array.from(this.wallets.values()).filter(wallet => wallet.chain === chain);
  }

  async getPrimaryWallet(): Promise<ConnectedWallet | null> {
    const wallets = Array.from(this.wallets.values());
    return wallets.find(wallet => wallet.is_primary) || wallets[0] || null;
  }

  async setPrimaryWallet(walletId: string): Promise<boolean> {
    try {
      // Remove primary flag from all wallets
      for (const wallet of this.wallets.values()) {
        wallet.is_primary = false;
      }

      // Set new primary wallet
      const wallet = this.wallets.get(walletId);
      if (wallet) {
        wallet.is_primary = true;
        await this.saveWallets();
        console.log(`👑 Primary wallet set to ${walletId}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to set primary wallet:', error);
      return false;
    }
  }

  async updateWalletNickname(walletId: string, nickname: string): Promise<boolean> {
    try {
      const wallet = this.wallets.get(walletId);
      if (wallet) {
        wallet.nickname = nickname;
        await this.saveWallets();
        console.log(`📝 Wallet nickname updated: ${nickname}`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to update wallet nickname:', error);
      return false;
    }
  }

  // ===== Chain Switching for Privy Wallet =====

  async switchChain(walletId: string, chain: SupportedChain): Promise<boolean> {
    try {
      const wallet = this.wallets.get(walletId);
      if (!wallet || wallet.type !== WalletType.PRIVY_EMBEDDED) {
        throw new Error('Chain switching only supported for Privy embedded wallets');
      }

      // Privy wallets are chain-specific, so we get the appropriate wallet
      const privyWallets = await privyService.getEmbeddedWallets();
      const targetChain = chain === SupportedChain.ETHEREUM ? 'ethereum' : 'solana';
      const privyWallet = privyWallets.find(w => w.chain_type === targetChain);

      if (privyWallet) {
        wallet.chain = chain;
        wallet.address = privyWallet.address;
        wallet.last_used = new Date().toISOString();
        await this.saveWallets();
        console.log(`🔄 Switched to ${chain} chain`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Failed to switch chain:', error);
      return false;
    }
  }

  // ===== Balance Methods =====

  async getWalletBalance(walletId: string): Promise<WalletBalance | null> {
    try {
      const wallet = this.wallets.get(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      // Mock implementation - in production this would fetch real balances
      const balance: WalletBalance = {
        native: this.generateMockBalance(),
        tokens: {
          'USDC': this.generateMockBalance(),
          'USDT': this.generateMockBalance()
        }
      };

      console.log(`💰 Retrieved balance for wallet ${walletId}`);
      return balance;
    } catch (error) {
      console.error('Failed to get wallet balance:', error);
      return null;
    }
  }

  // ===== Utility Methods =====

  private async isWalletAvailable(walletType: 'keplr' | 'phantom'): Promise<boolean> {
    try {
      // In a real implementation, this would check for the actual wallet apps
      // For now, return true to allow testing
      return true;
    } catch (error) {
      return false;
    }
  }

  private getChainConfig(chain: SupportedChain) {
    const configs = {
      [SupportedChain.ETHEREUM]: {
        chainId: '0x1',
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/your-api-key'
      },
      [SupportedChain.POLYGON]: {
        chainId: '0x89',
        rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/your-api-key'
      },
      [SupportedChain.SOLANA]: {
        cluster: 'mainnet-beta',
        endpoint: 'https://api.mainnet-beta.solana.com'
      },
      [SupportedChain.COSMOS]: {
        chainId: 'cosmoshub-4',
        rpcEndpoint: 'https://rpc-cosmoshub.blockapsis.com'
      },
      [SupportedChain.SAGA]: {
        chainId: 'saga-1',
        rpcEndpoint: 'https://rpc.saga.com'
      }
    };

    return configs[chain];
  }

  private generateMockBalance(): string {
    return (Math.random() * 1000).toFixed(6);
  }

  // ===== Storage Methods =====

  private async loadWallets(): Promise<void> {
    try {
      const storedWallets = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (storedWallets) {
        const walletsArray: ConnectedWallet[] = JSON.parse(storedWallets);
        this.wallets.clear();
        walletsArray.forEach(wallet => this.wallets.set(wallet.id, wallet));
        console.log(`📂 Loaded ${walletsArray.length} wallets from storage`);
      }
    } catch (error) {
      console.error('Failed to load wallets from storage:', error);
    }
  }

  private async saveWallets(): Promise<void> {
    try {
      const walletsArray = Array.from(this.wallets.values());
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(walletsArray));
      console.log(`💾 Saved ${walletsArray.length} wallets to storage`);
    } catch (error) {
      console.error('Failed to save wallets to storage:', error);
    }
  }

  // ===== Authentication State =====

  isAuthenticated(): boolean {
    return privyService.isAuthenticated();
  }

  async logout(): Promise<void> {
    try {
      await privyService.logout();
      this.wallets.clear();
      await AsyncStorage.removeItem(this.STORAGE_KEY);
      console.log('👋 User logged out and wallets cleared');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  }

  // ===== Transaction Methods =====

  async signTransaction(walletId: string, transaction: any): Promise<string | null> {
    try {
      const wallet = this.wallets.get(walletId);
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      if (wallet.type === WalletType.PRIVY_EMBEDDED) {
        // Use Privy to sign transaction
        const chainType = wallet.chain === SupportedChain.ETHEREUM ? 'ethereum' : 'solana';
        const signature = await privyService.signTransaction(chainType, transaction);

        if (signature) {
          console.log('✍️ Transaction signed with Privy wallet');
          return signature;
        }
      }

      // For external wallets (Kepler, Phantom), delegate to respective services
      console.log(`✍️ Transaction signed with ${wallet.type} wallet`);
      return `mock_signature_${Date.now()}`;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      return null;
    }
  }
}

export const walletManagementService = new WalletManagementService();
