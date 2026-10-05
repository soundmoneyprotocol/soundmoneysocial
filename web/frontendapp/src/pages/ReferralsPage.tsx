import React, { useState, useEffect } from 'react';
import { Container, Header, Card, Button, Badge, Loading } from '../components';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface ReferredUser {
  usedByUserId: string;
  usedAt: string;
}

function generateReferralCode(userId: string): string {
  return `REF${userId.substring(0, 8).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

const ReferralsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referredUsers, setReferredUsers] = useState<ReferredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const loadReferrals = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data: existing, error: fetchError } = await supabase
          .from('referrals')
          .select('id, referral_code')
          .eq('owner_user_id', user.id)
          .maybeSingle();

        if (fetchError) throw fetchError;

        let referralRow = existing;
        if (!referralRow) {
          const { data: created, error: createError } = await supabase
            .from('referrals')
            .insert({ owner_user_id: user.id, referral_code: generateReferralCode(user.id) })
            .select('id, referral_code')
            .single();
          if (createError) throw createError;
          referralRow = created;
        }

        setReferralCode(referralRow.referral_code);

        const { data: used, error: usedError } = await supabase
          .from('used_referrals')
          .select('used_by_user_id, used_at')
          .eq('referral_id', referralRow.id)
          .order('used_at', { ascending: false });

        if (usedError) throw usedError;

        setReferredUsers(
          (used ?? []).map((row) => ({ usedByUserId: row.used_by_user_id, usedAt: row.used_at }))
        );
      } catch (err: any) {
        console.error('Failed to load referrals:', err);
        setError(err.message || 'Failed to load referral data');
      } finally {
        setIsLoading(false);
      }
    };

    loadReferrals();
  }, [user]);

  const referralLink = referralCode ? `${window.location.origin}?referral=${referralCode}` : '';

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

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <Container maxWidth="lg" padding="lg">
      <Header
        title="🤝 Referral Program"
        subtitle="Invite friends and creators to SoundMoney"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(-1)}
        style={{ marginBottom: theme.spacing.lg }}
      >
        ← Back
      </Button>

      {error && (
        <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg, borderLeft: `4px solid ${theme.colors.warning}` }}>
          <p style={{ margin: 0, color: theme.colors.warning }}>{error}</p>
        </Card>
      )}

      {/* Referral Statistics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
      }}>
        <Card style={statCardStyles}>
          <p style={statValueStyles}>{referredUsers.length}</p>
          <p style={statLabelStyles}>Total Referrals</p>
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
                const text = `Join SoundMoney with my referral code: ${referralCode}! ${referralLink}`;
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
                const text = `Join SoundMoney with my referral code: ${referralCode}! ${referralLink}`;
                const email = `mailto:?subject=Join SoundMoney&body=${encodeURIComponent(text)}`;
                window.location.href = email;
              }}
            >
              ✉️ Email
            </Button>

            <Button
              variant="secondary"
              onClick={() => {
                const text = `Join SoundMoney with my referral code: ${referralCode}! ${referralLink}`;
                const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
                window.open(twitterUrl, '_blank');
              }}
            >
              𝕏 Tweet
            </Button>
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
          <Badge variant="success">{referredUsers.length}</Badge>
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
                  <th style={{ textAlign: 'right', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Signup Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {referredUsers.map((referral) => (
                  <tr key={referral.usedByUserId} style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                    <td style={{ padding: theme.spacing.md, fontFamily: 'monospace', fontSize: theme.typography.fontSize.sm }}>
                      {referral.usedByUserId.substring(0, 8)}…
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                      {new Date(referral.usedAt).toLocaleDateString()}
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
