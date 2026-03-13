import React, { useState } from 'react';
import { Container, Header, Card, Button } from '../components';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: localStorage.getItem('user_bio') || '',
    artistName: localStorage.getItem('artist_name') || '',
    location: localStorage.getItem('user_location') || '',
  });

  const handleSaveProfile = () => {
    localStorage.setItem('user_bio', profileData.bio);
    localStorage.setItem('artist_name', profileData.artistName);
    localStorage.setItem('user_location', profileData.location);
    alert('✅ Profile updated successfully');
    setIsEditing(false);
  };

  const statCardStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
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
    margin: 0,
    marginTop: theme.spacing.sm,
  };

  const profileSectionStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  };

  const inputFieldStyles: React.CSSProperties = {
    width: '100%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    border: `1px solid ${theme.colors.gray[700]}`,
    backgroundColor: theme.colors.background.secondary,
    color: theme.colors.text.primary,
    fontSize: theme.typography.fontSize.base,
    boxSizing: 'border-box',
    marginBottom: theme.spacing.md,
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: theme.spacing.sm,
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.sm,
    fontWeight: 600,
  };

  return (
    <Container maxWidth="lg" padding="lg">
      <Header
        title="👤 Your Profile"
        subtitle="View and manage your profile information"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(-1)}
        style={{ marginBottom: theme.spacing.lg }}
      >
        ← Back
      </Button>

      {/* Profile Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
      }}>
        <Card style={statCardStyles}>
          <p style={statValueStyles}>42</p>
          <p style={statLabelStyles}>Tracks</p>
        </Card>
        <Card style={statCardStyles}>
          <p style={statValueStyles}>1.2K</p>
          <p style={statLabelStyles}>Total Listens</p>
        </Card>
        <Card style={statCardStyles}>
          <p style={statValueStyles}>850</p>
          <p style={statLabelStyles}>BZY Earned</p>
        </Card>
        <Card style={statCardStyles}>
          <p style={statValueStyles}>15</p>
          <p style={statLabelStyles}>Followers</p>
        </Card>
      </div>

      {/* Profile Information */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
        }}>
          <h3 style={{ margin: 0, color: theme.colors.text.primary }}>Profile Information</h3>
          <Button
            variant={isEditing ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? '✕ Cancel' : '✏️ Edit'}
          </Button>
        </div>

        {isEditing ? (
          <div>
            <label style={labelStyles}>Username</label>
            <input
              type="text"
              value={profileData.username}
              disabled
              style={{ ...inputFieldStyles, opacity: 0.6, cursor: 'not-allowed' }}
            />

            <label style={labelStyles}>Email</label>
            <input
              type="email"
              value={profileData.email}
              disabled
              style={{ ...inputFieldStyles, opacity: 0.6, cursor: 'not-allowed' }}
            />

            <label style={labelStyles}>Artist Name</label>
            <input
              type="text"
              value={profileData.artistName}
              onChange={(e) => setProfileData({ ...profileData, artistName: e.target.value })}
              placeholder="Your stage name or artist name"
              style={inputFieldStyles}
            />

            <label style={labelStyles}>Location</label>
            <input
              type="text"
              value={profileData.location}
              onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
              placeholder="City, Country"
              style={inputFieldStyles}
            />

            <label style={labelStyles}>Bio</label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              style={{
                ...inputFieldStyles,
                minHeight: '100px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />

            <Button
              variant="primary"
              onClick={handleSaveProfile}
            >
              💾 Save Changes
            </Button>
          </div>
        ) : (
          <div style={profileSectionStyles}>
            <div>
              <p style={labelStyles}>Username</p>
              <p style={{ color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base }}>
                {profileData.username}
              </p>
            </div>
            <div>
              <p style={labelStyles}>Email</p>
              <p style={{ color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base }}>
                {profileData.email}
              </p>
            </div>
            <div>
              <p style={labelStyles}>Artist Name</p>
              <p style={{ color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base }}>
                {profileData.artistName || 'Not set'}
              </p>
            </div>
            <div>
              <p style={labelStyles}>Location</p>
              <p style={{ color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base }}>
                {profileData.location || 'Not set'}
              </p>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <p style={labelStyles}>Bio</p>
              <p style={{ color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base }}>
                {profileData.bio || 'No bio yet'}
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* Account Links */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: theme.spacing.md,
      }}>
        <Button
          variant="secondary"
          onClick={() => navigate('/settings')}
        >
          ⚙️ Account Settings
        </Button>
        <Button
          variant="secondary"
          onClick={() => navigate('/payouts')}
        >
          💰 Wallet & Payouts
        </Button>
      </div>
    </Container>
  );
};

export default ProfilePage;
