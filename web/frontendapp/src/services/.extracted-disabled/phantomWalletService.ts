/**
 * Phantom Wallet Service
 * Manages Phantom wallet connections, network switching, and status monitoring
 * Testing: Use local wallet: FMxPWXwfFjzimZKyo6i144D8FMoLPjoBX4VP2DzXTP2v
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type SolanaNetwork = 'mainnet-beta' | 'testnet' | 'devnet' | 'localhost';

export interface PhantomWallet {
  publicKey: string;
  isConnected: boolean;
}

export interface WalletInfo {
  address: string;
  isConnected: boolean;
  network: SolanaNetwork;
  publicKey?: string;
}

const STORAGE_KEY = 'phantom_wallet_data';
const NETWORK_STORAGE_KEY = 'solana_network';

// Local test wallet (your CLI wallet with 500 SOL)
const TEST_WALLET_ADDRESS = 'FMxPWXwfFjzimZKyo6i144D8FMoLPjoBX4VP2DzXTP2v';

/**
 * PhantomWalletService - Manages wallet state and network operations
 */
class PhantomWalletService {
  private wallet: PhantomWallet | null = null;
  private currentNetwork: SolanaNetwork = 'localhost'; // Using local validator
  private isConnected = false;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();
  private networkListeners: Set<(network: SolanaNetwork) => void> = new Set();

  constructor() {
    this.initialize();
    console.log('👻 Phantom Wallet Service initialized');
    console.log(`📝 Test wallet: ${TEST_WALLET_ADDRESS}`);
    console.log(`🌐 Network: localhost (http://localhost:8899)`);
  }

  /**
   * Initialize Phantom wallet service
   */
  private async initialize(): Promise<void> {
    try {
      // Load saved network preference
      const savedNetwork = await AsyncStorage.getItem(NETWORK_STORAGE_KEY);
      if (savedNetwork) {
        this.currentNetwork = savedNetwork as SolanaNetwork;
        console.log(`📡 Loaded saved network: ${this.currentNetwork}`);
      }

      // Try to reconnect to previously connected wallet
      const savedWalletData = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedWalletData) {
        console.log('🔄 Attempting to reconnect to previous wallet...');
        try {
          const walletData = JSON.parse(savedWalletData);
          this.wallet = {
            publicKey: walletData.address,
            isConnected: true,
          };
          this.isConnected = true;
          this.notifyConnectionListeners(true);
        } catch (error) {
          console.warn('Could not restore wallet data:', error);
        }
      }
    } catch (error) {
      console.error('Failed to initialize Phantom wallet service:', error);
    }
  }

  /**
   * Store connected wallet info
   */
  setConnectedWallet(address: string): void {
    this.wallet = {
      publicKey: address,
      isConnected: true,
    };
    this.isConnected = true;

    // Save connection info
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
      address,
      connectedAt: new Date().toISOString(),
    })).catch((error) => {
      console.error('Failed to save wallet data:', error);
    });

    console.log(`✅ Connected to wallet: ${address.substring(0, 12)}...`);
    console.log(`📡 Network: ${this.currentNetwork}`);

    // Notify listeners
    this.notifyConnectionListeners(true);
  }

  /**
   * Check if Phantom is available
   */
  isPhantomAvailable(): boolean {
    console.log('✅ Using local wallet for testing');
    return true;
  }

  /**
   * Get current wallet info
   */
  getWalletInfo(): WalletInfo | null {
    if (!this.wallet) {
      return null;
    }

    return {
      address: this.wallet.publicKey,
      isConnected: this.isConnected,
      network: this.currentNetwork,
      publicKey: this.wallet.publicKey,
    };
  }

  /**
   * Get wallet public key
   */
  getPublicKey(): string | null {
    return this.wallet?.publicKey || null;
  }

  /**
   * Check if wallet is connected
   */
  isWalletConnected(): boolean {
    return this.isConnected && this.wallet !== null;
  }

  /**
   * Disconnect from Phantom wallet
   */
  async disconnect(): Promise<void> {
    try {
      this.wallet = null;
      this.isConnected = false;

      // Clear saved data
      await AsyncStorage.removeItem(STORAGE_KEY);

      console.log('👋 Disconnected from wallet');
      this.notifyConnectionListeners(false);
    } catch (error) {
      console.error('Failed to disconnect:', error);
    }
  }

  /**
   * Switch to a different Solana network
   */
  async switchNetwork(network: SolanaNetwork): Promise<void> {
    try {
      if (!['mainnet-beta', 'testnet', 'devnet', 'localhost'].includes(network)) {
        throw new Error(`Unsupported network: ${network}`);
      }

      console.log(`🔄 Switching network to ${network}...`);

      this.currentNetwork = network;

      // Save network preference
      await AsyncStorage.setItem(NETWORK_STORAGE_KEY, network);

      const rpcUrls: Record<SolanaNetwork, string> = {
        'mainnet-beta': 'https://api.mainnet-beta.solana.com',
        'testnet': 'https://api.testnet.solana.com',
        'devnet': 'https://api.devnet.solana.com',
        'localhost': 'http://localhost:8899',
      };

      console.log(`✅ Network switched to ${network}`);
      console.log(`📡 Using RPC: ${rpcUrls[network]}`);

      this.notifyNetworkListeners(network);
    } catch (error) {
      console.error('Failed to switch network:', error);
      throw error;
    }
  }

  /**
   * Get current network
   */
  getCurrentNetwork(): SolanaNetwork {
    return this.currentNetwork;
  }

  /**
   * Get all available networks
   */
  getAvailableNetworks(): SolanaNetwork[] {
    return ['localhost', 'devnet', 'testnet', 'mainnet-beta'];
  }

  /**
   * Get network display name
   */
  getNetworkDisplayName(network: SolanaNetwork): string {
    const names: Record<SolanaNetwork, string> = {
      'mainnet-beta': 'Mainnet',
      'testnet': 'Testnet',
      'devnet': 'Devnet (Test)',
      'localhost': 'Local (Test)',
    };
    return names[network] || network;
  }

  /**
   * Get test wallet address
   */
  getTestWallet(): string {
    return TEST_WALLET_ADDRESS;
  }

  /**
   * Sign a message
   */
  async signMessage(message: string): Promise<string | null> {
    try {
      if (!this.isWalletConnected() || !this.wallet) {
        throw new Error('Wallet not connected');
      }

      console.log('✍️ Signing message...');

      // Mock signature for testing
      return 'signed_' + Math.random().toString(36).substring(7);
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  }

  /**
   * Sign a transaction
   */
  async signTransaction(transaction: any): Promise<any> {
    try {
      if (!this.isWalletConnected() || !this.wallet) {
        throw new Error('Wallet not connected');
      }

      console.log('✍️ Signing transaction...');
      return transaction;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  }

  /**
   * Sign and send a transaction
   */
  async signAndSendTransaction(transaction: any): Promise<string> {
    try {
      if (!this.isWalletConnected() || !this.wallet) {
        throw new Error('Wallet not connected');
      }

      console.log('📤 Signing and sending transaction...');
      return 'tx_' + Math.random().toString(36).substring(7);
    } catch (error) {
      console.error('Failed to sign and send transaction:', error);
      throw error;
    }
  }

  /**
   * Subscribe to connection changes
   */
  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.add(callback);
    console.log('📍 Connection listener added');

    return () => {
      this.connectionListeners.delete(callback);
    };
  }

  /**
   * Subscribe to network changes
   */
  onNetworkChange(callback: (network: SolanaNetwork) => void): () => void {
    this.networkListeners.add(callback);
    console.log('📍 Network listener added');

    return () => {
      this.networkListeners.delete(callback);
    };
  }

  /**
   * Notify connection listeners
   */
  private notifyConnectionListeners(connected: boolean): void {
    this.connectionListeners.forEach((callback) => {
      try {
        callback(connected);
      } catch (error) {
        console.error('Error in connection listener:', error);
      }
    });
  }

  /**
   * Notify network listeners
   */
  private notifyNetworkListeners(network: SolanaNetwork): void {
    this.networkListeners.forEach((callback) => {
      try {
        callback(network);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }

  /**
   * Get connection status info
   */
  getConnectionStatus(): {
    isPhantomInstalled: boolean;
    isConnected: boolean;
    walletAddress: string | null;
    network: SolanaNetwork;
  } {
    return {
      isPhantomInstalled: this.isPhantomAvailable(),
      isConnected: this.isWalletConnected(),
      walletAddress: this.wallet?.publicKey || null,
      network: this.currentNetwork,
    };
  }
}

export const phantomWalletService = new PhantomWalletService();
