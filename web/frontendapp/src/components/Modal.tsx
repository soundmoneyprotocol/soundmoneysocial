import React, { useEffect } from 'react';
import { theme } from '../theme/theme';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const overlayStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    boxShadow: theme.shadow.xl,
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
    borderBottom: `1px solid ${theme.colors.gray[800]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleStyles: React.CSSProperties = {
    margin: 0,
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: theme.colors.text.secondary,
    fontSize: theme.typography.fontSize.xl,
    cursor: 'pointer',
    padding: 0,
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const contentStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
    flex: 1,
    overflow: 'auto',
  };

  const footerStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
    borderTop: `1px solid ${theme.colors.gray[800]}`,
    display: 'flex',
    gap: theme.spacing.md,
    justifyContent: 'flex-end',
  };

  return (
    <div style={overlayStyles} onClick={onClose}>
      <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
        {title && (
          <div style={headerStyles}>
            <h2 style={titleStyles}>{title}</h2>
            <button
              style={closeButtonStyles}
              onClick={onClose}
              aria-label="Close modal"
            >
              ✕
            </button>
          </div>
        )}
        <div style={contentStyles}>{children}</div>
        {footer && <div style={footerStyles}>{footer}</div>}
      </div>
    </div>
  );
};

export default Modal;
