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

interface CRMIntegration {
  id: string;
  name: string;
  icon: string;
  description: string;
  connected: boolean;
  features: string[];
}

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  recipients: number;
  status: 'draft' | 'scheduled' | 'sent';
  createdAt: string;
  sendAt?: string;
}

interface CommunityManagerModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'messaging' | 'social' | 'web3' | 'email_marketing';

export const CommunityManagerModal: React.FC<CommunityManagerModalProps> = ({ visible, onClose }) => {
  const [selectedTab, setSelectedTab] = useState<TabType>('messaging');
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

  // Email List States
  const [emailContacts, setEmailContacts] = useState<Array<{ email: string; name: string }>>([]);
  const [emailCampaigns, setEmailCampaigns] = useState<EmailCampaign[]>([]);
  const [showConnectionModal, setShowConnectionModal] = useState<string | null>(null);
  const [showEmailCampaignModal, setShowEmailCampaignModal] = useState(false);
  const [showSocialPostModal, setShowSocialPostModal] = useState(false);
  const [crmStatuses, setCRMStatuses] = useState<Record<string, boolean>>({
    hubspot: false,
    salesforce: false,
    mailchimp: false,
    klaviyo: false,
    pipedrive: false,
  });

  // Email campaign form
  const [campaignForm, setCampaignForm] = useState({
    name: '',
    subject: '',
    template: 'exclusive_passes',
    sendAt: '',
  });

  // Social media post form
  const [socialPostForm, setSocialPostForm] = useState({
    content: '',
    platforms: [] as string[],
    schedule: 'now' as 'now' | 'schedule',
    scheduledTime: '',
  });

  const crms: CRMIntegration[] = [
    {
      id: 'hubspot',
      name: 'HubSpot',
      icon: '🎯',
      description: 'All-in-one CRM with email and marketing automation.',
      connected: crmStatuses.hubspot,
      features: ['Contact management', 'Email automation', 'Lead scoring', 'Analytics dashboard'],
    },
    {
      id: 'salesforce',
      name: 'Salesforce',
      icon: '☁️',
      description: 'Enterprise CRM for large-scale customer management.',
      connected: crmStatuses.salesforce,
      features: ['Account management', 'Sales automation', 'Custom fields', 'API access'],
    },
    {
      id: 'mailchimp',
      name: 'Mailchimp',
      icon: '🐵',
      description: 'Email marketing and CRM platform for audience management.',
      connected: crmStatuses.mailchimp,
      features: ['Email campaigns', 'List segmentation', 'Automation', 'A/B testing'],
    },
    {
      id: 'klaviyo',
      name: 'Klaviyo',
      icon: '📧',
      description: 'Platform for e-commerce email and SMS marketing.',
      connected: crmStatuses.klaviyo,
      features: ['SMS campaigns', 'Email flows', 'Segmentation', 'Analytics'],
    },
    {
      id: 'pipedrive',
      name: 'Pipedrive',
      icon: '📈',
      description: 'Sales CRM focused on deal management and pipeline.',
      connected: crmStatuses.pipedrive,
      features: ['Deal tracking', 'Activity timeline', 'Email sync', 'Mobile app'],
    },
  ];

  const platforms: PlatformIntegration[] = [
    {
      id: 'discord',
      name: 'Discord',
      category: 'messaging',
      icon: '💜',
      description: 'Direct server and community management for fan engagement.',
      connected: platformStatuses.discord,
      connectUrl: 'https://discord.com/developers/applications',
      features: ['Dedicated fan community server', 'Role-based fan tiers', 'Exclusive content channels'],
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      category: 'messaging',
      icon: '💬',
      description: 'Direct messaging and broadcast lists for personal fan connections.',
      connected: platformStatuses.whatsapp,
      connectUrl: 'https://www.whatsapp.com/business/api',
      features: ['Personal messaging', 'Broadcast lists', 'Media sharing'],
    },
    {
      id: 'telegram',
      name: 'Telegram',
      category: 'messaging',
      icon: '✈️',
      description: 'Create channels and groups for community discussions and announcements.',
      connected: platformStatuses.telegram,
      connectUrl: 'https://core.telegram.org/api',
      features: ['Public channels', 'Supergroups', 'Bot automation'],
    },
    {
      id: 'instagram',
      name: 'Instagram',
      category: 'social',
      icon: '📸',
      description: 'Manage DMs and reach fans through Instagram Messenger.',
      connected: platformStatuses.instagram,
      connectUrl: 'https://developers.facebook.com/docs/instagram-api',
      features: ['Direct Messages', 'Story interactions', 'Engagement metrics'],
    },
    {
      id: 'facebook',
      name: 'Facebook',
      category: 'social',
      icon: '📘',
      description: 'Connect Facebook Messenger for fan communication and community groups.',
      connected: platformStatuses.facebook,
      connectUrl: 'https://developers.facebook.com/docs/messenger-platform',
      features: ['Messenger integration', 'Community groups', 'Fan pages'],
    },
    {
      id: 'twitter',
      name: 'Twitter/X',
      category: 'social',
      icon: '🐦',
      description: 'Engage fans through DMs, mentions, and community notes.',
      connected: platformStatuses.twitter,
      connectUrl: 'https://developer.twitter.com/en/portal/dashboard',
      features: ['Direct Messages', 'Mention monitoring', 'Analytics'],
    },
    {
      id: 'bluesky',
      name: 'Bluesky',
      category: 'social',
      icon: '🌤️',
      description: 'Decentralized social platform for community building.',
      connected: platformStatuses.bluesky,
      connectUrl: 'https://docs.bsky.app',
      features: ['Decentralized posts', 'Direct messaging', 'Feeds creation'],
    },
    {
      id: 'mastodon',
      name: 'Mastodon',
      category: 'social',
      icon: '🐘',
      description: 'Decentralized social network for federated community engagement.',
      connected: platformStatuses.mastodon,
      connectUrl: 'https://docs.joinmastodon.org/client/intro/',
      features: ['Federated posts', 'Direct messaging', 'Custom emojis'],
    },
    {
      id: 'farcaster',
      name: 'Farcaster',
      category: 'web3',
      icon: '🎭',
      description: 'Web3 social network with on-chain profiles and decentralized interactions.',
      connected: platformStatuses.farcaster,
      connectUrl: 'https://docs.farcaster.xyz/reference/farcaster/api',
      features: ['On-chain profiles', 'Cast interactions', 'Token-gating'],
    },
    {
      id: 'lens',
      name: 'Lens Protocol',
      category: 'web3',
      icon: '🔍',
      description: 'Web3 social graph for creator economy with NFT-based interactions.',
      connected: platformStatuses.lens,
      connectUrl: 'https://github.com/lens-protocol/api-examples',
      features: ['Creator profiles (NFT)', 'Publication NFTs', 'Collect mechanisms'],
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

  const handleConnectCRM = (crmId: string) => {
    setCRMStatuses(prev => ({
      ...prev,
      [crmId]: true,
    }));
    alert(`✅ ${crms.find(c => c.id === crmId)?.name} connected successfully!`);
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csv = event.target?.result as string;
        const lines = csv.split('\n').slice(1);
        const contacts = lines
          .filter(line => line.trim())
          .map(line => {
            const [email, name] = line.split(',');
            return { email: email.trim(), name: name?.trim() || '' };
          });
        setEmailContacts(contacts);
        alert(`✅ ${contacts.length} contacts imported successfully!`);
      };
      reader.readAsText(file);
    }
  };

  const handleCreateCampaign = () => {
    if (!campaignForm.name || !campaignForm.subject) {
      alert('Please fill in all required fields');
      return;
    }

    const newCampaign: EmailCampaign = {
      id: `campaign_${Date.now()}`,
      name: campaignForm.name,
      subject: campaignForm.subject,
      recipients: emailContacts.length,
      status: campaignForm.sendAt ? 'scheduled' : 'draft',
      createdAt: new Date().toISOString(),
      sendAt: campaignForm.sendAt,
    };

    setEmailCampaigns([...emailCampaigns, newCampaign]);
    setCampaignForm({ name: '', subject: '', template: 'exclusive_passes', sendAt: '' });
    setShowEmailCampaignModal(false);
    alert('✅ Email campaign created!');
  };

  const handlePostToSocial = () => {
    if (!socialPostForm.content) {
      alert('Please enter post content');
      return;
    }

    alert(
      `✅ Post scheduled!\n\n📱 Platforms: ${socialPostForm.platforms.join(', ') || 'None selected'}\n⏰ Time: ${socialPostForm.scheduledTime || 'Now'}\n\n🤖 Claude Skills can enhance this with:\n- Auto-generate hashtags\n- Optimize for engagement\n- Schedule across all platforms\n- Generate analytics reports`
    );

    setSocialPostForm({ content: '', platforms: [], schedule: 'now', scheduledTime: '' });
    setShowSocialPostModal(false);
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
          width: '95%',
          maxWidth: '1200px',
          height: '90vh',
          maxHeight: '900px',
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
            background: `linear-gradient(135deg, ${theme.colors.background.primary} 0%, ${theme.colors.background.secondary} 100%)`,
          }}
        >
          <div>
            <h2 style={{ margin: 0, color: theme.colors.text.primary, fontSize: '24px' }}>
              🌐 Community Manager
            </h2>
            <p style={{ margin: '4px 0 0 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Manage all your fan engagement, email lists, and social media in one place
            </p>
          </div>
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
            overflowX: 'auto',
            flexWrap: 'wrap',
          }}
        >
          {(['messaging', 'social', 'web3', 'email_marketing'] as const).map(tab => (
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
                whiteSpace: 'nowrap',
              }}
            >
              {tab === 'messaging' && '💬 Messaging'}
              {tab === 'social' && '📱 Social Media'}
              {tab === 'web3' && '🔗 Web3'}
              {tab === 'email_marketing' && '📧 Email & Marketing'}
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
          {selectedTab === 'email_marketing' ? (
            // Email & Marketing Dashboard
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
              {/* Dashboard Stats */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: theme.spacing.md,
                }}
              >
                <div
                  style={{
                    padding: theme.spacing.lg,
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.md,
                    border: `2px solid ${theme.colors.primary}`,
                  }}
                >
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                    📧 Total Contacts
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: theme.colors.primary }}>
                    {emailContacts.length}
                  </p>
                </div>

                <div
                  style={{
                    padding: theme.spacing.lg,
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.md,
                    border: `2px solid ${theme.colors.accent}`,
                  }}
                >
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                    📤 Active Campaigns
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: theme.colors.accent }}>
                    {emailCampaigns.length}
                  </p>
                </div>

                <div
                  style={{
                    padding: theme.spacing.lg,
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.md,
                    border: `2px solid #FFD700`,
                  }}
                >
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                    🤖 Claude Skills
                  </p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: 'bold', color: '#FFD700' }}>
                    Ready
                  </p>
                </div>
              </div>

              {/* CRM Integration Section */}
              <div>
                <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
                  🎯 CRM Integrations
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: theme.spacing.md }}>
                  {crms.map(crm => (
                    <div
                      key={crm.id}
                      style={{
                        padding: theme.spacing.md,
                        backgroundColor: theme.colors.background.secondary,
                        borderRadius: theme.borderRadius.md,
                        border: crm.connected ? `2px solid ${theme.colors.success}` : `1px solid ${theme.colors.gray[800]}`,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: theme.spacing.sm }}>
                        <div style={{ fontSize: '32px' }}>{crm.icon}</div>
                        <div
                          style={{
                            fontSize: theme.typography.fontSize.xs,
                            fontWeight: 600,
                            color: crm.connected ? theme.colors.success : theme.colors.text.tertiary,
                            textTransform: 'uppercase',
                          }}
                        >
                          {crm.connected ? '✓ Connected' : 'Not Connected'}
                        </div>
                      </div>
                      <h4 style={{ margin: '0 0 4px 0', color: theme.colors.text.primary }}>
                        {crm.name}
                      </h4>
                      <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs }}>
                        {crm.description}
                      </p>
                      <button
                        onClick={() => handleConnectCRM(crm.id)}
                        disabled={crm.connected}
                        style={{
                          width: '100%',
                          marginTop: theme.spacing.sm,
                          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                          backgroundColor: crm.connected ? theme.colors.gray[700] : theme.colors.primary,
                          color: 'white',
                          border: 'none',
                          borderRadius: theme.borderRadius.md,
                          cursor: crm.connected ? 'default' : 'pointer',
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: 600,
                          opacity: crm.connected ? 0.6 : 1,
                        }}
                      >
                        {crm.connected ? '✓ Connected' : 'Connect'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email List Management */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
                  <h3 style={{ margin: 0, color: theme.colors.text.primary }}>📨 Email List Management</h3>
                  <label
                    style={{
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      backgroundColor: theme.colors.primary,
                      color: 'white',
                      border: 'none',
                      borderRadius: theme.borderRadius.md,
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: theme.typography.fontSize.sm,
                    }}
                  >
                    📥 Upload CSV
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCSVUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>

                {emailContacts.length > 0 && (
                  <div
                    style={{
                      padding: theme.spacing.md,
                      backgroundColor: theme.colors.background.secondary,
                      borderRadius: theme.borderRadius.md,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    <p style={{ margin: 0, marginBottom: theme.spacing.sm, color: theme.colors.text.primary }}>
                      📋 Recent Contacts
                    </p>
                    <div style={{ fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary, maxHeight: '150px', overflowY: 'auto' }}>
                      {emailContacts.slice(0, 5).map((contact, idx) => (
                        <div key={idx} style={{ padding: '4px 0', borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                          {contact.name && <strong>{contact.name}</strong>} {contact.email}
                        </div>
                      ))}
                      {emailContacts.length > 5 && (
                        <div style={{ padding: '8px 0', color: theme.colors.accent, fontWeight: 600 }}>
                          ... and {emailContacts.length - 5} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Email Campaigns */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
                  <h3 style={{ margin: 0, color: theme.colors.text.primary }}>📤 Email Campaigns</h3>
                  <button
                    onClick={() => setShowEmailCampaignModal(true)}
                    disabled={emailContacts.length === 0}
                    style={{
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      backgroundColor: emailContacts.length === 0 ? theme.colors.gray[700] : theme.colors.accent,
                      color: 'white',
                      border: 'none',
                      borderRadius: theme.borderRadius.md,
                      cursor: emailContacts.length === 0 ? 'default' : 'pointer',
                      fontWeight: 600,
                      fontSize: theme.typography.fontSize.sm,
                      opacity: emailContacts.length === 0 ? 0.5 : 1,
                    }}
                  >
                    ✏️ Create Campaign
                  </button>
                </div>

                {emailCampaigns.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                    {emailCampaigns.map(campaign => (
                      <div
                        key={campaign.id}
                        style={{
                          padding: theme.spacing.md,
                          backgroundColor: theme.colors.background.secondary,
                          borderRadius: theme.borderRadius.md,
                          border: `1px solid ${theme.colors.gray[800]}`,
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div>
                            <h4 style={{ margin: 0, marginBottom: theme.spacing.xs, color: theme.colors.text.primary }}>
                              {campaign.name}
                            </h4>
                            <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                              {campaign.subject}
                            </p>
                            <p style={{ margin: '4px 0 0 0', color: theme.colors.text.tertiary, fontSize: theme.typography.fontSize.xs }}>
                              📧 {campaign.recipients} recipients
                            </p>
                          </div>
                          <div
                            style={{
                              padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                              backgroundColor:
                                campaign.status === 'sent'
                                  ? theme.colors.success
                                  : campaign.status === 'scheduled'
                                    ? theme.colors.info
                                    : theme.colors.gray[700],
                              color: 'white',
                              borderRadius: theme.borderRadius.sm,
                              fontSize: theme.typography.fontSize.xs,
                              fontWeight: 600,
                            }}
                          >
                            {campaign.status.toUpperCase()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: theme.spacing.lg,
                      textAlign: 'center',
                      backgroundColor: theme.colors.background.secondary,
                      borderRadius: theme.borderRadius.md,
                      border: `1px dashed ${theme.colors.gray[800]}`,
                      color: theme.colors.text.secondary,
                    }}
                  >
                    No campaigns yet. Import contacts and create one!
                  </div>
                )}
              </div>

              {/* Social Media & Claude Skills */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md }}>
                  <h3 style={{ margin: 0, color: theme.colors.text.primary }}>
                    🤖 Social Media & Claude Skills
                  </h3>
                  <button
                    onClick={() => setShowSocialPostModal(true)}
                    style={{
                      padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                      backgroundColor: theme.colors.accent,
                      color: '#000',
                      border: 'none',
                      borderRadius: theme.borderRadius.md,
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: theme.typography.fontSize.sm,
                    }}
                  >
                    ✍️ Create Post
                  </button>
                </div>

                <div
                  style={{
                    padding: theme.spacing.lg,
                    backgroundColor: theme.colors.background.secondary,
                    borderRadius: theme.borderRadius.md,
                    border: `2px solid ${theme.colors.accent}`,
                  }}
                >
                  <h4 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>
                    🔗 Connected Social Platforms
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: theme.spacing.md }}>
                    <div style={{ padding: theme.spacing.md, backgroundColor: theme.colors.background.tertiary, borderRadius: theme.borderRadius.md }}>
                      <div style={{ fontSize: '28px', marginBottom: theme.spacing.xs }}>📱</div>
                      <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>
                        Threads
                      </p>
                      <p style={{ margin: '4px 0 0 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs }}>
                        Not Connected
                      </p>
                    </div>
                    <div style={{ padding: theme.spacing.md, backgroundColor: theme.colors.background.tertiary, borderRadius: theme.borderRadius.md }}>
                      <div style={{ fontSize: '28px', marginBottom: theme.spacing.xs }}>💼</div>
                      <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>
                        LinkedIn
                      </p>
                      <p style={{ margin: '4px 0 0 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs }}>
                        Not Connected
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: theme.spacing.lg, paddingTop: theme.spacing.lg, borderTop: `1px solid ${theme.colors.gray[800]}` }}>
                    <h4 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>
                      ✨ Claude Skills Available
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                      <li style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, marginBottom: '8px' }}>
                        🎯 Auto-generate engaging hashtags for maximum reach
                      </li>
                      <li style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, marginBottom: '8px' }}>
                        📊 Optimize posts for platform engagement algorithms
                      </li>
                      <li style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, marginBottom: '8px' }}>
                        ⏰ Schedule posts across all platforms simultaneously
                      </li>
                      <li style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, marginBottom: '8px' }}>
                        📈 Generate performance analytics and insights
                      </li>
                      <li style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, marginBottom: '8px' }}>
                        💬 Auto-respond to comments with AI-powered replies
                      </li>
                      <li style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                        🎨 Generate post variations for A/B testing
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Platform Selection View
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
                          onClick={() => setPlatformStatuses(prev => ({ ...prev, [platform.id]: false }))}
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
          )}
        </div>
      </div>

      {/* Email Campaign Modal */}
      {showEmailCampaignModal && (
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
          onClick={() => setShowEmailCampaignModal(false)}
        >
          <div
            style={{
              backgroundColor: theme.colors.background.primary,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              maxWidth: '500px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
              📤 Create Email Campaign
            </h3>

            <div style={{ marginBottom: theme.spacing.md }}>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                Campaign Name
              </label>
              <input
                type="text"
                placeholder="e.g., Exclusive Event Pass Offer"
                value={campaignForm.name}
                onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[700]}`,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: theme.spacing.md }}>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                Email Subject
              </label>
              <input
                type="text"
                placeholder="e.g., Get lifetime residency membership at SoundMoney"
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[700]}`,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: theme.spacing.md }}>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                Email Template
              </label>
              <select
                value={campaignForm.template}
                onChange={(e) => setCampaignForm({ ...campaignForm, template: e.target.value })}
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[700]}`,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              >
                <option value="exclusive_passes">🎫 Exclusive Event Passes</option>
                <option value="lifetime_membership">👑 Lifetime Residency Membership</option>
                <option value="combined">🎉 Combined Offer</option>
                <option value="custom">✍️ Custom Template</option>
              </select>
            </div>

            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                Schedule Send (Optional)
              </label>
              <input
                type="datetime-local"
                value={campaignForm.sendAt}
                onChange={(e) => setCampaignForm({ ...campaignForm, sendAt: e.target.value })}
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[700]}`,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.base,
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <button
                onClick={() => setShowEmailCampaignModal(false)}
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
                onClick={handleCreateCampaign}
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
                ✓ Create Campaign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Social Media Post Modal */}
      {showSocialPostModal && (
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
          onClick={() => setShowSocialPostModal(false)}
        >
          <div
            style={{
              backgroundColor: theme.colors.background.primary,
              borderRadius: theme.borderRadius.lg,
              padding: theme.spacing.lg,
              maxWidth: '500px',
              width: '90%',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
              ✍️ Create Social Post
            </h3>

            <div style={{ marginBottom: theme.spacing.md }}>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                Post Content
              </label>
              <textarea
                placeholder="Write your post here... 🎵"
                value={socialPostForm.content}
                onChange={(e) => setSocialPostForm({ ...socialPostForm, content: e.target.value })}
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[700]}`,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.base,
                  boxSizing: 'border-box',
                  minHeight: '120px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ marginBottom: theme.spacing.md }}>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                Select Platforms
              </label>
              <div style={{ display: 'flex', gap: theme.spacing.sm, flexWrap: 'wrap' }}>
                {['threads', 'linkedin'].map(platform => (
                  <label
                    key={platform}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: theme.spacing.xs,
                      padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
                      backgroundColor: socialPostForm.platforms.includes(platform) ? theme.colors.primary : theme.colors.background.secondary,
                      borderRadius: theme.borderRadius.md,
                      cursor: 'pointer',
                      color: socialPostForm.platforms.includes(platform) ? 'white' : theme.colors.text.primary,
                      fontSize: theme.typography.fontSize.sm,
                      border: `1px solid ${theme.colors.gray[700]}`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={socialPostForm.platforms.includes(platform)}
                      onChange={(e) => {
                        setSocialPostForm(prev => ({
                          ...prev,
                          platforms: e.target.checked
                            ? [...prev.platforms, platform]
                            : prev.platforms.filter(p => p !== platform),
                        }));
                      }}
                      style={{ cursor: 'pointer' }}
                    />
                    {platform === 'threads' ? '📱 Threads' : '💼 LinkedIn'}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                Schedule
              </label>
              <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="schedule"
                    value="now"
                    checked={socialPostForm.schedule === 'now'}
                    onChange={() => setSocialPostForm({ ...socialPostForm, schedule: 'now' })}
                  />
                  <span style={{ color: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm }}>Post Now</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs, cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="schedule"
                    value="schedule"
                    checked={socialPostForm.schedule === 'schedule'}
                    onChange={() => setSocialPostForm({ ...socialPostForm, schedule: 'schedule' })}
                  />
                  <span style={{ color: theme.colors.text.primary, fontSize: theme.typography.fontSize.sm }}>Schedule</span>
                </label>
              </div>
              {socialPostForm.schedule === 'schedule' && (
                <input
                  type="datetime-local"
                  value={socialPostForm.scheduledTime}
                  onChange={(e) => setSocialPostForm({ ...socialPostForm, scheduledTime: e.target.value })}
                  style={{
                    width: '100%',
                    marginTop: theme.spacing.sm,
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                    boxSizing: 'border-box',
                  }}
                />
              )}
            </div>

            <div style={{ display: 'flex', gap: theme.spacing.md }}>
              <button
                onClick={() => setShowSocialPostModal(false)}
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
                onClick={handlePostToSocial}
                style={{
                  flex: 1,
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  backgroundColor: theme.colors.accent,
                  color: '#000',
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                📤 Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityManagerModal;
