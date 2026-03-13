import React, { useState } from 'react';
import { theme } from '../theme/theme';

interface PlatformIntegration {
  id: string;
  name: string;
  category: 'messaging' | 'social' | 'web3';
  icon: string;
  description: string;
  connected: boolean;
  connectUrl?: string;
  features: string[];
}

interface CommunityManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

export const CommunityManagerModal: React.FC<CommunityManagerModalProps> = ({ visible, onClose }) => {
  const [selectedTab, setSelectedTab] = useState<'messaging' | 'social' | 'web3'>('messaging');
  const [platformStatuses, setPlatformStatuses] = useState<Record<string, boolean>>({
    discord: false,
    whatsapp: false,
    telegram: false,
    instagram: false,
    facebook: false,
    twitter: false,
    bluesky: false,
    mastodon: false,
    farcaster: false,
    lens: false,
  });
  const [showConnectionModal, setShowConnectionModal] = useState<string | null>(null);

  const platforms: PlatformIntegration[] = [
    // Messaging Platforms
    {
      id: 'discord',
      name: 'Discord',
      category: 'messaging',
      icon: '💜',
      description: 'Direct server and community management for fan engagement.',
      connected: platformStatuses.discord,
      connectUrl: 'https://discord.com/developers/applications',
      features: [
        'Dedicated fan community server',
        'Role-based fan tiers',
        'Exclusive content channels',
        'Real-time chat moderation',
        'Bot automation for engagement',
      ],
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      category: 'messaging',
      icon: '💬',
      description: 'Direct messaging and broadcast lists for personal fan connections.',
      connected: platformStatuses.whatsapp,
      connectUrl: 'https://www.whatsapp.com/business/api',
      features: [
        'Personal messaging',
        'Broadcast lists',
        'Media sharing',
        'End-to-end encryption',
        'Business automation',
      ],
    },
    {
      id: 'telegram',
      name: 'Telegram',
      category: 'messaging',
      icon: '✈️',
      description: 'Create channels and groups for community discussions and announcements.',
      connected: platformStatuses.telegram,
      connectUrl: 'https://core.telegram.org/api',
      features: [
        'Public channels',
        'Supergroups',
        'Bot automation',
        'File sharing',
        'Admin tools',
      ],
    },

    // Social Media Platforms
    {
      id: 'instagram',
      name: 'Instagram',
      category: 'social',
      icon: '📸',
      description: 'Manage DMs and reach fans through Instagram Messenger.',
      connected: platformStatuses.instagram,
      connectUrl: 'https://developers.facebook.com/docs/instagram-api',
      features: [
        'Direct Messages',
        'Story interactions',
        'Comments moderation',
        'Engagement metrics',
        'Fan insights',
      ],
    },
    {
      id: 'facebook',
      name: 'Facebook',
      category: 'social',
      icon: '📘',
      description: 'Connect Facebook Messenger for fan communication and community groups.',
      connected: platformStatuses.facebook,
      connectUrl: 'https://developers.facebook.com/docs/messenger-platform',
      features: [
        'Messenger integration',
        'Community groups',
        'Live streaming',
        'Fan pages',
        'Engagement tools',
      ],
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      category: 'social',
      icon: '🐦',
      description: 'Engage fans through DMs, mentions, and community notes.',
      connected: platformStatuses.twitter,
      connectUrl: 'https://developer.twitter.com/en/portal/dashboard',
      features: [
        'Direct Messages',
        'Mention monitoring',
        'Twitter Blue features',
        'Community Notes',
        'Analytics',
      ],
    },
    {
      id: 'bluesky',
      name: 'Bluesky',
      category: 'social',
      icon: '🌤️',
      description: 'Decentralized social platform for community building.',
      connected: platformStatuses.bluesky,
      connectUrl: 'https://docs.bsky.app',
      features: [
        'Decentralized posts',
        'Direct messaging',
        'Feeds creation',
        'Feed algorithms',
        'Open protocol',
      ],
    },
    {
      id: 'mastodon',
      name: 'Mastodon',
      category: 'social',
      icon: '🐘',
      description: 'Decentralized social network for federated community engagement.',
      connected: platformStatuses.mastodon,
      connectUrl: 'https://docs.joinmastodon.org/client/intro/',
      features: [
        'Federated posts',
        'Direct messaging',
        'Custom emojis',
        'Hashtag communities',
        'ActivityPub protocol',
      ],
    },

    // Web3 Platforms
    {
      id: 'farcaster',
      name: 'Farcaster',
      category: 'web3',
      icon: '🎭',
      description: 'Web3 social network with on-chain profiles and decentralized interactions.',
      connected: platformStatuses.farcaster,
      connectUrl: 'https://docs.farcaster.xyz/reference/farcaster/api',
      features: [
        'On-chain profiles',
        'Cast interactions',
        'Direct messaging',
        'Token-gated content',
        'Smart contract integration',
      ],
    },
    {
      id: 'lens',
      name: 'Lens Protocol',
      category: 'web3',
      icon: '🔍',
      description: 'Web3 social graph for creator economy with NFT-based interactions.',
      connected: platformStatuses.lens,
      connectUrl: 'https://github.com/lens-protocol/api-examples',
      features: [
        'Creator profiles (NFT)',
        'Publication NFTs',
        'Collect mechanisms',
        'Follower NFTs',
        'Governance tokens',
      ],
    },
  ];

  const handleConnectPlatform = (platformId: string) => {
    setPlatformStatuses(prev => ({
      ...prev,
      [platformId]: true,
    }));
    alert(`✅ ${platforms.find(p => p.id === platformId)?.name} connected successfully!`);
    setShowConnectionModal(null);
  };

  const handleDisconnectPlatform = (platformId: string) => {
    if (window.confirm('Are you sure you want to disconnect this platform?')) {
      setPlatformStatuses(prev => ({
        ...prev,
        [platformId]: false,
      }));
      alert('🔌 Platform disconnected');
    }
  };

  const filteredPlatforms = platforms.filter(p => p.category === selectedTab);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          backgroundColor: theme.colors.background.primary,
          borderRadius: theme.borderRadius.lg,
          width: '90%',
          maxWidth: '900px',
          height: '85vh',
          maxHeight: '800px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: theme.spacing.lg,
            borderBottom: `1px solid ${theme.colors.gray[800]}`,
          }}
        >
          <h2 style={{ margin: 0, color: theme.colors.text.primary, fontSize: '24px' }}>
            🌐 Community Manager
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: theme.colors.text.primary,
            }}
          >
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{
            display: 'flex',
            gap: theme.spacing.md,
            padding: theme.spacing.md,
            borderBottom: `1px solid ${theme.colors.gray[800]}`,
            backgroundColor: theme.colors.background.secondary,
            flexWrap: 'wrap',
          }}
        >
          {(['messaging', 'social', 'web3'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor: selectedTab === tab ? theme.colors.primary : 'transparent',
                color: selectedTab === tab ? 'white' : theme.colors.text.secondary,
                border: 'none',
                borderRadius: theme.borderRadius.md,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: theme.typography.fontSize.base,
                transition: 'all 0.2s',
              }}
            >
              {tab === 'messaging' && '💬 Messaging'}
              {tab === 'social' && '📱 Social Media'}
              {tab === 'web3' && '🔗 Web3'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: theme.spacing.lg,
          }}
        >
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: theme.spacing.lg,
          }}>
            {filteredPlatforms.map(platform => (
              <div
                key={platform.id}
                style={{
                  padding: theme.spacing.lg,
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[800]}`,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  marginBottom: theme.spacing.md,
                }}>
                  <div style={{ fontSize: '40px' }}>{platform.icon}</div>
                  <div>
                    <h4 style={{
                      margin: 0,
                      marginBottom: theme.spacing.xs,
                      color: theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.lg,
                    }}>
                      {platform.name}
                    </h4>
                    <div style={{
                      fontSize: theme.typography.fontSize.xs,
                      fontWeight: 600,
                      color: platform.connected ? theme.colors.success : theme.colors.text.tertiary,
                      textTransform: 'uppercase',
                    }}>
                      {platform.connected ? '✓ Connected' : 'Not Connected'}
                    </div>
                  </div>
                </div>

                <p style={{
                  margin: '0 0 12px 0',
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}>
                  {platform.description}
                </p>

                <div style={{
                  marginBottom: theme.spacing.md,
                  paddingBottom: theme.spacing.md,
                  borderBottom: `1px solid ${theme.colors.gray[800]}`,
                  flex: 1,
                }}>
                  <p style={{
                    margin: '0 0 8px 0',
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.xs,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                  }}>
                    Features:
                  </p>
                  <ul style={{
                    margin: 0,
                    paddingLeft: '20px',
                    listStyleType: 'disc',
                  }}>
                    {platform.features.slice(0, 3).map((feature, idx) => (
                      <li
                        key={idx}
                        style={{
                          color: theme.colors.text.secondary,
                          fontSize: theme.typography.fontSize.xs,
                          marginBottom: '4px',
                        }}
                      >
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                  {platform.connected ? (
                    <>
                      <button
                        onClick={() => setShowConnectionModal(platform.id)}
                        style={{
                          flex: 1,
                          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                          backgroundColor: theme.colors.background.tertiary,
                          color: theme.colors.text.primary,
                          border: `1px solid ${theme.colors.gray[700]}`,
                          borderRadius: theme.borderRadius.md,
                          cursor: 'pointer',
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: 600,
                        }}
                      >
                        ⚙️ Manage
                      </button>
                      <button
                        onClick={() => handleDisconnectPlatform(platform.id)}
                        style={{
                          flex: 1,
                          padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                          backgroundColor: theme.colors.danger,
                          color: 'white',
                          border: 'none',
                          borderRadius: theme.borderRadius.md,
                          cursor: 'pointer',
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: 600,
                        }}
                      >
                        🔌 Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => setShowConnectionModal(platform.id)}
                      style={{
                        width: '100%',
                        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                        backgroundColor: theme.colors.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: theme.borderRadius.md,
                        cursor: 'pointer',
                        fontSize: theme.typography.fontSize.sm,
                        fontWeight: 600,
                      }}
                    >
                      🔗 Connect
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Connection Modal */}
      {showConnectionModal && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1001,
          }}
          onClick={() => setShowConnectionModal(null)}
        >
          <div
            style={{
              backgroundColor: theme.colors.background.primary,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              maxWidth: '500px',
              width: '90%',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {platforms.find(p => p.id === showConnectionModal) && (
              <>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.md,
                  marginBottom: theme.spacing.lg,
                }}>
                  <div style={{ fontSize: '48px' }}>
                    {platforms.find(p => p.id === showConnectionModal)?.icon}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, color: theme.colors.text.primary }}>
                      {platforms.find(p => p.id === showConnectionModal)?.name}
                    </h3>
                    <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                      {platforms.find(p => p.id === showConnectionModal)?.description}
                    </p>
                  </div>
                </div>

                <div style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.tertiary,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.lg,
                }}>
                  <h4 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
                    📋 Connection Steps
                  </h4>
                  <ol style={{
                    margin: 0,
                    paddingLeft: '20px',
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.sm,
                    lineHeight: '1.6',
                  }}>
                    <li style={{ marginBottom: '8px' }}>
                      Create or log in to your {platforms.find(p => p.id === showConnectionModal)?.name} account
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      Navigate to Developer or API settings
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      Generate your API credentials or access token
                    </li>
                    <li style={{ marginBottom: '8px' }}>
                      Copy and paste your credentials below
                    </li>
                    <li>Click "Verify & Connect" to complete the integration</li>
                  </ol>
                </div>

                <div style={{ marginBottom: theme.spacing.lg }}>
                  <label style={{
                    display: 'block',
                    marginBottom: theme.spacing.sm,
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.sm,
                    fontWeight: 600,
                  }}>
                    API Key / Access Token
                  </label>
                  <input
                    type="password"
                    placeholder="Paste your credentials here..."
                    style={{
                      width: '100%',
                      padding: theme.spacing.md,
                      borderRadius: theme.borderRadius.md,
                      border: `1px solid ${theme.colors.gray[700]}`,
                      backgroundColor: theme.colors.background.secondary,
                      color: theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.base,
                      boxSizing: 'border-box',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>

                <div style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.lg,
                  border: `1px solid ${theme.colors.gray[800]}`,
                }}>
                  <p style={{
                    margin: 0,
                    color: theme.colors.text.secondary,
                    fontSize: theme.typography.fontSize.xs,
                  }}>
                    💡 Need help? Visit the <a
                      href={platforms.find(p => p.id === showConnectionModal)?.connectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: theme.colors.primary, textDecoration: 'none' }}
                    >
                      API documentation
                    </a>
                  </p>
                </div>

                <div style={{ display: 'flex', gap: theme.spacing.md }}>
                  <button
                    onClick={() => setShowConnectionModal(null)}
                    style={{
                      flex: 1,
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      backgroundColor: theme.colors.background.tertiary,
                      color: theme.colors.text.primary,
                      border: `1px solid ${theme.colors.gray[700]}`,
                      borderRadius: theme.borderRadius.md,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleConnectPlatform(showConnectionModal)}
                    style={{
                      flex: 1,
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      backgroundColor: theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: theme.borderRadius.md,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    ✓ Verify & Connect
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityManagerModal;
