import React, { useState, useEffect, useRef } from 'react';
import { Container, Header, Card, Button, Avatar, Badge, Input } from '../components';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import { spotifyService } from '../services/spotifyService';
import AudioPlayer from '../components/AudioPlayer';
import { streamingHistoryService } from '../services/streamingHistoryService';
import { youtubeMusicService } from '../services/youtubeMusic';
import fileStorageService from '../services/fileStorageService';

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number; // in seconds
  coverUrl?: string;
  streamPrice: string; // BZY per second
  isPlaying: boolean;
  audioUrl?: string;
  source?: 'spotify' | 'uploaded';
}

interface PaymentStream {
  isActive: boolean;
  flowRate: string;
  totalEarned: string;
  artist: string;
  startTime?: number;
}

const genres = [
  { id: 'pop', name: 'Pop', emoji: '🎤' },
  { id: 'hip-hop', name: 'Hip Hop', emoji: '🎤' },
  { id: 'rock', name: 'Rock', emoji: '🎸' },
  { id: 'electronic', name: 'Electronic', emoji: '🎛️' },
  { id: 'indie', name: 'Indie', emoji: '🎵' },
  { id: 'jazz', name: 'Jazz', emoji: '🎺' },
];

const FeedPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState('pop');
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [paymentStream, setPaymentStream] = useState<PaymentStream>({
    isActive: false,
    flowRate: '0',
    totalEarned: '0',
    artist: '',
  });
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch tracks from Spotify and uploaded tracks when genre changes
  useEffect(() => {
    const fetchTracksFromSpotify = async () => {
      setLoading(true);
      try {
        // Get Spotify tracks
        const spotifyTracks = await spotifyService.searchTracksByGenre(selectedGenre, 20);
        const appTracks = spotifyTracks.map(track => spotifyService.convertToAppTrack(track));

        // Get uploaded tracks from Music Portal
        const uploadedTracksData = youtubeMusicService.getTracksByGenre(selectedGenre);
        
        // Convert uploaded tracks and fetch file data if available
        const uploadedTracks: Track[] = await Promise.all(
          uploadedTracksData.map(async (track) => {
            let audioUrl = '';
            
            // If track has file data in IndexedDB, fetch it
            if (track.fileType?.startsWith('audio/')) {
              try {
                const fileData = await fileStorageService.getFile(track.id);
                if (fileData) {
                  audioUrl = fileData.fileData;
                }
              } catch (error) {
                console.error('Error fetching file:', error);
              }
            }
            
            return {
              id: track.id,
              title: track.title,
              artist: track.artist,
              genre: track.genre,
              duration: track.duration,
              coverUrl: track.coverUrl,
              streamPrice: track.streamPrice,
              isPlaying: false,
              audioUrl: audioUrl || track.youtubeUrl, // Fallback to YouTube URL if available
              source: 'uploaded' as const,
            };
          })
        );

        // Combine Spotify and uploaded tracks, with uploaded tracks first
        const allTracks = [...uploadedTracks, ...appTracks];
        setTracks(allTracks);
        console.log(`✅ Loaded ${appTracks.length} Spotify + ${uploadedTracks.length} uploaded tracks for genre: ${selectedGenre}`);
      } catch (error) {
        console.error('Failed to fetch tracks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracksFromSpotify();
  }, [selectedGenre]);

  const startPaymentStream = (track: Track) => {
    // Stop previous stream if any
    stopPaymentStream();

    setCurrentTrack({ ...track, isPlaying: true });
    setPaymentStream({
      isActive: true,
      flowRate: track.streamPrice,
      totalEarned: '0',
      artist: track.artist,
      startTime: Date.now(),
    });

    startStreamingCounter(track.streamPrice);
  };

  const startStreamingCounter = (flowRate: string) => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    streamingIntervalRef.current = setInterval(() => {
      setPaymentStream(prev => {
        if (!prev.isActive) {
          if (streamingIntervalRef.current) {
            clearInterval(streamingIntervalRef.current);
            streamingIntervalRef.current = null;
          }
          return prev;
        }

        const flowRateNum = parseFloat(prev.flowRate);
        const currentTotal = parseFloat(prev.totalEarned);
        const newTotal = (currentTotal + flowRateNum).toFixed(6);

        return {
          ...prev,
          totalEarned: newTotal,
        };
      });
    }, 1000);
  };

  const stopPaymentStream = () => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }

    // Record the streaming session before stopping
    if (currentTrack && paymentStream.isActive) {
      const duration = paymentStream.startTime
        ? Math.floor((Date.now() - paymentStream.startTime) / 1000)
        : 0;

      streamingHistoryService.recordSession(
        currentTrack.id,
        currentTrack.title,
        currentTrack.artist,
        currentTrack.genre,
        paymentStream.flowRate,
        duration,
        paymentStream.totalEarned
      );

      console.log(`📊 Streaming session saved: ${paymentStream.totalEarned} BZY earned`);
    }

    if (currentTrack) {
      setCurrentTrack({ ...currentTrack, isPlaying: false });
    }

    setPaymentStream({
      isActive: false,
      flowRate: '0',
      totalEarned: '0',
      artist: '',
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container maxWidth="lg" padding="lg">
      <Header
        title="Distribute Music"
        subtitle="Discover tracks and earn BZY in real-time"
      />

      {/* BZY Earning Counter - Hero Section */}
      {paymentStream.isActive && (
        <Card
          style={{
            marginBottom: theme.spacing.lg,
            background: `linear-gradient(135deg, ${theme.colors.accent}, ${theme.colors.primary})`,
            padding: theme.spacing.lg,
            borderRadius: 16,
          }}
        >
          <div style={{ textAlign: 'center', color: 'white' }}>
            <p style={{ margin: 0, marginBottom: theme.spacing.sm, fontSize: '14px', opacity: 0.9 }}>
              🎵 Streaming to {paymentStream.artist}
            </p>
            <div style={{
              fontSize: '48px',
              fontWeight: 'bold',
              marginBottom: theme.spacing.sm,
              fontFamily: 'monospace',
            }}>
              {paymentStream.totalEarned} BZY
            </div>
            <p style={{ margin: 0, fontSize: '14px', opacity: 0.9 }}>
              +{paymentStream.flowRate} BZY/second
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={stopPaymentStream}
              style={{ marginTop: theme.spacing.md }}
            >
              ⏹️ Stop Streaming
            </Button>
          </div>
        </Card>
      )}

      {/* Audio Player */}
      {paymentStream.isActive && currentTrack && (
        <AudioPlayer
          audioUrl={currentTrack.audioUrl}
          trackTitle={currentTrack.title}
          artistName={currentTrack.artist}
          onEnded={stopPaymentStream}
        />
      )}

      {/* Genre Selection */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <h3 style={{
          color: theme.colors.text.primary,
          marginTop: 0,
          marginBottom: theme.spacing.md,
          fontSize: theme.typography.fontSize.lg,
        }}>
          Browse Genres
        </h3>
        <div style={{
          display: 'flex',
          gap: theme.spacing.md,
          overflowX: 'auto',
          paddingBottom: theme.spacing.sm,
        }}>
          {genres.map(genre => (
            <Button
              key={genre.id}
              variant={selectedGenre === genre.id ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setSelectedGenre(genre.id)}
              style={{
                whiteSpace: 'nowrap',
                minWidth: 'fit-content',
              }}
            >
              {genre.emoji} {genre.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Tracks List */}
      <div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.md,
        }}>
          <h3 style={{
            color: theme.colors.text.primary,
            marginTop: 0,
            marginBottom: 0,
            fontSize: theme.typography.fontSize.lg,
          }}>
            {genres.find(g => g.id === selectedGenre)?.name} Tracks
          </h3>
          {loading && (
            <span style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Loading... 🎵
            </span>
          )}
        </div>

        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
        }}>
          {loading ? (
            <Card style={{ textAlign: 'center', padding: theme.spacing.lg }}>
              <p style={{ color: theme.colors.text.secondary }}>Fetching tracks from Spotify...</p>
            </Card>
          ) : tracks.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: theme.spacing.lg }}>
              <p style={{ color: theme.colors.text.secondary }}>No tracks found for this genre</p>
            </Card>
          ) : (
            tracks.map(track => {
              const isCurrentTrack = currentTrack?.id === track.id;
              const isPlaying = isCurrentTrack && paymentStream.isActive;

              return (
                <Card
                  key={track.id}
                  style={{
                    marginBottom: theme.spacing.md,
                    borderLeft: isCurrentTrack ? `4px solid ${theme.colors.accent}` : 'none',
                    transition: 'all 0.3s ease',
                    backgroundColor: isCurrentTrack ? theme.colors.gray[900] : 'transparent',
                  }}
                >
                  <div style={{
                    display: 'flex',
                    gap: theme.spacing.md,
                    alignItems: 'center',
                  }}>
                    {/* Album Art */}
                    {track.coverUrl ? (
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '8px',
                        backgroundColor: theme.colors.gray[800],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '32px',
                        flexShrink: 0,
                      }}>
                        🎵
                      </div>
                    )}

                    {/* Track Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{
                        margin: 0,
                        marginBottom: '4px',
                        color: theme.colors.text.primary,
                        fontSize: theme.typography.fontSize.base,
                        fontWeight: 600,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                      }}>
                        {track.title}
                      </h4>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: theme.spacing.sm,
                        marginBottom: theme.spacing.sm,
                      }}>
                        <p style={{
                          margin: 0,
                          color: theme.colors.text.secondary,
                          fontSize: theme.typography.fontSize.sm,
                          textOverflow: 'ellipsis',
                          overflow: 'hidden',
                          whiteSpace: 'nowrap',
                        }}>
                          {track.artist}
                        </p>
                        {track.source === 'uploaded' && (
                          <Badge variant="success" size="sm">
                            📤 Your Upload
                          </Badge>
                        )}
                        {!track.source || track.source === 'spotify' && (
                          <Badge variant="info" size="sm">
                            🎵 Spotify
                          </Badge>
                        )}
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: theme.spacing.md,
                        fontSize: theme.typography.fontSize.sm,
                        flexWrap: 'wrap',
                      }}>
                        <span style={{ color: theme.colors.text.secondary }}>
                          ⏱️ {formatDuration(track.duration)}
                        </span>
                        <span style={{
                          color: theme.colors.accent,
                          fontWeight: 600,
                        }}>
                          💰 {track.streamPrice} BZY/sec
                        </span>
                      </div>
                    </div>

                    {/* Play Button */}
                    <Button
                      variant={isPlaying ? 'primary' : 'secondary'}
                      size="sm"
                      onClick={() => isPlaying ? stopPaymentStream() : startPaymentStream(track)}
                      style={{
                        minWidth: '100px',
                        flexShrink: 0,
                      }}
                    >
                      {isPlaying ? '⏹️ Stop' : '▶️ Play'}
                    </Button>
                  </div>

                  {/* Playing Indicator */}
                  {isPlaying && (
                    <div style={{
                      marginTop: theme.spacing.md,
                      paddingTop: theme.spacing.md,
                      borderTop: `1px solid ${theme.colors.gray[800]}`,
                      display: 'flex',
                      gap: theme.spacing.sm,
                      alignItems: 'center',
                    }}>
                      <span style={{ color: theme.colors.accent, fontSize: '18px' }}>
                        🎵
                      </span>
                      <span style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                        Now streaming... +{paymentStream.flowRate} BZY/second
                      </span>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Info Section */}
      <Card style={{
        marginTop: theme.spacing.xl,
        background: theme.colors.gray[900],
        padding: theme.spacing.lg,
      }}>
        <h3 style={{
          margin: 0,
          marginBottom: theme.spacing.md,
          color: theme.colors.accent,
        }}>
          💫 SoundMoney Streaming
        </h3>
        <p style={{
          margin: 0,
          marginBottom: theme.spacing.sm,
          color: theme.colors.text.secondary,
          lineHeight: '1.6',
        }}>
          Play music from Spotify and earn BZY tokens in real-time! Every second of streaming directly compensates artists.
          This is the future of music ownership and direct artist support.
        </p>
        <p style={{
          margin: 0,
          color: theme.colors.text.secondary,
          fontSize: theme.typography.fontSize.sm,
          marginTop: theme.spacing.md,
        }}>
          🎵 Powered by SoundMoney API • 💚 Real tracks, real artists, real earnings
        </p>
      </Card>
    </Container>
  );
};

export default FeedPage;
