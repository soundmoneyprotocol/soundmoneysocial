import React from 'react';
import { theme } from '../theme/theme';

export interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  fullScreen?: boolean;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'md',
  color = theme.colors.primary,
  fullScreen = false,
}) => {
  const sizeMap: { [key: string]: number } = {
    sm: 20,
    md: 40,
    lg: 60,
  };

  const spinnerSize = sizeMap[size];

  const containerStyles: React.CSSProperties = fullScreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background.primary,
        zIndex: 9999,
      }
    : {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.lg,
      };

  const spinnerStyles: React.CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    border: `3px solid ${theme.colors.gray[800]}`,
    borderTop: `3px solid ${color}`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <div style={containerStyles}>
        <div style={spinnerStyles} />
      </div>
    </>
  );
};

export default Loading;
