import React, { useState } from 'react';
import { Container, Header, Card, Button, Badge } from '../components';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import privyWalletService from '../services/privyWalletService';

interface PayoutRecord {
  id: string;
  date: string;
  amount: number;
  method: string;
  status: 'completed' | 'pending' | 'failed';
}

const PayoutsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [walletData, setWalletData] = useState({
    totalBalance: 1250.45,
    availableBalance: 850.32,
    pendingBalance: 400.13,
    walletAddress: localStorage.getItem('wallet_address') || '',
  });

  const [payoutRecords] = useState<PayoutRecord[]>([
    {
      id: '1',
      date: '2026-03-10',
      amount: 500,
      method: 'Bank Transfer',
      status: 'completed',
    },
    {
      id: '2',
      date: '2026-03-03',
      amount: 350,
      method: 'Crypto Wallet',
      status: 'completed',
    },
    {
      id: '3',
      date: '2026-02-28',
      amount: 275.50,
      method: 'Bank Transfer',
      status: 'pending',
    },
  ]);

  const [walletConnected, setWalletConnected] = useState(false);
  const [magicLinkEmail, setMagicLinkEmail] = useState('');
  const [showMagicLinkForm, setShowMagicLinkForm] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    amount: '',
    method: 'bank',
    accountDetails: '',
  });

  const handleRequestPayout = () => {
    if (!payoutForm.amount || parseFloat(payoutForm.amount) > walletData.availableBalance) {
      alert('❌ Invalid amount. Please check your available balance.');
      return;
    }

    alert(`✅ Payout request submitted for ${payoutForm.amount} BZY via ${payoutForm.method}`);
    setPayoutForm({ amount: '', method: 'bank', accountDetails: '' });
    setShowPayoutForm(false);
  };

  const balanceCardStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
  };

  const balanceValueStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.accent,
    margin: 0,
  };

  const balanceLabelStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
    marginBottom: theme.spacing.sm,
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

  const statusBadgeStyles: (status: string) => React.CSSProperties = (status) => ({
    padding: `${theme.spacing.xs} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.md,
    fontSize: theme.typography.fontSize.xs,
    fontWeight: 600,
    backgroundColor:
      status === 'completed' ? theme.colors.success :
      status === 'pending' ? theme.colors.warning :
      '#ef4444',
    color: 'white',
  });


  const handleSendMagicLink = async () => {
    if (!magicLinkEmail) {
      alert('Please enter your email');
      return;
    }

    try {
      const result = await privyWalletService.sendMagicLink(magicLinkEmail);
      if (result.success) {
        setMagicLinkSent(true);
        localStorage.setItem('user_email', magicLinkEmail);
        alert('✅ ' + result.message);
      }
    } catch (error) {
      alert('❌ Error sending magic link');
    }
  };

  const handleVerifyAndConnectWallet = async () => {
    try {
      const wallet = await privyWalletService.linkEmailToWallet(magicLinkEmail);
      if (wallet) {
        setWalletConnected(true);
        setWalletData(prev => ({
          ...prev,
          walletAddress: wallet.walletAddress,
        }));
        localStorage.setItem('wallet_address', wallet.walletAddress);
        localStorage.setItem('privy_wallet_id', wallet.id);
        setShowMagicLinkForm(false);
        alert('✅ Wallet connected successfully!');
      }
    } catch (error) {
      alert('❌ Error connecting wallet');
    }
  };

  return (
    <Container maxWidth="lg" padding="lg">
      <Header
        title="💰 Wallet & Payouts"
        subtitle="Manage your BZY earnings and withdraw funds"
      />

      <Button
        variant="secondary"
        size="sm"
        onClick={() => navigate(-1)}
        style={{ marginBottom: theme.spacing.lg }}
      >
        ← Back
      </Button>

      {/* Wallet Balance Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.xl,
      }}>
        <Card style={balanceCardStyles}>
          <p style={balanceLabelStyles}>Total Balance</p>
          <p style={balanceValueStyles}>{walletData.totalBalance.toFixed(2)} BZY</p>
        </Card>

        <Card style={balanceCardStyles}>
          <p style={balanceLabelStyles}>Available</p>
          <p style={{ ...balanceValueStyles, color: theme.colors.primary }}>
            {walletData.availableBalance.toFixed(2)} BZY
          </p>
        </Card>

        <Card style={balanceCardStyles}>
          <p style={balanceLabelStyles}>Pending</p>
          <p style={{ ...balanceValueStyles, color: theme.colors.info }}>
            {walletData.pendingBalance.toFixed(2)} BZY
          </p>
        </Card>
      </div>

      {/* Privy Wallet Connection */}
      {!walletConnected ? (
        <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg, borderLeft: `4px solid ${theme.colors.primary}` }}>
          <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
            🔐 Connect Wallet with Privy
          </h3>

          {!showMagicLinkForm ? (
            <div>
              <p style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.secondary }}>
                Connect your wallet securely using magic link authentication. No passwords needed!
              </p>
              <Button
                variant="primary"
                onClick={() => setShowMagicLinkForm(true)}
                style={{ width: '100%' }}
              >
                🔗 Connect via Magic Link
              </Button>
            </div>
          ) : (
            <div style={{
              padding: theme.spacing.lg,
              backgroundColor: theme.colors.background.tertiary,
              borderRadius: theme.borderRadius.md,
            }}>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.sm,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
                fontWeight: 600,
              }}>
                Email Address *
              </label>
              <input
                type="email"
                value={magicLinkEmail}
                onChange={(e) => setMagicLinkEmail(e.target.value)}
                placeholder="your.email@example.com"
                style={{
                  width: '100%',
                  padding: theme.spacing.md,
                  borderRadius: theme.borderRadius.md,
                  border: `1px solid ${theme.colors.gray[700]}`,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.base,
                  boxSizing: 'border-box',
                  marginBottom: theme.spacing.md,
                }}
              />

              <p style={{
                margin: 0,
                marginBottom: theme.spacing.md,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}>
                💡 We'll send a secure magic link to your email to create and connect your embedded wallet.
              </p>

              <div style={{ display: 'flex', gap: theme.spacing.md }}>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowMagicLinkForm(false);
                    setMagicLinkSent(false);
                  }}
                  style={{ flex: 1 }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSendMagicLink}
                  style={{ flex: 1 }}
                >
                  📧 Send Magic Link
                </Button>
              </div>

              {magicLinkSent && (
                <div style={{
                  marginTop: theme.spacing.lg,
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.success,
                  borderRadius: theme.borderRadius.md,
                  color: 'white',
                }}>
                  <p style={{ margin: 0, fontWeight: 600 }}>
                    ✅ Magic link sent to {magicLinkEmail}
                  </p>
                  <p style={{ margin: 0, marginTop: theme.spacing.xs, fontSize: theme.typography.fontSize.sm }}>
                    Click the link in your email to verify and connect your wallet
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleVerifyAndConnectWallet}
                    style={{ marginTop: theme.spacing.md, width: '100%' }}
                  >
                    ✓ Confirm Wallet Connection
                  </Button>
                </div>
              )}
            </div>
          )}
        </Card>
      ) : (
        <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg, borderLeft: `4px solid ${theme.colors.success}` }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: theme.spacing.lg,
          }}>
            <h3 style={{ margin: 0, color: theme.colors.success }}>
              ✅ Wallet Connected
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setWalletConnected(false);
                setMagicLinkEmail('');
                setMagicLinkSent(false);
              }}
            >
              🔄 Disconnect
            </Button>
          </div>

          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
          }}>
            <p style={{
              margin: 0,
              marginBottom: theme.spacing.sm,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
            }}>
              Connected Email
            </p>
            <p style={{
              margin: 0,
              color: theme.colors.text.primary,
              fontWeight: 600,
              marginBottom: theme.spacing.lg,
            }}>
              {magicLinkEmail}
            </p>

            <p style={{
              margin: 0,
              marginBottom: theme.spacing.sm,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
            }}>
              Privy Embedded Wallet
            </p>
            <p style={{
              margin: 0,
              color: theme.colors.primary,
              fontWeight: 600,
              fontFamily: 'monospace',
              fontSize: theme.typography.fontSize.sm,
              wordBreak: 'break-all',
            }}>
              {walletData.walletAddress}
            </p>
          </div>
        </Card>
      )}

      {/* Wallet Address Section */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
          🔐 Wallet Address
        </h3>

        <label style={labelStyles}>Your Wallet Address</label>
        <input
          type="text"
          value={walletData.walletAddress}
          onChange={(e) => setWalletData({ ...walletData, walletAddress: e.target.value })}
          placeholder="Enter your blockchain wallet address"
          style={inputFieldStyles}
        />

        <Button
          variant="secondary"
          onClick={() => {
            localStorage.setItem('wallet_address', walletData.walletAddress);
            alert('✅ Wallet address saved');
          }}
        >
          💾 Save Address
        </Button>
      </Card>

      {/* Request Payout Section */}
      <Card style={{ padding: theme.spacing.lg, marginBottom: theme.spacing.lg }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
        }}>
          <h3 style={{ margin: 0, color: theme.colors.text.primary }}>Request Payout</h3>
          <Button
            variant={showPayoutForm ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => setShowPayoutForm(!showPayoutForm)}
          >
            {showPayoutForm ? '✕ Cancel' : '➕ New Payout'}
          </Button>
        </div>

        {showPayoutForm && (
          <div style={{
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
          }}>
            <label style={labelStyles}>Amount (BZY)</label>
            <input
              type="number"
              value={payoutForm.amount}
              onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })}
              placeholder="0.00"
              max={walletData.availableBalance}
              style={inputFieldStyles}
            />
            <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Available: {walletData.availableBalance.toFixed(2)} BZY
            </p>

            <label style={{ ...labelStyles, marginTop: theme.spacing.md }}>Payout Method</label>
            <select
              value={payoutForm.method}
              onChange={(e) => setPayoutForm({ ...payoutForm, method: e.target.value })}
              style={inputFieldStyles}
            >
              <option value="bank">Bank Transfer</option>
              <option value="crypto">Crypto Wallet</option>
              <option value="paypal">PayPal</option>
            </select>

            <label style={labelStyles}>Account Details</label>
            <textarea
              value={payoutForm.accountDetails}
              onChange={(e) => setPayoutForm({ ...payoutForm, accountDetails: e.target.value })}
              placeholder="Enter your account details (bank account, crypto address, etc.)"
              style={{
                ...inputFieldStyles,
                minHeight: '80px',
                fontFamily: 'inherit',
                resize: 'vertical',
              }}
            />

            <Button
              variant="primary"
              onClick={handleRequestPayout}
              style={{ width: '100%' }}
            >
              ✓ Request Payout
            </Button>
          </div>
        )}
      </Card>

      {/* Payout History */}
      <Card>
        <h3 style={{ margin: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
          📋 Payout History
        </h3>

        {payoutRecords.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: theme.colors.text.primary,
            }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                  <th style={{ textAlign: 'left', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Date
                  </th>
                  <th style={{ textAlign: 'left', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Method
                  </th>
                  <th style={{ textAlign: 'right', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Amount
                  </th>
                  <th style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {payoutRecords.map((record) => (
                  <tr key={record.id} style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                    <td style={{ padding: theme.spacing.md, color: theme.colors.text.primary }}>
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                      {record.method}
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.accent, fontWeight: 600 }}>
                      {record.amount.toFixed(2)} BZY
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'center' }}>
                      <span style={statusBadgeStyles(record.status)}>
                        {record.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: theme.colors.text.secondary, textAlign: 'center' }}>
            No payout history yet
          </p>
        )}
      </Card>
    </Container>
  );
};

export default PayoutsPage;
