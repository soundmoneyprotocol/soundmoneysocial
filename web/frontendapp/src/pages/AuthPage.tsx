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

  const pageStyles: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.lg,
  };

  const containerStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: '450px',
  };

  const headerStyles: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  };

  const logoStyles: React.CSSProperties = {
    fontSize: '2.5rem',
    marginBottom: theme.spacing.md,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: 0,
    marginBottom: theme.spacing.sm,
  };

  const subtitleStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
  };

  const formStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const inputGroupStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
  };

  const errorStyles: React.CSSProperties = {
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.danger}20`,
    border: `1px solid ${theme.colors.danger}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.danger,
    fontSize: theme.typography.fontSize.sm,
    margin: 0,
  };

  const successStyles: React.CSSProperties = {
    padding: theme.spacing.md,
    backgroundColor: `${theme.colors.success}20`,
    border: `1px solid ${theme.colors.success}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.success,
    fontSize: theme.typography.fontSize.sm,
    margin: 0,
  };

  const submitButtonStyles: React.CSSProperties = {
    width: '100%',
  };

  const toggleModeStyles: React.CSSProperties = {
    textAlign: 'center',
    paddingTop: theme.spacing.md,
    borderTop: `1px solid ${theme.colors.gray[800]}`,
  };

  const toggleTextStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
    marginBottom: theme.spacing.sm,
  };

  const toggleLinkStyles: React.CSSProperties = {
    color: theme.colors.primary,
    cursor: 'pointer',
    fontWeight: theme.typography.fontWeight.semibold,
    textDecoration: 'none',
    transition: 'opacity 0.2s ease',
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div style={pageStyles}>
      <div style={containerStyles}>
        <div style={headerStyles}>
          <div style={logoStyles}>🎵</div>
          <h1 style={titleStyles}>SoundMoney</h1>
          <p style={subtitleStyles}>
            {mode === 'login' ? 'Welcome back' : 'Join the movement'}
          </p>
        </div>

        <Card>
          <form style={formStyles} onSubmit={mode === 'login' ? handleLogin : handleSignup}>
            {error && <p style={errorStyles}>{error}</p>}
            {success && <p style={successStyles}>{success}</p>}

            <div style={inputGroupStyles}>
              <Input
                label="Email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {mode === 'signup' && (
              <div style={inputGroupStyles}>
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

            <div style={inputGroupStyles}>
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>

            {mode === 'signup' && (
              <div style={inputGroupStyles}>
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

            <Button
              variant="primary"
              size="md"
              style={submitButtonStyles}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            <div style={toggleModeStyles}>
              <p style={toggleTextStyles}>
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
              </p>
              <button
                type="button"
                style={toggleLinkStyles}
                onClick={() => {
                  setMode(mode === 'login' ? 'signup' : 'login');
                  setError('');
                  setSuccess('');
                  setEmail('');
                  setPassword('');
                  setUsername('');
                  setConfirmPassword('');
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

        <div
          style={{
            marginTop: theme.spacing.lg,
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
            fontSize: theme.typography.fontSize.xs,
            color: theme.colors.text.secondary,
            textAlign: 'center',
            lineHeight: '1.6',
          }}
        >
          <p style={{ margin: 0, marginBottom: theme.spacing.sm }}>
            🔒 Your data is secure with Supabase
          </p>
          <p style={{ margin: 0 }}>
            Test account: Use any email with password (min 6 chars)
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
