import React, { useState } from 'react';
import { Card, Button, Badge } from './index';
import { theme } from '../theme/theme';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SubscriptionTab = 'plans' | 'dashboard' | 'team' | 'referrals';

interface Plan {
  id: string;
  name: string;
  price: number;
  bezyMultiplier: number;
  features: string[];
  highlighted?: boolean;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<SubscriptionTab>('plans');
  const [referralCode, setReferralCode] = useState('REF-' + Math.random().toString(36).substr(2, 9).toUpperCase());
  const [teamEmail, setTeamEmail] = useState('');
  const [currentPlan, setCurrentPlan] = useState('creator');

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Creator',
      price: 0,
      bezyMultiplier: 1,
      features: [
        'Basic streaming analytics',
        'Up to 10 tracks',
        'Standard BZY earnings (1x)',
        'Limited team members',
      ],
    },
    {
      id: 'pro',
      name: 'Pro Artist',
      price: 9.99,
      bezyMultiplier: 1.5,
      features: [
        'Advanced analytics',
        'Unlimited tracks',
        '1.5x BZY earnings boost',
        'Team collaboration (5 members)',
        'Priority support',
        'Custom metadata',
      ],
      highlighted: true,
    },
    {
      id: 'team',
      name: 'Team/Label',
      price: 29.99,
      bezyMultiplier: 2,
      features: [
        'All Pro features',
        '2x BZY earnings boost',
        'Unlimited team members',
        'AI-powered analytics',
        'Meta Ads + Google Analytics integration',
        'Claude Cowork enabled',
        'Dedicated account manager',
      ],
    },
  ];

  const handleGenerateReferral = () => {
    setReferralCode('REF-' + Math.random().toString(36).substr(2, 9).toUpperCase());
    alert(`✅ Referral code generated: ${referralCode}`);
  };

  const handleInviteTeamMember = () => {
    if (!teamEmail.trim()) {
      alert('❌ Please enter an email address');
      return;
    }
    alert(`✅ Invitation sent to ${teamEmail}`);
    setTeamEmail('');
  };

  const handleUpgrade = (planId: string) => {
    if (planId === currentPlan) {
      alert('You are already on this plan');
      return;
    }
    alert(`✅ Upgraded to ${plans.find(p => p.id === planId)?.name}!`);
    setCurrentPlan(planId);
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
      }}
      onClick={onClose}
    >
      <Card
        style={{
          width: '90%',
          maxWidth: '900px',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: theme.spacing.lg,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
          <h2 style={{ margin: 0, color: theme.colors.text.primary }}>
            💎 Premium Subscription
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: theme.colors.text.secondary,
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.lg, flexWrap: 'wrap' }}>
          {(['plans', 'dashboard', 'team', 'referrals'] as SubscriptionTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                borderRadius: theme.borderRadius.md,
                border: 'none',
                backgroundColor: activeTab === tab ? theme.colors.primary : theme.colors.background.secondary,
                color: activeTab === tab ? '#fff' : theme.colors.text.secondary,
                cursor: 'pointer',
                fontWeight: activeTab === tab ? '600' : '400',
                fontSize: theme.typography.fontSize.sm,
                textTransform: 'capitalize',
              }}
            >
              {tab === 'plans' && '💳 Plans'}
              {tab === 'dashboard' && '📊 Dashboard'}
              {tab === 'team' && '👥 Team'}
              {tab === 'referrals' && '🎁 Referrals'}
            </button>
          ))}
        </div>

        {/* Plans Tab */}
        {activeTab === 'plans' && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: theme.spacing.lg,
          }}>
            {plans.map((plan) => (
              <Card
                key={plan.id}
                style={{
                  padding: theme.spacing.lg,
                  border: plan.highlighted ? `2px solid ${theme.colors.primary}` : `1px solid ${theme.colors.gray[700]}`,
                  position: 'relative',
                }}
              >
                {plan.highlighted && (
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    right: '16px',
                    backgroundColor: theme.colors.primary,
                    color: '#fff',
                    padding: `4px 12px`,
                    borderRadius: theme.borderRadius.md,
                    fontSize: '12px',
                    fontWeight: '600',
                  }}>
                    ⭐ MOST POPULAR
                  </div>
                )}

                <h3 style={{ margin: '0 0 8px 0', color: theme.colors.text.primary }}>
                  {plan.name}
                </h3>

                <div style={{ marginBottom: theme.spacing.md }}>
                  <p style={{ margin: '4px 0', color: theme.colors.accent, fontSize: '24px', fontWeight: '700' }}>
                    ${plan.price}
                    <span style={{ fontSize: '14px', color: theme.colors.text.secondary }}>/month</span>
                  </p>
                  <p style={{ margin: '4px 0', color: theme.colors.primary, fontWeight: '600' }}>
                    {plan.bezyMultiplier}x BZY Multiplier
                  </p>
                </div>

                <div style={{ marginBottom: theme.spacing.lg }}>
                  {plan.features.map((feature, idx) => (
                    <p key={idx} style={{ margin: '8px 0', fontSize: theme.typography.fontSize.sm, color: theme.colors.text.secondary }}>
                      ✓ {feature}
                    </p>
                  ))}
                </div>

                <Button
                  variant={currentPlan === plan.id ? 'secondary' : 'primary'}
                  onClick={() => handleUpgrade(plan.id)}
                  style={{ width: '100%' }}
                >
                  {currentPlan === plan.id ? '✓ Current Plan' : `Upgrade to ${plan.name}`}
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: theme.spacing.lg,
            }}>
              <Card style={{ padding: theme.spacing.lg, textAlign: 'center' }}>
                <p style={{ margin: 0, marginBottom: theme.spacing.sm, color: theme.colors.text.secondary }}>
                  Monthly BZY Earned
                </p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: theme.colors.accent }}>
                  1,250.50
                </p>
              </Card>

              <Card style={{ padding: theme.spacing.lg, textAlign: 'center' }}>
                <p style={{ margin: 0, marginBottom: theme.spacing.sm, color: theme.colors.text.secondary }}>
                  Active Listeners
                </p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: theme.colors.primary }}>
                  342
                </p>
              </Card>

              <Card style={{ padding: theme.spacing.lg, textAlign: 'center' }}>
                <p style={{ margin: 0, marginBottom: theme.spacing.sm, color: theme.colors.text.secondary }}>
                  Subscription Value
                </p>
                <p style={{ margin: 0, fontSize: '28px', fontWeight: 'bold', color: theme.colors.success || '#10b981' }}>
                  $9.99
                </p>
              </Card>
            </div>

            <Card style={{ padding: theme.spacing.lg }}>
              <h4 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
                📈 Your Subscription Benefits
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  ✅ 1.5x BZY Earnings Boost
                </p>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  ✅ Advanced Analytics Dashboard
                </p>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  ✅ Unlimited Tracks & Features
                </p>
                <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  ✅ Priority Support
                </p>
              </div>
            </Card>
          </div>
        )}

        {/* Team Tab */}
        {activeTab === 'team' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
            <Card style={{ padding: theme.spacing.lg }}>
              <h4 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
                👥 Team Management
              </h4>
              <p style={{ margin: '0 0 16px 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                Invite team members to collaborate on music publishing and marketing
              </p>

              <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
                <input
                  type="email"
                  value={teamEmail}
                  onChange={(e) => setTeamEmail(e.target.value)}
                  placeholder="team@example.com"
                  style={{
                    flex: 1,
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                    boxSizing: 'border-box',
                  }}
                />
                <Button variant="primary" onClick={handleInviteTeamMember}>
                  📧 Invite
                </Button>
              </div>

              <div>
                <p style={{ margin: '0 0 12px 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, fontWeight: '600' }}>
                  Active Team Members (1/5):
                </p>
                <div style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[700]}`,
                }}>
                  <p style={{ margin: 0, color: theme.colors.text.primary }}>
                    📧 you@example.com
                  </p>
                  <p style={{ margin: '4px 0 0 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                    Owner • Full Access
                  </p>
                </div>
              </div>
            </Card>

            <Card style={{ padding: theme.spacing.lg }}>
              <h4 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
                🔐 Role Permissions
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.colors.primary, fontWeight: '600' }}>Manager</p>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                    Upload content, view analytics, manage team, handle revenue
                  </p>
                </div>
                <div>
                  <p style={{ margin: '0 0 4px 0', color: theme.colors.primary, fontWeight: '600' }}>Analyst</p>
                  <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                    View analytics and revenue data only
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
            <Card style={{ padding: theme.spacing.lg }}>
              <h4 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
                🎁 Referral Program
              </h4>
              <p style={{ margin: '0 0 16px 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                Earn BZY by inviting friends to SoundMoney. Get 10% of their referral earnings for life!
              </p>

              <Card style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.secondary,
                border: `1px solid ${theme.colors.gray[700]}`,
              }}>
                <p style={{ margin: '0 0 8px 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  Your Referral Code:
                </p>
                <div style={{ display: 'flex', gap: theme.spacing.sm }}>
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    style={{
                      flex: 1,
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.md,
                      border: `1px solid ${theme.colors.primary}`,
                      backgroundColor: theme.colors.background.primary,
                      color: theme.colors.accent,
                      fontSize: theme.typography.fontSize.base,
                      fontWeight: '600',
                      boxSizing: 'border-box',
                    }}
                  />
                  <Button variant="secondary">📋 Copy</Button>
                </div>
              </Card>
            </Card>

            <Card style={{ padding: theme.spacing.lg }}>
              <h4 style={{ margin: '0 0 16px 0', color: theme.colors.text.primary }}>
                📊 Referral Stats
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: theme.spacing.md,
              }}>
                <div style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.md,
                  textAlign: 'center',
                }}>
                  <p style={{ margin: '0 0 8px 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                    Referred Users
                  </p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary }}>
                    12
                  </p>
                </div>

                <div style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.md,
                  textAlign: 'center',
                }}>
                  <p style={{ margin: '0 0 8px 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                    BZY Earned
                  </p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: theme.colors.accent }}>
                    450.25
                  </p>
                </div>

                <div style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.md,
                  textAlign: 'center',
                }}>
                  <p style={{ margin: '0 0 8px 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                    Active Referrals
                  </p>
                  <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: theme.colors.info }}>
                    8
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        <div style={{ marginTop: theme.spacing.lg, paddingTop: theme.spacing.lg, borderTop: `1px solid ${theme.colors.gray[800]}` }}>
          <Button
            variant="secondary"
            onClick={onClose}
            style={{ width: '100%' }}
          >
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SubscriptionModal;
