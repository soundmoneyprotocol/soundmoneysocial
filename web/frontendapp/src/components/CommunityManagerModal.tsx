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


interface Quest {
  id: string;
  title: string;
  description: string;
  platform: 'instagram' | 'tiktok' | 'facebook' | 'twitter' | 'threads';
  contentType: 'post' | 'reel' | 'story' | 'video' | 'article';
  rewardAmount: number;
  rewardType: 'bzy' | 'usd';
  status: 'active' | 'completed' | 'paused';
  submissionsCount: number;
  createdAt: string;
  dueDate?: string;
  requirements: string[];
}

interface QuestSubmission {
  id: string;
  questId: string;
  creatorName: string;
  creatorHandle: string;
  contentUrl: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  engagementMetrics?: {
    likes: number;
    comments: number;
    shares: number;
    views: number;
  };
}


interface AdCampaign {
  id: string;
  title: string;
  description: string;
  platform: 'google_ads' | 'chatgpt' | 'aeo';
  budget: number;
  currencyType: 'usd' | 'bzy';
  targetAudience: string;
  keywords: string[];
  geoTargeting: string[];
  status: 'active' | 'paused' | 'completed';
  performance: {
    impressions: number;
    clicks: number;
    conversions: number;
    ctr: number;
    cpc: number;
  };
  createdAt: string;
  startDate?: string;
  endDate?: string;
}

interface SEOMetrics {
  id: string;
  campaignId: string;
  keyword: string;
  ranking: number;
  volume: number;
  difficulty: number;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

interface GEOData {
  country: string;
  region: string;
  impressions: number;
  clicks: number;
  conversions: number;
  costPerClick: number;
}


type TabType = 'messaging' | 'social' | 'web3' | 'email_marketing' | 'campaign' | 'ads';

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
  const [questForm, setQuestForm] = useState({
    title: '',
    description: '',
    platform: 'instagram' as const,
    contentType: 'post' as const,
    rewardAmount: 50,
    rewardType: 'bzy' as const,
    dueDate: '',
    requirements: [] as string[],
    requirementInput: '',
  });


  // Ads Management States
  const [adCampaigns, setAdCampaigns] = useState<AdCampaign[]>([]);
  const [seoMetrics, setSEOMetrics] = useState<SEOMetrics[]>([]);
  const [geoData, setGeoData] = useState<GEOData[]>([]);
  const [showCreateAdModal, setShowCreateAdModal] = useState(false);
  const [selectedAdCampaign, setSelectedAdCampaign] = useState<string | null>(null);
  const [adForm, setAdForm] = useState({
    title: '',
    description: '',
    platform: 'google_ads' as const,
    budget: 100,
    currencyType: 'usd' as const,
    targetAudience: '',
    keywords: [] as string[],
    geoTargeting: [] as string[],
    keywordInput: '',
    geoInput: '',
    startDate: '',
    endDate: '',
  });


  const [quests, setQuests] = useState<Quest[]>([]);
  const [questSubmissions, setQuestSubmissions] = useState<QuestSubmission[]>([]);
  const [showCreateQuestModal, setShowCreateQuestModal] = useState(false);
  const [selectedQuestForSubmissions, setSelectedQuestForSubmissions] = useState<string | null>(null);

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


  const handleCreateQuest = () => {
    if (!questForm.title || !questForm.description || questForm.rewardAmount <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const newQuest: Quest = {
      id: `quest_${Date.now()}`,
      title: questForm.title,
      description: questForm.description,
      platform: questForm.platform,
      contentType: questForm.contentType,
      rewardAmount: questForm.rewardAmount,
      rewardType: questForm.rewardType,
      status: 'active',
      submissionsCount: 0,
      createdAt: new Date().toISOString(),
      dueDate: questForm.dueDate,
      requirements: questForm.requirements,
    };

    setQuests([...quests, newQuest]);
    setQuestForm({
      title: '',
      description: '',
      platform: 'instagram',
      contentType: 'post',
      rewardAmount: 50,
      rewardType: 'bzy',
      dueDate: '',
      requirements: [],
      requirementInput: '',
    });
    setShowCreateQuestModal(false);
    alert('✅ Quest created! Your Social Agents can now submit content.');
  };

  const handleAddRequirement = () => {
    if (questForm.requirementInput.trim()) {
      setQuestForm({
        ...questForm,
        requirements: [...questForm.requirements, questForm.requirementInput],
        requirementInput: '',
      });
    }
  };

  const handleRemoveRequirement = (index: number) => {
    setQuestForm({
      ...questForm,
      requirements: questForm.requirements.filter((_, i) => i !== index),
    });
  };

  const handleApproveSubmission = (submissionId: string) => {
    setQuestSubmissions(questSubmissions.map(sub => 
      sub.id === submissionId ? { ...sub, status: 'approved' as const } : sub
    ));
    alert('✅ Submission approved! Social Agent will be rewarded.');
  };

  const handleRejectSubmission = (submissionId: string) => {
    setQuestSubmissions(questSubmissions.map(sub => 
      sub.id === submissionId ? { ...sub, status: 'rejected' as const } : sub
    ));
    alert('❌ Submission rejected.');
  };

  const handleCreateAdCampaign = () => {
    if (!adForm.title || !adForm.description || adForm.budget <= 0) {
      alert('Please fill in all required fields');
      return;
    }

    const newCampaign: AdCampaign = {
      id: `ad_${Date.now()}`,
      title: adForm.title,
      description: adForm.description,
      platform: adForm.platform,
      budget: adForm.budget,
      currencyType: adForm.currencyType,
      targetAudience: adForm.targetAudience,
      keywords: adForm.keywords,
      geoTargeting: adForm.geoTargeting,
      status: 'active',
      performance: {
        impressions: Math.floor(Math.random() * 10000),
        clicks: Math.floor(Math.random() * 500),
        conversions: Math.floor(Math.random() * 50),
        ctr: Math.random() * 5,
        cpc: Math.random() * 2,
      },
      createdAt: new Date().toISOString(),
      startDate: adForm.startDate,
      endDate: adForm.endDate,
    };

    setAdCampaigns([...adCampaigns, newCampaign]);
    setAdForm({
      title: '',
      description: '',
      platform: 'google_ads',
      budget: 100,
      currencyType: 'usd',
      targetAudience: '',
      keywords: [],
      geoTargeting: [],
      keywordInput: '',
      geoInput: '',
      startDate: '',
      endDate: '',
    });
    setShowCreateAdModal(false);
    alert('✅ Ad campaign created! Monitor performance metrics in real-time.');
  };

  const handleAddKeyword = () => {
    if (adForm.keywordInput.trim()) {
      setAdForm({
        ...adForm,
        keywords: [...adForm.keywords, adForm.keywordInput],
        keywordInput: '',
      });
    }
  };

  const handleRemoveKeyword = (index: number) => {
    setAdForm({
      ...adForm,
      keywords: adForm.keywords.filter((_, i) => i !== index),
    });
  };

  const handleAddGeoTarget = () => {
    if (adForm.geoInput.trim()) {
      setAdForm({
        ...adForm,
        geoTargeting: [...adForm.geoTargeting, adForm.geoInput],
        geoInput: '',
      });
    }
  };

  const handleRemoveGeoTarget = (index: number) => {
    setAdForm({
      ...adForm,
      geoTargeting: adForm.geoTargeting.filter((_, i) => i !== index),
    });
  };

  const handlePauseAdCampaign = (campaignId: string) => {
    setAdCampaigns(adCampaigns.map(c => 
      c.id === campaignId ? { ...c, status: 'paused' as const } : c
    ));
    alert('⏸️ Campaign paused');
  };

  const handleResumeAdCampaign = (campaignId: string) => {
    setAdCampaigns(adCampaigns.map(c => 
      c.id === campaignId ? { ...c, status: 'active' as const } : c
    ));
    alert('▶️ Campaign resumed');
  };



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
          {(['messaging', 'social', 'web3', 'email_marketing', 'campaign', 'ads'] as const).map(tab => (
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
              {tab === 'campaign' && '🎯 Campaigns'}
              {tab === 'ads' && '📊 Ads'}
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
          ) : selectedTab === 'campaign' ? (
            // Social Agent Campaigns & Quests
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: theme.spacing.md }}>
                <div style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: `2px solid ${theme.colors.accent}` }}>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>🎯 Active Quests</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: theme.colors.accent }}>{quests.filter(q => q.status === 'active').length}</p>
                </div>
                <div style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: `2px solid ${theme.colors.success}` }}>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>✅ Submissions</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: theme.colors.success }}>{questSubmissions.length}</p>
                </div>
                <div style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: `2px solid #FFD700` }}>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>💰 Total Rewards</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: '#FFD700' }}>{quests.reduce((sum, q) => sum + (q.status === 'completed' ? q.rewardAmount : 0), 0)} {quests.some(q => q.rewardType === 'usd') ? 'USD' : 'BZY'}</p>
                </div>
              </div>

              <button onClick={() => setShowCreateQuestModal(true)} style={{ padding: `${theme.spacing.sm} ${theme.spacing.md}`, backgroundColor: theme.colors.accent, color: '#000', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', fontWeight: 600, fontSize: theme.typography.fontSize.base }}>
                🎯 Create New Quest
              </button>

              <div>
                <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>📋 Active Quests</h3>
                {quests.filter(q => q.status === 'active').length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: theme.spacing.md }}>
                    {quests.filter(q => q.status === 'active').map(quest => (
                      <div key={quest.id} onClick={() => setSelectedQuestForSubmissions(selectedQuestForSubmissions === quest.id ? null : quest.id)} style={{ padding: theme.spacing.md, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: selectedQuestForSubmissions === quest.id ? `2px solid ${theme.colors.accent}` : `1px solid ${theme.colors.gray[800]}`, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: theme.spacing.md }}>
                          <div>
                            <h4 style={{ margin: 0, marginBottom: theme.spacing.xs, color: theme.colors.text.primary }}>{quest.title}</h4>
                            <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>{quest.description}</p>
                          </div>
                          <div style={{ fontSize: '32px' }}>
                            {quest.platform === 'instagram' && '📸'}
                            {quest.platform === 'tiktok' && '🎵'}
                            {quest.platform === 'facebook' && '👥'}
                            {quest.platform === 'twitter' && '𝕏'}
                            {quest.platform === 'threads' && '📱'}
                          </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
                          <div>
                            <p style={{ margin: 0, color: theme.colors.text.tertiary, fontSize: theme.typography.fontSize.xs }}>TYPE</p>
                            <p style={{ margin: '4px 0 0 0', color: theme.colors.text.primary, fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>{quest.contentType}</p>
                          </div>
                          <div>
                            <p style={{ margin: 0, color: theme.colors.text.tertiary, fontSize: theme.typography.fontSize.xs }}>REWARD</p>
                            <p style={{ margin: '4px 0 0 0', color: theme.colors.accent, fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>{quest.rewardAmount} {quest.rewardType.toUpperCase()}</p>
                          </div>
                          <div>
                            <p style={{ margin: 0, color: theme.colors.text.tertiary, fontSize: theme.typography.fontSize.xs }}>SUBMISSIONS</p>
                            <p style={{ margin: '4px 0 0 0', color: theme.colors.success, fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>{questSubmissions.filter(s => s.questId === quest.id).length}</p>
                          </div>
                        </div>
                        {selectedQuestForSubmissions === quest.id && (
                          <div style={{ marginTop: theme.spacing.md, paddingTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.gray[800]}` }}>
                            <h5 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>📥 Submissions</h5>
                            {questSubmissions.filter(s => s.questId === quest.id).length > 0 ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                                {questSubmissions.filter(s => s.questId === quest.id).map(submission => (
                                  <div key={submission.id} style={{ padding: theme.spacing.sm, backgroundColor: theme.colors.background.tertiary, borderRadius: theme.borderRadius.sm, border: `1px solid ${theme.colors.gray[700]}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs }}>
                                      <div>
                                        <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>{submission.creatorName}</p>
                                        <p style={{ margin: '2px 0 0 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs }}>@{submission.creatorHandle}</p>
                                      </div>
                                      <div style={{ padding: `4px 12px`, backgroundColor: submission.status === 'approved' ? theme.colors.success : submission.status === 'rejected' ? theme.colors.danger : theme.colors.info, color: 'white', borderRadius: theme.borderRadius.sm, fontSize: theme.typography.fontSize.xs, fontWeight: 600 }}>{submission.status.toUpperCase()}</div>
                                    </div>
                                    {submission.status === 'pending' && (
                                      <div style={{ display: 'flex', gap: theme.spacing.sm, marginTop: theme.spacing.sm }}>
                                        <button onClick={() => handleApproveSubmission(submission.id)} style={{ flex: 1, padding: `4px 8px`, backgroundColor: theme.colors.success, color: 'white', border: 'none', borderRadius: theme.borderRadius.sm, cursor: 'pointer', fontSize: theme.typography.fontSize.xs, fontWeight: 600 }}>✅ Approve</button>
                                        <button onClick={() => handleRejectSubmission(submission.id)} style={{ flex: 1, padding: `4px 8px`, backgroundColor: theme.colors.danger, color: 'white', border: 'none', borderRadius: theme.borderRadius.sm, cursor: 'pointer', fontSize: theme.typography.fontSize.xs, fontWeight: 600 }}>❌ Reject</button>
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>No submissions yet.</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: theme.spacing.lg, textAlign: 'center', backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: `1px dashed ${theme.colors.gray[800]}`, color: theme.colors.text.secondary }}>
                    No active quests yet. Create one to activate your Social Agents!
                  </div>
                )}
              </div>
            </div>
          ) : selectedTab === 'ads' ? (
            // Ads Manager & SEO Tracking
            <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
              {/* Ads Dashboard Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: theme.spacing.md }}>
                <div style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: `2px solid ${theme.colors.primary}` }}>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>📊 Active Campaigns</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: theme.colors.primary }}>{adCampaigns.filter(c => c.status === 'active').length}</p>
                </div>
                <div style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: `2px solid ${theme.colors.accent}` }}>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>👁️ Total Impressions</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: theme.colors.accent }}>{adCampaigns.reduce((sum, c) => sum + c.performance.impressions, 0).toLocaleString()}</p>
                </div>
                <div style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: `2px solid ${theme.colors.success}` }}>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>🎯 Total Clicks</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: theme.colors.success }}>{adCampaigns.reduce((sum, c) => sum + c.performance.clicks, 0).toLocaleString()}</p>
                </div>
                <div style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: `2px solid #FFD700` }}>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>💰 Avg CPC</p>
                  <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 'bold', color: '#FFD700' }}>${(adCampaigns.length > 0 ? adCampaigns.reduce((sum, c) => sum + c.performance.cpc, 0) / adCampaigns.length : 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Ad Platform Integration Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: theme.spacing.md }}>
                <div style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[800]}` }}>
                  <div style={{ fontSize: '32px', marginBottom: theme.spacing.sm }}>🔍</div>
                  <h4 style={{ margin: '0 0 8px 0', color: theme.colors.text.primary }}>Google AdWords</h4>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, marginBottom: theme.spacing.sm }}>Pay-per-click advertising & keyword bidding</p>
                  <button style={{ width: '100%', padding: `${theme.spacing.sm} ${theme.spacing.md}`, backgroundColor: theme.colors.primary, color: 'white', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>
                    🔗 Connect
                  </button>
                </div>

                <div style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[800]}` }}>
                  <div style={{ fontSize: '32px', marginBottom: theme.spacing.sm }}>🤖</div>
                  <h4 style={{ margin: '0 0 8px 0', color: theme.colors.text.primary }}>ChatGPT Ads</h4>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, marginBottom: theme.spacing.sm }}>AI-powered ad copy & optimization</p>
                  <button style={{ width: '100%', padding: `${theme.spacing.sm} ${theme.spacing.md}`, backgroundColor: theme.colors.primary, color: 'white', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>
                    🔗 Connect
                  </button>
                </div>

                <div style={{ padding: theme.spacing.lg, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[800]}` }}>
                  <div style={{ fontSize: '32px', marginBottom: theme.spacing.sm }}>⚡</div>
                  <h4 style={{ margin: '0 0 8px 0', color: theme.colors.text.primary }}>AEO Optimization</h4>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, marginBottom: theme.spacing.sm }}>Answer Engine Optimization for ChatGPT, Perplexity</p>
                  <button style={{ width: '100%', padding: `${theme.spacing.sm} ${theme.spacing.md}`, backgroundColor: theme.colors.primary, color: 'white', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>
                    🔗 Connect
                  </button>
                </div>
              </div>

              {/* Create Campaign Button */}
              <button onClick={() => setShowCreateAdModal(true)} style={{ padding: `${theme.spacing.sm} ${theme.spacing.md}`, backgroundColor: theme.colors.accent, color: '#000', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', fontWeight: 600, fontSize: theme.typography.fontSize.base }}>
                📊 Create Ad Campaign
              </button>

              {/* Ad Campaigns List */}
              <div>
                <h3 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>📈 Active Ad Campaigns</h3>
                {adCampaigns.filter(c => c.status === 'active').length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: theme.spacing.md }}>
                    {adCampaigns.filter(c => c.status === 'active').map(campaign => (
                      <div key={campaign.id} onClick={() => setSelectedAdCampaign(selectedAdCampaign === campaign.id ? null : campaign.id)} style={{ padding: theme.spacing.md, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: selectedAdCampaign === campaign.id ? `2px solid ${theme.colors.accent}` : `1px solid ${theme.colors.gray[800]}`, cursor: 'pointer' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: theme.spacing.md }}>
                          <div>
                            <h4 style={{ margin: 0, marginBottom: theme.spacing.xs, color: theme.colors.text.primary }}>{campaign.title}</h4>
                            <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>{campaign.description}</p>
                          </div>
                          <div style={{ fontSize: '28px' }}>
                            {campaign.platform === 'google_ads' && '🔍'}
                            {campaign.platform === 'chatgpt' && '🤖'}
                            {campaign.platform === 'aeo' && '⚡'}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
                          <div>
                            <p style={{ margin: 0, color: theme.colors.text.tertiary, fontSize: theme.typography.fontSize.xs }}>BUDGET</p>
                            <p style={{ margin: '4px 0 0 0', color: theme.colors.accent, fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>${campaign.budget}</p>
                          </div>
                          <div>
                            <p style={{ margin: 0, color: theme.colors.text.tertiary, fontSize: theme.typography.fontSize.xs }}>CTR</p>
                            <p style={{ margin: '4px 0 0 0', color: theme.colors.success, fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>{campaign.performance.ctr.toFixed(2)}%</p>
                          </div>
                          <div>
                            <p style={{ margin: 0, color: theme.colors.text.tertiary, fontSize: theme.typography.fontSize.xs }}>CONVERSIONS</p>
                            <p style={{ margin: '4px 0 0 0', color: theme.colors.primary, fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>{campaign.performance.conversions}</p>
                          </div>
                          <div>
                            <p style={{ margin: 0, color: theme.colors.text.tertiary, fontSize: theme.typography.fontSize.xs }}>CPC</p>
                            <p style={{ margin: '4px 0 0 0', color: '#FFD700', fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>${campaign.performance.cpc.toFixed(2)}</p>
                          </div>
                        </div>

                        {campaign.keywords.length > 0 && (
                          <div style={{ marginBottom: theme.spacing.md }}>
                            <p style={{ margin: '0 0 8px 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs, fontWeight: 600 }}>Keywords:</p>
                            <div style={{ display: 'flex', gap: theme.spacing.xs, flexWrap: 'wrap' }}>
                              {campaign.keywords.slice(0, 3).map((kw, idx) => (
                                <span key={idx} style={{ padding: `2px 8px`, backgroundColor: theme.colors.background.tertiary, borderRadius: theme.borderRadius.sm, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>{kw}</span>
                              ))}
                              {campaign.keywords.length > 3 && <span style={{ padding: `2px 8px`, color: theme.colors.text.tertiary, fontSize: theme.typography.fontSize.xs }}>+{campaign.keywords.length - 3} more</span>}
                            </div>
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                          <button onClick={(e) => { e.stopPropagation(); handlePauseAdCampaign(campaign.id); }} style={{ flex: 1, padding: `4px 8px`, backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.gray[700]}`, borderRadius: theme.borderRadius.sm, cursor: 'pointer', fontSize: theme.typography.fontSize.xs, fontWeight: 600 }}>⏸️ Pause</button>
                          <button onClick={(e) => { e.stopPropagation(); alert('View detailed analytics'); }} style={{ flex: 1, padding: `4px 8px`, backgroundColor: theme.colors.primary, color: 'white', border: 'none', borderRadius: theme.borderRadius.sm, cursor: 'pointer', fontSize: theme.typography.fontSize.xs, fontWeight: 600 }}>📊 Details</button>
                        </div>

                        {selectedAdCampaign === campaign.id && (
                          <div style={{ marginTop: theme.spacing.md, paddingTop: theme.spacing.md, borderTop: `1px solid ${theme.colors.gray[800]}` }}>
                            <h5 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>📍 GEO Performance</h5>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
                              <div style={{ padding: theme.spacing.sm, backgroundColor: theme.colors.background.tertiary, borderRadius: theme.borderRadius.sm }}>
                                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs }}>Top Region</p>
                                <p style={{ margin: '4px 0 0 0', color: theme.colors.text.primary, fontWeight: 600 }}>United States</p>
                              </div>
                              <div style={{ padding: theme.spacing.sm, backgroundColor: theme.colors.background.tertiary, borderRadius: theme.borderRadius.sm }}>
                                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs }}>Regional CTR</p>
                                <p style={{ margin: '4px 0 0 0', color: theme.colors.success, fontWeight: 600 }}>4.2%</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: theme.spacing.lg, textAlign: 'center', backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.md, border: `1px dashed ${theme.colors.gray[800]}`, color: theme.colors.text.secondary }}>
                    No active ad campaigns yet. Create one to start advertising!
                  </div>
                )}
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

      {showCreateAdModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }} onClick={(e) => { if (e.target === e.currentTarget) setShowCreateAdModal(false); }}>
          <div style={{ backgroundColor: theme.colors.background.primary, borderRadius: theme.borderRadius.lg, width: '95%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
            <div style={{ padding: theme.spacing.lg, borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
              <h3 style={{ margin: 0, color: theme.colors.text.primary }}>📊 Create Ad Campaign</h3>
              <p style={{ margin: '8px 0 0 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>Launch an ad campaign on Google AdWords, ChatGPT Ads, or AEO</p>
            </div>
            <div style={{ padding: theme.spacing.lg }}>
              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Campaign Title</label>
                <input type="text" value={adForm.title} onChange={(e) => setAdForm({ ...adForm, title: e.target.value })} placeholder="e.g., Summer Music Festival Promo" style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Description</label>
                <textarea value={adForm.description} onChange={(e) => setAdForm({ ...adForm, description: e.target.value })} placeholder="Describe your ad campaign and target audience..." style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base, boxSizing: 'border-box', minHeight: '80px', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
                <div>
                  <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Ad Platform</label>
                  <select value={adForm.platform} onChange={(e) => setAdForm({ ...adForm, platform: e.target.value as any })} style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base }}>
                    <option value="google_ads">🔍 Google AdWords</option>
                    <option value="chatgpt">🤖 ChatGPT Ads</option>
                    <option value="aeo">⚡ AEO</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Budget</label>
                  <input type="number" value={adForm.budget} onChange={(e) => setAdForm({ ...adForm, budget: parseFloat(e.target.value) || 0 })} min="0" step="10" style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base, boxSizing: 'border-box' }} />
                </div>
              </div>
              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Target Audience</label>
                <input type="text" value={adForm.targetAudience} onChange={(e) => setAdForm({ ...adForm, targetAudience: e.target.value })} placeholder="e.g., Music lovers 18-35" style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Keywords</label>
                <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                  <input type="text" value={adForm.keywordInput} onChange={(e) => setAdForm({ ...adForm, keywordInput: e.target.value })} placeholder="Add keyword and press Enter" onKeyPress={(e) => { if (e.key === 'Enter') handleAddKeyword(); }} style={{ flex: 1, padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base, boxSizing: 'border-box' }} />
                  <button onClick={handleAddKeyword} style={{ padding: `${theme.spacing.sm} ${theme.spacing.md}`, backgroundColor: theme.colors.primary, color: 'white', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>Add</button>
                </div>
                {adForm.keywords.length > 0 && (
                  <div>
                    {adForm.keywords.map((kw, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${theme.spacing.xs} ${theme.spacing.sm}`, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.sm, marginBottom: theme.spacing.xs }}>
                        <span style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>🔍 {kw}</span>
                        <button onClick={() => handleRemoveKeyword(idx)} style={{ background: 'none', border: 'none', color: theme.colors.danger, cursor: 'pointer', fontWeight: 600 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Geographic Targeting</label>
                <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.sm }}>
                  <input type="text" value={adForm.geoInput} onChange={(e) => setAdForm({ ...adForm, geoInput: e.target.value })} placeholder="Add country/region and press Enter" onKeyPress={(e) => { if (e.key === 'Enter') handleAddGeoTarget(); }} style={{ flex: 1, padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base, boxSizing: 'border-box' }} />
                  <button onClick={handleAddGeoTarget} style={{ padding: `${theme.spacing.sm} ${theme.spacing.md}`, backgroundColor: theme.colors.primary, color: 'white', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', fontWeight: 600, whiteSpace: 'nowrap' }}>Add</button>
                </div>
                {adForm.geoTargeting.length > 0 && (
                  <div>
                    {adForm.geoTargeting.map((geo, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${theme.spacing.xs} ${theme.spacing.sm}`, backgroundColor: theme.colors.background.secondary, borderRadius: theme.borderRadius.sm, marginBottom: theme.spacing.xs }}>
                        <span style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>📍 {geo}</span>
                        <button onClick={() => handleRemoveGeoTarget(idx)} style={{ background: 'none', border: 'none', color: theme.colors.danger, cursor: 'pointer', fontWeight: 600 }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <button onClick={() => setShowCreateAdModal(false)} style={{ flex: 1, padding: `${theme.spacing.sm} ${theme.spacing.md}`, backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.gray[700]}`, borderRadius: theme.borderRadius.md, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={handleCreateAdCampaign} style={{ flex: 1, padding: `${theme.spacing.sm} ${theme.spacing.md}`, backgroundColor: theme.colors.accent, color: '#000', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', fontWeight: 600 }}>📊 Create Campaign</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCreateQuestModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0, 0, 0, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1001 }} onClick={(e) => { if (e.target === e.currentTarget) setShowCreateQuestModal(false); }}>
          <div style={{ backgroundColor: theme.colors.background.primary, borderRadius: theme.borderRadius.lg, width: '95%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)' }}>
            <div style={{ padding: theme.spacing.lg, borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
              <h3 style={{ margin: 0, color: theme.colors.text.primary }}>🎯 Create New Quest</h3>
              <p style={{ margin: '8px 0 0 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>Launch a content creation quest for your Social Agents to complete</p>
            </div>
            <div style={{ padding: theme.spacing.lg }}>
              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Quest Title</label>
                <input type="text" value={questForm.title} onChange={(e) => setQuestForm({ ...questForm, title: e.target.value })} placeholder="e.g., Share my new single on TikTok" style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base, boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: theme.spacing.lg }}>
                <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Description</label>
                <textarea value={questForm.description} onChange={(e) => setQuestForm({ ...questForm, description: e.target.value })} placeholder="Describe what you want Social Agents to do..." style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base, boxSizing: 'border-box', minHeight: '100px', fontFamily: 'inherit' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
                <div>
                  <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Platform</label>
                  <select value={questForm.platform} onChange={(e) => setQuestForm({ ...questForm, platform: e.target.value as any })} style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base }}>
                    <option value="instagram">📸 Instagram</option>
                    <option value="tiktok">🎵 TikTok</option>
                    <option value="facebook">👥 Facebook</option>
                    <option value="twitter">𝕏 Twitter</option>
                    <option value="threads">📱 Threads</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Content Type</label>
                  <select value={questForm.contentType} onChange={(e) => setQuestForm({ ...questForm, contentType: e.target.value as any })} style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base }}>
                    <option value="post">Post</option>
                    <option value="reel">Reel/Video</option>
                    <option value="story">Story</option>
                    <option value="video">Video</option>
                    <option value="article">Article</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md, marginBottom: theme.spacing.lg }}>
                <div>
                  <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Reward Amount</label>
                  <input type="number" value={questForm.rewardAmount} onChange={(e) => setQuestForm({ ...questForm, rewardAmount: parseInt(e.target.value) || 0 })} min="0" style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base, boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: theme.spacing.xs, color: theme.colors.text.primary, fontWeight: 600 }}>Reward Type</label>
                  <select value={questForm.rewardType} onChange={(e) => setQuestForm({ ...questForm, rewardType: e.target.value as any })} style={{ width: '100%', padding: theme.spacing.sm, borderRadius: theme.borderRadius.md, border: `1px solid ${theme.colors.gray[700]}`, backgroundColor: theme.colors.background.secondary, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base }}>
                    <option value="bzy">💎 BZY</option>
                    <option value="usd">💵 USD</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <button onClick={() => setShowCreateQuestModal(false)} style={{ flex: 1, padding: `${theme.spacing.sm} ${theme.spacing.md}`, backgroundColor: theme.colors.background.tertiary, color: theme.colors.text.primary, border: `1px solid ${theme.colors.gray[700]}`, borderRadius: theme.borderRadius.md, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={handleCreateQuest} style={{ flex: 1, padding: `${theme.spacing.sm} ${theme.spacing.md}`, backgroundColor: theme.colors.accent, color: '#000', border: 'none', borderRadius: theme.borderRadius.md, cursor: 'pointer', fontWeight: 600 }}>🎯 Create Quest</button>
              </div>
            </div>
          </div>
        </div>

      )}
    </div>
  );
};

export default CommunityManagerModal;
