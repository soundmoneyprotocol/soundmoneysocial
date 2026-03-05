import React, { useState } from 'react';
import { Container, Header, Card, Button, Avatar, Badge, Input } from '@/components';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import { formatNumber, formatCurrency } from '../utils/formatters';

interface UserStats {
  followers: number;
  following: number;
  posts: number;
  earnings: number;
  bezyBalance: number;
}

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [stats] = useState<UserStats>({
    followers: 1240,
    following: 342,
    posts: 28,
    earnings: 2450.75,
    bezyBalance: 125.5,
  });

  const containerStyles: React.CSSProperties = {
    maxWidth: '1000px',
    margin: '0 auto',
  };

  const profileCardStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  };

  const avatarStyles: React.CSSProperties = {
    minWidth: '120px',
  };

  const profileInfoStyles: React.CSSProperties = {
    flex: 1,
  };

  const usernameStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    margin: `0 0 ${theme.spacing.sm} 0`,
  };

  const emailStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
    margin: 0,
    marginBottom: theme.spacing.md,
  };

  const statsGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  };

  const statCardStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
  };

  const statValueStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    margin: 0,
  };

  const statLabelStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: `${theme.spacing.sm} 0 0 0`,
  };

  const earningsCardStyles: React.CSSProperties = {
    background: `linear-gradient(135deg, ${theme.colors.primary}20 0%, ${theme.colors.accent}20 100%)`,
    border: `2px solid ${theme.colors.primary}`,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  };

  const earningsHeaderStyles: React.CSSProperties = {
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    margin: 0,
    marginBottom: theme.spacing.sm,
  };

  const earningsValueStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    margin: 0,
  };

  const actionsStyles: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  };

  return (
    <Container maxWidth="lg" padding="lg" style={containerStyles}>
      <Header
        title="Dashboard"
        action={
          <Button variant="secondary" size="sm" onClick={() => logout()}>
            Logout
          </Button>
        }
      />

      {user && (
        <>
          <Card style={profileCardStyles}>
            <div style={avatarStyles}>
              <Avatar
                alt={user.username}
                initials={user.username.charAt(0).toUpperCase()}
                size="xl"
              />
            </div>
            <div style={profileInfoStyles}>
              <h2 style={usernameStyles}>{user.username}</h2>
              <p style={emailStyles}>{user.email}</p>
              <div style={actionsStyles}>
                <Button
                  variant={isEditing ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
                <Button variant="secondary" size="sm">
                  View Profile
                </Button>
              </div>
            </div>
          </Card>

          {isEditing && (
            <Card style={{ marginBottom: theme.spacing.lg }}>
              <h3 style={{ marginTop: 0 }}>Edit Profile</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                <Input label="Username" defaultValue={user.username} />
                <Input label="Email" type="email" defaultValue={user.email} />
                <Input label="Bio" placeholder="Tell us about yourself..." />
                <div style={{ display: 'flex', gap: theme.spacing.md, justifyContent: 'flex-end' }}>
                  <Button variant="secondary" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" onClick={() => setIsEditing(false)}>
                    Save Changes
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <Card style={earningsCardStyles}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.lg }}>
              <div>
                <p style={earningsHeaderStyles}>Total Earnings</p>
                <p style={earningsValueStyles}>{formatCurrency(stats.earnings)}</p>
              </div>
              <div>
                <p style={earningsHeaderStyles}>BEZY Balance</p>
                <p style={earningsValueStyles}>{stats.bezyBalance} BEZY</p>
              </div>
            </div>
            <Button style={{ marginTop: theme.spacing.lg, width: '100%' }} variant="primary">
              Withdraw Earnings
            </Button>
          </Card>

          <h3 style={{ color: theme.colors.text.primary, marginTop: theme.spacing.xl }}>
            Your Stats
          </h3>
          <div style={statsGridStyles}>
            <Card style={statCardStyles} interactive>
              <p style={statValueStyles}>{formatNumber(stats.followers)}</p>
              <p style={statLabelStyles}>Followers</p>
            </Card>
            <Card style={statCardStyles} interactive>
              <p style={statValueStyles}>{formatNumber(stats.following)}</p>
              <p style={statLabelStyles}>Following</p>
            </Card>
            <Card style={statCardStyles} interactive>
              <p style={statValueStyles}>{formatNumber(stats.posts)}</p>
              <p style={statLabelStyles}>Posts</p>
            </Card>
            <Card style={statCardStyles} interactive>
              <p style={statValueStyles}>
                <Badge variant="success">Active</Badge>
              </p>
              <p style={statLabelStyles}>Status</p>
            </Card>
          </div>
        </>
      )}
    </Container>
  );
};

export default DashboardPage;
