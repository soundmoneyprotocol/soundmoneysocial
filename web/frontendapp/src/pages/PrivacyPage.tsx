import React, { useState } from 'react';
import { Container, Header, Card, Button } from '../components';
import { theme } from '../theme/theme';
import { useNavigate } from 'react-router-dom';

interface ActivityLog {
  id: string;
  action: string;
  device: string;
  location: string;
  date: string;
}

const PrivacyPage: React.FC = () => {
  const navigate = useNavigate();
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: localStorage.getItem('profile_visibility') || 'public',
    allowMessages: localStorage.getItem('allow_messages') !== 'false',
    allowCollaborations: localStorage.getItem('allow_collaborations') !== 'false',
    showActivity: localStorage.getItem('show_activity') !== 'false',
    searchEngineIndex: localStorage.getItem('search_engine_index') !== 'false',
  });

  const [blockedUsers] = useState([
    { id: '1', username: 'spam_user', blockedDate: '2026-02-15' },
    { id: '2', username: 'another_user', blockedDate: '2026-01-20' },
  ]);

  const [activityLog] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'Login',
      device: 'Chrome on macOS',
      location: 'San Francisco, CA',
      date: '2026-03-12 14:32',
    },
    {
      id: '2',
      action: 'Profile Updated',
      device: 'Safari on iPhone',
      location: 'San Francisco, CA',
      date: '2026-03-11 10:15',
    },
    {
      id: '3',
      action: 'Password Changed',
      device: 'Firefox on Windows',
      location: 'Los Angeles, CA',
      date: '2026-03-09 16:45',
    },
  ]);

  const handleSavePrivacySettings = () => {
    localStorage.setItem('profile_visibility', privacySettings.profileVisibility);
    localStorage.setItem('allow_messages', String(privacySettings.allowMessages));
    localStorage.setItem('allow_collaborations', String(privacySettings.allowCollaborations));
    localStorage.setItem('show_activity', String(privacySettings.showActivity));
    localStorage.setItem('search_engine_index', String(privacySettings.searchEngineIndex));
    alert('✅ Privacy settings updated');
  };

  const toggleSetting = (key: keyof typeof privacySettings) => {
    if (key === 'profileVisibility') return;
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const settingItemStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  };

  const toggleStyles: (isActive: boolean) => React.CSSProperties = (isActive) => ({
    width: '50px',
    height: '28px',
    backgroundColor: isActive ? theme.colors.primary : theme.colors.gray[700],
    border: 'none',
    borderRadius: '14px',
    cursor: 'pointer',
    position: 'relative',
    transition: 'all 0.3s ease',
    padding: 0,
  });

  const toggleDotStyles: (isActive: boolean) => React.CSSProperties = (isActive) => ({
    position: 'absolute',
    width: '24px',
    height: '24px',
    backgroundColor: 'white',
    borderRadius: '50%',
    top: '2px',
    left: isActive ? '24px' : '2px',
    transition: 'left 0.3s ease',
  });

  const labelStyles: React.CSSProperties = {
    margin: 0,
    color: theme.colors.text.primary,
    fontWeight: 600,
    fontSize: theme.typography.fontSize.sm,
  };

  const descriptionStyles: React.CSSProperties = {
    margin: 0,
    marginTop: '4px',
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xs,
  };

  return (
    <Container maxWidth="lg" padding="lg">
      <Header
        title="🔒 Privacy Tools"
        subtitle="Manage your privacy and data"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(-1)}
        style={{ marginBottom: theme.spacing.lg }}
      >
        ← Back
      </Button>

      {/* Profile Visibility */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
          👁️ Profile Visibility
        </h3>

        <label style={{
          display: 'block',
          marginBottom: theme.spacing.sm,
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.sm,
          fontWeight: 600,
        }}>
          Who can see your profile?
        </label>

        <select
          value={privacySettings.profileVisibility}
          onChange={(e) => setPrivacySettings({ ...privacySettings, profileVisibility: e.target.value })}
          style={{
            width: '100%',
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.gray[700]}`,
            backgroundColor: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.base,
            boxSizing: 'border-box',
            marginBottom: theme.spacing.lg,
          }}
        >
          <option value="public">Public - Everyone can see your profile</option>
          <option value="followers">Followers Only - Only your followers can see</option>
          <option value="private">Private - Only you can see your profile</option>
        </select>

        <p style={{ ...descriptionStyles, marginBottom: theme.spacing.lg }}>
          Current setting: <strong>{privacySettings.profileVisibility}</strong>
        </p>
      </Card>

      {/* Privacy Controls */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
          ⚙️ Privacy Controls
        </h3>

        <div style={settingItemStyles}>
          <div>
            <p style={labelStyles}>Allow Direct Messages</p>
            <p style={descriptionStyles}>Let others send you messages</p>
          </div>
          <button
            style={toggleStyles(privacySettings.allowMessages)}
            onClick={() => toggleSetting('allowMessages')}
          >
            <div style={toggleDotStyles(privacySettings.allowMessages)} />
          </button>
        </div>

        <div style={settingItemStyles}>
          <div>
            <p style={labelStyles}>Allow Collaboration Requests</p>
            <p style={descriptionStyles}>Let others invite you to collaborate</p>
          </div>
          <button
            style={toggleStyles(privacySettings.allowCollaborations)}
            onClick={() => toggleSetting('allowCollaborations')}
          >
            <div style={toggleDotStyles(privacySettings.allowCollaborations)} />
          </button>
        </div>

        <div style={settingItemStyles}>
          <div>
            <p style={labelStyles}>Show Activity Status</p>
            <p style={descriptionStyles}>Let others see when you're active</p>
          </div>
          <button
            style={toggleStyles(privacySettings.showActivity)}
            onClick={() => toggleSetting('showActivity')}
          >
            <div style={toggleDotStyles(privacySettings.showActivity)} />
          </button>
        </div>

        <div style={settingItemStyles}>
          <div>
            <p style={labelStyles}>Allow Search Engine Indexing</p>
            <p style={descriptionStyles}>Let search engines find your profile</p>
          </div>
          <button
            style={toggleStyles(privacySettings.searchEngineIndex)}
            onClick={() => toggleSetting('searchEngineIndex')}
          >
            <div style={toggleDotStyles(privacySettings.searchEngineIndex)} />
          </button>
        </div>
      </Card>

      {/* Login Activity */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
          📱 Login Activity
        </h3>

        {activityLog.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: theme.colors.text.primary,
            }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                  <th style={{ textAlign: 'left', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Action
                  </th>
                  <th style={{ textAlign: 'left', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Device
                  </th>
                  <th style={{ textAlign: 'left', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Location
                  </th>
                  <th style={{ textAlign: 'left', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {activityLog.map((log) => (
                  <tr key={log.id} style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                    <td style={{ padding: theme.spacing.md, color: theme.colors.text.primary }}>
                      {log.action}
                    </td>
                    <td style={{ padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                      {log.device}
                    </td>
                    <td style={{ padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                      {log.location}
                    </td>
                    <td style={{ padding: theme.spacing.md, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                      {log.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: theme.colors.text.secondary }}>No activity log</p>
        )}
      </Card>

      {/* Blocked Users */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
        }}>
          <h3 style={{ margin: 0, color: theme.colors.text.primary }}>
            🚫 Blocked Users
          </h3>
          <Button variant="secondary" size="sm">
            ➕ Block User
          </Button>
        </div>

        {blockedUsers.length > 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.md,
          }}>
            {blockedUsers.map((user) => (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.tertiary,
                  borderRadius: theme.borderRadius.md,
                }}
              >
                <div>
                  <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600 }}>
                    @{user.username}
                  </p>
                  <p style={{ margin: 0, marginTop: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                    Blocked on {new Date(user.blockedDate).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    if (window.confirm(`Unblock @${user.username}?`)) {
                      alert('User unblocked');
                    }
                  }}
                >
                  Unblock
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: theme.colors.text.secondary }}>No blocked users</p>
        )}
      </Card>

      {/* Data & Privacy */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
          📊 Data & Privacy
        </h3>

        <Button
          variant="secondary"
          onClick={() => {
            alert('✅ Privacy policy downloaded');
          }}
          style={{ marginBottom: theme.spacing.md, width: '100%' }}
        >
          📄 View Privacy Policy
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            alert('✅ Terms of service downloaded');
          }}
          style={{ marginBottom: theme.spacing.md, width: '100%' }}
        >
          📋 View Terms of Service
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            alert('✅ Cookie settings updated');
          }}
          style={{ marginBottom: theme.spacing.md, width: '100%' }}
        >
          🍪 Cookie Preferences
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            if (window.confirm('Request a copy of your data?')) {
              alert('✅ Data export request submitted. You will receive an email shortly.');
            }
          }}
          style={{ width: '100%' }}
        >
          📥 Request Data Export
        </Button>
      </Card>

      {/* Save Settings */}
      <Button
        variant="primary"
        onClick={handleSavePrivacySettings}
      >
        💾 Save Privacy Settings
      </Button>
    </Container>
  );
};

export default PrivacyPage;
