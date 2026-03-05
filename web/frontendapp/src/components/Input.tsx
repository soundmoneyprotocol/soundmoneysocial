import React from 'react';
import { theme } from '../theme/theme';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      size = 'md',
      style,
      ...props
    },
    ref
  ) => {
    const sizeStyles: { [key: string]: React.CSSProperties } = {
      sm: {
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        fontSize: theme.typography.fontSize.sm,
      },
      md: {
        padding: `${theme.spacing.md} ${theme.spacing.md}`,
        fontSize: theme.typography.fontSize.base,
      },
      lg: {
        padding: `${theme.spacing.lg} ${theme.spacing.md}`,
        fontSize: theme.typography.fontSize.lg,
      },
    };

    const inputStyles: React.CSSProperties = {
      ...sizeStyles[size],
      width: '100%',
      backgroundColor: theme.colors.background.tertiary,
      color: theme.colors.text.primary,
      border: `1px solid ${error ? theme.colors.danger : theme.colors.gray[700]}`,
      borderRadius: theme.borderRadius.md,
      fontFamily: theme.typography.fontFamily.primary,
      transition: 'all 0.2s ease',
      boxSizing: 'border-box',
      ...style,
    };

    const containerStyles: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing.xs,
      width: '100%',
    };

    const labelStyles: React.CSSProperties = {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.primary,
    };

    const helperStyles: React.CSSProperties = {
      fontSize: theme.typography.fontSize.xs,
      color: error ? theme.colors.danger : theme.colors.text.secondary,
    };

    return (
      <div style={containerStyles}>
        {label && <label style={labelStyles}>{label}</label>}
        <input
          ref={ref}
          style={inputStyles}
          {...props}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = theme.colors.primary;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${theme.colors.primary}20`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error
              ? theme.colors.danger
              : theme.colors.gray[700];
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
        {(error || helperText) && (
          <p style={helperStyles}>{error || helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
