import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import Badge from './Badge';
import { theme } from '../theme/theme';

interface MonetizationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type MonetizationTab = 'tip' | 'buy' | 'stake';
type PaymentMethod = 'card' | 'stablecoin' | 'crypto';

export const MonetizationModal: React.FC<MonetizationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<MonetizationTab>('tip');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card');
  const [tipAmount, setTipAmount] = useState('10');
  const [buyAmount, setBuyAmount] = useState('100');
  const [stakeAmount, setStakeAmount] = useState('0');
  const [selectedStablecoin, setSelectedStablecoin] = useState('USDC');
  const [walletAddress, setWalletAddress] = useState('');
  const [processing, setProcessing] = useState(false);

  const stablecoins = [
    { name: 'USDC', icon: '◎', chain: 'Solana' },
    { name: 'USDT', icon: '◎', chain: 'Solana' },
    { name: 'USDC.e', icon: '⟠', chain: 'Polygon' },
  ];

  const handleTip = async () => {
    setProcessing(true);
    try {
      // Simulate API call
      setTimeout(() => {
        alert(`✅ Tipped $${tipAmount} USD via ${paymentMethod}`);
        setProcessing(false);
      }, 1000);
    } catch (error) {
      alert('❌ Tip failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleBuy = async () => {
    setProcessing(true);
    try {
      // Simulate API call
      const bezyAmount = (parseFloat(buyAmount) * 1000) / 0.001; // Mock conversion
      setTimeout(() => {
        alert(`✅ Purchased ${bezyAmount.toFixed(0)} BZY for $${buyAmount} via ${paymentMethod}`);
        setProcessing(false);
      }, 1000);
    } catch (error) {
      alert('❌ Purchase failed. Please try again.');
      setProcessing(false);
    }
  };

  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('❌ Please enter a valid amount to stake');
      return;
    }

    setProcessing(true);
    try {
      setTimeout(() => {
        alert(`✅ Staked ${stakeAmount} BZY`);
        setStakeAmount('0');
        setProcessing(false);
      }, 1000);
    } catch (error) {
      alert('❌ Staking failed. Please try again.');
      setProcessing(false);
    }
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
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: theme.spacing.lg,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
          <h2 style={{ margin: 0, color: theme.colors.text.primary }}>
            💰 Monetization Hub
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
        <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.lg }}>
          {(['tip', 'buy', 'stake'] as MonetizationTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                flex: 1,
                padding: theme.spacing.md,
                borderRadius: theme.borderRadius.md,
                border: 'none',
                backgroundColor: activeTab === tab ? theme.colors.primary : theme.colors.background.secondary,
                color: activeTab === tab ? '#fff' : theme.colors.text.secondary,
                cursor: 'pointer',
                fontWeight: activeTab === tab ? '600' : '400',
                fontSize: theme.typography.fontSize.base,
                textTransform: 'capitalize',
              }}
            >
              {tab === 'tip' && '💳 Tip'}
              {tab === 'buy' && '🛒 Buy BZY'}
              {tab === 'stake' && '📈 Stake'}
            </button>
          ))}
        </div>

        {/* Tip Tab */}
        {activeTab === 'tip' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Support creators with a tip in USD or crypto
            </p>

            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.xs,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}>
                Tip Amount (USD)
              </label>
              <input
                type="number"
                value={tipAmount}
                onChange={(e) => setTipAmount(e.target.value)}
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
                placeholder="10"
                min="1"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.sm,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}>
                Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: theme.spacing.sm }}>
                {(['card', 'stablecoin', 'crypto'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.md,
                      border: `2px solid ${paymentMethod === method ? theme.colors.primary : theme.colors.gray[700]}`,
                      backgroundColor: paymentMethod === method ? `${theme.colors.primary}20` : theme.colors.background.secondary,
                      color: theme.colors.text.primary,
                      cursor: 'pointer',
                      fontWeight: paymentMethod === method ? '600' : '400',
                      fontSize: theme.typography.fontSize.sm,
                    }}
                  >
                    {method === 'card' && '💳 Card'}
                    {method === 'stablecoin' && '🪙 Stablecoin'}
                    {method === 'crypto' && '🔗 Crypto'}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'stablecoin' && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: theme.spacing.sm,
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}>
                  Select Stablecoin
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
                  {stablecoins.map((coin) => (
                    <button
                      key={coin.name}
                      onClick={() => setSelectedStablecoin(coin.name)}
                      style={{
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.md,
                        border: `1px solid ${selectedStablecoin === coin.name ? theme.colors.primary : theme.colors.gray[700]}`,
                        backgroundColor: selectedStablecoin === coin.name ? `${theme.colors.primary}20` : theme.colors.background.secondary,
                        color: theme.colors.text.primary,
                        cursor: 'pointer',
                        fontSize: theme.typography.fontSize.sm,
                      }}
                    >
                      {coin.icon} {coin.name}
                      <br />
                      <small style={{ color: theme.colors.text.secondary }}>{coin.chain}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleTip}
              style={{ width: '100%' }}
            >
              {processing ? '⏳ Processing...' : `💳 Tip $${tipAmount} USD`}
            </Button>
          </div>
        )}

        {/* Buy Tab */}
        {activeTab === 'buy' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Purchase BZY tokens to start earning and supporting creators
            </p>

            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.xs,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}>
                Amount (USD)
              </label>
              <input
                type="number"
                value={buyAmount}
                onChange={(e) => setBuyAmount(e.target.value)}
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
                placeholder="100"
                min="1"
              />
              <small style={{ color: theme.colors.text.secondary, marginTop: theme.spacing.xs }}>
                1 USD = ~1000 BZY tokens
              </small>
            </div>

            <div style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.background.secondary,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.gray[700]}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
                <span style={{ color: theme.colors.text.secondary }}>You Get:</span>
                <span style={{ color: theme.colors.accent, fontWeight: '600' }}>
                  {((parseFloat(buyAmount) || 0) * 1000).toLocaleString()} BZY
                </span>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.sm,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}>
                Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: theme.spacing.sm }}>
                {(['card', 'stablecoin', 'crypto'] as PaymentMethod[]).map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      padding: theme.spacing.sm,
                      borderRadius: theme.borderRadius.md,
                      border: `2px solid ${paymentMethod === method ? theme.colors.primary : theme.colors.gray[700]}`,
                      backgroundColor: paymentMethod === method ? `${theme.colors.primary}20` : theme.colors.background.secondary,
                      color: theme.colors.text.primary,
                      cursor: 'pointer',
                      fontWeight: paymentMethod === method ? '600' : '400',
                      fontSize: theme.typography.fontSize.sm,
                    }}
                  >
                    {method === 'card' && '💳 Card'}
                    {method === 'stablecoin' && '🪙 Stablecoin'}
                    {method === 'crypto' && '🔗 Crypto'}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'stablecoin' && (
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: theme.spacing.sm,
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}>
                  Select Stablecoin
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.sm }}>
                  {stablecoins.map((coin) => (
                    <button
                      key={coin.name}
                      onClick={() => setSelectedStablecoin(coin.name)}
                      style={{
                        padding: theme.spacing.sm,
                        borderRadius: theme.borderRadius.md,
                        border: `1px solid ${selectedStablecoin === coin.name ? theme.colors.primary : theme.colors.gray[700]}`,
                        backgroundColor: selectedStablecoin === coin.name ? `${theme.colors.primary}20` : theme.colors.background.secondary,
                        color: theme.colors.text.primary,
                        cursor: 'pointer',
                        fontSize: theme.typography.fontSize.sm,
                      }}
                    >
                      {coin.icon} {coin.name}
                      <br />
                      <small style={{ color: theme.colors.text.secondary }}>{coin.chain}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleBuy}
              style={{ width: '100%' }}
            >
              {processing ? '⏳ Processing...' : `🛒 Buy ${((parseFloat(buyAmount) || 0) * 1000).toLocaleString()} BZY`}
            </Button>
          </div>
        )}

        {/* Stake Tab */}
        {activeTab === 'stake' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Stake your BZY tokens to earn passive rewards
            </p>

            <div style={{
              padding: theme.spacing.md,
              backgroundColor: theme.colors.background.secondary,
              borderRadius: theme.borderRadius.md,
              border: `1px solid ${theme.colors.gray[700]}`
            }}>
              <div style={{ marginBottom: theme.spacing.sm }}>
                <small style={{ color: theme.colors.text.secondary }}>Available Balance:</small>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: theme.colors.accent }}>
                  1,250.5000 BZY
                </p>
              </div>
              <div style={{ marginBottom: 0 }}>
                <small style={{ color: theme.colors.text.secondary }}>Currently Staked:</small>
                <p style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: theme.colors.primary }}>
                  500.0000 BZY
                </p>
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.xs,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}>
                Amount to Stake (BZY)
              </label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
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
                placeholder="0.0"
                min="0"
                step="0.0001"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.md }}>
              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.md,
              }}>
                <small style={{ color: theme.colors.text.secondary }}>APY</small>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: theme.colors.success || '#10b981' }}>
                  12.5%
                </p>
              </div>
              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.secondary,
                borderRadius: theme.borderRadius.md,
              }}>
                <small style={{ color: theme.colors.text.secondary }}>Lock Period</small>
                <p style={{ margin: 0, fontSize: '20px', fontWeight: '600', color: theme.colors.info }}>
                  30 days
                </p>
              </div>
            </div>

            {stakeAmount && parseFloat(stakeAmount) > 0 && (
              <div style={{
                padding: theme.spacing.md,
                backgroundColor: `${theme.colors.primary}20`,
                borderRadius: theme.borderRadius.md,
                border: `1px solid ${theme.colors.primary}`,
              }}>
                <small style={{ color: theme.colors.primary }}>Monthly Reward Estimate:</small>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: theme.colors.primary }}>
                  {(parseFloat(stakeAmount) * 0.125 / 12).toFixed(4)} BZY
                </p>
              </div>
            )}

            <Button
              variant="primary"
              onClick={handleStake}
              style={{ width: '100%' }}
            >
              {processing ? '⏳ Processing...' : `📈 Stake ${stakeAmount || '0'} BZY`}
            </Button>
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

export default MonetizationModal;
