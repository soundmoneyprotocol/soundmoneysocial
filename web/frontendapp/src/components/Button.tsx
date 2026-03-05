import React from 'react';
import { theme } from '../theme/theme';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      isDisabled = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const baseStyles: React.CSSProperties = {
      fontFamily: theme.typography.fontFamily.primary,
      fontWeight: theme.typography.fontWeight.semibold,
      borderRadius: theme.borderRadius.md,
      border: 'none',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: theme.spacing.sm,
      opacity: isDisabled ? 0.6 : 1,
    };

    const sizeStyles: { [key: string]: React.CSSProperties } = {
      sm: {
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        fontSize: theme.typography.fontSize.sm,
        minHeight: '32px',
      },
      md: {
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        fontSize: theme.typography.fontSize.base,
        minHeight: '40px',
      },
      lg: {
        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
        fontSize: theme.typography.fontSize.lg,
        minHeight: '48px',
      },
    };

    const variantStyles: { [key: string]: React.CSSProperties } = {
      primary: {
        backgroundColor: theme.colors.primary,
        color: theme.colors.white,
      },
      secondary: {
        backgroundColor: theme.colors.gray[800],
        color: theme.colors.text.primary,
      },
      outline: {
        backgroundColor: 'transparent',
        color: theme.colors.primary,
        border: `2px solid ${theme.colors.primary}`,
      },
      ghost: {
        backgroundColor: 'transparent',
        color: theme.colors.text.primary,
      },
    };

    const combinedStyles: React.CSSProperties = {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };

    return (
      <button
        ref={ref}
        style={combinedStyles}
        disabled={isDisabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <span className="loading-spinner" />
            {children}
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
