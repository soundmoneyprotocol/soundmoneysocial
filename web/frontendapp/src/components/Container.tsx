import React from 'react';
import { theme } from '../theme/theme';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  (
    {
      children,
      maxWidth = 'lg',
      padding = 'md',
      style,
      ...props
    },
    ref
  ) => {
    const maxWidthStyles: { [key: string]: string } = {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      full: '100%',
    };

    const paddingStyles: { [key: string]: string } = {
      none: '0',
      sm: theme.spacing.md,
      md: theme.spacing.lg,
      lg: theme.spacing.xl,
    };

    const containerStyles: React.CSSProperties = {
      maxWidth: maxWidthStyles[maxWidth],
      margin: '0 auto',
      padding: paddingStyles[padding],
      width: '100%',
      boxSizing: 'border-box',
      ...style,
    };

    return (
      <div ref={ref} style={containerStyles} {...props}>
        {children}
      </div>
    );
  }
);

Container.displayName = 'Container';

export default Container;
