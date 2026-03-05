import React from 'react';
import { theme } from '../theme/theme';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      style,
      ...props
    },
    ref
  ) => {
    const variantStyles: { [key: string]: { bg: string; color: string } } = {
      success: {
        bg: theme.colors.success,
        color: theme.colors.white,
      },
      warning: {
        bg: theme.colors.warning,
        color: theme.colors.black,
      },
      danger: {
        bg: theme.colors.danger,
        color: theme.colors.white,
      },
      info: {
        bg: theme.colors.info,
        color: theme.colors.black,
      },
      default: {
        bg: theme.colors.gray[800],
        color: theme.colors.text.primary,
      },
    };

    const sizeStyles: { [key: string]: React.CSSProperties } = {
      sm: {
        padding: `${theme.spacing.xs} ${theme.spacing.sm}`,
        fontSize: theme.typography.fontSize.xs,
      },
      md: {
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        fontSize: theme.typography.fontSize.sm,
      },
      lg: {
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        fontSize: theme.typography.fontSize.base,
      },
    };

    const { bg, color } = variantStyles[variant];

    const badgeStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: bg,
      color,
      borderRadius: theme.borderRadius.full,
      fontWeight: theme.typography.fontWeight.semibold,
      ...sizeStyles[size],
      ...style,
    };

    return (
      <span ref={ref} style={badgeStyles} {...props}>
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export default Badge;
