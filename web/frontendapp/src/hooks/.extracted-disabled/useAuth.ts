import { useState, useEffect, useCallback } from 'react';
import { AuthService, type User } from '../../services/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const authService = AuthService.getInstance();

        if (authService.isAuthenticated()) {
          const cachedUser = authService.getCurrentUserSync();
          if (cachedUser) {
            setAuthState({
              user: cachedUser,
              loading: false,
              error: null,
            });
          } else {
            setAuthState(prev => ({ ...prev, loading: false }));
          }
        } else {
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthState(prev => ({
          ...prev,
          error: 'Failed to load session',
          loading: false
        }));
      }
    };

    getInitialSession();
  }, []);

  const signUp = useCallback(async (
    email: string,
    password: string,
    username: string,
    displayName?: string
  ) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const authService = AuthService.getInstance();
      const result = await authService.signUp({
        email,
        password,
        username,
        displayName: displayName || username,
      });

      if (!result.success) {
        setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Signup failed' }));
        return { success: false, error: result.error };
      }

      if (result.data) {
        setAuthState({
          user: result.data.user,
          loading: false,
          error: null,
        });
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const authService = AuthService.getInstance();
      const result = await authService.signIn({ email, password });

      if (!result.success) {
        setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Signin failed' }));
        return { success: false, error: result.error };
      }

      if (result.data) {
        setAuthState({
          user: result.data.user,
          loading: false,
          error: null,
        });
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signin failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));

      const authService = AuthService.getInstance();
      const result = await authService.signOut();

      if (!result.success) {
        setAuthState(prev => ({ ...prev, loading: false, error: result.error || 'Signout failed' }));
        return { success: false, error: result.error };
      }

      setAuthState({
        user: null,
        loading: false,
        error: null,
      });

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Signout failed';
      setAuthState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const updateProfile = useCallback(async (updates: Partial<User>) => {
    if (!authState.user) {
      return { success: false, error: 'No user authenticated' };
    }

    try {
      // Use dashboard service to update profile
      const { ArtistDashboardService } = await import('../../services/api');
      const dashboardService = ArtistDashboardService.getInstance();

      const result = await dashboardService.updateUserProfile(updates);

      if (result.success && result.data) {
        setAuthState(prev => ({ ...prev, user: result.data }));
        return { success: true, profile: result.data };
      }

      return { success: false, error: result.error };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed';
      return { success: false, error: errorMessage };
    }
  }, [authState.user]);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
    updateProfile,
    clearError,
    isAuthenticated: !!authState.user,
    userId: authState.user?.id,
  };
};
