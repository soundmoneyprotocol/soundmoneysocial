import React, { useEffect, useRef, useState } from 'react';
import { theme } from '../theme/theme';

interface AudioPlayerProps {
  audioUrl?: string;
  trackTitle?: string;
  artistName?: string;
  onPlayingChange?: (isPlaying: boolean) => void;
  onEnded?: () => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  audioUrl,
  trackTitle,
  artistName,
  onPlayingChange,
  onEnded,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasAudio, setHasAudio] = useState(!!audioUrl);

  useEffect(() => {
    setHasAudio(!!audioUrl);
    if (audioRef.current) {
      audioRef.current.src = audioUrl || '';
    }
  }, [audioUrl]);

  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(error => {
        console.error('Failed to play audio:', error);
        setHasAudio(false);
      });
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    onEnded?.();
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audioRef.current.currentTime = percent * duration;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div style={{
      backgroundColor: theme.colors.gray[900],
      borderRadius: 12,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.lg,
    }}>
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={() => setHasAudio(false)}
      />

      {!hasAudio && (
        <div style={{
          textAlign: 'center',
          color: theme.colors.text.secondary,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          backgroundColor: theme.colors.gray[800],
          borderRadius: 8,
          fontSize: theme.typography.fontSize.sm,
        }}>
          🎵 Preview audio not available for this track
        </div>
      )}

      {/* Track Info */}
      <div style={{ marginBottom: theme.spacing.md }}>
        <p style={{
          margin: 0,
          marginBottom: '4px',
          color: theme.colors.text.primary,
          fontWeight: 600,
          fontSize: theme.typography.fontSize.base,
        }}>
          {trackTitle || 'Unknown Track'}
        </p>
        <p style={{
          margin: 0,
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.sm,
        }}>
          {artistName || 'Unknown Artist'}
        </p>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: theme.spacing.md }}>
        <div
          onClick={handleProgressClick}
          style={{
            height: '6px',
            backgroundColor: theme.colors.gray[800],
            borderRadius: '3px',
            cursor: 'pointer',
            overflow: 'hidden',
            marginBottom: theme.spacing.sm,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: theme.colors.accent,
              transition: 'width 0.1s linear',
            }}
          />
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: theme.typography.fontSize.xs,
          color: theme.colors.text.secondary,
        }}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        gap: theme.spacing.md,
        alignItems: 'center',
      }}>
        <button
          onClick={handlePlayPause}
          disabled={!hasAudio}
          style={{
            flex: 1,
            padding: `${theme.spacing.sm} ${theme.spacing.md}`,
            backgroundColor: hasAudio ? theme.colors.accent : theme.colors.gray[700],
            color: hasAudio ? theme.colors.gray[900] : theme.colors.text.secondary,
            border: 'none',
            borderRadius: 8,
            fontSize: theme.typography.fontSize.base,
            fontWeight: 600,
            cursor: hasAudio ? 'pointer' : 'not-allowed',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            if (hasAudio) {
              (e.target as HTMLButtonElement).style.opacity = '0.9';
            }
          }}
          onMouseLeave={(e) => {
            if (hasAudio) {
              (e.target as HTMLButtonElement).style.opacity = '1';
            }
          }}
        >
          {isPlaying ? '⏸ Pause' : '▶ Play Preview'}
        </button>

        <div style={{
          padding: theme.spacing.sm,
          backgroundColor: theme.colors.gray[800],
          borderRadius: 8,
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.sm,
          minWidth: '60px',
          textAlign: 'center',
        }}>
          {isPlaying ? '🎵 Playing' : 'Stopped'}
        </div>
      </div>

      <p style={{
        margin: 0,
        marginTop: theme.spacing.md,
        color: theme.colors.text.secondary,
        fontSize: theme.typography.fontSize.xs,
        fontStyle: 'italic',
      }}>
        💡 Preview is a 30-second sample from Spotify
      </p>
    </div>
  );
};

export default AudioPlayer;
