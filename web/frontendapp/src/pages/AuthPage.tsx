import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Loading } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme/theme';

type AuthMode = 'login' | 'signup';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const validateForm = (): boolean => {
    setError('');

    if (!email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }

    if (!password.trim()) {
      setError('Password is required');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (mode === 'signup') {
      if (!username.trim()) {
        setError('Username is required');
        return false;
      }

      if (username.length < 3) {
        setError('Username must be at least 3 characters');
        return false;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
    }

    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await login(email, password);
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      await signup(email, password, username);
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background.primary,
        padding: theme.spacing.lg,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '450px',
        }}
      >
        {/* Header */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: theme.spacing.xl,
          }}
        >
          <div
            style={{
              fontSize: '3rem',
              marginBottom: theme.spacing.md,
            }}
          >
            🎵
          </div>
          <h1
            style={{
              fontSize: '2.5rem',
              fontWeight: 700,
              color: theme.colors.text.primary,
              margin: 0,
              marginBottom: theme.spacing.sm,
              letterSpacing: '-0.5px',
            }}
          >
            SoundMoney
          </h1>
          <p
            style={{
              fontSize: '1rem',
              color: theme.colors.text.secondary,
              margin: 0,
            }}
          >
            {mode === 'login' ? 'Welcome back' : 'Join the movement'}
          </p>
        </div>

        {/* Form Card */}
        <Card
          style={{
            padding: theme.spacing.xl,
          }}
        >
          <form
            onSubmit={mode === 'login' ? handleLogin : handleSignup}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.md,
            }}
          >
            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: theme.spacing.md,
                  backgroundColor: `${theme.colors.danger}20`,
                  border: `1px solid ${theme.colors.danger}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.danger,
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                }}
              >
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div
                style={{
                  padding: theme.spacing.md,
                  backgroundColor: `${theme.colors.success}20`,
                  border: `1px solid ${theme.colors.success}`,
                  borderRadius: theme.borderRadius.md,
                  color: theme.colors.success,
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                }}
              >
                {success}
              </div>
            )}

            {/* Email Input */}
            <div>
              <Input
                label="Email Address"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Username Input - Signup Only */}
            {mode === 'signup' && (
              <div>
                <Input
                  label="Username"
                  type="text"
                  placeholder="Choose your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Password Input */}
            <div>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {/* Confirm Password - Signup Only */}
            {mode === 'signup' && (
              <div>
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            {/* Submit Button */}
            <Button
              variant="primary"
              size="md"
              style={{
                width: '100%',
                marginTop: theme.spacing.md,
              }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            {/* Toggle Mode */}
            <div
              style={{
                textAlign: 'center',
                paddingTop: theme.spacing.md,
                borderTop: `1px solid ${theme.colors.gray[800]}`,
                marginTop: theme.spacing.md,
              }}
            >
              <p
                style={{
                  fontSize: '0.875rem',
                  color: theme.colors.text.secondary,
                  margin: 0,
                  marginBottom: theme.spacing.sm,
                }}
              >
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                  setSuccess('');
                  setEmail('');
                  setPassword('');
                  setUsername('');
                  setConfirmPassword('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: theme.colors.primary,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  padding: 0,
                  textDecoration: 'underline',
                  transition: 'opacity 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1';
                }}
              >
                {mode === 'login' ? 'Sign up here' : 'Sign in here'}
              </button>
            </div>
          </form>
        </Card>

        {/* Footer Info */}
        <div
          style={{
            marginTop: theme.spacing.lg,
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
            fontSize: '0.75rem',
            color: theme.colors.text.secondary,
            textAlign: 'center',
            lineHeight: '1.6',
          }}
        >
          <p style={{ margin: '0 0 0.5rem 0' }}>🔒 Your data is secure with Supabase</p>
          <p style={{ margin: 0 }}>Test signup with any email and password (min 6 chars)</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
