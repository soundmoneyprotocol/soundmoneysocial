import React, { useState } from 'react';
import { Container, Header, Card, Button, Badge } from '../components';
import { theme } from '../theme/theme';
import EmbedWidget from '../components/EmbedWidget';
import { useSubscription } from '../contexts/SubscriptionContext';

interface ApiIntegration {
  id: string;
  name: string;
  type: 'meta_ads' | 'google_analytics' | 'claude_api' | 'stripe' | 'custom';
  status: 'connected' | 'disconnected' | 'error';
  lastSynced?: string;
  icon: string;
  description: string;
}

type TabType = 'integrations' | 'ai_enhancements' | 'api_keys';

const ProArtistPage: React.FC = () => {
  const { tier, bezyMultiplier } = useSubscription();
  const [activeTab, setActiveTab] = useState<TabType>('integrations');
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
  const [selectedIntegration, setSelectedIntegration] = useState<ApiIntegration | null>(null);

  const handleConnectIntegration = (integration: ApiIntegration) => {
    if (integration.status === 'disconnected') {
      setSelectedIntegration(integration);
      alert(`Connect to ${integration.name}`);
    }
  };

  return (
    <Container>
      <Header title="🎤 Artist Pro" subtitle="Professional artist tools for music marketing and analytics" />

      {/* Tab Navigation */}
      <div style={{
        display: 'flex',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        borderBottom: `1px solid ${theme.colors.gray[800]}`,
        paddingBottom: theme.spacing.md,
        overflowX: 'auto',
        flexWrap: 'wrap',
      }}>
        {(['integrations', 'ai_enhancements', 'api_keys'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: activeTab === tab ? theme.colors.primary : 'transparent',
              color: activeTab === tab ? 'white' : theme.colors.text.secondary,
              border: 'none',
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: theme.typography.fontSize.base,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {tab === 'integrations' && '🔗 Integrations'}
            {tab === 'ai_enhancements' && '🤖 AI'}
            {tab === 'api_keys' && '🔑 API Keys'}
          </button>
        ))}
      </div>

      {/* Stream BZY Counter Widget */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <h3 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>📊 Embed Widget</h3>
        <EmbedWidget />
      </div>

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
                  AI suggestions to maximize streaming revenue, optimize pricing, and identify high-value audience segments for targeted promotions.
                </p>
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
                  sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
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
    </Container>
  );
};

export default ProArtistPage;
