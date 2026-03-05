import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if user has existing session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // Fetch additional user profile data
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const authUser: User = {
              id: session.user.id,
              email: session.user.email || '',
              username: profile.username || session.user.email?.split('@')[0] || '',
              avatar: profile.avatar,
              createdAt: profile.created_at || new Date().toISOString(),
            };
            setUser(authUser);
            setIsAuthenticated(true);
            localStorage.setItem('soundmoney_user', JSON.stringify(authUser));
          }
        } else {
          // Fall back to localStorage for mock/offline mode
          const storedUser = localStorage.getItem('soundmoney_user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
              setIsAuthenticated(true);
            } catch (error) {
              console.error('Failed to parse stored user:', error);
              localStorage.removeItem('soundmoney_user');
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const authUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            username: profile.username || session.user.email?.split('@')[0] || '',
            avatar: profile.avatar,
            createdAt: profile.created_at || new Date().toISOString(),
          };
          setUser(authUser);
          setIsAuthenticated(true);
          localStorage.setItem('soundmoney_user', JSON.stringify(authUser));
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('soundmoney_user');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const authUser: User = {
          id: data.user.id,
          email: data.user.email || '',
          username: profile?.username || email.split('@')[0],
          avatar: profile?.avatar,
          createdAt: profile?.created_at || new Date().toISOString(),
        };
        setUser(authUser);
        setIsAuthenticated(true);
        localStorage.setItem('soundmoney_user', JSON.stringify(authUser));
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    try {
      // Sign up user with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Create user profile in database
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email,
          username,
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          throw profileError;
        }

        const authUser: User = {
          id: data.user.id,
          email,
          username,
          createdAt: new Date().toISOString(),
        };
        setUser(authUser);
        setIsAuthenticated(true);
        localStorage.setItem('soundmoney_user', JSON.stringify(authUser));
      }
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('soundmoney_user');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (updatedUser: User) => {
    try {
      // Update user profile in database
      const { error } = await supabase
        .from('users')
        .update({
          username: updatedUser.username,
          avatar: updatedUser.avatar,
        })
        .eq('id', updatedUser.id);

      if (error) {
        throw error;
      }

      setUser(updatedUser);
      localStorage.setItem('soundmoney_user', JSON.stringify(updatedUser));
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        signup,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
