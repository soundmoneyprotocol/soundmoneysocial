import React from 'react';
import { theme } from '../theme/theme';

export interface HeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

const Header = React.forwardRef<HTMLDivElement, HeaderProps>(
  (
    {
      title,
      subtitle,
      action,
      style,
      ...props
    },
    ref
  ) => {
    const headerStyles: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: theme.spacing.lg,
      borderBottom: `1px solid ${theme.colors.gray[800]}`,
      marginBottom: theme.spacing.lg,
      ...style,
    };

    const titleContainerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.xs,
    };

    const titleStyles: React.CSSProperties = {
      fontSize: theme.typography.fontSize.xxxl,
      fontWeight: theme.typography.fontWeight.bold,
      color: theme.colors.text.primary,
      margin: 0,
    };

    const subtitleStyles: React.CSSProperties = {
      fontSize: theme.typography.fontSize.base,
      color: theme.colors.text.secondary,
      margin: 0,
    };

    return (
      <div ref={ref} style={headerStyles} {...props}>
        <div style={titleContainerStyles}>
          <h1 style={titleStyles}>{title}</h1>
          {subtitle && <p style={subtitleStyles}>{subtitle}</p>}
        </div>
        {action && <div>{action}</div>}
      </div>
    );
  }
);

Header.displayName = 'Header';

export default Header;
