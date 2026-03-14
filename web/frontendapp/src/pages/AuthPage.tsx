import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Button, Input, Loading } from '../components';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme/theme';

type AuthMode = 'login' | 'signup';
type AuthState = 'form' | 'email-confirmation';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, signup } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [authState, setAuthState] = useState<AuthState>('form');
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
      setAuthState('email-confirmation');
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
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(to bottom right, #131313, #070708)',
        padding: theme.spacing.lg,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '512px',
          width: '100%',
          backgroundColor: '#1a1a1a',
          boxShadow: '0px 8px 8px -4px #00000005, 0px 16px 24px 0px #0000000F, 0px 2px 4px -1px #00000005, 0px 0px 1px 0px #0000000F',
          borderRadius: '1rem',
          border: '1px solid #262626',
          padding: '1rem',
          backdropFilter: 'blur(10px)',
        }}
      >
        {/* Header */}
        {authState === 'form' && (
          <div
            style={{
              marginTop: '1rem',
              marginBottom: '2.5rem',
            }}
          >
            <h2
              style={{
                fontSize: '2.25rem',
                fontWeight: 400,
                color: '#ffffff',
                margin: 0,
                marginBottom: '1rem',
                letterSpacing: '-0.05em',
              }}
            >
              {mode === 'login' ? 'Login' : 'Sign Up'}
            </h2>
            <p
              style={{
                fontSize: '0.875rem',
                color: '#a0a0a0',
                margin: 0,
              }}
            >
              {mode === 'login'
                ? 'Welcome back to SoundMoney'
                : 'Join SoundMoney today'}
            </p>
          </div>
        )}

        {/* Email Confirmation State */}
        {authState === 'email-confirmation' ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.lg,
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '3rem',
                marginBottom: theme.spacing.md,
              }}
            >
              ✉️
            </div>

            <div>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 600,
                  color: '#ffffff',
                  margin: 0,
                  marginBottom: theme.spacing.sm,
                }}
              >
                Check your email
              </h2>
              <p
                style={{
                  fontSize: '0.95rem',
                  color: '#a0a0a0',
                  margin: 0,
                  lineHeight: '1.6',
                }}
              >
                We've sent a confirmation link to <strong>{email}</strong>. Click it to verify your email and activate your account.
              </p>
            </div>

            <div
              style={{
                padding: theme.spacing.md,
                backgroundColor: '#262626',
                borderRadius: theme.borderRadius.md,
                border: '1px solid #3a3a3a',
                width: '100%',
                fontSize: '0.85rem',
                color: '#a0a0a0',
                lineHeight: '1.6',
              }}
            >
              <p style={{ margin: 0, marginBottom: theme.spacing.sm }}>
                💡 <strong>Didn't receive the email?</strong>
              </p>
              <ul style={{ margin: 0, paddingLeft: theme.spacing.lg }}>
                <li>Check your spam folder</li>
                <li>Try a different email address</li>
                <li>Make sure the email is spelled correctly</li>
              </ul>
            </div>

            <Button
              variant="outline"
              size="md"
              style={{
                width: '100%',
              }}
              onClick={() => {
                setAuthState('form');
                setMode('signup');
                setEmail('');
                setPassword('');
                setUsername('');
                setConfirmPassword('');
                setError('');
              }}
            >
              Try a different email
            </Button>

            <p
              style={{
                fontSize: '0.85rem',
                color: '#a0a0a0',
                margin: 0,
                paddingTop: theme.spacing.md,
                borderTop: '1px solid #3a3a3a',
                width: '100%',
              }}
            >
              Already verified?{' '}
              <button
                type="button"
                onClick={() => {
                  setAuthState('form');
                  setMode('login');
                  setError('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#FD7125',
                  cursor: 'pointer',
                  fontWeight: 600,
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                Sign in here
              </button>
            </p>
          </div>
        ) : (
          /* Form State */
          <form
            onSubmit={mode === 'login' ? handleLogin : handleSignup}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: theme.spacing.md,
                  backgroundColor: '#6b2c2c',
                  border: '1px solid #8b3a3a',
                  borderRadius: theme.borderRadius.md,
                  color: '#ff6b6b',
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
                  backgroundColor: '#2b5c2b',
                  border: '1px solid #3a7a3a',
                  borderRadius: theme.borderRadius.md,
                  color: '#6bff6b',
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
                placeholder="example@gmail.com"
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

            {/* Forgot Password - Login Only */}
            {mode === 'login' && (
              <div
                style={{
                  textAlign: 'right',
                  marginTop: '-0.5rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => navigate('/reset-password')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FD7125',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    textDecoration: 'underline',
                    padding: 0,
                    fontWeight: 500,
                  }}
                >
                  Forgot password?
                </button>
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
                borderTop: '1px solid #3a3a3a',
                marginTop: theme.spacing.md,
              }}
            >
              <p
                style={{
                  fontSize: '0.875rem',
                  color: '#a0a0a0',
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
                  color: '#FD7125',
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
        )}

        {/* Footer Info */}
        {authState === 'form' && (
          <div
            style={{
              marginTop: theme.spacing.lg,
              padding: theme.spacing.md,
              backgroundColor: '#262626',
              borderRadius: theme.borderRadius.md,
              fontSize: '0.75rem',
              color: '#a0a0a0',
              textAlign: 'center',
              lineHeight: '1.6',
            }}
          >
            <p style={{ margin: '0 0 0.5rem 0' }}>🔒 Your data is secure with Supabase</p>
            <p style={{ margin: 0 }}>Your music, your platform, your earnings</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
