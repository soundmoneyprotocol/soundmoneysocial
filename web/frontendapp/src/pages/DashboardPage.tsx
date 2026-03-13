import React, { useState, useEffect } from 'react';
import { Container, Header, Card, Button } from '../components';
import { theme } from '../theme/theme';
import { useAuth } from '../contexts/AuthContext';
import { streamingHistoryService, StreamingSession } from '../services/streamingHistoryService';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalEarned: '0',
    totalSessions: 0,
    totalDuration: 0,
    topTracks: [] as any[],
    recentSessions: [] as StreamingSession[],
  });

  useEffect(() => {
    // Load streaming stats
    const history = streamingHistoryService.getStats();
    const topTracks = streamingHistoryService.getTopTracks(5);

    setStats({
      totalEarned: history.totalEarned,
      totalSessions: history.totalSessions,
      totalDuration: history.totalDuration,
      topTracks,
      recentSessions: history.sessions.slice(-10).reverse(),
    });
  }, []);

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <Container maxWidth="lg" padding="lg">
      <Header
        title="Dashboard"
        subtitle="Your streaming earnings and activity"
      />

      {/* Main Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
      }}>
        {/* Total Earned */}
        <Card style={{ textAlign: 'center', padding: theme.spacing.lg }}>
          <p style={{ color: theme.colors.text.secondary, margin: 0, marginBottom: theme.spacing.sm }}>
            Total BZY Earned
          </p>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: theme.colors.accent,
            fontFamily: 'monospace',
            marginBottom: theme.spacing.sm,
          }}>
            {stats.totalEarned} BZY
          </div>
          <p style={{ color: theme.colors.text.secondary, margin: 0, fontSize: theme.typography.fontSize.sm }}>
            💰 From {stats.totalSessions} streaming sessions
          </p>
        </Card>

        {/* Total Sessions */}
        <Card style={{ textAlign: 'center', padding: theme.spacing.lg }}>
          <p style={{ color: theme.colors.text.secondary, margin: 0, marginBottom: theme.spacing.sm }}>
            Streaming Sessions
          </p>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: theme.colors.primary,
          }}>
            {stats.totalSessions}
          </div>
          <p style={{ color: theme.colors.text.secondary, margin: 0, fontSize: theme.typography.fontSize.sm }}>
            🎵 Total time streamed
          </p>
        </Card>

        {/* Total Duration */}
        <Card style={{ textAlign: 'center', padding: theme.spacing.lg }}>
          <p style={{ color: theme.colors.text.secondary, margin: 0, marginBottom: theme.spacing.sm }}>
            Total Duration
          </p>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: theme.colors.info,
          }}>
            {formatDuration(stats.totalDuration)}
          </div>
          <p style={{ color: theme.colors.text.secondary, margin: 0, fontSize: theme.typography.fontSize.sm }}>
            ⏱️ Minutes streamed
          </p>
        </Card>
      </div>

      {/* Top Tracks */}
      {stats.topTracks.length > 0 && (
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <h3 style={{
            margin: 0,
            marginBottom: theme.spacing.md,
            color: theme.colors.text.primary,
          }}>
            🎵 Top Streamed Tracks
          </h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: theme.colors.text.primary,
            }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                  <th style={{ textAlign: 'left', padding: theme.spacing.md, color: theme.colors.text.secondary }}>Track</th>
                  <th style={{ textAlign: 'left', padding: theme.spacing.md, color: theme.colors.text.secondary }}>Artist</th>
                  <th style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>Sessions</th>
                  <th style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>Duration</th>
                  <th style={{ textAlign: 'right', padding: theme.spacing.md, color: theme.colors.text.secondary }}>BZY Earned</th>
                </tr>
              </thead>
              <tbody>
                {stats.topTracks.map((track, idx) => (
                  <tr key={idx} style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                    <td style={{ padding: theme.spacing.md, color: theme.colors.text.primary }}>
                      {track.trackTitle}
                    </td>
                    <td style={{ padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                      {track.artist}
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'center', color: theme.colors.text.secondary }}>
                      {track.sessionCount}
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'center', color: theme.colors.text.secondary }}>
                      {formatDuration(track.totalDuration)}
                    </td>
                    <td style={{
                      padding: theme.spacing.md,
                      textAlign: 'right',
                      color: theme.colors.accent,
                      fontWeight: 600,
                    }}>
                      {track.totalEarned} BZY
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Recent Sessions */}
      {stats.recentSessions.length > 0 && (
        <Card style={{ marginBottom: theme.spacing.lg }}>
          <h3 style={{
            margin: 0,
            marginBottom: theme.spacing.md,
            color: theme.colors.text.primary,
          }}>
            📊 Recent Sessions
          </h3>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.md,
          }}>
            {stats.recentSessions.map(session => (
              <div
                key={session.id}
                style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.gray[900],
                  borderRadius: 8,
                  borderLeft: `4px solid ${theme.colors.accent}`,
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: theme.spacing.sm,
                }}>
                  <div>
                    <p style={{
                      margin: 0,
                      marginBottom: '4px',
                      color: theme.colors.text.primary,
                      fontWeight: 600,
                    }}>
                      {session.trackTitle}
                    </p>
                    <p style={{
                      margin: 0,
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.fontSize.sm,
                    }}>
                      {session.artist}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      margin: 0,
                      marginBottom: '4px',
                      color: theme.colors.accent,
                      fontWeight: 600,
                      fontSize: theme.typography.fontSize.lg,
                    }}>
                      +{session.totalEarned} BZY
                    </p>
                    <p style={{
                      margin: 0,
                      color: theme.colors.text.secondary,
                      fontSize: theme.typography.fontSize.sm,
                    }}>
                      {formatDuration(session.duration)}
                    </p>
                  </div>
                </div>
                <p style={{
                  margin: 0,
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.xs,
                }}>
                  {formatDate(session.timestamp)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Empty State */}
      {stats.totalSessions === 0 && (
        <Card style={{ textAlign: 'center', padding: theme.spacing.xl }}>
          <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.lg }}>
            🎵 No streaming sessions yet
          </p>
          <p style={{
            color: theme.colors.text.secondary,
            fontSize: theme.typography.fontSize.sm,
            marginBottom: theme.spacing.lg,
          }}>
            Start streaming music on the Feed to earn BZY tokens!
          </p>
        </Card>
      )}

      {/* User Info */}
      <Card style={{ marginTop: theme.spacing.xl, padding: theme.spacing.lg }}>
        <h3 style={{ margin: '0 0 ' + theme.spacing.md + ' 0', color: theme.colors.text.primary }}>
          👤 User Profile
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: theme.spacing.lg }}>
          <div>
            <p style={{ margin: 0, marginBottom: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Username
            </p>
            <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600 }}>
              {user?.username || 'Not set'}
            </p>
          </div>
          <div>
            <p style={{ margin: 0, marginBottom: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Email
            </p>
            <p style={{ margin: 0, color: theme.colors.text.primary, fontWeight: 600 }}>
              {user?.email || 'Not set'}
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={logout}
          style={{ marginTop: theme.spacing.lg }}
        >
          🚪 Logout
        </Button>
      </Card>
    </Container>
  );
};

export default DashboardPage;
