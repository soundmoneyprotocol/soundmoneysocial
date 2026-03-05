import React from 'react';
import { theme } from '../theme/theme';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  interactive?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, hoverable = false, interactive = false, style, ...props }, ref) => {
    const cardStyles: React.CSSProperties = {
      backgroundColor: theme.colors.background.secondary,
      border: `1px solid ${theme.colors.gray[800]}`,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      transition: 'all 0.2s ease',
      cursor: interactive ? 'pointer' : 'default',
      ...style,
    };

    if (hoverable || interactive) {
      return (
        <div
          ref={ref}
          style={cardStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = theme.shadow.lg;
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <div ref={ref} style={cardStyles} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
