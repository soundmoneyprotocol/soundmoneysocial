import React from 'react';
import { theme } from '../theme/theme';

export interface AvatarProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  initials?: string;
}

const Avatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  (
    {
      src,
      alt,
      size = 'md',
      initials,
      style,
      ...props
    },
    ref
  ) => {
    const sizeStyles: { [key: string]: number } = {
      sm: 32,
      md: 48,
      lg: 64,
      xl: 96,
    };

    const sizeValue = sizeStyles[size];

    const avatarStyles: React.CSSProperties = {
      width: sizeValue,
      height: sizeValue,
      borderRadius: theme.borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: theme.colors.gray[800],
      border: `2px solid ${theme.colors.gray[700]}`,
      ...style,
    };

    if (src) {
      return (
        <img
          ref={ref}
          src={src}
          alt={alt}
          style={avatarStyles}
          {...props}
        />
      );
    }

    const initialsStyles: React.CSSProperties = {
      width: sizeValue,
      height: sizeValue,
      borderRadius: theme.borderRadius.full,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      color: theme.colors.white,
      fontSize: sizeValue / 2.5,
      fontWeight: theme.typography.fontWeight.bold,
      border: `2px solid ${theme.colors.gray[700]}`,
    };

    return (
      <div style={initialsStyles} title={alt}>
        {initials || alt.charAt(0).toUpperCase()}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export default Avatar;
