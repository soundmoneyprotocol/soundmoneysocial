import { useState, useEffect, useCallback } from 'react';
import { AuthService, ArtistDashboardService, type ApiResponse } from '../../services/api';

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Hook for BEZY balance (from dashboard analytics)
export function useBezyBalance(userId?: string): UseApiResult<{
  balance: number;
  locked_balance: number;
  total_earned: number;
  total_spent: number;
  last_updated: string;
}> {
  const [data, setData] = useState<{
    balance: number;
    locked_balance: number;
    total_earned: number;
    total_spent: number;
    last_updated: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dashboardService = ArtistDashboardService.getInstance();
      const result = await dashboardService.getDashboardSummary();

      if (result.success && result.data) {
        setData({
          balance: 0, // Would come from wallet service
          locked_balance: 0,
          total_earned: result.data.analytics.totalRevenue,
          total_spent: 0,
          last_updated: new Date().toISOString(),
        });
      } else {
        setError(result.error || 'Failed to fetch balance');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for transaction history
export function useTransactionHistory(userId?: string, limit = 20) {
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const dashboardService = ArtistDashboardService.getInstance();
      const result = await dashboardService.getTransactionHistory('all', limit);

      if (result.success) {
        setData(result.data || null);
      } else {
        setError(result.error || 'Failed to fetch transaction history');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

// Hook for current user
export function useCurrentUser() {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const authService = AuthService.getInstance();

      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Get current user from cached data (fast path)
      const cachedUser = authService.getCurrentUserSync();
      if (cachedUser) {
        setUser(cachedUser);
        setLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser };
}

// Hook for health check
export function useHealthCheck(enabled: boolean = false) {
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setIsHealthy(null);
      return;
    }

    const checkHealth = async () => {
      try {
        const apiClient = require('../../services/api').SoundMoneyApiClient.getInstance();
        const result = await apiClient.health();
        setIsHealthy(result);
      } catch {
        setIsHealthy(false);
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
  }, [enabled]);

  return { isHealthy, loading };
}

// Generic hook for API calls
export function useApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await apiCall();
      if (result.success) {
        setData(result.data!);
      } else {
        setError(result.error || 'API call failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
