import React, { useState, useEffect } from 'react';
import { Container, Header, Card, Button, Badge } from '../components';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

interface ReferredUser {
  id: string;
  email: string;
  username: string;
  status: 'active' | 'pending' | 'inactive';
  signupDate: string;
  totalEarned: number;
  lastActivity: string;
}

interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarningsFromReferrals: number;
  pendingEarnings: number;
  referralRate: number;
}

const ReferralsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referralCode] = useState(() => {
    let code = localStorage.getItem('referral_code');
    if (!code) {
      code = `REF${user?.id?.substring(0, 8).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      localStorage.setItem('referral_code', code);
    }
    return code;
  });

  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([
    {
      id: '1',
      email: 'artist@example.com',
      username: 'artist_one',
      status: 'active',
      signupDate: '2026-02-15',
      totalEarned: 150.50,
      lastActivity: '2026-03-12 14:32',
    },
    {
      id: '2',
      email: 'musician@example.com',
      username: 'musician_two',
      status: 'active',
      signupDate: '2026-02-20',
      totalEarned: 200.75,
      lastActivity: '2026-03-11 10:15',
    },
    {
      id: '3',
      email: 'producer@example.com',
      username: 'producer_three',
      status: 'pending',
      signupDate: '2026-03-10',
      totalEarned: 0,
      lastActivity: '2026-03-10 09:45',
    },
  ]);

  const [stats, setStats] = useState<ReferralStats>(() => {
    const active = referredUsers.filter(u => u.status === 'active').length;
    const total = referredUsers.length;
    const earnings = referredUsers.reduce((sum, u) => sum + u.totalEarned, 0);
    return {
      totalReferrals: total,
      activeReferrals: active,
      totalEarningsFromReferrals: earnings,
      pendingEarnings: 75.25,
      referralRate: active > 0 ? (active / total) * 100 : 0,
    };
  });

  const [showShareModal, setShowShareModal] = useState(false);
  const referralLink = `${window.location.origin}?referral=${referralCode}`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('✅ Copied to clipboard!');
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

  const statusBadgeStyles: (status: string) => React.CSSProperties = (status) => ({
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: 600,
    backgroundColor:
      status === 'active' ? theme.colors.success :
      status === 'pending' ? theme.colors.warning :
      theme.colors.gray[700],
    color: 'white',
  });

  return (
    <Container maxWidth="lg" padding="lg">
      <Header
        title="🤝 Referral Program"
        subtitle="Earn BZY by referring friends and creators"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(-1)}
        style={{ marginBottom: theme.spacing.lg }}
      >
        ← Back
      </Button>

      {/* Referral Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
      }}>
        <Card style={statCardStyles}>
          <p style={statValueStyles}>{stats.totalReferrals}</p>
          <p style={statLabelStyles}>Total Referrals</p>
        </Card>

        <Card style={statCardStyles}>
          <p style={{ ...statValueStyles, color: theme.colors.success }}>
            {stats.activeReferrals}
          </p>
          <p style={statLabelStyles}>Active Users</p>
        </Card>

        <Card style={statCardStyles}>
          <p style={{ ...statValueStyles, color: theme.colors.accent }}>
            {stats.totalEarningsFromReferrals.toFixed(2)} BZY
          </p>
          <p style={statLabelStyles}>Total Earned</p>
        </Card>

        <Card style={statCardStyles}>
          <p style={{ ...statValueStyles, color: theme.colors.info }}>
            {stats.referralRate.toFixed(1)}%
          </p>
          <p style={statLabelStyles}>Conversion Rate</p>
        </Card>
      </div>

      {/* Referral Link Section */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
          🔗 Your Referral Link
        </h3>

        <div style={{
          backgroundColor: theme.colors.background.tertiary,
          padding: theme.spacing.lg,
          borderRadius: theme.borderRadius.md,
          marginBottom: theme.spacing.lg,
        }}>
          <p style={{
            margin: 0,
            marginBottom: theme.spacing.sm,
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm,
          }}>
            Share this link with friends:
          </p>
          <div style={{
            display: 'flex',
            gap: theme.spacing.md,
            marginBottom: theme.spacing.md,
          }}>
            <input
              type="text"
              value={referralLink}
              readOnly
              style={{
                flex: 1,
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.gray[700]}`,
                backgroundColor: theme.colors.background.secondary,
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.sm,
                fontFamily: 'monospace',
              }}
            />
            <Button
              variant="primary"
              onClick={() => copyToClipboard(referralLink)}
            >
              📋 Copy
            </Button>
          </div>

          <p style={{
            margin: 0,
            marginBottom: theme.spacing.md,
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm,
          }}>
            Or use your referral code: <strong style={{ color: theme.colors.primary }}>{referralCode}</strong>
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: theme.spacing.md,
          }}>
            <Button
              variant="secondary"
              onClick={() => {
                const text = `Join SoundMoney with my referral code: ${referralCode} and earn BZY together! ${referralLink}`;
                if (navigator.share) {
                  navigator.share({ title: 'SoundMoney Referral', text });
                } else {
                  copyToClipboard(text);
                }
              }}
            >
              📱 Share
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                const text = `Join SoundMoney with my referral code: ${referralCode} and earn BZY together! ${referralLink}`;
                const email = `mailto:?subject=Join SoundMoney&body=${encodeURIComponent(text)}`;
                window.location.href = email;
              }}
            >
              ✉️ Email
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                const text = `Join SoundMoney with my referral code: ${referralCode} and earn BZY together! ${referralLink}`;
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(twitterUrl, '_blank');
              }}
            >
              𝕏 Tweet
            </Button>
          </div>
        </div>

        <div style={{
          padding: theme.spacing.md,
          backgroundColor: theme.colors.background.tertiary,
          borderRadius: theme.borderRadius.md,
          borderLeft: `4px solid ${theme.colors.info}`,
        }}>
          <p style={{ margin: 0, color: theme.colors.info, fontSize: theme.typography.fontSize.sm, fontWeight: 600 }}>
            💡 How it works:
          </p>
          <p style={{ margin: 0, marginTop: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
            Friends who sign up with your code earn you 10% of their first month earnings. Both of you get a 5% bonus!
          </p>
        </div>
      </Card>

      {/* Referral Earnings Breakdown */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
          💰 Earnings Breakdown
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: theme.spacing.lg,
        }}>
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.md,
          }}>
            <p style={{
              margin: 0,
              marginBottom: theme.spacing.sm,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
            }}>
              Confirmed Earnings
            </p>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.xxl,
              fontWeight: 'bold',
              color: theme.colors.success,
            }}>
              {stats.totalEarningsFromReferrals.toFixed(2)} BZY
            </p>
          </div>

          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.md,
          }}>
            <p style={{
              margin: 0,
              marginBottom: theme.spacing.sm,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
            }}>
              Pending Earnings
            </p>
            <p style={{
              margin: 0,
              fontSize: theme.typography.fontSize.xxl,
              fontWeight: 'bold',
              color: theme.colors.warning,
            }}>
              {stats.pendingEarnings.toFixed(2)} BZY
            </p>
          </div>
        </div>
      </Card>

      {/* Referred Users List */}
      <Card>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
        }}>
          <h3 style={{ margin: 0, color: theme.colors.text.primary }}>
            👥 People You've Referred
          </h3>
          <Badge variant="success">{stats.totalReferrals}</Badge>
        </div>

        {referredUsers.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: theme.colors.text.primary,
            }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                  <th style={{ textAlign: 'left', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    User
                  </th>
                  <th style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Signup Date
                  </th>
                  <th style={{ textAlign: 'right', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Your Earnings
                  </th>
                  <th style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Last Active
                  </th>
                </tr>
              </thead>
              <tbody>
                {referredUsers.map((referral) => (
                  <tr key={referral.id} style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                    <td style={{ padding: theme.spacing.md }}>
                      <div>
                        <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600 }}>
                          @{referral.username}
                        </p>
                        <p style={{ margin: 0, marginTop: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                          {referral.email}
                        </p>
                      </div>
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'center' }}>
                      <span style={statusBadgeStyles(referral.status)}>
                        {referral.status.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'center', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                      {new Date(referral.signupDate).toLocaleDateString()}
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.accent, fontWeight: 600 }}>
                      {referral.totalEarned.toFixed(2)} BZY
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'center', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                      {referral.lastActivity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: theme.colors.text.secondary, textAlign: 'center' }}>
            No referrals yet. Share your code to get started!
          </p>
        )}
      </Card>
    </Container>
  );
};

export default ReferralsPage;
