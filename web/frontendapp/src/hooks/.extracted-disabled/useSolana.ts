/**
 * React hooks for Solana integration
 * Provides hooks for dynamic metadata, schema management, and Solana blockchain interactions
 */

import { useState, useEffect, useCallback } from 'react';
import solanaService, { SolanaWallet, BurnAirdropResponse } from '../services/solanaService';

// Re-export types for convenience
export type {
  MetadataRegistry,
  MusicNFTMetadata,
  MusicCoreFields,
  DynamicField,
  FieldUpdate,
  SchemaRegistry,
  MigrationInstruction
} from '../services/solanaService';

interface SolanaState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  currentSchemaVersion: number;
}

interface MetadataState {
  metadata: Record<string, any>;
  loading: boolean;
  error: string | null;
}

interface MusicMetadata {
  id: string;
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  streamCount?: number;
  likeCount?: number;
  revenue?: number;
  lastUpdated: number;
  schemaVersion: number;
}

/**
 * Main Solana service hook
 */
export const useSolana = () => {
  const [state, setState] = useState<SolanaState>({
    initialized: false,
    loading: false,
    error: null,
    currentSchemaVersion: 2
  });

  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await solanaService.initialize();
      setState(prev => ({
        ...prev,
        loading: false,
        initialized: true
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize Solana service'
      }));
    }
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    ...state,
    initialize
  };
};

/**
 * Hook for managing dynamic metadata
 */
export const useMetadata = (metadataId?: string) => {
  const [state, setState] = useState<MetadataState>({
    metadata: {},
    loading: false,
    error: null
  });

  const loadMetadata = useCallback(async (id: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const metadata = await solanaService.getMetadata(id);
      setState({
        metadata: metadata || {},
        loading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load metadata'
      }));
    }
  }, []);

  const updateMetadata = useCallback(async (
    id: string,
    updates: Array<{ field: string; value: any; type?: 'set' | 'increment' | 'append' }>,
    authority: string,
    reason?: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const fieldUpdates = updates.map(update => ({
        field_key: update.field,
        new_value: typeof update.value === 'string' ? update.value : JSON.stringify(update.value),
        update_type: (update.type || 'set').toUpperCase() as any
      }));

      const updatedMetadata = await solanaService.updateMetadata(
        id,
        fieldUpdates,
        authority,
        reason
      );

      setState({
        metadata: updatedMetadata,
        loading: false,
        error: null
      });

      return updatedMetadata;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update metadata'
      }));
      throw error;
    }
  }, []);

  const migrateSchema = useCallback(async (
    id: string,
    targetVersion: number,
    authority: string,
    force: boolean = false
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const migratedMetadata = await solanaService.migrateMetadataSchema(
        id,
        targetVersion,
        authority,
        force
      );

      setState({
        metadata: migratedMetadata,
        loading: false,
        error: null
      });

      return migratedMetadata;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to migrate schema'
      }));
      throw error;
    }
  }, []);

  useEffect(() => {
    if (metadataId) {
      loadMetadata(metadataId);
    }
  }, [metadataId, loadMetadata]);

  return {
    ...state,
    loadMetadata,
    updateMetadata,
    migrateSchema
  };
};

/**
 * Hook specifically for music NFT metadata
 */
export const useMusicMetadata = (metadataId?: string) => {
  const [musicData, setMusicData] = useState<MusicMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMusicMetadata = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const metadata = await solanaService.getMusicMetadata(id);

      if (metadata) {
        // Extract common music fields
        const musicData: MusicMetadata = {
          id: metadata.base.id,
          title: metadata.music_fields.find(f => f.music_specific === 'TITLE')?.base.value,
          artist: metadata.music_fields.find(f => f.music_specific === 'ARTIST')?.base.value,
          album: metadata.music_fields.find(f => f.music_specific === 'ALBUM')?.base.value,
          genre: metadata.music_fields.find(f => f.music_specific === 'GENRE')?.base.value,
          streamCount: parseInt(metadata.music_fields.find(f => f.music_specific === 'STREAM_COUNT')?.base.value || '0'),
          likeCount: parseInt(metadata.music_fields.find(f => f.music_specific === 'LIKE_COUNT')?.base.value || '0'),
          revenue: parseFloat(metadata.music_fields.find(f => f.music_specific === 'REVENUE')?.base.value || '0'),
          lastUpdated: metadata.base.last_updated,
          schemaVersion: metadata.base.schema_version
        };

        setMusicData(musicData);
      } else {
        setMusicData(null);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to load music metadata');
    }
  }, []);

  const createMusicMetadata = useCallback(async (
    musicInfo: {
      title: string;
      artist: string;
      album?: string;
      genre?: string;
      audioHash?: string;
      duration?: number;
    },
    authority: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const musicCore = {
        audio_hash: musicInfo.audioHash || '',
        duration_ms: musicInfo.duration || 0,
        uploaded_at: Date.now()
      };

      const dynamicFields = {
        title: musicInfo.title,
        artist: musicInfo.artist,
        album: musicInfo.album || '',
        genre: musicInfo.genre || '',
        stream_count: 0,
        like_count: 0,
        revenue: 0
      };

      const metadata = await solanaService.createMusicMetadata(
        musicCore,
        dynamicFields,
        authority
      );

      // Convert to MusicMetadata format
      const musicData: MusicMetadata = {
        id: metadata.base.id,
        title: musicInfo.title,
        artist: musicInfo.artist,
        album: musicInfo.album,
        genre: musicInfo.genre,
        streamCount: 0,
        likeCount: 0,
        revenue: 0,
        lastUpdated: metadata.base.last_updated,
        schemaVersion: metadata.base.schema_version
      };

      setMusicData(musicData);
      setLoading(false);

      return musicData;
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to create music metadata');
      throw error;
    }
  }, []);

  const updateMusicField = useCallback(async (
    id: string,
    field: string,
    value: any,
    authority: string,
    updateType: 'set' | 'increment' | 'append' = 'set'
  ) => {
    setLoading(true);
    setError(null);

    try {
      await solanaService.updateMetadata(
        id,
        [{
          field_key: field,
          new_value: typeof value === 'string' ? value : JSON.stringify(value),
          update_type: updateType.toUpperCase() as any
        }],
        authority,
        `Music field update: ${field}`
      );

      // Reload metadata to get updated values
      if (musicData) {
        await loadMusicMetadata(id);
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error instanceof Error ? error.message : 'Failed to update music field');
      throw error;
    }
  }, [musicData, loadMusicMetadata]);

  const incrementStreamCount = useCallback(async (
    id: string,
    authority: string,
    incrementBy: number = 1
  ) => {
    try {
      await updateMusicField(id, 'stream_count', incrementBy, authority, 'increment');

      // Update local state immediately for responsive UI
      if (musicData) {
        setMusicData(prev => prev ? {
          ...prev,
          streamCount: (prev.streamCount || 0) + incrementBy,
          lastUpdated: Date.now()
        } : null);
      }
    } catch (error) {
      console.error('Failed to increment stream count:', error);
      throw error;
    }
  }, [musicData, updateMusicField]);

  const updateRevenue = useCallback(async (
    id: string,
    amount: number,
    authority: string
  ) => {
    try {
      await updateMusicField(id, 'revenue', amount, authority, 'increment');

      // Update local state immediately
      if (musicData) {
        setMusicData(prev => prev ? {
          ...prev,
          revenue: (prev.revenue || 0) + amount,
          lastUpdated: Date.now()
        } : null);
      }
    } catch (error) {
      console.error('Failed to update revenue:', error);
      throw error;
    }
  }, [musicData, updateMusicField]);

  useEffect(() => {
    if (metadataId) {
      loadMusicMetadata(metadataId);
    }
  }, [metadataId, loadMusicMetadata]);

  return {
    musicData,
    loading,
    error,
    loadMusicMetadata,
    createMusicMetadata,
    updateMusicField,
    incrementStreamCount,
    updateRevenue
  };
};

/**
 * Hook for real-time streaming metrics updates
 */
export const useStreamingMetrics = () => {
  const [metricsQueue, setMetricsQueue] = useState<Array<{
    metadataId: string;
    metrics: Record<string, number>;
    authority: string;
    timestamp: number;
  }>>([]);

  const [processing, setProcessing] = useState(false);

  const queueMetricsUpdate = useCallback((
    metadataId: string,
    metrics: Record<string, number>,
    authority: string
  ) => {
    setMetricsQueue(prev => [...prev, {
      metadataId,
      metrics,
      authority,
      timestamp: Date.now()
    }]);
  }, []);

  const processMetricsQueue = useCallback(async () => {
    if (processing || metricsQueue.length === 0) return;

    setProcessing(true);

    try {
      // Batch process metrics updates
      for (const update of metricsQueue) {
        await solanaService.incrementStreamMetrics(
          update.metadataId,
          update.authority,
          update.metrics
        );
      }

      // Clear processed metrics
      setMetricsQueue([]);
    } catch (error) {
      console.error('Failed to process metrics queue:', error);
    } finally {
      setProcessing(false);
    }
  }, [metricsQueue, processing]);

  // Auto-process metrics queue every 10 seconds
  useEffect(() => {
    if (metricsQueue.length > 0) {
      const timer = setTimeout(processMetricsQueue, 10000);
      return () => clearTimeout(timer);
    }
  }, [metricsQueue, processMetricsQueue]);

  return {
    queueMetricsUpdate,
    processMetricsQueue,
    queueLength: metricsQueue.length,
    processing
  };
};

/**
 * Hook for schema management
 */
export const useSchema = () => {
  const [schemas, setSchemas] = useState<Record<number, any>>({});
  const [currentVersion, setCurrentVersion] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSchema = useCallback(async (version: number) => {
    if (schemas[version]) return schemas[version];

    setLoading(true);
    try {
      const schema = await solanaService.getSchemaRegistry(version);
      if (schema) {
        setSchemas(prev => ({ ...prev, [version]: schema }));
      }
      setLoading(false);
      return schema;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load schema');
      setLoading(false);
      return null;
    }
  }, [schemas]);

  const checkMigrationPath = useCallback(async (
    fromVersion: number,
    toVersion: number
  ): Promise<boolean> => {
    try {
      // Check if migration path exists
      if (toVersion <= fromVersion) return false;

      // For now, allow migration to any newer version
      // In production, this would check actual migration instructions
      return true;
    } catch (error) {
      console.error('Failed to check migration path:', error);
      return false;
    }
  }, []);

  return {
    schemas,
    currentVersion,
    loading,
    error,
    getSchema,
    checkMigrationPath
  };
};

// ============ BEZY BURN/AIRDROP FUNCTIONALITY ============

interface SolanaWalletState {
  wallet: SolanaWallet | null;
  connecting: boolean;
  error: string | null;
}

interface BurnAirdropState {
  processing: boolean;
  lastResult: BurnAirdropResponse | null;
  error: string | null;
}

interface BurnEligibility {
  eligible: boolean;
  current_balance: number;
  required_balance: number;
  message: string;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for Solana wallet connection and management
 */
export const useSolanaWallet = () => {
  const [state, setState] = useState<SolanaWalletState>({
    wallet: null,
    connecting: false,
    error: null
  });

  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      const address = await solanaService.connectSolanaWallet();
      const wallet: SolanaWallet = {
        address,
        connected: true,
        connected_at: new Date().toISOString()
      };

      setState({
        wallet,
        connecting: false,
        error: null
      });

      return wallet;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect Solana wallet';
      setState(prev => ({
        ...prev,
        connecting: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    try {
      await solanaService.disconnectSolanaWallet();
      setState({
        wallet: null,
        connecting: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to disconnect Solana wallet:', error);
    }
  }, []);

  useEffect(() => {
    // Check if wallet was previously connected
    const checkWalletConnection = async () => {
      try {
        const wallet = await solanaService.getConnectedSolanaWallet();
        if (wallet) {
          setState({
            wallet,
            connecting: false,
            error: null
          });
        } else {
          setState(prev => ({ ...prev, connecting: false }));
        }
      } catch (error) {
        console.error('Error checking Solana wallet connection:', error);
        setState(prev => ({ ...prev, connecting: false }));
      }
    };

    checkWalletConnection();
  }, []);

  return {
    wallet: state.wallet,
    connecting: state.connecting,
    error: state.error,
    connectWallet,
    disconnectWallet
  };
};

/**
 * Hook for BEZY burn/airdrop operations
 */
export const useBurnAirdrop = () => {
  const [state, setState] = useState<BurnAirdropState>({
    processing: false,
    lastResult: null,
    error: null
  });

  const initiateBurnAirdrop = useCallback(async (
    sagaWalletAddress: string,
    solanaWalletAddress: string
  ) => {
    setState(prev => ({ ...prev, processing: true, error: null }));

    try {
      const result = await solanaService.initiateBurnAirdrop(sagaWalletAddress, solanaWalletAddress);

      setState({
        processing: false,
        lastResult: result,
        error: result.success ? null : result.error || 'Burn/airdrop failed'
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Burn/airdrop failed';
      setState({
        processing: false,
        lastResult: null,
        error: errorMessage
      });
      throw error;
    }
  }, []);

  const clearResult = useCallback(() => {
    setState(prev => ({ ...prev, lastResult: null, error: null }));
  }, []);

  return {
    processing: state.processing,
    lastResult: state.lastResult,
    error: state.error,
    initiateBurnAirdrop,
    clearResult
  };
};

/**
 * Hook for checking BEZY burn eligibility
 */
export const useBurnEligibility = (userAddress?: string) => {
  const [state, setState] = useState<BurnEligibility>({
    eligible: false,
    current_balance: 0,
    required_balance: 4000,
    message: '',
    loading: false,
    error: null
  });

  const checkEligibility = useCallback(async (address?: string) => {
    const targetAddress = address || userAddress;
    if (!targetAddress) {
      setState(prev => ({ ...prev, loading: false }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const eligibility = await solanaService.checkBurnEligibility(targetAddress);

      setState({
        eligible: eligibility.eligible,
        current_balance: eligibility.current_balance,
        required_balance: eligibility.required_balance,
        message: eligibility.message,
        loading: false,
        error: null
      });

      return eligibility;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to check eligibility';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, [userAddress]);

  useEffect(() => {
    if (userAddress) {
      checkEligibility();
    }
  }, [userAddress, checkEligibility]);

  return {
    eligible: state.eligible,
    currentBalance: state.current_balance,
    requiredBalance: state.required_balance,
    message: state.message,
    loading: state.loading,
    error: state.error,
    refetch: checkEligibility
  };
};

/**
 * Hook for burn/airdrop transaction history
 */
export const useBurnAirdropHistory = (userAddress?: string) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (address?: string) => {
    const targetAddress = address || userAddress;
    if (!targetAddress) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const history = await solanaService.getBurnAirdropHistory(targetAddress);
      setTransactions(history);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch history';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    if (userAddress) {
      fetchHistory();
    }
  }, [userAddress, fetchHistory]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchHistory
  };
};

// ============ EXISTING METADATA FUNCTIONALITY ============

/**
 * Combined hook for complete Solana functionality
 */
export const useSolanaIntegration = () => {
  const solana = useSolana();
  const streaming = useStreamingMetrics();
  const schema = useSchema();

  return {
    // Core Solana state
    initialized: solana.initialized,
    loading: solana.loading,
    error: solana.error,

    // Streaming metrics
    queueMetricsUpdate: streaming.queueMetricsUpdate,
    processMetricsQueue: streaming.processMetricsQueue,
    metricsProcessing: streaming.processing,

    // Schema management
    currentSchemaVersion: schema.currentVersion,
    getSchema: schema.getSchema,
    checkMigrationPath: schema.checkMigrationPath,

    // Initialization
    initialize: solana.initialize
  };
};

/**
 * Combined hook for BEZY burn/airdrop functionality
 */
export const useSolanaBurnAirdrop = (userAddress?: string) => {
  const solanaWallet = useSolanaWallet();
  const burnAirdrop = useBurnAirdrop();
  const burnEligibility = useBurnEligibility(userAddress);
  const burnHistory = useBurnAirdropHistory(userAddress);

  return {
    // Wallet functionality
    solanaWallet: solanaWallet.wallet,
    connecting: solanaWallet.connecting,
    connectSolanaWallet: solanaWallet.connectWallet,
    disconnectSolanaWallet: solanaWallet.disconnectWallet,

    // Burn/Airdrop functionality
    processing: burnAirdrop.processing,
    lastResult: burnAirdrop.lastResult,
    initiateBurnAirdrop: burnAirdrop.initiateBurnAirdrop,
    clearBurnAirdropResult: burnAirdrop.clearResult,

    // Eligibility checking
    eligible: burnEligibility.eligible,
    currentBalance: burnEligibility.currentBalance,
    requiredBalance: burnEligibility.requiredBalance,
    eligibilityMessage: burnEligibility.message,
    checkingEligibility: burnEligibility.loading,
    refetchEligibility: burnEligibility.refetch,

    // Transaction history
    burnAirdropHistory: burnHistory.transactions,
    historyLoading: burnHistory.loading,
    refetchHistory: burnHistory.refetch,

    // Combined error state
    error: solanaWallet.error || burnAirdrop.error || burnEligibility.error || burnHistory.error
  };
};