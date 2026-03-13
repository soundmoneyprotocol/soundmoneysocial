import React from 'react';
import { Container, Header, Card, Badge } from '../components';
import { theme } from '../theme/theme';
import { formatNumber } from '../utils/formatters';

interface AnalyticsData {
  views: number;
  engagementRate: number;
  avgTimeOnPage: string;
  topPosts: Array<{
    title: string;
    views: number;
    engagement: number;
  }>;
  timeSeriesData: Array<{
    date: string;
    views: number;
  }>;
}

interface SpotifyStreamEntry {
  id: string;
  trackName: string;
  artistName: string;
  monthlyListens: number;
  convertedBZY: number;
  importDate: string;
}

const AnalyticsPage: React.FC = () => {
  const [analytics] = React.useState<AnalyticsData>({
    views: 45230,
    engagementRate: 8.5,
    avgTimeOnPage: '2m 34s',
    topPosts: [
      { title: 'New Track Release', views: 5200, engagement: 12.5 },
      { title: 'Behind the Scenes', views: 3840, engagement: 15.2 },
      { title: 'Community Update', views: 2950, engagement: 7.8 },
    ],
    timeSeriesData: [
      { date: 'Mon', views: 1200 },
      { date: 'Tue', views: 1900 },
      { date: 'Wed', views: 1500 },
      { date: 'Thu', views: 2200 },
      { date: 'Fri', views: 2800 },
      { date: 'Sat', views: 3200 },
      { date: 'Sun', views: 2400 },
    ],
  });

  const [spotifyStreams, setSpotifyStreams] = React.useState<SpotifyStreamEntry[]>([]);
  const [showSpotifyForm, setShowSpotifyForm] = React.useState(false);
  const [streamInput, setStreamInput] = React.useState({
    trackName: '',
    artistName: '',
    monthlyListens: '',
  });
  const [conversionRate, setConversionRate] = React.useState('0.00001'); // BZY per listen
  const [spotifyLink, setSpotifyLink] = React.useState('');


  // Parse Spotify link and populate form
  const handleSpotifyLinkPaste = (url: string) => {
    setSpotifyLink(url);
    
    // Try to extract track ID from Spotify link
    // Format: https://open.spotify.com/track/{trackId}?si=... or spotify:track:{trackId}
    let trackId = '';
    
    if (url.includes('open.spotify.com')) {
      const match = url.match(/track\/([a-zA-Z0-9]+)/);
      trackId = match ? match[1] : '';
    } else if (url.includes('spotify:track:')) {
      const match = url.match(/spotify:track:([a-zA-Z0-9]+)/);
      trackId = match ? match[1] : '';
    }

    if (trackId) {
      // Mock data for common Spotify tracks
      const trackDatabase: Record<string, { name: string; artist: string }> = {
        '11dFghVXANMlKmJXsNCQvb': { name: 'Blinding Lights', artist: 'The Weeknd' },
        '4cOdK2wGLETKBW3PvgPWqLv': { name: 'Bad Guy', artist: 'Billie Eilish' },
        'levitating_track': { name: 'Levitating', artist: 'Dua Lipa' },
        'humble_track': { name: 'HUMBLE.', artist: 'Kendrick Lamar' },
        'mask_off': { name: 'Mask Off', artist: 'Future' },
        'bohemian_rhapsody': { name: 'Bohemian Rhapsody', artist: 'Queen' },
        'stairway_to_heaven': { name: 'Stairway to Heaven', artist: 'Led Zeppelin' },
        'levels_avicii': { name: 'Levels', artist: 'Avicii' },
        'midnight_city': { name: 'Midnight City', artist: 'M83' },
      };

      const trackData = trackDatabase[trackId];
      if (trackData) {
        setStreamInput(prev => ({
          ...prev,
          trackName: trackData.name,
          artistName: trackData.artist,
        }));
      } else {
        // If not in database, try to extract from URL or ask user
        alert('ℹ️ Track found! Please enter the monthly listening count from your Spotify for Artists dashboard.');
        setStreamInput(prev => ({
          ...prev,
          trackName: 'Track - ' + trackId.substring(0, 8),
          artistName: 'Your Artist Name',
        }));
      }
    } else {
      alert('❌ Invalid Spotify link. Please use: https://open.spotify.com/track/...');
    }
  };

  // Load from localStorage
  React.useEffect(() => {
    const stored = localStorage.getItem('soundmoney_spotify_streams');
    if (stored) {
      setSpotifyStreams(JSON.parse(stored));
    }
  }, []);

  const handleAddSpotifyStreams = () => {
    if (!streamInput.trackName || !streamInput.artistName || !streamInput.monthlyListens) {
      alert('Please fill in all fields');
      return;
    }

    const listens = parseInt(streamInput.monthlyListens);
    const rate = parseFloat(conversionRate);
    const convertedBZY = listens * rate;

    const newEntry: SpotifyStreamEntry = {
      id: `spotify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trackName: streamInput.trackName,
      artistName: streamInput.artistName,
      monthlyListens: listens,
      convertedBZY,
      importDate: new Date().toISOString(),
    };

    const updated = [...spotifyStreams, newEntry];
    setSpotifyStreams(updated);
    localStorage.setItem('soundmoney_spotify_streams', JSON.stringify(updated));

    setStreamInput({
      trackName: '',
      artistName: '',
      monthlyListens: '',
    });
    setShowSpotifyForm(false);
    alert('✅ Spotify streams imported successfully');
  };

  const handleDeleteSpotifyEntry = (id: string) => {
    if (window.confirm('Delete this entry?')) {
      const updated = spotifyStreams.filter(s => s.id !== id);
      setSpotifyStreams(updated);
      localStorage.setItem('soundmoney_spotify_streams', JSON.stringify(updated));
      alert('🗑️ Entry deleted');
    }
  };

  const totalSpotifyListens = spotifyStreams.reduce((sum, s) => sum + s.monthlyListens, 0);
  const totalConvertedBZY = spotifyStreams.reduce((sum, s) => sum + s.convertedBZY, 0);

  const containerStyles: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const metricsGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  };

  const metricCardStyles: React.CSSProperties = {
    padding: theme.spacing.lg,
  };

  const metricLabelStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
    marginBottom: theme.spacing.sm,
  };

  const metricValueStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    margin: 0,
  };

  const metricValueSmallStyles: React.CSSProperties = {
    ...metricValueStyles,
    fontSize: theme.typography.fontSize.xl,
  };

  const chartContainerStyles: React.CSSProperties = {
    marginBottom: theme.spacing.xl,
  };

  const chartBarContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: '200px',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  };

  const barStyles: (height: number) => React.CSSProperties = (height) => ({
    flex: 1,
    height: `${(height / 3200) * 100}%`,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.sm,
    minHeight: '20px',
    position: 'relative',
  });

  const barLabelStyles: React.CSSProperties = {
    position: 'absolute',
    bottom: '-24px',
    left: '0',
    right: '0',
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.secondary,
  };

  const topPostsListStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.md,
  };

  const postItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
  };

  const postInfoStyles: React.CSSProperties = {
    flex: 1,
  };

  const postTitleStyles: React.CSSProperties = {
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    margin: 0,
    marginBottom: theme.spacing.xs,
  };

  const postStatsStyles: React.CSSProperties = {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    margin: 0,
  };

  return (
    <Container maxWidth="lg" padding="lg" style={containerStyles}>
      <Header
        title="Analytics"
        subtitle="Track your engagement and performance metrics"
      />

      <div style={metricsGridStyles}>
        <Card style={metricCardStyles}>
          <p style={metricLabelStyles}>Total Views</p>
          <p style={metricValueStyles}>{formatNumber(analytics.views)}</p>
          <Badge variant="success" size="sm" style={{ marginTop: theme.spacing.md }}>
            ↑ 12% this week
          </Badge>
        </Card>

        <Card style={metricCardStyles}>
          <p style={metricLabelStyles}>Engagement Rate</p>
          <p style={metricValueStyles}>{analytics.engagementRate}%</p>
          <Badge variant="info" size="sm" style={{ marginTop: theme.spacing.md }}>
            Above average
          </Badge>
        </Card>

        <Card style={metricCardStyles}>
          <p style={metricLabelStyles}>Avg. Time on Page</p>
          <p style={metricValueSmallStyles}>
            {analytics.avgTimeOnPage}
          </p>
          <Badge variant="info" size="sm" style={{ marginTop: theme.spacing.md }}>
            Very engaged
          </Badge>
        </Card>
      </div>

      <Card style={chartContainerStyles}>
        <h3 style={{ marginTop: 0, color: theme.colors.text.primary }}>Views This Week</h3>
        <div style={chartBarContainerStyles}>
          {analytics.timeSeriesData.map((data, index) => (
            <div key={index} style={{ flex: 1, position: 'relative', height: '100%' }}>
              <div style={barStyles(data.views)}>
                <div style={barLabelStyles}>{data.date}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '40px', fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary, textAlign: 'center' }}>
          Each bar represents daily views. Total: {formatNumber(analytics.timeSeriesData.reduce((sum, d) => sum + d.views, 0))}
        </div>
      </Card>

      <Card>
        <h3 style={{ marginTop: 0, color: theme.colors.text.primary }}>Top Performing Tracks</h3>
        <div style={topPostsListStyles}>
          {analytics.topPosts.map((post, index) => (
            <div key={index} style={postItemStyles}>
              <div style={postInfoStyles}>
                <p style={postTitleStyles}>{post.title}</p>
                <p style={postStatsStyles}>
                  {formatNumber(post.views)} views • {post.engagement}% engagement
                </p>
              </div>
              <Badge variant="success">{index + 1}</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* Spotify Streams to BZY Conversion */}
      <Card style={{ marginTop: theme.spacing.lg }}>
        <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
          🎵 Spotify Streams to BZY Converter
        </h3>

        {/* Spotify Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        }}>
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.md,
          }}>
            <p style={{ margin: 0, marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Total Spotify Listens
            </p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary }}>
              {formatNumber(totalSpotifyListens)}
            </p>
          </div>

          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.md,
          }}>
            <p style={{ margin: 0, marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Converted BZY
            </p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: theme.colors.accent }}>
              {totalConvertedBZY.toFixed(6)} BZY
            </p>
          </div>

          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.md,
          }}>
            <p style={{ margin: 0, marginBottom: theme.spacing.xs, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Conversion Rate
            </p>
            <p style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: theme.colors.info }}>
              {conversionRate} BZY/listen
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginBottom: theme.spacing.lg }}>
          <button
            onClick={() => {
              setShowSpotifyForm(!showSpotifyForm);
              if (showSpotifyForm) {
                setSpotifyLink('');
                setStreamInput({ trackName: '', artistName: '', monthlyListens: '' });
              }
            }}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.primary,
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: theme.typography.fontSize.base,
              marginRight: theme.spacing.md,
              marginBottom: theme.spacing.md,
            }}
          >
            {showSpotifyForm ? '✕ Cancel' : '➕ Add Spotify Track'}
          </button>

          <button
            onClick={() => {
              const json = JSON.stringify(spotifyStreams, null, 2);
              const element = document.createElement('a');
              element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(json));
              element.setAttribute('download', 'spotify-streams-bzy.json');
              element.style.display = 'none';
              document.body.appendChild(element);
              element.click();
              document.body.removeChild(element);
              alert('📥 Spotify streams exported');
            }}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.gray[700],
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: theme.typography.fontSize.base,
              marginRight: theme.spacing.md,
              marginBottom: theme.spacing.md,
            }}
          >
            📥 Export Data
          </button>

          <button
            onClick={() => {
              setConversionRate('0.00001');
              alert('✅ Conversion rate reset to default (0.00001 BZY/listen)');
            }}
            style={{
              padding: `${theme.spacing.sm} ${theme.spacing.md}`,
              backgroundColor: theme.colors.gray[700],
              color: 'white',
              border: 'none',
              borderRadius: theme.borderRadius.md,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: theme.typography.fontSize.base,
              marginBottom: theme.spacing.md,
            }}
          >
            🔄 Reset Rate
          </button>
        </div>

        {/* Add Spotify Stream Form */}
        {showSpotifyForm && (
          <div style={{
            padding: theme.spacing.lg,
            backgroundColor: theme.colors.background.tertiary,
            borderRadius: theme.borderRadius.md,
            marginBottom: theme.spacing.lg,
          }}>
            <h4 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
              ➕ Import Monthly Spotify Streams
            </h4>

            {/* Spotify Link Input */}
            <div style={{ marginBottom: theme.spacing.lg }}>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.xs,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}>
                🔗 Paste Spotify Track Link (Optional - auto-fills track info)
              </label>
              <input
                type="url"
                value={spotifyLink}
                onChange={(e) => setSpotifyLink(e.target.value)}
                onBlur={(e) => {
                  if (e.target.value.trim()) {
                    handleSpotifyLinkPaste(e.target.value);
                  }
                }}
                placeholder="https://open.spotify.com/track/... or spotify:track:..."
                style={{
                  width: '100%',
                  padding: theme.spacing.sm,
                  borderRadius: theme.borderRadius.md,
                  border: `2px solid ${theme.colors.primary}`,
                  backgroundColor: theme.colors.background.secondary,
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.base,
                  boxSizing: 'border-box',
                  marginBottom: theme.spacing.sm,
                }}
              />
              <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs }}>
                💡 Paste a Spotify track link to auto-fill track name and artist
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: theme.spacing.md,
              marginBottom: theme.spacing.md,
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: theme.spacing.xs,
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}>
                  Track Name *
                </label>
                <input
                  type="text"
                  value={streamInput.trackName}
                  onChange={(e) => setStreamInput({ ...streamInput, trackName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                    boxSizing: 'border-box',
                  }}
                  placeholder="e.g., Blinding Lights"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: theme.spacing.xs,
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}>
                  Artist Name *
                </label>
                <input
                  type="text"
                  value={streamInput.artistName}
                  onChange={(e) => setStreamInput({ ...streamInput, artistName: e.target.value })}
                  style={{
                    width: '100%',
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                    boxSizing: 'border-box',
                  }}
                  placeholder="e.g., The Weeknd"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: theme.spacing.xs,
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}>
                  Monthly Listens *
                </label>
                <input
                  type="number"
                  value={streamInput.monthlyListens}
                  onChange={(e) => setStreamInput({ ...streamInput, monthlyListens: e.target.value })}
                  style={{
                    width: '100%',
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                    boxSizing: 'border-box',
                  }}
                  placeholder="e.g., 50000"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: theme.spacing.xs,
                  color: theme.colors.text.secondary,
                  fontSize: theme.typography.fontSize.sm,
                }}>
                  BZY per Listen
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={conversionRate}
                  onChange={(e) => setConversionRate(e.target.value)}
                  style={{
                    width: '100%',
                    padding: theme.spacing.sm,
                    borderRadius: theme.borderRadius.md,
                    border: `1px solid ${theme.colors.gray[700]}`,
                    backgroundColor: theme.colors.background.secondary,
                    color: theme.colors.text.primary,
                    fontSize: theme.typography.fontSize.base,
                    boxSizing: 'border-box',
                  }}
                  placeholder="0.00001"
                />
              </div>
            </div>

            <button
              onClick={handleAddSpotifyStreams}
              style={{
                padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                backgroundColor: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius.md,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: theme.typography.fontSize.base,
              }}
            >
              ➕ Import Streams
            </button>
          </div>
        )}

        {/* Spotify Streams List */}
        {spotifyStreams.length > 0 ? (
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
                  <th style={{ textAlign: 'right', padding: theme.spacing.md, color: theme.colors.text.secondary }}>Monthly Listens</th>
                  <th style={{ textAlign: 'right', padding: theme.spacing.md, color: theme.colors.text.secondary }}>Converted BZY</th>
                  <th style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {spotifyStreams.map((entry) => (
                  <tr key={entry.id} style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                    <td style={{ padding: theme.spacing.md, color: theme.colors.text.primary }}>
                      {entry.trackName}
                    </td>
                    <td style={{ padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                      {entry.artistName}
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.text.secondary }}>
                      {formatNumber(entry.monthlyListens)}
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.accent, fontWeight: 600 }}>
                      {entry.convertedBZY.toFixed(6)} BZY
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'center' }}>
                      <button
                        onClick={() => handleDeleteSpotifyEntry(entry.id)}
                        style={{
                          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                          backgroundColor: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: theme.borderRadius.md,
                          cursor: 'pointer',
                          fontSize: theme.typography.fontSize.sm,
                        }}
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: theme.spacing.lg }}>
            <p style={{ color: theme.colors.text.secondary }}>
              📊 No Spotify streams imported yet
            </p>
            <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              Add your monthly Spotify listen data to calculate BZY earnings
            </p>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default AnalyticsPage;
