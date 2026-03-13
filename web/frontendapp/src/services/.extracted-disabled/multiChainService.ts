/**
 * Multi-Chain Abstraction Layer
 * Provides unified interface for EVM (Ethereum/Polygon) and Solana chains
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import blockchainService from './blockchainService';
import solanaService from './solanaService';
import { supabase } from './authService';

// Unified chain types
export enum SupportedChain {
  ETHEREUM = 'ethereum',
  POLYGON = 'polygon',
  SOLANA = 'solana',
  COSMOS = 'cosmos',
  SAGA = 'saga'
}

// Unified wallet interface
export interface UnifiedWallet {
  address: string;
  chain: SupportedChain;
  connected: boolean;
  balance: Record<string, number>; // Token balances
  nativeBalance: number; // ETH, MATIC, SOL
}

// Unified transaction interface
export interface UnifiedTransaction {
  id: string;
  chain: SupportedChain;
  type: TransactionType;
  status: TransactionStatus;
  hash?: string;
  fromAddress: string;
  toAddress?: string;
  amount?: string;
  token?: string;
  metadata?: any;
  createdAt: number;
  confirmedAt?: number;
  gasUsed?: string;
  gasFee?: string;
}

export enum TransactionType {
  PAYMENT_STREAM = 'PAYMENT_STREAM',
  METADATA_UPDATE = 'METADATA_UPDATE',
  TOKEN_TRANSFER = 'TOKEN_TRANSFER',
  NFT_MINT = 'NFT_MINT',
  GOVERNANCE_VOTE = 'GOVERNANCE_VOTE'
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

// Unified streaming interface
export interface UnifiedStream {
  id: string;
  chain: SupportedChain;
  sender: string;
  receiver: string;
  token: string;
  flowRate: string; // tokens per second
  totalStreamed: string;
  status: StreamStatus;
  startTime: number;
  endTime?: number;
  contentId?: string;
  metadata?: any;
}

export enum StreamStatus {
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Unified metadata interface
export interface UnifiedMetadata {
  id: string;
  chain: SupportedChain;
  entityType: string;
  schemaVersion: number;
  lastUpdated: number;
  fields: Record<string, any>;
  permissions: MetadataPermission[];
  history: MetadataHistory[];
}

export interface MetadataPermission {
  field: string;
  operation: 'read' | 'write' | 'admin';
  authorized: string[];
}

export interface MetadataHistory {
  field: string;
  oldValue?: any;
  newValue: any;
  updatedBy: string;
  timestamp: number;
  reason?: string;
}

// Chain capabilities
interface ChainCapabilities {
  supportsStreaming: boolean;
  supportsDynamicMetadata: boolean;
  supportsNFTs: boolean;
  supportsGovernance: boolean;
  nativeToken: string;
  stableTokens: string[];
  averageBlockTime: number; // seconds
  averageGasFee: number; // USD
}

// Multi-chain configuration
interface MultiChainConfig {
  defaultChain: SupportedChain;
  preferredChainForOperation: Record<string, SupportedChain>;
  crossChainSyncEnabled: boolean;
  autoChainSelection: boolean;
  gasOptimization: boolean;
}

class MultiChainService {
  private config: MultiChainConfig;
  private connectedWallets: Map<SupportedChain, UnifiedWallet> = new Map();
  private transactionCache: Map<string, UnifiedTransaction> = new Map();
  private streamCache: Map<string, UnifiedStream> = new Map();
  private metadataCache: Map<string, UnifiedMetadata> = new Map();

  constructor() {
    this.config = {
      defaultChain: SupportedChain.POLYGON, // Polygon for lower fees
      preferredChainForOperation: {
        'payment_streaming': SupportedChain.POLYGON,
        'metadata_update': SupportedChain.SOLANA,
        'nft_minting': SupportedChain.SOLANA,
        'governance': SupportedChain.ETHEREUM,
        'cosmos_staking': SupportedChain.COSMOS,
        'saga_interactions': SupportedChain.SAGA
      },
      crossChainSyncEnabled: true,
      autoChainSelection: true,
      gasOptimization: true
    };
  }

  /**
   * Initialize multi-chain service
   */
  async initialize(): Promise<void> {
    try {
      console.log('🌐 Initializing multi-chain service...');

      // Initialize underlying services
      await Promise.all([
        blockchainService.initialize(),
        solanaService.initialize()
      ]);

      // Load saved wallet connections
      await this.loadSavedWallets();

      // Load user preferences
      await this.loadUserPreferences();

      console.log('✅ Multi-chain service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize multi-chain service:', error);
      throw error;
    }
  }

  /**
   * Connect wallet for specific chain
   */
  async connectWallet(chain: SupportedChain): Promise<UnifiedWallet> {
    try {
      console.log(`🔗 Connecting wallet to ${chain}...`);

      let address: string;
      let nativeBalance = 0;
      const balance: Record<string, number> = {};

      switch (chain) {
        case SupportedChain.ETHEREUM:
        case SupportedChain.POLYGON:
          address = await blockchainService.connectWallet(chain);
          // Get balances would be implemented here
          break;

        case SupportedChain.SOLANA:
          // For Solana, we'll simulate connection for now
          address = await this.simulateSolanaWalletConnection();
          break;

        case SupportedChain.COSMOS:
          // Simulate Cosmos wallet connection
          address = await this.simulateCosmosWalletConnection();
          break;

        case SupportedChain.SAGA:
          // Simulate Saga wallet connection
          address = await this.simulateSagaWalletConnection();
          break;

        default:
          throw new Error(`Unsupported chain: ${chain}`);
      }

      const wallet: UnifiedWallet = {
        address,
        chain,
        connected: true,
        balance,
        nativeBalance
      };

      this.connectedWallets.set(chain, wallet);
      await this.saveWalletConnection(wallet);

      console.log(`✅ Wallet connected to ${chain}:`, address);
      return wallet;
    } catch (error) {
      console.error(`❌ Failed to connect wallet to ${chain}:`, error);
      throw error;
    }
  }

  /**
   * Get connected wallets
   */
  getConnectedWallets(): UnifiedWallet[] {
    return Array.from(this.connectedWallets.values());
  }

  /**
   * Get wallet for specific chain
   */
  getWallet(chain: SupportedChain): UnifiedWallet | null {
    return this.connectedWallets.get(chain) || null;
  }

  /**
   * Create unified payment stream with automatic chain selection
   */
  async createPaymentStream(
    contentId: string,
    receiverAddress: string,
    amount: string,
    duration: number,
    options?: {
      preferredChain?: SupportedChain;
      token?: string;
      metadata?: any;
    }
  ): Promise<UnifiedStream> {
    try {
      console.log('💳 Creating unified payment stream...');

      // Select optimal chain
      const chain = await this.selectOptimalChain('payment_streaming', {
        preferredChain: options?.preferredChain,
        amount: parseFloat(amount),
        estimatedGas: await this.estimateStreamingGas(parseFloat(amount))
      });

      const wallet = this.getWallet(chain);
      if (!wallet) {
        throw new Error(`Wallet not connected to ${chain}`);
      }

      let streamId: string;
      let actualAmount = amount;
      let flowRate: string;

      switch (chain) {
        case SupportedChain.ETHEREUM:
        case SupportedChain.POLYGON:
          const evmStream = await blockchainService.createPaymentStream(
            contentId,
            receiverAddress,
            parseFloat(amount) / duration, // flow rate per second
            duration
          );
          streamId = evmStream.stream_id;
          flowRate = evmStream.flow_rate;
          break;

        case SupportedChain.SOLANA:
          streamId = await this.createSolanaStream(
            contentId,
            receiverAddress,
            amount,
            duration,
            options?.metadata
          );
          flowRate = (parseFloat(amount) / duration).toString();
          break;

        default:
          throw new Error(`Streaming not supported on ${chain}`);
      }

      const unifiedStream: UnifiedStream = {
        id: streamId,
        chain,
        sender: wallet.address,
        receiver: receiverAddress,
        token: options?.token || this.getDefaultToken(chain),
        flowRate,
        totalStreamed: '0',
        status: StreamStatus.ACTIVE,
        startTime: Date.now(),
        contentId,
        metadata: options?.metadata
      };

      this.streamCache.set(streamId, unifiedStream);
      await this.saveStream(unifiedStream);

      // Cross-chain sync if enabled
      if (this.config.crossChainSyncEnabled) {
        await this.syncStreamAcrossChains(unifiedStream);
      }

      console.log('✅ Unified payment stream created:', streamId);
      return unifiedStream;
    } catch (error) {
      console.error('❌ Failed to create payment stream:', error);
      throw error;
    }
  }

  /**
   * Update metadata with automatic chain routing
   */
  async updateMetadata(
    metadataId: string,
    updates: Array<{ field: string; value: any; type?: string }>,
    authority: string,
    options?: {
      preferredChain?: SupportedChain;
      reason?: string;
      syncAcrossChains?: boolean;
    }
  ): Promise<UnifiedMetadata> {
    try {
      console.log('📝 Updating unified metadata...');

      // Determine which chain contains the metadata
      const metadata = await this.getMetadata(metadataId);
      const chain = metadata?.chain ||
        await this.selectOptimalChain('metadata_update', {
          preferredChain: options?.preferredChain
        });

      let updatedMetadata: any;

      switch (chain) {
        case SupportedChain.SOLANA:
          const fieldUpdates = updates.map(update => ({
            field_key: update.field,
            new_value: typeof update.value === 'string' ? update.value : JSON.stringify(update.value),
            update_type: (update.type || 'SET').toUpperCase()
          }));

          updatedMetadata = await solanaService.updateMetadata(
            metadataId,
            fieldUpdates,
            authority,
            options?.reason
          );
          break;

        case SupportedChain.ETHEREUM:
        case SupportedChain.POLYGON:
          // EVM metadata updates would be handled differently
          updatedMetadata = await this.updateEVMMetadata(
            metadataId,
            updates,
            authority,
            chain
          );
          break;

        default:
          throw new Error(`Metadata updates not supported on ${chain}`);
      }

      const unified = this.convertToUnifiedMetadata(updatedMetadata, chain);
      this.metadataCache.set(metadataId, unified);

      // Cross-chain sync if requested
      if (options?.syncAcrossChains && this.config.crossChainSyncEnabled) {
        await this.syncMetadataAcrossChains(unified);
      }

      console.log('✅ Unified metadata updated');
      return unified;
    } catch (error) {
      console.error('❌ Failed to update metadata:', error);
      throw error;
    }
  }

  /**
   * Get unified metadata from any chain
   */
  async getMetadata(metadataId: string): Promise<UnifiedMetadata | null> {
    try {
      // Check cache first
      if (this.metadataCache.has(metadataId)) {
        return this.metadataCache.get(metadataId)!;
      }

      // Try to fetch from all chains
      const results = await Promise.allSettled([
        this.getMetadataFromChain(metadataId, SupportedChain.SOLANA),
        this.getMetadataFromChain(metadataId, SupportedChain.ETHEREUM),
        this.getMetadataFromChain(metadataId, SupportedChain.POLYGON),
        this.getMetadataFromChain(metadataId, SupportedChain.COSMOS),
        this.getMetadataFromChain(metadataId, SupportedChain.SAGA)
      ]);

      // Return the first successful result
      for (const result of results) {
        if (result.status === 'fulfilled' && result.value) {
          this.metadataCache.set(metadataId, result.value);
          return result.value;
        }
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get metadata:', error);
      return null;
    }
  }

  /**
   * Get unified streams for user across all chains
   */
  async getUserStreams(userAddress?: string): Promise<UnifiedStream[]> {
    try {
      const streams: UnifiedStream[] = [];

      // Get streams from all connected chains
      for (const wallet of this.connectedWallets.values()) {
        const address = userAddress || wallet.address;

        switch (wallet.chain) {
          case SupportedChain.ETHEREUM:
          case SupportedChain.POLYGON:
            const evmStreams = await blockchainService.getActiveStreams();
            streams.push(...evmStreams.map(stream =>
              this.convertEVMStreamToUnified(stream, wallet.chain)
            ));
            break;

          case SupportedChain.SOLANA:
            const solanaStreams = await this.getSolanaStreams(address);
            streams.push(...solanaStreams);
            break;
        }
      }

      return streams;
    } catch (error) {
      console.error('❌ Failed to get user streams:', error);
      return [];
    }
  }

  /**
   * Select optimal chain for operation
   */
  private async selectOptimalChain(
    operation: string,
    options?: {
      preferredChain?: SupportedChain;
      amount?: number;
      estimatedGas?: number;
    }
  ): Promise<SupportedChain> {
    // Return preferred chain if specified and wallet is connected
    if (options?.preferredChain && this.connectedWallets.has(options.preferredChain)) {
      return options.preferredChain;
    }

    // Use configured preference for operation
    if (this.config.preferredChainForOperation[operation]) {
      const preferred = this.config.preferredChainForOperation[operation];
      if (this.connectedWallets.has(preferred)) {
        return preferred;
      }
    }

    // Auto-select based on gas optimization if enabled
    if (this.config.gasOptimization && options?.amount && options?.estimatedGas) {
      return await this.selectChainByGasOptimization(operation, options.amount, options.estimatedGas);
    }

    // Fallback to default chain or first connected wallet
    if (this.connectedWallets.has(this.config.defaultChain)) {
      return this.config.defaultChain;
    }

    const firstConnected = Array.from(this.connectedWallets.keys())[0];
    if (firstConnected) {
      return firstConnected;
    }

    throw new Error('No wallets connected');
  }

  /**
   * Select chain based on gas optimization
   */
  private async selectChainByGasOptimization(
    operation: string,
    amount: number,
    estimatedGas: number
  ): Promise<SupportedChain> {
    const allChains = [
      SupportedChain.ETHEREUM,
      SupportedChain.POLYGON,
      SupportedChain.SOLANA,
      SupportedChain.COSMOS,
      SupportedChain.SAGA
    ];

    const chainCosts = await Promise.all(
      allChains.map(chain => this.estimateOperationCost(chain, operation, amount))
    );

    // Find chain with lowest cost that user has wallet connected to
    const availableChains = Array.from(this.connectedWallets.keys());
    let cheapestChain = availableChains[0];
    let lowestCost = Infinity;

    for (let i = 0; i < chainCosts.length; i++) {
      const chain = allChains[i];
      if (availableChains.includes(chain) && chainCosts[i] < lowestCost) {
        lowestCost = chainCosts[i];
        cheapestChain = chain;
      }
    }

    return cheapestChain;
  }

  /**
   * Cross-chain synchronization methods
   */
  private async syncStreamAcrossChains(stream: UnifiedStream): Promise<void> {
    try {
      // Record stream reference in other chains for tracking
      const syncData = {
        originalStream: stream.id,
        originalChain: stream.chain,
        sender: stream.sender,
        receiver: stream.receiver,
        amount: stream.totalStreamed,
        contentId: stream.contentId,
        timestamp: Date.now()
      };

      // Store cross-chain reference
      await this.storeCrossChainReference('stream', stream.id, syncData);

      console.log('🔗 Stream synced across chains');
    } catch (error) {
      console.error('❌ Failed to sync stream across chains:', error);
    }
  }

  private async syncMetadataAcrossChains(metadata: UnifiedMetadata): Promise<void> {
    try {
      // Create lightweight metadata references on other chains
      const syncData = {
        originalMetadata: metadata.id,
        originalChain: metadata.chain,
        entityType: metadata.entityType,
        lastUpdated: metadata.lastUpdated,
        fieldsHash: this.hashFields(metadata.fields)
      };

      await this.storeCrossChainReference('metadata', metadata.id, syncData);

      console.log('🔗 Metadata synced across chains');
    } catch (error) {
      console.error('❌ Failed to sync metadata across chains:', error);
    }
  }

  // Helper methods for chain-specific operations
  private async simulateSolanaWalletConnection(): Promise<string> {
    // Generate mock Solana address for development
    return `${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 9)}${Math.random().toString(36).substr(2, 9)}`;
  }

  private async simulateCosmosWalletConnection(): Promise<string> {
    // Generate mock Cosmos address for development
    return `cosmos1${Math.random().toString(36).substr(2, 38)}`;
  }

  private async simulateSagaWalletConnection(): Promise<string> {
    // Generate mock Saga address for development
    return `saga1${Math.random().toString(36).substr(2, 39)}`;
  }

  private async createSolanaStream(
    contentId: string,
    receiver: string,
    amount: string,
    duration: number,
    metadata?: any
  ): Promise<string> {
    // Simulate Solana stream creation
    return `solana_stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getSolanaStreams(address: string): Promise<UnifiedStream[]> {
    // Simulate getting Solana streams
    return [];
  }

  private async updateEVMMetadata(
    metadataId: string,
    updates: Array<{ field: string; value: any; type?: string }>,
    authority: string,
    chain: SupportedChain
  ): Promise<any> {
    // EVM metadata updates would be implemented here
    return {
      id: metadataId,
      updates,
      authority,
      chain,
      timestamp: Date.now()
    };
  }

  private async getMetadataFromChain(
    metadataId: string,
    chain: SupportedChain
  ): Promise<UnifiedMetadata | null> {
    try {
      switch (chain) {
        case SupportedChain.SOLANA:
          const solanaMetadata = await solanaService.getMetadata(metadataId);
          return solanaMetadata ? this.convertToUnifiedMetadata(solanaMetadata, chain) : null;

        case SupportedChain.ETHEREUM:
        case SupportedChain.POLYGON:
          // EVM metadata fetch would be implemented here
          return null;

        case SupportedChain.COSMOS:
          // Cosmos metadata fetch would be implemented here
          return null;

        case SupportedChain.SAGA:
          // Saga metadata fetch would be implemented here
          return null;

        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  private convertToUnifiedMetadata(metadata: any, chain: SupportedChain): UnifiedMetadata {
    return {
      id: metadata.id,
      chain,
      entityType: metadata.core_fields?.entity_type || 'unknown',
      schemaVersion: metadata.schema_version || 1,
      lastUpdated: metadata.last_updated || Date.now(),
      fields: this.extractFieldsFromMetadata(metadata),
      permissions: this.convertToUnifiedPermissions(metadata.field_permissions || []),
      history: this.convertToUnifiedHistory(metadata.update_history || [])
    };
  }

  private convertEVMStreamToUnified(stream: any, chain: SupportedChain): UnifiedStream {
    return {
      id: stream.stream_id,
      chain,
      sender: stream.sender || '',
      receiver: stream.receiver || '',
      token: 'USDC', // Default for EVM
      flowRate: stream.flow_rate,
      totalStreamed: stream.total_streamed,
      status: this.convertToUnifiedStreamStatus(stream.status),
      startTime: Date.now(), // Would be parsed from stream data
      contentId: stream.content_id,
      metadata: stream.metadata
    };
  }

  private convertToUnifiedStreamStatus(status: string): StreamStatus {
    switch (status.toLowerCase()) {
      case 'active': return StreamStatus.ACTIVE;
      case 'paused': return StreamStatus.PAUSED;
      case 'completed': return StreamStatus.COMPLETED;
      case 'cancelled': return StreamStatus.CANCELLED;
      default: return StreamStatus.ACTIVE;
    }
  }

  private extractFieldsFromMetadata(metadata: any): Record<string, any> {
    const fields: Record<string, any> = {};

    if (metadata.dynamic_fields) {
      for (const field of metadata.dynamic_fields) {
        try {
          fields[field.key] = JSON.parse(field.value);
        } catch {
          fields[field.key] = field.value;
        }
      }
    }

    return fields;
  }

  private convertToUnifiedPermissions(permissions: any[]): MetadataPermission[] {
    return permissions.map(perm => ({
      field: perm.field_key,
      operation: perm.permission_type.toLowerCase(),
      authorized: perm.authorized_keys
    }));
  }

  private convertToUnifiedHistory(history: any[]): MetadataHistory[] {
    return history.map(entry => ({
      field: entry.field_key,
      oldValue: entry.old_value,
      newValue: entry.new_value,
      updatedBy: entry.updated_by,
      timestamp: entry.timestamp,
      reason: entry.reason
    }));
  }

  private getDefaultToken(chain: SupportedChain): string {
    const defaultTokens = {
      [SupportedChain.ETHEREUM]: 'USDC',
      [SupportedChain.POLYGON]: 'USDC',
      [SupportedChain.SOLANA]: 'USDC',
      [SupportedChain.COSMOS]: 'ATOM',
      [SupportedChain.SAGA]: 'SAGA'
    };
    return defaultTokens[chain];
  }

  private async estimateStreamingGas(amount: number): Promise<number> {
    // Estimate gas for streaming operations
    return amount * 0.001; // Mock estimation
  }

  private async estimateOperationCost(
    chain: SupportedChain,
    operation: string,
    amount: number
  ): Promise<number> {
    // Mock cost estimation in USD
    const baseCosts = {
      [SupportedChain.ETHEREUM]: 10, // $10 average
      [SupportedChain.POLYGON]: 0.1, // $0.10 average
      [SupportedChain.SOLANA]: 0.01,   // $0.01 average
      [SupportedChain.COSMOS]: 0.05,   // $0.05 average
      [SupportedChain.SAGA]: 0.02      // $0.02 average
    };

    return baseCosts[chain] * (amount / 100); // Scale with amount
  }

  private hashFields(fields: Record<string, any>): string {
    // Simple hash of fields for comparison
    return btoa(JSON.stringify(fields)).slice(0, 16);
  }

  // Storage methods
  private async loadSavedWallets(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem('connected_wallets');
      if (saved) {
        const wallets: UnifiedWallet[] = JSON.parse(saved);
        for (const wallet of wallets) {
          this.connectedWallets.set(wallet.chain, wallet);
        }
      }
    } catch (error) {
      console.error('Failed to load saved wallets:', error);
    }
  }

  private async saveWalletConnection(wallet: UnifiedWallet): Promise<void> {
    try {
      const wallets = this.getConnectedWallets();
      await AsyncStorage.setItem('connected_wallets', JSON.stringify(wallets));
    } catch (error) {
      console.error('Failed to save wallet connection:', error);
    }
  }

  private async loadUserPreferences(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('user_preferences')
          .select('preferences')
          .eq('user_id', user.id)
          .single();

        if (data?.preferences?.multiChain) {
          this.config = { ...this.config, ...data.preferences.multiChain };
        }
      }
    } catch (error) {
      console.error('Failed to load user preferences:', error);
    }
  }

  private async saveStream(stream: UnifiedStream): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('unified_streams')
          .insert({
            stream_id: stream.id,
            user_id: user.id,
            chain: stream.chain,
            stream_data: JSON.stringify(stream),
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Failed to save stream:', error);
    }
  }

  private async storeCrossChainReference(
    type: 'stream' | 'metadata',
    originalId: string,
    syncData: any
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('cross_chain_references')
          .insert({
            reference_type: type,
            original_id: originalId,
            sync_data: JSON.stringify(syncData),
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      console.error('Failed to store cross-chain reference:', error);
    }
  }

  /**
   * Cleanup connections
   */
  cleanup(): void {
    this.connectedWallets.clear();
    this.transactionCache.clear();
    this.streamCache.clear();
    this.metadataCache.clear();

    blockchainService.cleanup();
    solanaService.cleanup();
  }
}

export const multiChainService = new MultiChainService();
export default multiChainService;