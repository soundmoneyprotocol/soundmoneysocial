import React, { useState, useEffect } from 'react';
import { theme } from '../theme/theme';

interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  messageType: 'text' | 'audio' | 'image' | 'track_share';
  timestamp: string;
  readStatus: 'sent' | 'delivered' | 'read';
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage: ChatMessage | null;
  lastActivity: string;
  unreadCount: number;
  isArchived: boolean;
}

interface MessageRequest {
  id: string;
  senderId: string;
  recipientId: string;
  previewMessage: string;
  engagementScore: number;
  timestamp: string;
  status: 'pending' | 'approved' | 'declined';
}

interface PrivacySettings {
  userId: string;
  inboxOpenToAll: boolean;
  minimumEngagementScore: number;
  minimumFollowerCount: number;
  allowVerifiedOnly: boolean;
  blockedUsers: string[];
  allowTrackShares: boolean;
  allowVoiceMessages: boolean;
}

interface EngagementScore {
  userId: string;
  totalStreams: number;
  likesGiven: number;
  sharesMade: number;
  commentsPosted: number;
  bezySpent: number;
  daysActive: number;
  score: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface ChatModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'inbox' | 'requests' | 'privacy' | 'compose';

export const ChatModal: React.FC<ChatModalProps> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messageRequests, setMessageRequests] = useState<MessageRequest[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [engagementScore, setEngagementScore] = useState<EngagementScore | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock current user ID - in real app, get from auth context
  const currentUserId = 'user-123';

  useEffect(() => {
    if (visible) {
      loadChatData();
    }
  }, [visible]);

  const loadChatData = async () => {
    setLoading(true);
    try {
      // Mock data - in real app, fetch from API
      const mockConversations: Conversation[] = [
        {
          id: 'conv-1',
          participants: [currentUserId, 'artist-456'],
          lastMessage: {
            id: 'msg-1',
            conversationId: 'conv-1',
            senderId: 'artist-456',
            recipientId: currentUserId,
            content: 'Thanks for the love on my new track!',
            messageType: 'text',
            timestamp: new Date().toISOString(),
            readStatus: 'delivered',
          },
          lastActivity: new Date().toISOString(),
          unreadCount: 2,
          isArchived: false,
        },
      ];

      const mockRequests: MessageRequest[] = [
        {
          id: 'req-1',
          senderId: 'fan-789',
          recipientId: currentUserId,
          previewMessage: 'Love your music! Would love to collaborate.',
          engagementScore: 65,
          timestamp: new Date().toISOString(),
          status: 'pending',
        },
      ];

      const mockPrivacySettings: PrivacySettings = {
        userId: currentUserId,
        inboxOpenToAll: false,
        minimumEngagementScore: 20,
        minimumFollowerCount: 10,
        allowVerifiedOnly: false,
        blockedUsers: [],
        allowTrackShares: true,
        allowVoiceMessages: true,
      };

      const mockEngagementScore: EngagementScore = {
        userId: currentUserId,
        totalStreams: 15420,
        likesGiven: 342,
        sharesMade: 87,
        commentsPosted: 156,
        bezySpent: 450,
        daysActive: 45,
        score: 68,
        tier: 'gold',
      };

      setConversations(mockConversations);
      setMessageRequests(mockRequests);
      setPrivacySettings(mockPrivacySettings);
      setEngagementScore(mockEngagementScore);
    } catch (error) {
      console.error('Error loading chat data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMessageRequestResponse = (requestId: string, response: 'approved' | 'declined') => {
    setMessageRequests(prev => prev.filter(req => req.id !== requestId));
  };

  const openConversation = (conversationId: string) => {
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation?.lastMessage) {
      // Mock messages
      const mockMessages: ChatMessage[] = [
        {
          id: 'msg-1',
          conversationId,
          senderId: conversation.participants[1],
          recipientId: currentUserId,
          content: 'Thanks for the love on my new track!',
          messageType: 'text',
          timestamp: new Date(Date.now() - 5000).toISOString(),
          readStatus: 'read',
        },
        {
          id: 'msg-2',
          conversationId,
          senderId: currentUserId,
          recipientId: conversation.participants[1],
          content: 'Amazing work! Keep it up!',
          messageType: 'text',
          timestamp: new Date().toISOString(),
          readStatus: 'delivered',
        },
      ];
      setMessages(mockMessages);
      setSelectedConversation(conversationId);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      conversationId: selectedConversation,
      senderId: currentUserId,
      recipientId: conversations.find(c => c.id === selectedConversation)?.participants[1] || '',
      content: newMessage.trim(),
      messageType: 'text',
      timestamp: new Date().toISOString(),
      readStatus: 'sent',
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum':
        return theme.colors.accent;
      case 'gold':
        return '#FFD700';
      case 'silver':
        return '#C0C0C0';
      default:
        return '#CD7F32';
    }
  };

  const renderInboxTab = () => {
    if (selectedConversation) {
      const conversation = conversations.find(c => c.id === selectedConversation);
      const otherUser = conversation?.participants.find(p => p !== currentUserId) || 'Unknown';

      return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Chat Header */}
          <div
            style={{
              padding: theme.spacing.md,
              borderBottom: `1px solid ${theme.colors.gray[800]}`,
              display: 'flex',
              alignItems: 'center',
              gap: theme.spacing.md,
            }}
          >
            <button
              onClick={() => setSelectedConversation(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: theme.colors.text.primary,
              }}
            >
              ←
            </button>
            <h3 style={{ margin: 0, color: theme.colors.text.primary }}>{otherUser}</h3>
          </div>

          {/* Messages */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: theme.spacing.md,
              display: 'flex',
              flexDirection: 'column',
              gap: theme.spacing.sm,
            }}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                style={{
                  alignSelf: message.senderId === currentUserId ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                }}
              >
                <div
                  style={{
                    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                    borderRadius: '18px',
                    backgroundColor:
                      message.senderId === currentUserId
                        ? theme.colors.accent
                        : theme.colors.background.secondary,
                    color:
                      message.senderId === currentUserId
                        ? '#fff'
                        : theme.colors.text.primary,
                    wordWrap: 'break-word',
                  }}
                >
                  {message.content}
                </div>
                <p
                  style={{
                    fontSize: '12px',
                    color: theme.colors.text.tertiary,
                    textAlign: message.senderId === currentUserId ? 'right' : 'left',
                    margin: '4px 0 0 0',
                  }}
                >
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            ))}
          </div>

          {/* Message Input */}
          <div
            style={{
              display: 'flex',
              gap: theme.spacing.sm,
              padding: theme.spacing.md,
              borderTop: `1px solid ${theme.colors.gray[800]}`,
            }}
          >
            <input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              style={{
                flex: 1,
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: '20px',
                border: `1px solid ${theme.colors.gray[700]}`,
                backgroundColor: theme.colors.background.secondary,
                color: theme.colors.text.primary,
                fontSize: '14px',
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: theme.colors.accent,
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      );
    }

    return (
      <div>
        {conversations.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '64px',
              color: theme.colors.text.tertiary,
            }}
          >
            <p style={{ fontSize: '24px', marginBottom: theme.spacing.md }}>💬</p>
            <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: theme.spacing.sm }}>
              No Conversations
            </p>
            <p style={{ fontSize: '14px' }}>
              Your conversations with artists and fans will appear here
            </p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => openConversation(conversation.id)}
              style={{
                padding: theme.spacing.md,
                borderBottom: `1px solid ${theme.colors.gray[800]}`,
                cursor: 'pointer',
                display: 'flex',
                gap: theme.spacing.md,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = theme.colors.background.secondary)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'transparent')
              }
            >
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '18px',
                  flexShrink: 0,
                }}
              >
                {conversation.participants[0]?.charAt(0) || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={{
                    margin: '0 0 4px 0',
                    color: theme.colors.text.primary,
                    fontWeight: '600',
                  }}
                >
                  {conversation.participants.find(p => p !== currentUserId) || 'Unknown User'}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: theme.colors.text.secondary,
                    fontSize: '14px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {conversation.lastMessage?.content || 'No messages yet'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: '12px',
                    color: theme.colors.text.tertiary,
                  }}
                >
                  {new Date(conversation.lastActivity).toLocaleDateString()}
                </p>
                {conversation.unreadCount > 0 && (
                  <div
                    style={{
                      backgroundColor: theme.colors.accent,
                      borderRadius: '50%',
                      minWidth: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#fff',
                    }}
                  >
                    {conversation.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderRequestsTab = () => (
    <div>
      {messageRequests.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '64px',
            color: theme.colors.text.tertiary,
          }}
        >
          <p style={{ fontSize: '24px', marginBottom: theme.spacing.md }}>📬</p>
          <p style={{ fontSize: '16px', fontWeight: '600', marginBottom: theme.spacing.sm }}>
            No Message Requests
          </p>
          <p style={{ fontSize: '14px' }}>
            Requests from fans will appear here based on your privacy settings
          </p>
        </div>
      ) : (
        messageRequests.map((request) => (
          <div
            key={request.id}
            style={{
              padding: theme.spacing.md,
              borderBottom: `1px solid ${theme.colors.gray[800]}`,
            }}
          >
            <div style={{ display: 'flex', gap: theme.spacing.md, marginBottom: theme.spacing.sm }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  backgroundColor: theme.colors.accent,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: '600',
                  flexShrink: 0,
                }}
              >
                {request.senderId.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <p
                  style={{
                    margin: '0 0 4px 0',
                    color: theme.colors.text.primary,
                    fontWeight: '600',
                  }}
                >
                  {request.senderId}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ color: theme.colors.accent, fontSize: '12px' }}>⭐</span>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: '12px' }}>
                    Score: {request.engagementScore}
                  </p>
                </div>
              </div>
            </div>
            <p
              style={{
                margin: `0 0 ${theme.spacing.md} 0`,
                color: theme.colors.text.secondary,
                fontSize: '14px',
              }}
            >
              {request.previewMessage}
            </p>
            <div style={{ display: 'flex', gap: theme.spacing.sm, justifyContent: 'flex-end' }}>
              <button
                onClick={() => handleMessageRequestResponse(request.id, 'declined')}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Decline
              </button>
              <button
                onClick={() => handleMessageRequestResponse(request.id, 'approved')}
                style={{
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: theme.colors.accent,
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Approve
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderPrivacyTab = () => {
    if (!privacySettings || !engagementScore) return null;

    return (
      <div style={{ padding: theme.spacing.md, overflowY: 'auto', maxHeight: '500px' }}>
        {/* Engagement Score Section */}
        <div style={{ marginBottom: theme.spacing.xl }}>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: theme.colors.text.primary,
              margin: `0 0 ${theme.spacing.md} 0`,
            }}
          >
            Your Engagement Score
          </h3>
          <div
            style={{
              backgroundColor: theme.colors.background.secondary,
              padding: theme.spacing.lg,
              borderRadius: '12px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <p
                style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: theme.colors.accent,
                  margin: 0,
                }}
              >
                {engagementScore.score}/100
              </p>
              <p
                style={{
                  fontSize: '14px',
                  color: theme.colors.text.secondary,
                  margin: '8px 0 0 0',
                }}
              >
                Your score determines your ability to message other users
              </p>
            </div>
            <div
              style={{
                padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                borderRadius: '16px',
                backgroundColor: getTierColor(engagementScore.tier),
                color: '#fff',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              {engagementScore.tier.toUpperCase()}
            </div>
          </div>
        </div>

        {/* Privacy Settings Section */}
        <div>
          <h3
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: theme.colors.text.primary,
              margin: `0 0 ${theme.spacing.md} 0`,
            }}
          >
            Message Privacy
          </h3>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: theme.spacing.md,
              borderBottom: `1px solid ${theme.colors.gray[800]}`,
              marginBottom: theme.spacing.md,
            }}
          >
            <label style={{ color: theme.colors.text.primary, fontSize: '14px' }}>
              Open inbox to all fans
            </label>
            <input
              type="checkbox"
              checked={privacySettings.inboxOpenToAll}
              onChange={(e) =>
                setPrivacySettings({
                  ...privacySettings,
                  inboxOpenToAll: e.target.checked,
                })
              }
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
          </div>

          {!privacySettings.inboxOpenToAll && (
            <>
              <div
                style={{
                  paddingBottom: theme.spacing.md,
                  borderBottom: `1px solid ${theme.colors.gray[800]}`,
                  marginBottom: theme.spacing.md,
                }}
              >
                <p style={{ color: theme.colors.text.primary, margin: 0, fontSize: '14px' }}>
                  Minimum engagement score
                </p>
                <p
                  style={{
                    color: theme.colors.text.secondary,
                    margin: '4px 0 0 0',
                    fontSize: '14px',
                  }}
                >
                  {privacySettings.minimumEngagementScore}
                </p>
              </div>

              <div
                style={{
                  paddingBottom: theme.spacing.md,
                  borderBottom: `1px solid ${theme.colors.gray[800]}`,
                  marginBottom: theme.spacing.md,
                }}
              >
                <p style={{ color: theme.colors.text.primary, margin: 0, fontSize: '14px' }}>
                  Minimum followers
                </p>
                <p
                  style={{
                    color: theme.colors.text.secondary,
                    margin: '4px 0 0 0',
                    fontSize: '14px',
                  }}
                >
                  {privacySettings.minimumFollowerCount}
                </p>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingBottom: theme.spacing.md,
                  borderBottom: `1px solid ${theme.colors.gray[800]}`,
                  marginBottom: theme.spacing.md,
                }}
              >
                <label style={{ color: theme.colors.text.primary, fontSize: '14px' }}>
                  Verified users only
                </label>
                <input
                  type="checkbox"
                  checked={privacySettings.allowVerifiedOnly}
                  onChange={(e) =>
                    setPrivacySettings({
                      ...privacySettings,
                      allowVerifiedOnly: e.target.checked,
                    })
                  }
                  style={{ cursor: 'pointer', width: '18px', height: '18px' }}
                />
              </div>
            </>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: theme.spacing.md,
              borderBottom: `1px solid ${theme.colors.gray[800]}`,
              marginBottom: theme.spacing.md,
            }}
          >
            <label style={{ color: theme.colors.text.primary, fontSize: '14px' }}>
              Allow track sharing
            </label>
            <input
              type="checkbox"
              checked={privacySettings.allowTrackShares}
              onChange={(e) =>
                setPrivacySettings({
                  ...privacySettings,
                  allowTrackShares: e.target.checked,
                })
              }
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <label style={{ color: theme.colors.text.primary, fontSize: '14px' }}>
              Allow voice messages
            </label>
            <input
              type="checkbox"
              checked={privacySettings.allowVoiceMessages}
              onChange={(e) =>
                setPrivacySettings({
                  ...privacySettings,
                  allowVoiceMessages: e.target.checked,
                })
              }
              style={{ cursor: 'pointer', width: '18px', height: '18px' }}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderComposeTab = () => (
    <div style={{ padding: theme.spacing.md, textAlign: 'center' }}>
      <h3
        style={{
          fontSize: '16px',
          fontWeight: '600',
          color: theme.colors.text.primary,
          margin: `0 0 ${theme.spacing.md} 0`,
        }}
      >
        Start New Conversation
      </h3>
      <p
        style={{
          fontSize: '14px',
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.lg,
        }}
      >
        Search for artists or fans to start a conversation. Your engagement score determines who you
        can message.
      </p>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: theme.colors.background.secondary,
          borderRadius: '12px',
          paddingLeft: theme.spacing.md,
          marginBottom: theme.spacing.xl,
        }}
      >
        <span style={{ fontSize: '18px', color: theme.colors.text.secondary }}>🔍</span>
        <input
          type="text"
          placeholder="Search users..."
          style={{
            flex: 1,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            border: 'none',
            backgroundColor: 'transparent',
            color: theme.colors.text.primary,
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ color: theme.colors.text.tertiary, paddingTop: '64px' }}>
        <p style={{ fontSize: '24px', margin: 0 }}>👥</p>
        <p style={{ fontSize: '16px', fontWeight: '600', margin: `${theme.spacing.md} 0 ${theme.spacing.sm} 0` }}>
          Find Users
        </p>
        <p style={{ fontSize: '14px', margin: 0 }}>
          Search for artists and fans you'd like to connect with
        </p>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'inbox':
        return renderInboxTab();
      case 'requests':
        return renderRequestsTab();
      case 'privacy':
        return renderPrivacyTab();
      case 'compose':
        return renderComposeTab();
      default:
        return null;
    }
  };

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
          maxWidth: '600px',
          height: '80vh',
          maxHeight: '700px',
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
            padding: theme.spacing.md,
            borderBottom: `1px solid ${theme.colors.gray[800]}`,
          }}
        >
          <h2 style={{ margin: 0, color: theme.colors.text.primary, fontSize: '20px' }}>💬 Chats</h2>
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

        {/* Tab Bar */}
        <div
          style={{
            display: 'flex',
            borderBottom: `1px solid ${theme.colors.gray[800]}`,
            backgroundColor: theme.colors.background.secondary,
          }}
        >
          {(['inbox', 'requests', 'privacy', 'compose'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: theme.spacing.md,
                border: 'none',
                backgroundColor: 'transparent',
                color:
                  activeTab === tab
                    ? theme.colors.accent
                    : theme.colors.text.secondary,
                fontWeight: activeTab === tab ? '600' : '500',
                cursor: 'pointer',
                borderBottom:
                  activeTab === tab
                    ? `2px solid ${theme.colors.accent}`
                    : '2px solid transparent',
                transition: 'all 0.2s',
                fontSize: '14px',
              }}
            >
              {tab === 'inbox' && '📬 Inbox'}
              {tab === 'requests' && `📨 Requests${messageRequests.length > 0 ? ` (${messageRequests.length})` : ''}`}
              {tab === 'privacy' && '🛡️ Privacy'}
              {tab === 'compose' && '✏️ Compose'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: theme.colors.text.secondary,
              }}
            >
              Loading chats...
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatModal;
