import React, { useState, useEffect } from 'react';
import { theme } from '../theme/theme';

interface EmbedWidgetProps {
  artistName?: string;
  trackTitle?: string;
  spotifyUrl?: string;
  youtubeUrl?: string;
  isEmbed?: boolean;
}

export const EmbedWidget: React.FC<EmbedWidgetProps> = ({
  artistName = 'Your Artist Name',
  trackTitle = 'Your Track',
  spotifyUrl = '',
  youtubeUrl = '',
  isEmbed = false,
}) => {
  const [bzyCounter, setBzyCounter] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Simulate BZY earnings counter
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setBzyCounter((prev) => prev + 0.0015);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const embedCode = `<iframe
  src="https://soundmoney.io/embed/widget?artist=${encodeURIComponent(artistName)}&track=${encodeURIComponent(trackTitle)}&spotify=${encodeURIComponent(spotifyUrl)}"
  width="300"
  height="400"
  style="border: none; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"
  allow="autoplay"
></iframe>`;

  const widgetStyles: React.CSSProperties = {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    border: `1px solid ${theme.colors.gray[700]}`,
    maxWidth: '350px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  };

  const counterStyles: React.CSSProperties = {
    fontSize: '32px',
    fontWeight: 'bold',
    color: theme.colors.accent,
    textAlign: 'center',
    margin: `${theme.spacing.md} 0`,
    fontFamily: 'monospace',
  };

  const playerButtonStyles: React.CSSProperties = {
    width: '100%',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    border: 'none',
    backgroundColor: isPlaying ? theme.colors.primary : theme.colors.background.tertiary,
    color: isPlaying ? '#fff' : theme.colors.text.primary,
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: theme.typography.fontSize.base,
    marginBottom: theme.spacing.md,
    transition: 'all 0.3s ease',
  };

  return (
    <div style={widgetStyles}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: theme.spacing.md }}>
        <p style={{ margin: '0 0 4px 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
          🎵 Now Streaming
        </p>
        <h4 style={{ margin: 0, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.base }}>
          {trackTitle}
        </h4>
        <p style={{ margin: '4px 0 0 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
          by {artistName}
        </p>
      </div>

      {/* BZY Counter */}
      <div style={{
        backgroundColor: theme.colors.background.primary,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.md,
      }}>
        <p style={{ margin: 0, marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm, textAlign: 'center' }}>
          💰 BZY Earned This Session
        </p>
        <div style={counterStyles}>
          {bzyCounter.toFixed(4)}
        </div>
        <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs, textAlign: 'center' }}>
          {isPlaying ? '▶️ Earning in real-time' : '⏸️ Press play to earn'}
        </p>
      </div>

      {/* Play/Pause Button */}
      <button
        style={playerButtonStyles}
        onClick={() => setIsPlaying(!isPlaying)}
        onMouseEnter={(e) => {
          e.currentTarget.style.opacity = '0.8';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
        }}
      >
        {isPlaying ? '⏸️ Stop Streaming' : '▶️ Play & Earn BZY'}
      </button>

      {/* Platform Links */}
      <div style={{ display: 'flex', gap: theme.spacing.sm, marginBottom: theme.spacing.md }}>
        {spotifyUrl && (
          <a
            href={spotifyUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.background.tertiary,
              color: theme.colors.text.primary,
              textDecoration: 'none',
              borderRadius: theme.borderRadius.md,
              textAlign: 'center',
              fontSize: theme.typography.fontSize.sm,
              cursor: 'pointer',
              border: `1px solid ${theme.colors.gray[700]}`,
            }}
          >
            🎵 Spotify
          </a>
        )}
        {youtubeUrl && (
          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.background.tertiary,
              color: theme.colors.text.primary,
              textDecoration: 'none',
              borderRadius: theme.borderRadius.md,
              textAlign: 'center',
              fontSize: theme.typography.fontSize.sm,
              cursor: 'pointer',
              border: `1px solid ${theme.colors.gray[700]}`,
            }}
          >
            📺 YouTube
          </a>
        )}
      </div>

      {/* Footer */}
      {!isEmbed && (
        <div style={{
          padding: `${theme.spacing.md} 0`,
          borderTop: `1px solid ${theme.colors.gray[800]}`,
          marginTop: theme.spacing.md,
        }}>
          <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs, textAlign: 'center' }}>
            Powered by <strong>SoundMoney</strong>
          </p>
          <p style={{ margin: '4px 0 0 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs, textAlign: 'center' }}>
            🎵 Real earnings for real artists
          </p>
        </div>
      )}
    </div>
  );
};

export default EmbedWidget;
