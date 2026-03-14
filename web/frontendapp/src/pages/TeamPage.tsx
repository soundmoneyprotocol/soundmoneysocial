import React, { useState } from 'react';
import { Container, Header, Card, Button, Badge } from '../components';
import { theme } from '../theme/theme';
import EmbedWidget from '../components/EmbedWidget';
import { useSubscription } from '../contexts/SubscriptionContext';

interface TeamMember {
  id: string;
  email: string;
  name?: string;
  role: 'owner' | 'manager' | 'analyst' | 'developer';
  status: 'active' | 'pending';
  invitedAt: string;
  acceptedAt?: string;
  permissions: string[];
}

interface ApiIntegration {
  id: string;
  name: string;
  type: 'meta_ads' | 'google_analytics' | 'claude_api' | 'stripe' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  lastSynced?: string;
  icon: string;
  description: string;
}

type TabType = 'overview' | 'team' | 'integrations' | 'ai_enhancements' | 'api_keys';

const TeamPage: React.FC = () => {
  const { tier, bezyMultiplier, teamMembersLimit } = useSubscription();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      email: 'owner@soundmoney.io',
      name: 'You',
      role: 'owner',
      status: 'active',
      invitedAt: '2024-01-01',
      acceptedAt: '2024-01-01',
      permissions: ['full_access'],
    },
  ]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamMember['role']>('manager');
  const [integrations, setIntegrations] = useState<ApiIntegration[]>([
    {
      id: 'meta_ads',
      name: 'Meta Ads Manager',
      type: 'meta_ads',
      status: 'disconnected',
      icon: '📱',
      description: 'Connect your Meta Ads account to import campaign data and audience insights',
    },
    {
      id: 'tiktok_api',
      name: 'TikTok Ads API',
      type: 'custom',
      status: 'disconnected',
      icon: '🎵',
      description: 'Access TikTok campaign performance, audience demographics, and viral content insights for music promotion',
    },
    {
      id: 'snapchat_api',
      name: 'Snapchat Ads API',
      type: 'custom',
      status: 'disconnected',
      icon: '👻',
      description: 'Connect Snapchat ads to track youth audience engagement and music discovery campaigns',
    },
    {
      id: 'google_analytics',
      name: 'Google Analytics 4',
      type: 'google_analytics',
      status: 'disconnected',
      icon: '📊',
      description: 'Track website traffic, user behavior, and conversion metrics in real-time',
    },
    {
      id: 'claude_api',
      name: 'Claude API (Cowork)',
      type: 'claude_api',
      status: 'disconnected',
      icon: '🤖',
      description: 'Enable AI-powered data analysis, content recommendations, and marketing automation',
    },
    {
      id: 'stripe',
      name: 'Stripe',
      type: 'stripe',
      status: 'connected',
      lastSynced: '2026-03-12T14:30:00Z',
      icon: '💳',
      description: 'Payment processing and revenue tracking',
    },
  ]);
  const [showNewApiModal, setShowNewApiModal] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<ApiIntegration | null>(null);

  const handleInviteTeamMember = () => {
    if (!inviteEmail.trim()) {
      alert('❌ Please enter an email address');
      return;
    }

    const newMember: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      email: inviteEmail,
      role: inviteRole,
      status: 'pending',
      invitedAt: new Date().toISOString(),
      permissions: getPermissionsForRole(inviteRole),
    };

    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail('');
    alert(`✅ Invitation sent to ${inviteEmail}`);
  };

  const getPermissionsForRole = (role: TeamMember['role']): string[] => {
    const permissions: Record<TeamMember['role'], string[]> = {
      owner: ['full_access', 'manage_team', 'billing', 'api_keys', 'integrations'],
      manager: ['upload', 'analytics', 'manage_fans', 'revenue'],
      analyst: ['view_analytics', 'view_revenue'],
      developer: ['api_access', 'integrations', 'webhooks'],
    };
    return permissions[role];
  };

  const handleConnectIntegration = (integration: ApiIntegration) => {
    setSelectedIntegration(integration);
    setShowNewApiModal(true);
  };

  const handleSaveApiKey = (apiKey: string) => {
    if (!apiKey.trim()) {
      alert('❌ Please enter an API key');
      return;
    }

    setIntegrations(
      integrations.map((int) =>
        int.id === selectedIntegration?.id
          ? {
            ...int,
            status: 'connected' as const,
            lastSynced: new Date().toISOString(),
          }
          : int
      )
    );

    alert(`✅ ${selectedIntegration?.name} connected successfully!`);
    setShowNewApiModal(false);
    setSelectedIntegration(null);
  };

  return (
    <Container maxWidth="lg" padding="lg">
      <Header
        title="👥 Team Management & AI Analytics"
        subtitle="Manage your team, connect integrations, and enable AI-powered insights"
      />

      {/* Tab Navigation */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
      }}>
        {(['overview', 'team', 'integrations', 'ai_enhancements', 'api_keys'] as TabType[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: theme.spacing.md,
              borderRadius: theme.borderRadius.md,
              border: 'none',
              backgroundColor: activeTab === tab ? theme.colors.primary : theme.colors.background.secondary,
              color: activeTab === tab ? '#fff' : theme.colors.text.secondary,
              cursor: 'pointer',
              fontWeight: activeTab === tab ? '600' : '400',
              fontSize: theme.typography.fontSize.sm,
              textTransform: 'capitalize',
            }}
          >
            {tab === 'overview' && '📈 Overview'}
            {tab === 'team' && '👥 Team'}
            {tab === 'integrations' && '🔗 Integrations'}
            {tab === 'ai_enhancements' && '🤖 AI'}
            {tab === 'api_keys' && '🔑 API Keys'}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>

          <Card style={{ padding: theme.spacing.lg }}>
            <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
              🎵 Stream BZY Counter Widget
            </h3>
            <p style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Embed a real-time BZY counter on your website or blog. Perfect for artist portfolios and music promotion pages.
            </p>

            <div style={{ display: 'flex', gap: theme.spacing.lg, marginBottom: theme.spacing.lg, flexWrap: 'wrap' }}>
              <div style={{ flex: '0 1 auto' }}>
                <p style={{ margin: '0 0 12px 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, fontWeight: '600' }}>
                  Preview:
                </p>
                <EmbedWidget
                  artistName="Your Artist"
                  trackTitle="Your Track"
                  spotifyUrl="https://open.spotify.com/track/..."
                />
              </div>

              <div style={{ flex: '1', minWidth: '300px' }}>
                <p style={{ margin: '0 0 12px 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, fontWeight: '600' }}>
                  Embed Code:
                </p>
                <pre style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.primary,
                  borderRadius: theme.borderRadius.md,
                  overflow: 'auto',
                  color: theme.colors.accent,
                  fontSize: '11px',
                  margin: 0,
                  marginBottom: theme.spacing.md,
                  fontFamily: 'monospace',
                }}>
{`<iframe
  src="https://soundmoney.io/embed/widget?artist=YourArtist&track=YourTrack"
  width="300"
  height="400"
  style="border: none; border-radius: 12px;"
  allow="autoplay"
></iframe>`}
                </pre>

                <button style={{
                  padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                  backgroundColor: theme.colors.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: '600',
                  width: '100%',
                }} onClick={() => {
                  const code = `<iframe
  src="https://soundmoney.io/embed/widget?artist=YourArtist&track=YourTrack"
  width="300"
  height="400"
  style="border: none; border-radius: 12px;"
  allow="autoplay"
></iframe>`;
                  navigator.clipboard.writeText(code);
                  alert('✅ Embed code copied to clipboard!');
                }}>
                  📋 Copy Embed Code
                </button>
              </div>
            </div>
          </Card>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: theme.spacing.lg,
          }}>
            <Card style={{ padding: theme.spacing.lg, textAlign: 'center' }}>
              <p style={{ margin: 0, marginBottom: theme.spacing.sm, color: theme.colors.text.secondary }}>
                Subscription Tier
              </p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: theme.colors.primary, textTransform: 'capitalize' }}>
                {tier === 'free' ? 'Creator' : tier === 'pro' ? 'Pro' : 'Team/Label'}
              </p>
              <p style={{ margin: 0, marginTop: '4px', color: theme.colors.accent, fontSize: theme.typography.fontSize.sm, fontWeight: '600' }}>
                {bezyMultiplier}x BZY Multiplier
              </p>
            </Card>

            <Card style={{ padding: theme.spacing.lg, textAlign: 'center' }}>
              <p style={{ margin: 0, marginBottom: theme.spacing.sm, color: theme.colors.text.secondary }}>
                Connected Integrations
              </p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: theme.colors.accent }}>
                {integrations.filter((i) => i.status === 'connected').length}/{integrations.length}
              </p>
              <p style={{ margin: 0, marginTop: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                Active connections
              </p>
            </Card>

            <Card style={{ padding: theme.spacing.lg, textAlign: 'center' }}>
              <p style={{ margin: 0, marginBottom: theme.spacing.sm, color: theme.colors.text.secondary }}>
                AI Status
              </p>
              <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: theme.colors.primary }}>
                Ready
              </p>
              <p style={{ margin: 0, marginTop: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                Claude API connected
              </p>
            </Card>
          </div>

          <Card style={{ padding: theme.spacing.lg }}>
            <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
              🚀 Quick Start
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                <span style={{ fontSize: '20px' }}>1️⃣</span>
                <div>
                  <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: '600' }}>Invite team members</p>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Collaborate with managers and analysts</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                <span style={{ fontSize: '20px' }}>2️⃣</span>
                <div>
                  <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: '600' }}>Connect integrations</p>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Link Meta Ads, Google Analytics, and Claude API</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                <span style={{ fontSize: '20px' }}>3️⃣</span>
                <div>
                  <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: '600' }}>Enable AI analytics</p>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Get automated insights and recommendations</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === 'team' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <Card style={{ padding: theme.spacing.lg }}>
            <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
              👥 Invite Team Member
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.md }}>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="team@example.com"
                style={{
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[700]}`,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TeamMember['role'])}
                style={{
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[700]}`,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              >
                <option value="manager">Manager</option>
                <option value="analyst">Analyst</option>
                <option value="developer">Developer</option>
              </select>
              <Button variant="primary" onClick={handleInviteTeamMember}>
                📧 Send Invite
              </Button>
            </div>
          </Card>

          <Card style={{ padding: theme.spacing.lg }}>
            <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
              Team Members ({teamMembers.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  style={{
                    padding: theme.spacing.md,
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: '600' }}>
                      {member.name || member.email}
                    </p>
                    <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                      {member.role} • {member.permissions.join(', ')}
                    </p>
                  </div>
                  <Badge
                    variant={member.status === 'active' ? 'success' : 'info'}
                    size="sm"
                  >
                    {member.status === 'active' ? '✓ Active' : '⏳ Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: theme.spacing.lg }}>
          {integrations.map((integration) => (
            <Card key={integration.id} style={{ padding: theme.spacing.lg }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: theme.spacing.md }}>
                <div>
                  <p style={{ margin: 0, fontSize: '24px' }}>{integration.icon}</p>
                  <h4 style={{ margin: '8px 0 4px 0', color: theme.colors.text.primary }}>
                    {integration.name}
                  </h4>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                    {integration.description}
                  </p>
                </div>
                <Badge
                  variant={integration.status === 'connected' ? 'success' : 'info'}
                  size="sm"
                >
                  {integration.status === 'connected' ? '✓ Connected' : '⊘ Disconnected'}
                </Badge>
              </div>

              {integration.lastSynced && (
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, marginBottom: theme.spacing.md }}>
                  Last synced: {new Date(integration.lastSynced).toLocaleDateString()}
                </p>
              )}

              <Button
                variant={integration.status === 'connected' ? 'secondary' : 'primary'}
                onClick={() => handleConnectIntegration(integration)}
                style={{ width: '100%' }}
              >
                {integration.status === 'connected' ? '✓ Reconnect' : '🔗 Connect'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {/* AI Enhancements Tab */}
      {activeTab === 'ai_enhancements' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <Card style={{ padding: theme.spacing.lg }}>
            <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
              🤖 Claude AI-Powered Features
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.primary}`,
              }}>
                <p style={{ margin: 0, color: theme.colors.primary, fontWeight: '600', marginBottom: theme.spacing.xs }}>
                  📊 Automated Analytics Dashboard
                </p>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                  Claude AI analyzes your Meta Ads, Google Analytics, and streaming data to provide actionable insights, identify trends, and predict audience growth.
                </p>
              </div>

              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.primary}`,
              }}>
                <p style={{ margin: 0, color: theme.colors.primary, fontWeight: '600', marginBottom: theme.spacing.xs }}>
                  🎯 Content Recommendations
                </p>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                  AI-generated recommendations for music genres, release timing, promotional strategies based on audience data and market trends.
                </p>
              </div>

              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.primary}`,
              }}>
                <p style={{ margin: 0, color: theme.colors.primary, fontWeight: '600', marginBottom: theme.spacing.xs }}>
                  🚀 Marketing Automation
                </p>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                  Automated campaign suggestions, budget optimization, and audience targeting powered by Claude Skills for music marketing.
                </p>
              </div>

              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.primary}`,
              }}>
                <p style={{ margin: 0, color: theme.colors.primary, fontWeight: '600', marginBottom: theme.spacing.xs }}>
                  📈 Revenue Optimization
                </p>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                  AI-driven insights on pricing, pricing strategies, and revenue diversification across streaming platforms.
                </p>
              </div>

              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.primary}`,
              }}>
                <p style={{ margin: 0, color: theme.colors.primary, fontWeight: '600', marginBottom: theme.spacing.xs }}>
                  🤝 Claude Cowork Integration
                </p>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                  Enable real-time collaboration with AI agents for music publishing management, licensing coordination, and distribution optimization.
                </p>
              </div>
            </div>
          </Card>

          <Card style={{ padding: theme.spacing.lg }}>
            <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
              ✨ Data Sources for AI Analysis
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                <span style={{ fontSize: '18px' }}>📱</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: '600' }}>Meta Ads Manager</p>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Campaign performance, audience insights, spend analysis</p>
                </div>
                <Badge variant={integrations.find(i => i.id === 'meta_ads')?.status === 'connected' ? 'success' : 'info'} size="sm">
                  {integrations.find(i => i.id === 'meta_ads')?.status === 'connected' ? '✓' : '⊘'}
                </Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                <span style={{ fontSize: '18px' }}>📊</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: '600' }}>Google Analytics</p>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Website traffic, user behavior, conversion tracking</p>
                </div>
                <Badge variant={integrations.find(i => i.id === 'google_analytics')?.status === 'connected' ? 'success' : 'info'} size="sm">
                  {integrations.find(i => i.id === 'google_analytics')?.status === 'connected' ? '✓' : '⊘'}
                </Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                <span style={{ fontSize: '18px' }}>🎵</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: '600' }}>SoundMoney Streaming Data</p>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>BZY earnings, listener demographics, track performance</p>
                </div>
                <Badge variant="success" size="sm">
                  ✓
                </Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                <span style={{ fontSize: '18px' }}>🎵</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: '600' }}>TikTok Ads API</p>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Campaign performance, viral content metrics, youth audience insights</p>
                </div>
                <Badge variant={integrations.find(i => i.id === 'tiktok_api')?.status === 'connected' ? 'success' : 'info'} size="sm">
                  {integrations.find(i => i.id === 'tiktok_api')?.status === 'connected' ? '✓' : '⊘'}
                </Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                <span style={{ fontSize: '18px' }}>👻</span>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: '600' }}>Snapchat Ads API</p>
                  <p style={{ margin: 0, fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>Youth audience engagement, discovery campaigns, Gen Z metrics</p>
                </div>
                <Badge variant={integrations.find(i => i.id === 'snapchat_api')?.status === 'connected' ? 'success' : 'info'} size="sm">
                  {integrations.find(i => i.id === 'snapchat_api')?.status === 'connected' ? '✓' : '⊘'}
                </Badge>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api_keys' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <Card style={{ padding: theme.spacing.lg }}>
            <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
              🔑 Developer API Keys
            </h3>
            <p style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Manage your API keys for custom integrations and Claude Skills development. Keep these secret and secure.
            </p>

            <div style={{
              padding: theme.spacing.md,
              backgroundColor: `${theme.colors.danger}20`,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.danger}`,
              marginBottom: theme.spacing.md,
            }}>
              <p style={{ margin: 0, color: theme.colors.danger, fontSize: theme.typography.fontSize.sm, fontWeight: '600' }}>
                ⚠️ Keep your API keys confidential. Never share them publicly or commit to version control.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.gray[700]}`,
                fontFamily: 'monospace',
                fontSize: theme.typography.fontSize.sm,
                wordBreak: 'break-all',
              }}>
                <p style={{ margin: '0 0 8px 0', color: theme.colors.text.secondary }}>SoundMoney API Key:</p>
                <p style={{ margin: 0, color: theme.colors.accent, userSelect: 'all' }}>
                  ••••••••••••••••••••••••••••••••
                </p>
                <button style={{
                  marginTop: theme.spacing.sm,
                  padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                  backgroundColor: theme.colors.primary,
                  color: '#fff',
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  fontSize: theme.typography.fontSize.sm,
                }}>
                  📋 Copy
                </button>
              </div>

              <Button variant="secondary" style={{ width: '100%' }}>
                🔄 Regenerate API Key
              </Button>
            </div>
          </Card>

          <Card style={{ padding: theme.spacing.lg }}>
            <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
              🛠️ Integration Examples
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.md,
              }}>
                <p style={{ margin: '0 0 8px 0', color: theme.colors.text.primary, fontWeight: '600' }}>
                  Claude Skills Integration
                </p>
                <code style={{
                  display: 'block',
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.background.primary,
                  borderRadius: theme.borderRadius.sm,
                  overflow: 'auto',
                  color: theme.colors.accent,
                  fontSize: '12px',
                }}>
                  curl -H "Authorization: Bearer YOUR_API_KEY" \<br />
                  &nbsp;&nbsp;https://api.soundmoney.io/v1/analytics/insights
                </code>
              </div>

              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.md,
              }}>
                <p style={{ margin: '0 0 8px 0', color: theme.colors.text.primary, fontWeight: '600' }}>
                  Webhook for Real-time Events
                </p>
                <code style={{
                  display: 'block',
                  padding: theme.spacing.sm,
                  backgroundColor: theme.colors.background.primary,
                  borderRadius: theme.borderRadius.sm,
                  overflow: 'auto',
                  color: theme.colors.accent,
                  fontSize: '12px',
                }}>
                  POST /webhook/events{`
`}
                  Content-Type: application/json{`
`}
                  {`{"event": "track.streamed", "data": {...}}`}
                </code>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* API Key Modal */}
      {showNewApiModal && selectedIntegration && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
        }}>
          <Card style={{
            width: '90%',
            maxWidth: '500px',
            padding: theme.spacing.lg,
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
              🔗 Connect {selectedIntegration.name}
            </h3>

            {selectedIntegration.type === 'meta_ads' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  1. Go to <strong>Meta Business Suite</strong> → Settings → Apps and Websites
                </p>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  2. Copy your <strong>Access Token</strong> from the API section
                </p>
                <input
                  type="password"
                  placeholder="Paste your Meta Access Token here"
                  style={{
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                    boxSizing: 'border-box',
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveApiKey((e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </div>
            )}

            {selectedIntegration.type === 'google_analytics' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  1. Go to <strong>Google Analytics</strong> → Admin → Property Settings
                </p>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  2. Copy your <strong>Property ID</strong> (format: G-XXXXXXXXXX)
                </p>
                <input
                  type="text"
                  placeholder="Paste your Google Analytics Property ID"
                  style={{
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                    boxSizing: 'border-box',
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveApiKey((e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </div>
            )}

            {selectedIntegration.type === 'claude_api' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  1. Get your API key from <strong>console.anthropic.com</strong>
                </p>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  2. Paste your <strong>Claude API Key</strong> below
                </p>
                <input
                  type="password"
                  placeholder="Paste your Claude API key (sk-ant-...)"
                  style={{
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                    boxSizing: 'border-box',
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveApiKey((e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </div>
            )}

            {selectedIntegration?.id === 'tiktok_api' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  1. Go to <strong>TikTok for Business</strong> → Business Center → Apps
                </p>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  2. Create or select your app and copy the <strong>Access Token</strong>
                </p>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  3. Also copy your <strong>Advertiser ID</strong> (found in Business Center)
                </p>
                <input
                  type="password"
                  placeholder="Paste your TikTok Access Token"
                  style={{
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                    boxSizing: 'border-box',
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveApiKey((e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </div>
            )}

            {selectedIntegration?.id === 'snapchat_api' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  1. Go to <strong>Snapchat Ads Manager</strong> → Settings → API & Tools
                </p>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  2. Create an app and copy the <strong>Client ID</strong> and <strong>Client Secret</strong>
                </p>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  3. Also note your <strong>Ad Account ID</strong> for youth audience targeting
                </p>
                <input
                  type="password"
                  placeholder="Paste your Snapchat Client ID:Client Secret"
                  style={{
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                    boxSizing: 'border-box',
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSaveApiKey((e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </div>
            )}

            <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.lg }}>
              <Button
                variant="secondary"
                onClick={() => setShowNewApiModal(false)}
                style={{ flex: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  const input = (document.querySelector('input[type="password"]') || document.querySelector('input[type="text"]')) as HTMLInputElement;
                  handleSaveApiKey(input?.value || '');
                }}
                style={{ flex: 1 }}
              >
                ✓ Connect
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Container>
  );
};

export default TeamPage;
