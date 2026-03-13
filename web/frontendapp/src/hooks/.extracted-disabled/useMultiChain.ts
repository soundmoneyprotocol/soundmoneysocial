/**
 * React hooks for multi-chain functionality
 * Provides unified interface for EVM and Solana blockchain interactions
 */

import { useState, useEffect, useCallback } from 'react';
import multiChainService, {
  SupportedChain,
  UnifiedWallet,
  UnifiedStream,
  UnifiedMetadata,
  UnifiedTransaction,
  StreamStatus,
  TransactionStatus
} from '../services/multiChainService';

// Re-export types for convenience
export {
  SupportedChain,
  UnifiedWallet,
  UnifiedStream,
  UnifiedMetadata,
  UnifiedTransaction,
  StreamStatus,
  TransactionStatus
};

interface MultiChainState {
  initialized: boolean;
  loading: boolean;
  error: string | null;
  connectedWallets: UnifiedWallet[];
  supportedChains: SupportedChain[];
}

interface StreamingState {
  activeStreams: UnifiedStream[];
  totalStreamed: Record<string, number>; // Per chain
  loading: boolean;
  error: string | null;
}

interface MetadataState {
  metadata: Record<string, UnifiedMetadata>;
  loading: boolean;
  error: string | null;
}

interface ChainMetrics {
  chain: SupportedChain;
  connected: boolean;
  gasPrice: number;
  blockTime: number;
  transactionCount: number;
  totalValue: number;
}

/**
 * Main multi-chain hook
 */
export const useMultiChain = () => {
  const [state, setState] = useState<MultiChainState>({
    initialized: false,
    loading: false,
    error: null,
    connectedWallets: [],
    supportedChains: [SupportedChain.ETHEREUM, SupportedChain.POLYGON, SupportedChain.SOLANA]
  });

  const initialize = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      await multiChainService.initialize();
      const wallets = multiChainService.getConnectedWallets();

      setState(prev => ({
        ...prev,
        loading: false,
        initialized: true,
        connectedWallets: wallets
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize multi-chain service'
      }));
    }
  }, []);

  const connectWallet = useCallback(async (chain: SupportedChain): Promise<UnifiedWallet> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const wallet = await multiChainService.connectWallet(chain);

      setState(prev => ({
        ...prev,
        loading: false,
        connectedWallets: [...prev.connectedWallets.filter(w => w.chain !== chain), wallet]
      }));

      return wallet;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : `Failed to connect to ${chain}`
      }));
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(async (chain: SupportedChain) => {
    setState(prev => ({
      ...prev,
      connectedWallets: prev.connectedWallets.filter(w => w.chain !== chain)
    }));
  }, []);

  const getWalletForChain = useCallback((chain: SupportedChain): UnifiedWallet | null => {
    return state.connectedWallets.find(w => w.chain === chain) || null;
  }, [state.connectedWallets]);

  const getBestChainForOperation = useCallback((
    operation: string,
    options?: {
      amount?: number;
      preferredChain?: SupportedChain;
      optimizeForGas?: boolean;
    }
  ): SupportedChain | null => {
    // Simple chain selection logic
    if (options?.preferredChain && state.connectedWallets.some(w => w.chain === options.preferredChain)) {
      return options.preferredChain;
    }

    // Default preferences
    const operationPreferences = {
      'streaming': SupportedChain.POLYGON,  // Lower gas fees
      'metadata': SupportedChain.SOLANA,    // Better metadata support
      'nft': SupportedChain.SOLANA,         // Better NFT ecosystem
      'governance': SupportedChain.ETHEREUM // More established governance
    };

    const preferred = operationPreferences[operation as keyof typeof operationPreferences];
    if (preferred && state.connectedWallets.some(w => w.chain === preferred)) {
      return preferred;
    }

    // Fallback to first connected wallet
    return state.connectedWallets[0]?.chain || null;
  }, [state.connectedWallets]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    ...state,
    initialize,
    connectWallet,
    disconnectWallet,
    getWalletForChain,
    getBestChainForOperation
  };
};

/**
 * Hook for unified streaming across chains
 */
export const useUnifiedStreaming = () => {
  const [state, setState] = useState<StreamingState>({
    activeStreams: [],
    totalStreamed: {},
    loading: false,
    error: null
  });

  const { connectedWallets } = useMultiChain();

  const createStream = useCallback(async (
    contentId: string,
    receiverAddress: string,
    amount: string,
    duration: number,
    options?: {
      chain?: SupportedChain;
      token?: string;
      metadata?: any;
    }
  ): Promise<UnifiedStream> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const stream = await multiChainService.createPaymentStream(
        contentId,
        receiverAddress,
        amount,
        duration,
        options
      );

      setState(prev => ({
        ...prev,
        loading: false,
        activeStreams: [...prev.activeStreams, stream]
      }));

      return stream;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create stream'
      }));
      throw error;
    }
  }, []);

  const stopStream = useCallback(async (streamId: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Update stream status locally
      setState(prev => ({
        ...prev,
        loading: false,
        activeStreams: prev.activeStreams.map(stream =>
          stream.id === streamId
            ? { ...stream, status: StreamStatus.COMPLETED }
            : stream
        )
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to stop stream'
      }));
      throw error;
    }
  }, []);

  const loadUserStreams = useCallback(async (userAddress?: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const streams = await multiChainService.getUserStreams(userAddress);
      const totalByChain: Record<string, number> = {};

      for (const stream of streams) {
        const total = parseFloat(stream.totalStreamed);
        totalByChain[stream.chain] = (totalByChain[stream.chain] || 0) + total;
      }

      setState(prev => ({
        ...prev,
        loading: false,
        activeStreams: streams,
        totalStreamed: totalByChain
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to load streams'
      }));
    }
  }, []);

  const getStreamsByChain = useCallback((chain: SupportedChain): UnifiedStream[] => {
    return state.activeStreams.filter(stream => stream.chain === chain);
  }, [state.activeStreams]);

  const getTotalStreamedByChain = useCallback((chain: SupportedChain): number => {
    return state.totalStreamed[chain] || 0;
  }, [state.totalStreamed]);

  useEffect(() => {
    if (connectedWallets.length > 0) {
      loadUserStreams();
    }
  }, [connectedWallets, loadUserStreams]);

  return {
    ...state,
    createStream,
    stopStream,
    loadUserStreams,
    getStreamsByChain,
    getTotalStreamedByChain
  };
};

/**
 * Hook for unified metadata management
 */
export const useUnifiedMetadata = () => {
  const [state, setState] = useState<MetadataState>({
    metadata: {},
    loading: false,
    error: null
  });

  const getMetadata = useCallback(async (metadataId: string): Promise<UnifiedMetadata | null> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const metadata = await multiChainService.getMetadata(metadataId);

      if (metadata) {
        setState(prev => ({
          ...prev,
          loading: false,
          metadata: { ...prev.metadata, [metadataId]: metadata }
        }));
      } else {
        setState(prev => ({ ...prev, loading: false }));
      }

      return metadata;
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to get metadata'
      }));
      return null;
    }
  }, []);

  const updateMetadata = useCallback(async (
    metadataId: string,
    updates: Array<{ field: string; value: any; type?: string }>,
    authority: string,
    options?: {
      chain?: SupportedChain;
      reason?: string;
      syncAcrossChains?: boolean;
    }
  ): Promise<UnifiedMetadata> => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const updatedMetadata = await multiChainService.updateMetadata(
        metadataId,
        updates,
        authority,
        options
      );

      setState(prev => ({
        ...prev,
        loading: false,
        metadata: { ...prev.metadata, [metadataId]: updatedMetadata }
      }));

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

  const incrementField = useCallback(async (
    metadataId: string,
    field: string,
    amount: number,
    authority: string,
    options?: { chain?: SupportedChain; reason?: string }
  ) => {
    try {
      await updateMetadata(
        metadataId,
        [{ field, value: amount, type: 'increment' }],
        authority,
        options
      );

      // Update local state immediately for responsive UI
      setState(prev => {
        const current = prev.metadata[metadataId];
        if (current) {
          const currentValue = current.fields[field] || 0;
          return {
            ...prev,
            metadata: {
              ...prev.metadata,
              [metadataId]: {
                ...current,
                fields: {
                  ...current.fields,
                  [field]: currentValue + amount
                },
                lastUpdated: Date.now()
              }
            }
          };
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to increment field:', error);
      throw error;
    }
  }, [updateMetadata]);

  const getMetadataByChain = useCallback((chain: SupportedChain): UnifiedMetadata[] => {
    return Object.values(state.metadata).filter(metadata => metadata.chain === chain);
  }, [state.metadata]);

  return {
    ...state,
    getMetadata,
    updateMetadata,
    incrementField,
    getMetadataByChain
  };
};

/**
 * Hook for chain metrics and analytics
 */
export const useChainMetrics = () => {
  const [metrics, setMetrics] = useState<ChainMetrics[]>([]);
  const [loading, setLoading] = useState(false);

  const { connectedWallets } = useMultiChain();
  const { activeStreams, totalStreamed } = useUnifiedStreaming();

  const refreshMetrics = useCallback(async () => {
    setLoading(true);

    try {
      const chainMetrics: ChainMetrics[] = [];

      for (const chain of Object.values(SupportedChain)) {
        const wallet = connectedWallets.find(w => w.chain === chain);
        const streams = activeStreams.filter(s => s.chain === chain);
        const total = totalStreamed[chain] || 0;

        chainMetrics.push({
          chain,
          connected: !!wallet,
          gasPrice: await estimateGasPrice(chain),
          blockTime: getAverageBlockTime(chain),
          transactionCount: streams.length,
          totalValue: total
        });
      }

      setMetrics(chainMetrics);
      setLoading(false);
    } catch (error) {
      console.error('Failed to refresh chain metrics:', error);
      setLoading(false);
    }
  }, [connectedWallets, activeStreams, totalStreamed]);

  const getMetricsForChain = useCallback((chain: SupportedChain): ChainMetrics | null => {
    return metrics.find(m => m.chain === chain) || null;
  }, [metrics]);

  const getBestChainForAmount = useCallback((amount: number): SupportedChain | null => {
    const connectedMetrics = metrics.filter(m => m.connected);
    if (connectedMetrics.length === 0) return null;

    // Simple logic: choose chain with lowest gas cost for amount
    let bestChain = connectedMetrics[0];
    let lowestCost = estimateTransactionCost(bestChain, amount);

    for (const metric of connectedMetrics) {
      const cost = estimateTransactionCost(metric, amount);
      if (cost < lowestCost) {
        lowestCost = cost;
        bestChain = metric;
      }
    }

    return bestChain.chain;
  }, [metrics]);

  useEffect(() => {
    refreshMetrics();
  }, [refreshMetrics]);

  return {
    metrics,
    loading,
    refreshMetrics,
    getMetricsForChain,
    getBestChainForAmount
  };
};

// Helper functions
async function estimateGasPrice(chain: SupportedChain): Promise<number> {
  // Mock gas price estimation
  const gasPrices = {
    [SupportedChain.ETHEREUM]: 50,
    [SupportedChain.POLYGON]: 30,
    [SupportedChain.SOLANA]: 0.00025
  };
  return gasPrices[chain];
}

function getAverageBlockTime(chain: SupportedChain): number {
  const blockTimes = {
    [SupportedChain.ETHEREUM]: 12,
    [SupportedChain.POLYGON]: 2,
    [SupportedChain.SOLANA]: 0.4
  };
  return blockTimes[chain];
}

function estimateTransactionCost(metric: ChainMetrics, amount: number): number {
  // Simple cost estimation based on gas price and amount
  return metric.gasPrice * (amount / 1000);
}

/**
 * Combined hook for complete multi-chain functionality
 */
export const useUnifiedBlockchain = () => {
  const multiChain = useMultiChain();
  const streaming = useUnifiedStreaming();
  const metadata = useUnifiedMetadata();
  const metrics = useChainMetrics();

  return {
    // Multi-chain state
    initialized: multiChain.initialized,
    loading: multiChain.loading || streaming.loading || metadata.loading || metrics.loading,
    error: multiChain.error || streaming.error || metadata.error,
    connectedWallets: multiChain.connectedWallets,
    supportedChains: multiChain.supportedChains,

    // Wallet management
    connectWallet: multiChain.connectWallet,
    disconnectWallet: multiChain.disconnectWallet,
    getWalletForChain: multiChain.getWalletForChain,

    // Streaming functionality
    activeStreams: streaming.activeStreams,
    totalStreamed: streaming.totalStreamed,
    createStream: streaming.createStream,
    stopStream: streaming.stopStream,
    getStreamsByChain: streaming.getStreamsByChain,

    // Metadata functionality
    metadata: metadata.metadata,
    getMetadata: metadata.getMetadata,
    updateMetadata: metadata.updateMetadata,
    incrementField: metadata.incrementField,

    // Chain optimization
    getBestChainForOperation: multiChain.getBestChainForOperation,
    getBestChainForAmount: metrics.getBestChainForAmount,
    chainMetrics: metrics.metrics,

    // Initialization
    initialize: multiChain.initialize
  };
};