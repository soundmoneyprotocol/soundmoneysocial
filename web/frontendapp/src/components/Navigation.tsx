import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme/theme';
import MonetizationModal from './MonetizationModal';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

interface ProfileMenuItem {
  label: string;
  icon: string;
  action: () => void;
}

const navItems: NavItem[] = [
  { label: 'Feed', path: '/', icon: '🏠' },
  { label: 'Analytics', path: '/analytics', icon: '📊' },
  { label: 'Music Portal', path: '/music-portal', icon: '🎵' },
  { label: 'Dashboard', path: '/dashboard', icon: '👤' },
];

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const profileMenuItems: ProfileMenuItem[] = [
    {
      label: 'View Profile',
      icon: '👤',
      action: () => {
        navigate('/profile');
        setShowProfileDropdown(false);
      },
    },
    {
      label: 'Monetization',
      icon: '💰',
      action: () => {
        setShowMonetizationModal(true);
        setShowProfileDropdown(false);
      },
    },
    {
      label: 'Account Settings',
      icon: '⚙️',
      action: () => {
        navigate('/settings');
        setShowProfileDropdown(false);
      },
    },
    {
      label: 'Wallet & Payouts',
      icon: '💳',
      action: () => {
        navigate('/payouts');
        setShowProfileDropdown(false);
      },
    },
    {
      label: 'Tickets & Events',
      icon: '🎫',
      action: () => {
        navigate('/tickets');
        setShowProfileDropdown(false);
      },
    },
    {
      label: 'Referrals',
      icon: '🤝',
      action: () => {
        navigate('/referrals');
        setShowProfileDropdown(false);
      },
    },
    {
      label: 'Privacy Tools',
      icon: '🔒',
      action: () => {
        navigate('/privacy');
        setShowProfileDropdown(false);
      },
    },
    {
      label: 'Logout',
      icon: '🚪',
      action: () => {
        handleLogout();
        setShowProfileDropdown(false);
      },
    },
  ];

  const navStyles: React.CSSProperties = {
    backgroundColor: theme.colors.background.secondary,
    borderBottom: `1px solid ${theme.colors.gray[800]}`,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const containerStyles: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xl,
    justifyContent: 'space-between',
  };

  const leftContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.xl,
    flex: 1,
  };

  const logoStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    textDecoration: 'none',
    marginRight: theme.spacing.lg,
  };

  const navListStyles: React.CSSProperties = {
    display: 'flex',
    gap: theme.spacing.lg,
    listStyle: 'none',
    margin: 0,
    padding: 0,
    flex: 1,
  };

  const navItemStyles: (isActive: boolean) => React.CSSProperties = (isActive) => ({
    textDecoration: 'none',
    color: isActive ? theme.colors.primary : theme.colors.text.secondary,
    fontWeight: theme.typography.fontWeight.medium,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    borderRadius: theme.borderRadius.md,
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    cursor: 'pointer',
  });

  const rightContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    position: 'relative',
  };

  const profileButtonStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    backgroundColor: theme.colors.background.tertiary,
    color: theme.colors.text.primary,
    border: `1px solid ${theme.colors.gray[700]}`,
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.medium,
    transition: 'all 0.2s ease',
  };

  const dropdownStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    border: `1px solid ${theme.colors.gray[700]}`,
    borderRadius: theme.borderRadius.md,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    minWidth: '200px',
    zIndex: 1000,
    overflow: 'hidden',
  };

  const dropdownItemStyles: (isLastItem?: boolean) => React.CSSProperties = (isLastItem = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.sm,
    padding: `${theme.spacing.md} ${theme.spacing.lg}`,
    color: isLastItem ? theme.colors.danger : theme.colors.text.primary,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    borderBottom: isLastItem ? 'none' : `1px solid ${theme.colors.gray[800]}`,
    fontSize: theme.typography.fontSize.sm,
  });

  const dropdownItemHoverStyles: React.CSSProperties = {
    backgroundColor: theme.colors.background.tertiary,
  };

  return (
    <>
      <nav style={navStyles}>
        <div style={containerStyles}>
          <div style={leftContainerStyles}>
            <Link to="/" style={logoStyles}>
              🎵 SoundMoney
            </Link>
            <ul style={navListStyles}>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      style={navItemStyles(isActive)}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          <div style={rightContainerStyles}>
            {user && (
              <div style={{ position: 'relative' }}>
                <button
                  style={profileButtonStyles}
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
                    e.currentTarget.style.borderColor = theme.colors.primary;
                    e.currentTarget.style.color = theme.colors.primary;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.background.tertiary;
                    e.currentTarget.style.borderColor = theme.colors.gray[700];
                    e.currentTarget.style.color = theme.colors.text.primary;
                  }}
                >
                  <span>👤</span>
                  <span>{user.username}</span>
                  <span style={{ fontSize: '12px', marginLeft: theme.spacing.xs }}>
                    {showProfileDropdown ? '▲' : '▼'}
                  </span>
                </button>

                {showProfileDropdown && (
                  <div style={dropdownStyles}>
                    {profileMenuItems.map((item, index) => (
                      <div
                        key={index}
                        style={dropdownItemStyles(index === profileMenuItems.length - 1)}
                        onClick={() => {
                          item.action();
                          setShowProfileDropdown(false);
                        }}
                        onMouseEnter={(e) => {
                          Object.assign(e.currentTarget.style, dropdownItemHoverStyles);
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Close dropdown when clicking outside */}
        {showProfileDropdown && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999,
            }}
            onClick={() => setShowProfileDropdown(false)}
          />
        )}
      </nav>

      {/* Monetization Modal */}
      <MonetizationModal
        isOpen={showMonetizationModal}
        onClose={() => setShowMonetizationModal(false)}
      />
    </>
  );
};

export default Navigation;
