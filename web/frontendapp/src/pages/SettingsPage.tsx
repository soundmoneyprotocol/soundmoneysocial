import React, { useState } from 'react';
import { Container, Header, Card, Button } from '../components';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    emailNotifications: localStorage.getItem('email_notifications') !== 'false',
    pushNotifications: localStorage.getItem('push_notifications') !== 'false',
    privateProfile: localStorage.getItem('private_profile') === 'true',
    twoFactorAuth: localStorage.getItem('two_factor_auth') === 'true',
  });

  const handleSaveSettings = () => {
    localStorage.setItem('email_notifications', String(settings.emailNotifications));
    localStorage.setItem('push_notifications', String(settings.pushNotifications));
    localStorage.setItem('private_profile', String(settings.privateProfile));
    localStorage.setItem('two_factor_auth', String(settings.twoFactorAuth));
    alert('✅ Settings updated successfully');
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({
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

  return (
    <Container maxWidth="lg" padding="lg">
      <Header
        title="⚙️ Account Settings"
        subtitle="Manage your account preferences and security"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(-1)}
        style={{ marginBottom: theme.spacing.lg }}
      >
        ← Back
      </Button>

      {/* Notification Settings */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
          🔔 Notification Settings
        </h3>

        <div style={settingItemStyles}>
          <div>
            <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600 }}>
              Email Notifications
            </p>
            <p style={{ margin: 0, marginTop: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Receive updates via email
            </p>
          </div>
          <button
            style={toggleStyles(settings.emailNotifications)}
            onClick={() => toggleSetting('emailNotifications')}
          >
            <div style={toggleDotStyles(settings.emailNotifications)} />
          </button>
        </div>

        <div style={settingItemStyles}>
          <div>
            <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600 }}>
              Push Notifications
            </p>
            <p style={{ margin: 0, marginTop: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Get alerts for important events
            </p>
          </div>
          <button
            style={toggleStyles(settings.pushNotifications)}
            onClick={() => toggleSetting('pushNotifications')}
          >
            <div style={toggleDotStyles(settings.pushNotifications)} />
          </button>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
          🔒 Privacy & Security
        </h3>

        <div style={settingItemStyles}>
          <div>
            <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600 }}>
              Private Profile
            </p>
            <p style={{ margin: 0, marginTop: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Only you and approved followers can see your profile
            </p>
          </div>
          <button
            style={toggleStyles(settings.privateProfile)}
            onClick={() => toggleSetting('privateProfile')}
          >
            <div style={toggleDotStyles(settings.privateProfile)} />
          </button>
        </div>

        <div style={settingItemStyles}>
          <div>
            <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600 }}>
              Two-Factor Authentication
            </p>
            <p style={{ margin: 0, marginTop: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Add an extra layer of security to your account
            </p>
          </div>
          <button
            style={toggleStyles(settings.twoFactorAuth)}
            onClick={() => toggleSetting('twoFactorAuth')}
          >
            <div style={toggleDotStyles(settings.twoFactorAuth)} />
          </button>
        </div>
      </Card>

      {/* Account Actions */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
          ⚠️ Account Actions
        </h3>

        <Button
          variant="secondary"
          onClick={() => {
            if (window.confirm('Are you sure you want to change your password?')) {
              alert('Password change functionality coming soon');
            }
          }}
          style={{ marginBottom: theme.spacing.md, width: '100%' }}
        >
          🔐 Change Password
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            if (window.confirm('Download a copy of your data? This will generate a JSON file with all your account information.')) {
              const data = {
                username: user?.username,
                email: user?.email,
                createdAt: user?.createdAt,
                settingsBackup: settings,
              };
              const json = JSON.stringify(data, null, 2);
              const element = document.createElement('a');
              element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(json));
              element.setAttribute('download', 'soundmoney-backup.json');
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
              alert('✅ Data downloaded');
            }
          }}
          style={{ marginBottom: theme.spacing.md, width: '100%' }}
        >
          📥 Download My Data
        </Button>

        <Button
          variant="secondary"
          onClick={() => {
            if (window.confirm('Delete your account? This action cannot be undone.')) {
              alert('Account deletion coming soon - please contact support');
            }
          }}
          style={{ width: '100%', backgroundColor: '#ef4444', color: 'white' }}
        >
          🗑️ Delete Account
        </Button>
      </Card>

      {/* Save Settings Button */}
      <Button
        variant="primary"
        onClick={handleSaveSettings}
      >
        💾 Save All Settings
      </Button>
    </Container>
  );
};

export default SettingsPage;
