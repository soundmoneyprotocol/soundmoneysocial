/**
 * React hooks for blockchain integration
 * Provides easy-to-use React hooks for payment streaming functionality
 */

import { useState, useEffect, useCallback } from 'react';
import blockchainService from '../services/blockchainService';

interface WalletState {
  address: string | null;
  connected: boolean;
  loading: boolean;
  error: string | null;
}

interface PaymentStream {
  stream_id: string;
  content_id: string;
  status: 'active' | 'pending' | 'cancelled';
  flow_rate: string;
  total_streamed: string;
  estimated_cost: number;
}

interface StreamingState {
  isStreaming: boolean;
  currentTrack: string | null;
  paymentStreamId: string | null;
  streamingUrl: string | null;
  estimatedCost: number;
  loading: boolean;
  error: string | null;
}

/**
 * Hook for wallet connection and management
 */
export const useWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    address: null,
    connected: false,
    loading: false,
    error: null
  });

  const connectWallet = useCallback(async (chain: 'ethereum' | 'polygon' = 'polygon') => {
    setWallet(prev => ({ ...prev, loading: true, error: null }));

    try {
      const address = await blockchainService.connectWallet(chain);
      setWallet({
        address,
        connected: true,
        loading: false,
        error: null
      });
      return address;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      setWallet(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    setWallet({
      address: null,
      connected: false,
      loading: false,
      error: null
    });
  }, []);

  useEffect(() => {
    // Check if wallet was previously connected
    const checkWalletConnection = async () => {
      try {
        const walletData = await import('@react-native-async-storage/async-storage').then(
          module => module.default.getItem('user_wallet')
        );

        if (walletData) {
          const { address } = JSON.parse(walletData);
          setWallet({
            address,
            connected: true,
            loading: false,
            error: null
          });
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    };

    checkWalletConnection();
  }, []);

  return {
    wallet,
    connectWallet,
    disconnectWallet
  };
};

/**
 * Hook for payment stream management
 */
export const usePaymentStreams = () => {
  const [streams, setStreams] = useState<PaymentStream[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createStream = useCallback(async (
    contentId: string,
    artistAddress: string,
    pricePerSecond: number,
    duration?: number
  ) => {
    setLoading(true);
    setError(null);

    try {
      const stream = await blockchainService.createPaymentStream(
        contentId,
        artistAddress,
        pricePerSecond,
        duration
      );

      const newStream: PaymentStream = {
        stream_id: stream.stream_id,
        content_id: contentId,
        status: stream.status,
        flow_rate: stream.flow_rate,
        total_streamed: stream.total_streamed,
        estimated_cost: duration ? pricePerSecond * duration : 0
      };

      setStreams(prev => [...prev, newStream]);
      return stream;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create stream';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const stopStream = useCallback(async (streamId: string) => {
    setLoading(true);
    setError(null);

    try {
      await blockchainService.stopPaymentStream(streamId);
      setStreams(prev =>
        prev.map(stream =>
          stream.stream_id === streamId
            ? { ...stream, status: 'cancelled' as const }
            : stream
        )
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop stream';
      setError(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshStreams = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const activeStreams = await blockchainService.getActiveStreams();
      const formattedStreams: PaymentStream[] = activeStreams.map(stream => ({
        stream_id: stream.stream_id,
        content_id: '', // Would need to be retrieved from storage
        status: stream.status,
        flow_rate: stream.flow_rate,
        total_streamed: stream.total_streamed,
        estimated_cost: 0
      }));

      setStreams(formattedStreams);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to refresh streams';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshStreams();
  }, [refreshStreams]);

  return {
    streams,
    loading,
    error,
    createStream,
    stopStream,
    refreshStreams
  };
};

/**
 * Hook for music streaming with automatic payment
 */
export const useMusicStreaming = () => {
  const [streaming, setStreaming] = useState<StreamingState>({
    isStreaming: false,
    currentTrack: null,
    paymentStreamId: null,
    streamingUrl: null,
    estimatedCost: 0,
    loading: false,
    error: null
  });

  const startStream = useCallback(async (
    contentId: string,
    quality: 'low' | 'medium' | 'high' = 'medium'
  ) => {
    setStreaming(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await blockchainService.startMusicStream(contentId, quality);

      setStreaming({
        isStreaming: true,
        currentTrack: contentId,
        paymentStreamId: result.payment_stream_id,
        streamingUrl: result.streaming_url,
        estimatedCost: result.estimated_cost,
        loading: false,
        error: null
      });

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start stream';
      setStreaming(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, []);

  const stopStream = useCallback(async () => {
    if (!streaming.paymentStreamId) {
      return;
    }

    setStreaming(prev => ({ ...prev, loading: true, error: null }));

    try {
      await blockchainService.stopPaymentStream(streaming.paymentStreamId);

      setStreaming({
        isStreaming: false,
        currentTrack: null,
        paymentStreamId: null,
        streamingUrl: null,
        estimatedCost: 0,
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop stream';
      setStreaming(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [streaming.paymentStreamId]);

  useEffect(() => {
    // Initialize blockchain service
    const initialize = async () => {
      try {
        await blockchainService.initialize();
      } catch (error) {
        console.error('Failed to initialize blockchain service:', error);
      }
    };

    initialize();

    // Listen for stream updates
    const handleStreamUpdate = (data: any) => {
      console.log('Received stream update:', data);

      // Update streaming state based on received data
      if (data.type === 'flow_updated' && data.stream_id === streaming.paymentStreamId) {
        setStreaming(prev => ({
          ...prev,
          estimatedCost: parseFloat(data.data.total_streamed)
        }));
      }
    };

    blockchainService.addEventListener('streamUpdate', handleStreamUpdate);

    return () => {
      blockchainService.removeEventListener('streamUpdate', handleStreamUpdate);
      blockchainService.cleanup();
    };
  }, [streaming.paymentStreamId]);

  return {
    streaming,
    startStream,
    stopStream
  };
};

/**
 * Hook for monitoring stream analytics and costs
 */
export const useStreamAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalStreamed: '0',
    totalCost: '0',
    streamCount: 0,
    averageStreamCost: '0',
    loading: false,
    error: null as string | null
  });

  const refreshAnalytics = useCallback(async () => {
    setAnalytics(prev => ({ ...prev, loading: true, error: null }));

    try {
      const streams = await blockchainService.getActiveStreams();

      const totalStreamed = streams.reduce((sum, stream) =>
        sum + parseFloat(stream.total_streamed), 0
      ).toFixed(6);

      const streamCount = streams.length;
      const averageStreamCost = streamCount > 0
        ? (parseFloat(totalStreamed) / streamCount).toFixed(6)
        : '0';

      setAnalytics({
        totalStreamed,
        totalCost: totalStreamed,
        streamCount,
        averageStreamCost,
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch analytics';
      setAnalytics(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    }
  }, []);

  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  return {
    analytics,
    refreshAnalytics
  };
};

/**
 * Combined hook for complete blockchain functionality
 */
export const useBlockchain = () => {
  const wallet = useWallet();
  const paymentStreams = usePaymentStreams();
  const musicStreaming = useMusicStreaming();
  const analytics = useStreamAnalytics();

  return {
    wallet: wallet.wallet,
    connectWallet: wallet.connectWallet,
    disconnectWallet: wallet.disconnectWallet,
    streams: paymentStreams.streams,
    createStream: paymentStreams.createStream,
    stopStream: paymentStreams.stopStream,
    refreshStreams: paymentStreams.refreshStreams,
    streaming: musicStreaming.streaming,
    startMusicStream: musicStreaming.startStream,
    stopMusicStream: musicStreaming.stopStream,
    analytics: analytics.analytics,
    refreshAnalytics: analytics.refreshAnalytics,
    loading: wallet.wallet.loading || paymentStreams.loading || musicStreaming.streaming.loading || analytics.analytics.loading,
    error: wallet.wallet.error || paymentStreams.error || musicStreaming.streaming.error || analytics.analytics.error
  };
};