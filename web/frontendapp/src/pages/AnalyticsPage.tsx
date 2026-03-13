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

interface StreamEntry {
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

  // Spotify State
  const [spotifyStreams, setSpotifyStreams] = React.useState<StreamEntry[]>([]);
  const [showSpotifyForm, setShowSpotifyForm] = React.useState(false);
  const [spotifyInput, setSpotifyInput] = React.useState({
    trackName: '',
    artistName: '',
    monthlyListens: '',
  });
  const [spotifyConversionRate, setSpotifyConversionRate] = React.useState('0.00001');
  const [spotifyLink, setSpotifyLink] = React.useState('');

  // YouTube Music State
  const [youtubeStreams, setYoutubeStreams] = React.useState<StreamEntry[]>([]);
  const [showYoutubeForm, setShowYoutubeForm] = React.useState(false);
  const [youtubeInput, setYoutubeInput] = React.useState({
    trackName: '',
    artistName: '',
    monthlyListens: '',
  });
  const [youtubeConversionRate, setYoutubeConversionRate] = React.useState('0.00001');
  const [youtubeLink, setYoutubeLink] = React.useState('');

  // Parse Spotify link and populate form
  const handleSpotifyLinkPaste = (url: string) => {
    setSpotifyLink(url);

    let trackId = '';

    if (url.includes('open.spotify.com')) {
      const match = url.match(/track\/([a-zA-Z0-9]+)/);
      trackId = match ? match[1] : '';
    } else if (url.includes('spotify:track:')) {
      const match = url.match(/spotify:track:([a-zA-Z0-9]+)/);
      trackId = match ? match[1] : '';
    }

    if (trackId) {
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
        setSpotifyInput(prev => ({
          ...prev,
          trackName: trackData.name,
          artistName: trackData.artist,
        }));
      } else {
        alert('ℹ️ Track found! Please enter the monthly listening count from your Spotify for Artists dashboard.');
        setSpotifyInput(prev => ({
          ...prev,
          trackName: 'Track - ' + trackId.substring(0, 8),
          artistName: 'Your Artist Name',
        }));
      }
    } else {
      alert('❌ Invalid Spotify link. Please use: https://open.spotify.com/track/...');
    }
  };

  // Parse YouTube Music link and populate form
  const handleYoutubeLinkPaste = (url: string) => {
    setYoutubeLink(url);

    let videoId = '';

    if (url.includes('youtube.com')) {
      const match = url.match(/(?:watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
      videoId = match ? match[1] : '';
    } else if (url.includes('youtu.be')) {
      const match = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
      videoId = match ? match[1] : '';
    }

    if (videoId) {
      const trackDatabase: Record<string, { name: string; artist: string }> = {
        'dQw4w9WgXcQ': { name: 'Never Gonna Give You Up', artist: 'Rick Astley' },
        'jNQXAC9IVRw': { name: 'Me at the zoo', artist: 'Jawed Karim' },
        'aqz-KE-bpKQ': { name: 'YouTube Rewind 2019', artist: 'YouTube' },
      };

      const trackData = trackDatabase[videoId];
      if (trackData) {
        setYoutubeInput(prev => ({
          ...prev,
          trackName: trackData.name,
          artistName: trackData.artist,
        }));
      } else {
        alert('ℹ️ Video found! Please enter the monthly view count from your YouTube Music stats.');
        setYoutubeInput(prev => ({
          ...prev,
          trackName: 'Video - ' + videoId.substring(0, 8),
          artistName: 'Your Artist Name',
        }));
      }
    } else {
      alert('❌ Invalid YouTube Music link. Please use: https://www.youtube.com/watch?v=... or https://youtu.be/...');
    }
  };

  // Load from localStorage
  React.useEffect(() => {
    const spotifyStored = localStorage.getItem('soundmoney_spotify_streams');
    if (spotifyStored) {
      setSpotifyStreams(JSON.parse(spotifyStored));
    }

    const youtubeStored = localStorage.getItem('soundmoney_youtube_streams');
    if (youtubeStored) {
      setYoutubeStreams(JSON.parse(youtubeStored));
    }
  }, []);

  const handleAddSpotifyStreams = () => {
    if (!spotifyInput.trackName || !spotifyInput.artistName || !spotifyInput.monthlyListens) {
      alert('Please fill in all fields');
      return;
    }

    const listens = parseInt(spotifyInput.monthlyListens);
    const rate = parseFloat(spotifyConversionRate);
    const convertedBZY = listens * rate;

    const newEntry: StreamEntry = {
      id: `spotify_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trackName: spotifyInput.trackName,
      artistName: spotifyInput.artistName,
      monthlyListens: listens,
      convertedBZY,
      importDate: new Date().toISOString(),
    };

    const updated = [...spotifyStreams, newEntry];
    setSpotifyStreams(updated);
    localStorage.setItem('soundmoney_spotify_streams', JSON.stringify(updated));

    setSpotifyInput({
      trackName: '',
      artistName: '',
      monthlyListens: '',
    });
    setShowSpotifyForm(false);
    alert('✅ Spotify streams imported successfully');
  };

  const handleAddYoutubeStreams = () => {
    if (!youtubeInput.trackName || !youtubeInput.artistName || !youtubeInput.monthlyListens) {
      alert('Please fill in all fields');
      return;
    }

    const listens = parseInt(youtubeInput.monthlyListens);
    const rate = parseFloat(youtubeConversionRate);
    const convertedBZY = listens * rate;

    const newEntry: StreamEntry = {
      id: `youtube_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trackName: youtubeInput.trackName,
      artistName: youtubeInput.artistName,
      monthlyListens: listens,
      convertedBZY,
      importDate: new Date().toISOString(),
    };

    const updated = [...youtubeStreams, newEntry];
    setYoutubeStreams(updated);
    localStorage.setItem('soundmoney_youtube_streams', JSON.stringify(updated));

    setYoutubeInput({
      trackName: '',
      artistName: '',
      monthlyListens: '',
    });
    setShowYoutubeForm(false);
    alert('✅ YouTube Music streams imported successfully');
  };

  const handleDeleteSpotifyEntry = (id: string) => {
    if (window.confirm('Delete this entry?')) {
      const updated = spotifyStreams.filter(s => s.id !== id);
      setSpotifyStreams(updated);
      localStorage.setItem('soundmoney_spotify_streams', JSON.stringify(updated));
      alert('🗑️ Entry deleted');
    }
  };

  const handleDeleteYoutubeEntry = (id: string) => {
    if (window.confirm('Delete this entry?')) {
      const updated = youtubeStreams.filter(s => s.id !== id);
      setYoutubeStreams(updated);
      localStorage.setItem('soundmoney_youtube_streams', JSON.stringify(updated));
      alert('🗑️ Entry deleted');
    }
  };

  const totalSpotifyListens = spotifyStreams.reduce((sum, s) => sum + s.monthlyListens, 0);
  const totalSpotifyBZY = spotifyStreams.reduce((sum, s) => sum + s.convertedBZY, 0);

  const totalYoutubeListens = youtubeStreams.reduce((sum, s) => sum + s.monthlyListens, 0);
  const totalYoutubeBZY = youtubeStreams.reduce((sum, s) => sum + s.convertedBZY, 0);

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

  const renderStreamCard = (
    title: string,
    icon: string,
    streams: StreamEntry[],
    totalListens: number,
    totalBZY: number,
    conversionRate: string,
    setConversionRate: (rate: string) => void,
    showForm: boolean,
    setShowForm: (show: boolean) => void,
    input: { trackName: string; artistName: string; monthlyListens: string },
    setInput: (input: any) => void,
    link: string,
    setLink: (link: string) => void,
    onLinkPaste: (url: string) => void,
    onAddStreams: () => void,
    onDeleteEntry: (id: string) => void,
    platform: string
  ) => (
    <Card style={{ marginTop: theme.spacing.lg }}>
      <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
        {icon} {title}
      </h3>

      {/* Stats */}
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
            Total Listens
          </p>
          <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary }}>
            {formatNumber(totalListens)}
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
            {totalBZY.toFixed(6)} BZY
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
            setShowForm(!showForm);
            if (showForm) {
              setLink('');
              setInput({ trackName: '', artistName: '', monthlyListens: '' });
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
          {showForm ? '✕ Cancel' : `➕ Add ${platform} Track`}
        </button>

        <button
          onClick={() => {
            const json = JSON.stringify(streams, null, 2);
            const element = document.createElement('a');
            element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(json));
            element.setAttribute('download', `${platform.toLowerCase()}-streams-bzy.json`);
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            alert(`📥 ${platform} streams exported`);
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

      {/* Form */}
      {showForm && (
        <div style={{
          padding: theme.spacing.lg,
          backgroundColor: theme.colors.background.tertiary,
          borderRadius: theme.borderRadius.md,
          marginBottom: theme.spacing.lg,
        }}>
          <h4 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
            ➕ Import Monthly {platform} Streams
          </h4>

          {/* Link Input */}
          <div style={{ marginBottom: theme.spacing.lg }}>
            <label style={{
              display: 'block',
              marginBottom: theme.spacing.xs,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
            }}>
              🔗 Paste {platform} Track Link (Optional - auto-fills track info)
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              onBlur={(e) => {
                if (e.target.value.trim()) {
                  onLinkPaste(e.target.value);
                }
              }}
              placeholder={platform === 'Spotify' ? 'https://open.spotify.com/track/...' : 'https://www.youtube.com/watch?v=...'}
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
              💡 Paste a {platform} track link to auto-fill track name and artist
            </p>
          </div>

          {/* Form Fields */}
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
                value={input.trackName}
                onChange={(e) => setInput({ ...input, trackName: e.target.value })}
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
                value={input.artistName}
                onChange={(e) => setInput({ ...input, artistName: e.target.value })}
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
                value={input.monthlyListens}
                onChange={(e) => setInput({ ...input, monthlyListens: e.target.value })}
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
            onClick={onAddStreams}
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

      {/* Streams Table */}
      {streams.length > 0 ? (
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
              {streams.map((entry) => (
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
                      onClick={() => onDeleteEntry(entry.id)}
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
            📊 No {platform} streams imported yet
          </p>
          <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
            Add your monthly {platform} listen data to calculate BZY earnings
          </p>
        </div>
      )}
    </Card>
  );

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

      {/* Spotify Streams Card */}
      {renderStreamCard(
        'Spotify Streams to BZY Converter',
        '🎵',
        spotifyStreams,
        totalSpotifyListens,
        totalSpotifyBZY,
        spotifyConversionRate,
        setSpotifyConversionRate,
        showSpotifyForm,
        setShowSpotifyForm,
        spotifyInput,
        setSpotifyInput,
        spotifyLink,
        setSpotifyLink,
        handleSpotifyLinkPaste,
        handleAddSpotifyStreams,
        handleDeleteSpotifyEntry,
        'Spotify'
      )}

      {/* YouTube Music Streams Card */}
      {renderStreamCard(
        'YouTube Music Streams to BZY Converter',
        '▶️',
        youtubeStreams,
        totalYoutubeListens,
        totalYoutubeBZY,
        youtubeConversionRate,
        setYoutubeConversionRate,
        showYoutubeForm,
        setShowYoutubeForm,
        youtubeInput,
        setYoutubeInput,
        youtubeLink,
        setYoutubeLink,
        handleYoutubeLinkPaste,
        handleAddYoutubeStreams,
        handleDeleteYoutubeEntry,
        'YouTube Music'
      )}
    </Container>
  );
};

export default AnalyticsPage;
