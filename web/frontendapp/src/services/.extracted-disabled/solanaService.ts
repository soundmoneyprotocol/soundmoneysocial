/**
 * Solana Service Integration
 * Handles dynamic metadata, schema versioning, and Solana blockchain interactions
 * Enhanced with BEZY token burn/airdrop functionality
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './authService';

// BEZY Burn/Airdrop types
interface SolanaWallet {
  address: string;
  connected: boolean;
  connected_at: string;
}

interface BurnAirdropRequest {
  saga_wallet_address: string;
  solana_wallet_address: string;
  burn_amount: number;
  airdrop_amount: number;
}

interface BurnAirdropResponse {
  success: boolean;
  burn_transaction_id?: string;
  airdrop_transaction_id?: string;
  error?: string;
}

// Solana metadata types based on the architecture documents
interface MetadataRegistry {
  id: string;
  schema_version: number;
  update_authority: string;
  last_updated: number;
  core_fields: CoreMetadataFields;
  dynamic_fields: DynamicField[];
  field_permissions: FieldPermission[];
  update_history: MetadataUpdate[];
}

interface CoreMetadataFields {
  created_at: number;
  creator: string;
  program_id: string;
  entity_type: EntityType;
  unique_identifier: string;
}

interface DynamicField {
  key: string;
  value: string;
  field_type: FieldType;
  added_in_version: number;
  is_mutable: boolean;
  update_authority?: string;
  validation_rules: ValidationRule[];
  created_at: number;
  last_updated: number;
}

interface MusicNFTMetadata {
  base: MetadataRegistry;
  music_core: MusicCoreFields;
  music_fields: MusicDynamicField[];
}

interface MusicCoreFields {
  audio_fingerprint: string;
  isrc?: string;
  uploaded_at: number;
  audio_hash: string;
  original_format: AudioFormat;
  duration_ms: number;
}

interface MusicDynamicField {
  base: DynamicField;
  music_specific: MusicFieldType;
}

enum EntityType {
  MUSIC_NFT = 'MUSIC_NFT',
  USER_PROFILE = 'USER_PROFILE',
  STREAMING_SESSION = 'STREAMING_SESSION',
  COPYRIGHT_REPORT = 'COPYRIGHT_REPORT'
}

enum FieldType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  ARRAY = 'ARRAY',
  OBJECT = 'OBJECT',
  PUBLIC_KEY = 'PUBLIC_KEY',
  TIMESTAMP = 'TIMESTAMP',
  URI = 'URI',
  HASH = 'HASH',
  CUSTOM = 'CUSTOM'
}

enum MusicFieldType {
  TITLE = 'TITLE',
  ARTIST = 'ARTIST',
  ALBUM = 'ALBUM',
  GENRE = 'GENRE',
  STREAM_COUNT = 'STREAM_COUNT',
  LIKE_COUNT = 'LIKE_COUNT',
  BPM = 'BPM',
  KEY = 'KEY',
  MOOD = 'MOOD',
  REVENUE = 'REVENUE',
  ROYALTY_SPLIT = 'ROYALTY_SPLIT',
  SPOTIFY_ID = 'SPOTIFY_ID',
  YOUTUBE_ID = 'YOUTUBE_ID'
}

enum AudioFormat {
  MP3 = 'MP3',
  WAV = 'WAV',
  FLAC = 'FLAC',
  AAC = 'AAC',
  OGG = 'OGG',
  M4A = 'M4A'
}

interface ValidationRule {
  rule_type: ValidationType;
  parameters: string[];
  error_message: string;
}

enum ValidationType {
  REQUIRED = 'REQUIRED',
  MIN_LENGTH = 'MIN_LENGTH',
  MAX_LENGTH = 'MAX_LENGTH',
  PATTERN = 'PATTERN',
  RANGE = 'RANGE',
  ONE_OF = 'ONE_OF',
  CUSTOM = 'CUSTOM'
}

interface FieldPermission {
  field_key: string;
  permission_type: PermissionType;
  authorized_keys: string[];
  required_signatures: number;
  expiry?: number;
}

enum PermissionType {
  READ = 'READ',
  WRITE = 'WRITE',
  DELETE = 'DELETE',
  ADMIN = 'ADMIN'
}

interface MetadataUpdate {
  field_key: string;
  old_value?: string;
  new_value: string;
  updated_by: string;
  timestamp: number;
  transaction_signature: string;
  reason?: string;
}

interface SchemaRegistry {
  version: number;
  previous_version?: number;
  allows_new_fields: boolean;
  allows_field_modifications: boolean;
  created_at: number;
  upgrade_authority: string;
  supported_field_types: FieldType[];
  migration_instructions: MigrationInstruction[];
}

interface MigrationInstruction {
  instruction_type: MigrationType;
  source_field?: string;
  target_field: string;
  transformation_function?: string;
  is_required: boolean;
}

enum MigrationType {
  ADD_FIELD = 'ADD_FIELD',
  REMOVE_FIELD = 'REMOVE_FIELD',
  RENAME_FIELD = 'RENAME_FIELD',
  CHANGE_FIELD_TYPE = 'CHANGE_FIELD_TYPE',
  SPLIT_FIELD = 'SPLIT_FIELD',
  MERGE_FIELDS = 'MERGE_FIELDS',
  CUSTOM_MIGRATION = 'CUSTOM_MIGRATION'
}

interface FieldUpdate {
  field_key: string;
  new_value: string;
  update_type: UpdateType;
}

enum UpdateType {
  SET = 'SET',
  APPEND = 'APPEND',
  REMOVE = 'REMOVE',
  INCREMENT = 'INCREMENT',
  DECREMENT = 'DECREMENT'
}

interface SolanaConfig {
  rpc_url: string;
  metadata_program_id: string;
  music_program_id: string;
  schema_registry_account: string;
  current_schema_version: number;
}

class SolanaService {
  private config: SolanaConfig;
  private metadataCache: Map<string, MetadataRegistry> = new Map();
  private schemaCache: Map<number, SchemaRegistry> = new Map();

  constructor() {
    this.config = {
      rpc_url: process.env.EXPO_PUBLIC_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
      metadata_program_id: 'SMPLmeta1111111111111111111111111111111111',
      music_program_id: 'SMPLmusic11111111111111111111111111111111',
      schema_registry_account: 'SMPLschema111111111111111111111111111111',
      current_schema_version: 2
    };
  }

  // ============ BEZY BURN/AIRDROP FUNCTIONALITY ============

  private APP_IDENTITY = {
    name: 'BEZY',
    uri: 'https://bezy.app',
    icon: 'favicon.ico'
  };

  private BEZY_CONFIG = {
    saga_contract_address: '0x67a575c850d4d72d9c66c43ba25b15e8f5db2037',
    burn_amount: 4000,
    airdrop_amount: 40000,
    saga_chain_id: 'saga-1', // SAGA mainnet chain ID
    solana_cluster: 'devnet' // Switch to 'mainnet-beta' for production
  };

  /**
   * Connect Solana wallet using Mobile Wallet Adapter
   */
  async connectSolanaWallet(): Promise<string> {
    try {
      console.log('🔗 Connecting Solana wallet...');

      // For development, simulate wallet connection
      // In production, this will use the actual Solana Mobile Wallet Adapter
      const mockSolanaWallet: SolanaWallet = {
        address: this.generateMockSolanaAddress(),
        connected: true,
        connected_at: new Date().toISOString()
      };

      // Store Solana wallet info
      await AsyncStorage.setItem('solana_wallet', JSON.stringify(mockSolanaWallet));

      console.log('✅ Solana wallet connected:', mockSolanaWallet.address);
      return mockSolanaWallet.address;

      /*
      // Production implementation with actual Mobile Wallet Adapter:

      const { transact } = await import('@solana-mobile/mobile-wallet-adapter-protocol-web3js');

      const solanaAddress = await transact(async (wallet) => {
        const authorizationResult = await wallet.authorize({
          cluster: 'solana:devnet', // or 'solana:mainnet-beta' for production
          identity: this.APP_IDENTITY
        });

        return authorizationResult.address;
      });

      const solanaWallet: SolanaWallet = {
        address: solanaAddress,
        connected: true,
        connected_at: new Date().toISOString()
      };

      await AsyncStorage.setItem('solana_wallet', JSON.stringify(solanaWallet));
      return solanaAddress;
      */
    } catch (error) {
      console.error('❌ Failed to connect Solana wallet:', error);
      throw error;
    }
  }

  /**
   * Get connected Solana wallet
   */
  async getConnectedSolanaWallet(): Promise<SolanaWallet | null> {
    try {
      const walletData = await AsyncStorage.getItem('solana_wallet');
      return walletData ? JSON.parse(walletData) : null;
    } catch (error) {
      console.error('❌ Failed to get Solana wallet:', error);
      return null;
    }
  }

  /**
   * Disconnect Solana wallet
   */
  async disconnectSolanaWallet(): Promise<void> {
    try {
      await AsyncStorage.removeItem('solana_wallet');
      console.log('🔌 Solana wallet disconnected');
    } catch (error) {
      console.error('❌ Failed to disconnect Solana wallet:', error);
    }
  }

  /**
   * Initiate BEZY burn/airdrop process
   * Burns 4,000 BEZY on SAGA, airdrops 40,000 BEZY on Solana
   */
  async initiateBurnAirdrop(
    sagaWalletAddress: string,
    solanaWalletAddress: string
  ): Promise<BurnAirdropResponse> {
    try {
      console.log('🔥 Initiating BEZY burn/airdrop process...');
      console.log('📍 SAGA wallet:', sagaWalletAddress);
      console.log('📍 Solana wallet:', solanaWalletAddress);

      // Call backend API to coordinate burn/airdrop
      const { apiService } = await import('./apiService');

      const request: BurnAirdropRequest = {
        saga_wallet_address: sagaWalletAddress,
        solana_wallet_address: solanaWalletAddress,
        burn_amount: this.BEZY_CONFIG.burn_amount,
        airdrop_amount: this.BEZY_CONFIG.airdrop_amount
      };

      // Add contract configuration to request
      const burnRequest = {
        ...request,
        saga_contract_address: this.BEZY_CONFIG.saga_contract_address,
        saga_chain_id: this.BEZY_CONFIG.saga_chain_id,
        solana_cluster: this.BEZY_CONFIG.solana_cluster
      };

      const result = await apiService.post('/api/v1/bezy/burn-airdrop', burnRequest);

      if (!result.success) {
        throw new Error(result.error || 'Burn/airdrop failed');
      }

      console.log('✅ Burn/airdrop completed successfully');
      console.log('🔥 Burn transaction:', result.data.burn_transaction_id);
      console.log('💰 Airdrop transaction:', result.data.airdrop_transaction_id);

      return {
        success: true,
        burn_transaction_id: result.data.burn_transaction_id,
        airdrop_transaction_id: result.data.airdrop_transaction_id
      };
    } catch (error) {
      console.error('❌ Burn/airdrop failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Check user's SAGA BEZY balance eligibility for burn
   */
  async checkBurnEligibility(userAddress: string): Promise<{
    eligible: boolean;
    current_balance: number;
    required_balance: number;
    message: string;
  }> {
    try {
      const { apiService } = await import('./apiService');

      const result = await apiService.get(`/api/v1/bezy/burn-eligibility/${userAddress}`);

      if (!result.success) {
        throw new Error(result.error || 'Failed to check eligibility');
      }

      return result.data;
    } catch (error) {
      console.error('❌ Failed to check burn eligibility:', error);
      return {
        eligible: false,
        current_balance: 0,
        required_balance: 4000,
        message: 'Failed to check balance eligibility'
      };
    }
  }

  /**
   * Get burn/airdrop transaction history
   */
  async getBurnAirdropHistory(userAddress: string): Promise<any[]> {
    try {
      const { apiService } = await import('./apiService');

      const result = await apiService.get(`/api/v1/bezy/burn-airdrop-history/${userAddress}`);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch history');
      }

      return result.data || [];
    } catch (error) {
      console.error('❌ Failed to get burn/airdrop history:', error);
      return [];
    }
  }

  /**
   * Generate mock Solana address for development
   */
  private generateMockSolanaAddress(): string {
    // Generate a mock Solana address (base58 encoded, 32 bytes)
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 44; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Validate Solana address format
   */
  validateSolanaAddress(address: string): boolean {
    // Basic validation for Solana address format
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return base58Regex.test(address);
  }

  // ============ EXISTING METADATA FUNCTIONALITY ============

  /**
   * Initialize Solana service and load schema registry
   */
  async initialize(): Promise<void> {
    try {
      console.log('🔗 Initializing Solana service...');

      // Load current schema from cache or network
      await this.loadSchemaRegistry(this.config.current_schema_version);

      // Initialize connection test
      await this.testConnection();

      console.log('✅ Solana service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Solana service:', error);
      throw error;
    }
  }

  /**
   * Create music NFT metadata with dynamic fields
   */
  async createMusicMetadata(
    musicData: Partial<MusicCoreFields>,
    dynamicFields: Record<string, any> = {},
    authority: string
  ): Promise<MusicNFTMetadata> {
    try {
      console.log('🎵 Creating music NFT metadata...');

      const now = Date.now();
      const metadataId = this.generateMetadataId();

      // Build core metadata fields
      const coreFields: CoreMetadataFields = {
        created_at: now,
        creator: authority,
        program_id: this.config.music_program_id,
        entity_type: EntityType.MUSIC_NFT,
        unique_identifier: metadataId
      };

      // Build music core fields with defaults
      const musicCore: MusicCoreFields = {
        audio_fingerprint: musicData.audio_fingerprint || '',
        isrc: musicData.isrc,
        uploaded_at: musicData.uploaded_at || now,
        audio_hash: musicData.audio_hash || '',
        original_format: musicData.original_format || AudioFormat.MP3,
        duration_ms: musicData.duration_ms || 0
      };

      // Convert dynamic fields to DynamicField array
      const musicDynamicFields: MusicDynamicField[] = [];

      for (const [key, value] of Object.entries(dynamicFields)) {
        const musicFieldType = this.getMusicFieldTypeFromKey(key);
        const dynamicField: DynamicField = {
          key,
          value: JSON.stringify(value),
          field_type: this.inferFieldType(value),
          added_in_version: this.config.current_schema_version,
          is_mutable: this.isMutableField(musicFieldType),
          update_authority: authority,
          validation_rules: this.getValidationRulesForField(musicFieldType),
          created_at: now,
          last_updated: now
        };

        musicDynamicFields.push({
          base: dynamicField,
          music_specific: musicFieldType
        });
      }

      // Build base metadata registry
      const baseMetadata: MetadataRegistry = {
        id: metadataId,
        schema_version: this.config.current_schema_version,
        update_authority: authority,
        last_updated: now,
        core_fields: coreFields,
        dynamic_fields: musicDynamicFields.map(f => f.base),
        field_permissions: [],
        update_history: []
      };

      const musicMetadata: MusicNFTMetadata = {
        base: baseMetadata,
        music_core: musicCore,
        music_fields: musicDynamicFields
      };

      // Cache metadata
      this.metadataCache.set(metadataId, baseMetadata);

      // In production, this would submit to Solana
      await this.simulateMetadataCreation(musicMetadata);

      console.log('✅ Music NFT metadata created:', metadataId);
      return musicMetadata;
    } catch (error) {
      console.error('❌ Failed to create music metadata:', error);
      throw error;
    }
  }

  /**
   * Update dynamic metadata fields
   */
  async updateMetadata(
    metadataId: string,
    fieldUpdates: FieldUpdate[],
    authority: string,
    reason?: string
  ): Promise<MetadataRegistry> {
    try {
      console.log('📝 Updating metadata:', metadataId);

      // Load existing metadata
      const metadata = await this.getMetadata(metadataId);
      if (!metadata) {
        throw new Error('Metadata not found');
      }

      // Validate updates
      await this.validateFieldUpdates(metadata, fieldUpdates, authority);

      // Apply updates
      const updatedMetadata = await this.applyFieldUpdates(
        metadata,
        fieldUpdates,
        authority,
        reason
      );

      // Cache updated metadata
      this.metadataCache.set(metadataId, updatedMetadata);

      // In production, this would submit to Solana
      await this.simulateMetadataUpdate(updatedMetadata, fieldUpdates);

      console.log('✅ Metadata updated successfully');
      return updatedMetadata;
    } catch (error) {
      console.error('❌ Failed to update metadata:', error);
      throw error;
    }
  }

  /**
   * Migrate metadata to new schema version
   */
  async migrateMetadataSchema(
    metadataId: string,
    targetVersion: number,
    authority: string,
    forceMigration: boolean = false
  ): Promise<MetadataRegistry> {
    try {
      console.log(`🔄 Migrating metadata ${metadataId} to version ${targetVersion}`);

      const metadata = await this.getMetadata(metadataId);
      if (!metadata) {
        throw new Error('Metadata not found');
      }

      if (metadata.schema_version >= targetVersion) {
        throw new Error('Cannot migrate to older or same schema version');
      }

      // Load target schema
      const targetSchema = await this.loadSchemaRegistry(targetVersion);

      // Apply migration instructions
      const migratedMetadata = await this.applyMigrationInstructions(
        metadata,
        targetSchema,
        authority,
        forceMigration
      );

      // Update schema version
      migratedMetadata.schema_version = targetVersion;
      migratedMetadata.last_updated = Date.now();

      // Add migration record to history
      migratedMetadata.update_history.push({
        field_key: '__schema_version',
        old_value: metadata.schema_version.toString(),
        new_value: targetVersion.toString(),
        updated_by: authority,
        timestamp: migratedMetadata.last_updated,
        transaction_signature: this.generateTransactionId(),
        reason: `Schema migration to version ${targetVersion}`
      });

      // Cache migrated metadata
      this.metadataCache.set(metadataId, migratedMetadata);

      console.log('✅ Schema migration completed');
      return migratedMetadata;
    } catch (error) {
      console.error('❌ Failed to migrate schema:', error);
      throw error;
    }
  }

  /**
   * Get metadata by ID
   */
  async getMetadata(metadataId: string): Promise<MetadataRegistry | null> {
    try {
      // Check cache first
      if (this.metadataCache.has(metadataId)) {
        return this.metadataCache.get(metadataId)!;
      }

      // In production, this would fetch from Solana
      const metadata = await this.simulateMetadataFetch(metadataId);

      if (metadata) {
        this.metadataCache.set(metadataId, metadata);
      }

      return metadata;
    } catch (error) {
      console.error('❌ Failed to get metadata:', error);
      return null;
    }
  }

  /**
   * Get music NFT metadata
   */
  async getMusicMetadata(metadataId: string): Promise<MusicNFTMetadata | null> {
    try {
      const baseMetadata = await this.getMetadata(metadataId);
      if (!baseMetadata || baseMetadata.core_fields.entity_type !== EntityType.MUSIC_NFT) {
        return null;
      }

      // Reconstruct music metadata
      const musicCore = this.extractMusicCoreFromMetadata(baseMetadata);
      const musicFields = this.extractMusicFieldsFromMetadata(baseMetadata);

      return {
        base: baseMetadata,
        music_core: musicCore,
        music_fields: musicFields
      };
    } catch (error) {
      console.error('❌ Failed to get music metadata:', error);
      return null;
    }
  }

  /**
   * Increment streaming metrics
   */
  async incrementStreamMetrics(
    metadataId: string,
    authority: string,
    metricsToUpdate: Record<string, number> = {}
  ): Promise<void> {
    try {
      const updates: FieldUpdate[] = [];

      // Default stream count increment
      if (!metricsToUpdate.stream_count) {
        metricsToUpdate.stream_count = 1;
      }

      for (const [metric, increment] of Object.entries(metricsToUpdate)) {
        updates.push({
          field_key: metric,
          new_value: increment.toString(),
          update_type: UpdateType.INCREMENT
        });
      }

      await this.updateMetadata(
        metadataId,
        updates,
        authority,
        'Real-time stream metrics update'
      );

      console.log('📊 Stream metrics incremented:', metadataId);
    } catch (error) {
      console.error('❌ Failed to increment stream metrics:', error);
      throw error;
    }
  }

  /**
   * Get schema registry for version
   */
  async getSchemaRegistry(version: number): Promise<SchemaRegistry | null> {
    try {
      return await this.loadSchemaRegistry(version);
    } catch (error) {
      console.error('❌ Failed to get schema registry:', error);
      return null;
    }
  }

  // Private helper methods

  private async loadSchemaRegistry(version: number): Promise<SchemaRegistry> {
    if (this.schemaCache.has(version)) {
      return this.schemaCache.get(version)!;
    }

    // In production, this would fetch from Solana
    const schema = await this.simulateSchemaFetch(version);
    this.schemaCache.set(version, schema);
    return schema;
  }

  private async validateFieldUpdates(
    metadata: MetadataRegistry,
    updates: FieldUpdate[],
    authority: string
  ): Promise<void> {
    for (const update of updates) {
      const field = metadata.dynamic_fields.find(f => f.key === update.field_key);

      if (field) {
        if (!field.is_mutable) {
          throw new Error(`Field ${update.field_key} is not mutable`);
        }

        if (field.update_authority && field.update_authority !== authority) {
          throw new Error(`Unauthorized to update field ${update.field_key}`);
        }

        // Validate against field rules
        this.validateFieldValue(field, update.new_value);
      }
    }
  }

  private async applyFieldUpdates(
    metadata: MetadataRegistry,
    updates: FieldUpdate[],
    authority: string,
    reason?: string
  ): Promise<MetadataRegistry> {
    const now = Date.now();
    const updatedMetadata = { ...metadata };

    for (const update of updates) {
      const fieldIndex = updatedMetadata.dynamic_fields.findIndex(f => f.key === update.field_key);

      if (fieldIndex >= 0) {
        const field = updatedMetadata.dynamic_fields[fieldIndex];
        const oldValue = field.value;

        // Apply update based on type
        field.value = this.applyUpdateType(field.value, update.new_value, update.update_type);
        field.last_updated = now;

        // Record update history
        updatedMetadata.update_history.push({
          field_key: update.field_key,
          old_value: oldValue,
          new_value: field.value,
          updated_by: authority,
          timestamp: now,
          transaction_signature: this.generateTransactionId(),
          reason
        });
      } else {
        // Create new field if allowed
        const newField: DynamicField = {
          key: update.field_key,
          value: update.new_value,
          field_type: this.inferFieldType(update.new_value),
          added_in_version: updatedMetadata.schema_version,
          is_mutable: true,
          update_authority: authority,
          validation_rules: [],
          created_at: now,
          last_updated: now
        };

        updatedMetadata.dynamic_fields.push(newField);

        updatedMetadata.update_history.push({
          field_key: update.field_key,
          new_value: update.new_value,
          updated_by: authority,
          timestamp: now,
          transaction_signature: this.generateTransactionId(),
          reason
        });
      }
    }

    updatedMetadata.last_updated = now;
    return updatedMetadata;
  }

  private async applyMigrationInstructions(
    metadata: MetadataRegistry,
    targetSchema: SchemaRegistry,
    authority: string,
    forceMigration: boolean
  ): Promise<MetadataRegistry> {
    const migratedMetadata = { ...metadata };

    for (const instruction of targetSchema.migration_instructions) {
      switch (instruction.instruction_type) {
        case MigrationType.ADD_FIELD:
          this.applyAddFieldMigration(migratedMetadata, instruction);
          break;
        case MigrationType.RENAME_FIELD:
          this.applyRenameFieldMigration(migratedMetadata, instruction);
          break;
        case MigrationType.REMOVE_FIELD:
          this.applyRemoveFieldMigration(migratedMetadata, instruction);
          break;
        case MigrationType.CHANGE_FIELD_TYPE:
          if (!forceMigration && instruction.is_required) {
            throw new Error('Field type change requires force migration');
          }
          this.applyFieldTypeChangeMigration(migratedMetadata, instruction);
          break;
        case MigrationType.CUSTOM_MIGRATION:
          await this.applyCustomMigration(migratedMetadata, instruction);
          break;
      }
    }

    return migratedMetadata;
  }

  private applyAddFieldMigration(metadata: MetadataRegistry, instruction: MigrationInstruction): void {
    const newField: DynamicField = {
      key: instruction.target_field,
      value: '',
      field_type: FieldType.STRING,
      added_in_version: metadata.schema_version + 1,
      is_mutable: true,
      update_authority: metadata.update_authority,
      validation_rules: [],
      created_at: Date.now(),
      last_updated: Date.now()
    };

    metadata.dynamic_fields.push(newField);
  }

  private applyRenameFieldMigration(metadata: MetadataRegistry, instruction: MigrationInstruction): void {
    if (!instruction.source_field) return;

    const field = metadata.dynamic_fields.find(f => f.key === instruction.source_field);
    if (field) {
      field.key = instruction.target_field;
    }
  }

  private applyRemoveFieldMigration(metadata: MetadataRegistry, instruction: MigrationInstruction): void {
    if (!instruction.source_field) return;

    metadata.dynamic_fields = metadata.dynamic_fields.filter(f => f.key !== instruction.source_field);
  }

  private applyFieldTypeChangeMigration(metadata: MetadataRegistry, instruction: MigrationInstruction): void {
    // Implementation would depend on specific type conversion logic
  }

  private async applyCustomMigration(metadata: MetadataRegistry, instruction: MigrationInstruction): Promise<void> {
    // Custom migration logic would be implemented here
  }

  private applyUpdateType(currentValue: string, newValue: string, updateType: UpdateType): string {
    switch (updateType) {
      case UpdateType.SET:
        return newValue;
      case UpdateType.INCREMENT:
        const current = parseFloat(currentValue) || 0;
        const increment = parseFloat(newValue) || 0;
        return (current + increment).toString();
      case UpdateType.DECREMENT:
        const currentDec = parseFloat(currentValue) || 0;
        const decrement = parseFloat(newValue) || 0;
        return Math.max(0, currentDec - decrement).toString();
      case UpdateType.APPEND:
        try {
          const currentArray = JSON.parse(currentValue);
          const newItem = JSON.parse(newValue);
          return JSON.stringify([...currentArray, newItem]);
        } catch {
          return JSON.stringify([currentValue, newValue]);
        }
      case UpdateType.REMOVE:
        try {
          const currentArray = JSON.parse(currentValue);
          const itemToRemove = JSON.parse(newValue);
          return JSON.stringify(currentArray.filter(item => item !== itemToRemove));
        } catch {
          return currentValue;
        }
      default:
        return newValue;
    }
  }

  private getMusicFieldTypeFromKey(key: string): MusicFieldType {
    const keyToTypeMap: Record<string, MusicFieldType> = {
      'title': MusicFieldType.TITLE,
      'artist': MusicFieldType.ARTIST,
      'album': MusicFieldType.ALBUM,
      'genre': MusicFieldType.GENRE,
      'stream_count': MusicFieldType.STREAM_COUNT,
      'like_count': MusicFieldType.LIKE_COUNT,
      'bpm': MusicFieldType.BPM,
      'key': MusicFieldType.KEY,
      'mood': MusicFieldType.MOOD,
      'revenue': MusicFieldType.REVENUE,
      'royalty_split': MusicFieldType.ROYALTY_SPLIT,
      'spotify_id': MusicFieldType.SPOTIFY_ID,
      'youtube_id': MusicFieldType.YOUTUBE_ID
    };

    return keyToTypeMap[key.toLowerCase()] || MusicFieldType.TITLE;
  }

  private inferFieldType(value: any): FieldType {
    if (typeof value === 'string') {
      if (value.startsWith('http')) return FieldType.URI;
      if (value.length === 64 && /^[a-fA-F0-9]+$/.test(value)) return FieldType.HASH;
      if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(value)) return FieldType.PUBLIC_KEY;
      return FieldType.STRING;
    }
    if (typeof value === 'number') return FieldType.NUMBER;
    if (typeof value === 'boolean') return FieldType.BOOLEAN;
    if (Array.isArray(value)) return FieldType.ARRAY;
    if (typeof value === 'object') return FieldType.OBJECT;
    return FieldType.STRING;
  }

  private isMutableField(fieldType: MusicFieldType): boolean {
    const immutableFields = [
      MusicFieldType.SPOTIFY_ID,
      MusicFieldType.YOUTUBE_ID
    ];
    return !immutableFields.includes(fieldType);
  }

  private getValidationRulesForField(fieldType: MusicFieldType): ValidationRule[] {
    const rules: Record<MusicFieldType, ValidationRule[]> = {
      [MusicFieldType.TITLE]: [{
        rule_type: ValidationType.REQUIRED,
        parameters: [],
        error_message: 'Title is required'
      }],
      [MusicFieldType.STREAM_COUNT]: [{
        rule_type: ValidationType.RANGE,
        parameters: ['0', '999999999'],
        error_message: 'Stream count must be non-negative'
      }],
      // Add more validation rules as needed
    };

    return rules[fieldType] || [];
  }

  private validateFieldValue(field: DynamicField, value: string): void {
    for (const rule of field.validation_rules) {
      switch (rule.rule_type) {
        case ValidationType.REQUIRED:
          if (!value || value.trim() === '') {
            throw new Error(rule.error_message);
          }
          break;
        case ValidationType.MIN_LENGTH:
          if (value.length < parseInt(rule.parameters[0])) {
            throw new Error(rule.error_message);
          }
          break;
        case ValidationType.MAX_LENGTH:
          if (value.length > parseInt(rule.parameters[0])) {
            throw new Error(rule.error_message);
          }
          break;
        case ValidationType.RANGE:
          const numValue = parseFloat(value);
          const min = parseFloat(rule.parameters[0]);
          const max = parseFloat(rule.parameters[1]);
          if (numValue < min || numValue > max) {
            throw new Error(rule.error_message);
          }
          break;
      }
    }
  }

  private extractMusicCoreFromMetadata(metadata: MetadataRegistry): MusicCoreFields {
    // In production, this would extract from specific fields
    return {
      audio_fingerprint: '',
      uploaded_at: metadata.core_fields.created_at,
      audio_hash: '',
      original_format: AudioFormat.MP3,
      duration_ms: 0
    };
  }

  private extractMusicFieldsFromMetadata(metadata: MetadataRegistry): MusicDynamicField[] {
    return metadata.dynamic_fields.map(field => ({
      base: field,
      music_specific: this.getMusicFieldTypeFromKey(field.key)
    }));
  }

  private generateMetadataId(): string {
    return `meta_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async testConnection(): Promise<void> {
    // In production, this would test Solana RPC connection
    console.log('🔗 Testing Solana connection...');
  }

  // Simulation methods for development (replace with actual Solana calls in production)
  private async simulateMetadataCreation(metadata: MusicNFTMetadata): Promise<void> {
    // Store in Supabase for development
    try {
      const { error } = await supabase
        .from('solana_metadata')
        .insert({
          metadata_id: metadata.base.id,
          metadata_json: JSON.stringify(metadata),
          schema_version: metadata.base.schema_version,
          entity_type: metadata.base.core_fields.entity_type,
          created_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Failed to simulate metadata creation:', error);
    }
  }

  private async simulateMetadataUpdate(metadata: MetadataRegistry, updates: FieldUpdate[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('solana_metadata')
        .update({
          metadata_json: JSON.stringify(metadata),
          updated_at: new Date().toISOString()
        })
        .eq('metadata_id', metadata.id);

      if (error) throw error;
    } catch (error) {
      console.error('Failed to simulate metadata update:', error);
    }
  }

  private async simulateMetadataFetch(metadataId: string): Promise<MetadataRegistry | null> {
    try {
      const { data, error } = await supabase
        .from('solana_metadata')
        .select('metadata_json')
        .eq('metadata_id', metadataId)
        .single();

      if (error || !data) return null;

      const metadata = JSON.parse(data.metadata_json);
      return metadata.base || metadata;
    } catch (error) {
      console.error('Failed to simulate metadata fetch:', error);
      return null;
    }
  }

  private async simulateSchemaFetch(version: number): Promise<SchemaRegistry> {
    // Return mock schema for development
    return {
      version,
      allows_new_fields: true,
      allows_field_modifications: true,
      created_at: Date.now(),
      upgrade_authority: 'SMPLauth1111111111111111111111111111111',
      supported_field_types: Object.values(FieldType),
      migration_instructions: []
    };
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.metadataCache.clear();
    this.schemaCache.clear();
  }
}

export const solanaService = new SolanaService();
export default solanaService;
export type { SolanaWallet, BurnAirdropRequest, BurnAirdropResponse };