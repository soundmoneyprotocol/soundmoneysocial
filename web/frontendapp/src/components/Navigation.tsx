import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { theme } from '../theme/theme';

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: 'Feed', path: '/', icon: '🏠' },
  { label: 'Community', path: '/community', icon: '👥' },
  { label: 'Analytics', path: '/analytics', icon: '📊' },
  { label: 'Dashboard', path: '/dashboard', icon: '👤' },
];

const Navigation: React.FC = () => {
  const location = useLocation();

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

  return (
    <nav style={navStyles}>
      <div style={containerStyles}>
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
    </nav>
  );
};

export default Navigation;
