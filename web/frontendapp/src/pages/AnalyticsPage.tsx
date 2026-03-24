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

interface GeoData {
  country: string;
  countryCode: string;
  region: string;
  flag: string;
  listeners: number;
  percentage: number;
  engagement: number;
  topCity?: string;
}


interface AudienceSegment {
  id: string;
  title: string;
  count: number;
  percentage: number;
  engagementLevel: 'super' | 'moderate' | 'light';
  color: string;
  listeners: Array<{
    id: string;
    username: string;
    email: string;
    listensThisMonth: number;
    engagement: number;
    joinedDate: string;
  }>;
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
      { date: 'Tue', views: 2100 },
      { date: 'Wed', views: 3200 },
      { date: 'Thu', views: 4800 },
      { date: 'Fri', views: 6500 },
      { date: 'Sat', views: 8200 },
      { date: 'Sun', views: 9500 },
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

  // Geo Modal State
  const [selectedGeoCountry, setSelectedGeoCountry] = React.useState<GeoData | null>(null);
  const [showGeoModal, setShowGeoModal] = React.useState(false);

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

  // GEO Data State
  const [geoData] = React.useState<GeoData[]>([
    { country: 'United States', countryCode: 'US', region: 'North America', flag: '🇺🇸', listeners: 12450, percentage: 35.2, engagement: 9.2, topCity: 'Los Angeles' },
    { country: 'United Kingdom', countryCode: 'GB', region: 'Europe', flag: '🇬🇧', listeners: 5200, percentage: 14.7, engagement: 8.5, topCity: 'London' },
    { country: 'Canada', countryCode: 'CA', region: 'North America', flag: '🇨🇦', listeners: 4100, percentage: 11.6, engagement: 7.8, topCity: 'Toronto' },
    { country: 'Australia', countryCode: 'AU', region: 'Oceania', flag: '🇦🇺', listeners: 3200, percentage: 9.1, engagement: 8.9, topCity: 'Sydney' },
    { country: 'Germany', countryCode: 'DE', region: 'Europe', flag: '🇩🇪', listeners: 2800, percentage: 7.9, engagement: 7.2, topCity: 'Berlin' },
    { country: 'Japan', countryCode: 'JP', region: 'Asia', flag: '🇯🇵', listeners: 2100, percentage: 6.0, engagement: 8.7, topCity: 'Tokyo' },
    { country: 'Brazil', countryCode: 'BR', region: 'South America', flag: '🇧🇷', listeners: 1600, percentage: 4.5, engagement: 9.1, topCity: 'São Paulo' },
    { country: 'Mexico', countryCode: 'MX', region: 'North America', flag: '🇲🇽', listeners: 1200, percentage: 3.4, engagement: 8.3, topCity: 'Mexico City' },
  ]);


  // Audience Segments State
  const [audienceSegments] = React.useState<AudienceSegment[]>([
    {
      id: 'super',
      title: '148 Super Listeners',
      count: 148,
      percentage: 1.3,
      engagementLevel: 'super',
      color: '#FF6B6B',
      listeners: [
        { id: 'u1', username: 'music_lover_99', email: 'lover@music.com', listensThisMonth: 1250, engagement: 98, joinedDate: '2023-01-15' },
        { id: 'u2', username: 'track_fanatic', email: 'fanatic@sound.io', listensThisMonth: 980, engagement: 95, joinedDate: '2023-02-20' },
        { id: 'u3', username: 'beat_seeker', email: 'beats@audio.com', listensThisMonth: 856, engagement: 92, joinedDate: '2023-03-10' },
        { id: 'u4', username: 'sound_chaser', email: 'chaser@track.net', listensThisMonth: 745, engagement: 90, joinedDate: '2023-01-05' },
        { id: 'u5', username: 'melody_mind', email: 'melody@tune.io', listensThisMonth: 680, engagement: 88, joinedDate: '2023-04-12' },
      ],
    },
    {
      id: 'moderate',
      title: '2,285 Moderate',
      count: 2285,
      percentage: 20.8,
      engagementLevel: 'moderate',
      color: '#4ECDC4',
      listeners: [
        { id: 'm1', username: 'casual_listener', email: 'casual@mail.com', listensThisMonth: 285, engagement: 62, joinedDate: '2023-05-08' },
        { id: 'm2', username: 'regular_fan', email: 'regular@sound.com', listensThisMonth: 256, engagement: 58, joinedDate: '2023-06-15' },
        { id: 'm3', username: 'weekly_player', email: 'weekly@music.io', listensThisMonth: 198, engagement: 52, joinedDate: '2023-07-22' },
        { id: 'm4', username: 'music_browser', email: 'browser@track.com', listensThisMonth: 164, engagement: 48, joinedDate: '2023-08-01' },
        { id: 'm5', username: 'occasional_fan', email: 'occasional@tune.net', listensThisMonth: 152, engagement: 45, joinedDate: '2023-09-10' },
      ],
    },
    {
      id: 'light',
      title: '10,060 Light Listeners',
      count: 10060,
      percentage: 77.9,
      engagementLevel: 'light',
      color: '#95E1D3',
      listeners: [
        { id: 'l1', username: 'discovery_mode', email: 'discovery@music.com', listensThisMonth: 45, engagement: 25, joinedDate: '2023-10-05' },
        { id: 'l2', username: 'passive_listener', email: 'passive@sound.io', listensThisMonth: 38, engagement: 22, joinedDate: '2023-10-18' },
        { id: 'l3', username: 'background_play', email: 'background@track.com', listensThisMonth: 32, engagement: 18, joinedDate: '2023-11-02' },
        { id: 'l4', username: 'random_browser', email: 'random@tune.net', listensThisMonth: 28, engagement: 15, joinedDate: '2023-11-20' },
        { id: 'l5', username: 'one_timer', email: 'onetime@mail.io', listensThisMonth: 22, engagement: 12, joinedDate: '2023-12-01' },
      ],
    },
  ]);


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
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    height: '200px',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    gap: theme.spacing.md,
  };

  const maxViews = Math.max(...analytics.timeSeriesData.map(d => d.views), 1);

  const barStyles: (height: number) => React.CSSProperties = (height) => ({
    flex: 1,
    height: `${(height / maxViews) * 100}%`,
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


      {/* Audience Segments Analytics */}
      <Card>
        <h3 style={{ marginTop: 0, marginBottom: theme.spacing.lg, color: theme.colors.text.primary }}>
          👥 Audience Segments
        </h3>
        
        {/* Segments Overview Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: theme.spacing.lg,
          marginBottom: theme.spacing.xl,
        }}>
          {audienceSegments.map((segment) => (
            <div
              key={segment.id}
              style={{
                padding: theme.spacing.lg,
                backgroundColor: theme.colors.background.tertiary,
                borderRadius: theme.borderRadius.md,
                border: `2px solid ${segment.color}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.md }}>
                <h4 style={{ margin: 0, color: theme.colors.text.primary, fontSize: theme.typography.fontSize.lg }}>
                  {segment.title}
                </h4>
                <span style={{ color: segment.color, fontWeight: 'bold', fontSize: theme.typography.fontSize.sm }}>
                  {segment.percentage}%
                </span>
              </div>

              {/* Segment Stats */}
              <div style={{ marginBottom: theme.spacing.md }}>
                <p style={{ margin: '0 0 8px 0', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                  {segment.engagementLevel === 'super' && '⭐ Super Engaged'}
                  {segment.engagementLevel === 'moderate' && '🎯 Moderately Engaged'}
                  {segment.engagementLevel === 'light' && '📱 Casual Listeners'}
                </p>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.sm,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${segment.percentage}%`,
                    height: '100%',
                    backgroundColor: segment.color,
                  }} />
                </div>
              </div>

              {/* Download CSV Button */}
              <button
                onClick={() => {
                  const csv = ['username,email,listens_this_month,engagement,joined_date', ...segment.listeners.map(l => `${l.username},${l.email},${l.listensThisMonth},${l.engagement},${l.joinedDate}`)].join('\n');
                  const element = document.createElement('a');
                  element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
                  element.setAttribute('download', `${segment.id}-listeners.csv`);
                  element.style.display = 'none';
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                  alert(`📥 ${segment.title} exported as CSV`);
                }}
                style={{
                  width: '100%',
                  padding: `${theme.spacing.sm} ${theme.spacing.md}`,
                  backgroundColor: segment.color,
                  color: 'white',
                  border: 'none',
                  borderRadius: theme.borderRadius.md,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: theme.typography.fontSize.sm,
                }}
              >
                📥 Download CSV
              </button>
            </div>
          ))}
        </div>

        {/* Detailed Listeners Tables */}
        {audienceSegments.map((segment) => (
          <div key={segment.id} style={{ marginBottom: theme.spacing.xl }}>
            <h4 style={{ margin: `${theme.spacing.lg} 0 ${theme.spacing.md} 0`, color: segment.color, fontSize: theme.typography.fontSize.base }}>
              {segment.title} - Detailed View
            </h4>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: theme.typography.fontSize.sm,
              }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${segment.color}` }}>
                    <th style={{ padding: theme.spacing.md, textAlign: 'left', color: theme.colors.text.secondary, fontWeight: 600 }}>Username</th>
                    <th style={{ padding: theme.spacing.md, textAlign: 'left', color: theme.colors.text.secondary, fontWeight: 600 }}>Email</th>
                    <th style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.text.secondary, fontWeight: 600 }}>Listens</th>
                    <th style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.text.secondary, fontWeight: 600 }}>Engagement</th>
                    <th style={{ padding: theme.spacing.md, textAlign: 'left', color: theme.colors.text.secondary, fontWeight: 600 }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {segment.listeners.map((listener, idx) => (
                    <tr
                      key={listener.id}
                      style={{
                        borderBottom: `1px solid ${theme.colors.gray[800]}`,
                        backgroundColor: idx % 2 === 0 ? theme.colors.background.secondary : 'transparent',
                      }}
                    >
                      <td style={{ padding: theme.spacing.md, color: theme.colors.text.primary, fontWeight: 500 }}>
                        {listener.username}
                      </td>
                      <td style={{ padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                        {listener.email}
                      </td>
                      <td style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.accent, fontWeight: 600 }}>
                        {formatNumber(listener.listensThisMonth)}
                      </td>
                      <td style={{ padding: theme.spacing.md, textAlign: 'right', color: segment.color, fontWeight: 600 }}>
                        {listener.engagement}%
                      </td>
                      <td style={{ padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                        {new Date(listener.joinedDate).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </Card>


      {/* GEO Locational Analytics */}
      <Card>
        <h3 style={{ marginTop: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
          📍 Geographic Analytics
        </h3>
        
        {/* Regional Overview */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: theme.spacing.md,
          marginBottom: theme.spacing.lg,
        }}>
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.gray[800]}`,
          }}>
            <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              🌍 Total Countries
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: theme.colors.primary }}>
              {geoData.length}
            </p>
          </div>
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.gray[800]}`,
          }}>
            <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              👥 Total Listeners
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: theme.colors.accent }}>
              {formatNumber(geoData.reduce((sum, g) => sum + g.listeners, 0))}
            </p>
          </div>
          <div style={{
            padding: theme.spacing.md,
            backgroundColor: theme.colors.background.secondary,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.gray[800]}`,
          }}>
            <p style={{ margin: 0, color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              🎯 Avg. Engagement
            </p>
            <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold', color: theme.colors.success }}>
              {(geoData.reduce((sum, g) => sum + g.engagement, 0) / geoData.length).toFixed(1)}%
            </p>
          </div>
        </div>

        {/* Geographic Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: theme.typography.fontSize.sm,
          }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                <th style={{ padding: theme.spacing.md, textAlign: 'left', color: theme.colors.text.secondary, fontWeight: 600 }}>Country</th>
                <th style={{ padding: theme.spacing.md, textAlign: 'left', color: theme.colors.text.secondary, fontWeight: 600 }}>Region</th>
                <th style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.text.secondary, fontWeight: 600 }}>Listeners</th>
                <th style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.text.secondary, fontWeight: 600 }}>Share</th>
                <th style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.text.secondary, fontWeight: 600 }}>Engagement</th>
                <th style={{ padding: theme.spacing.md, textAlign: 'left', color: theme.colors.text.secondary, fontWeight: 600 }}>Top City</th>
              </tr>
            </thead>
            <tbody>
              {geoData.map((geo, index) => (
                <tr
                  key={index}
                  onClick={() => {
                    setSelectedGeoCountry(geo);
                    setShowGeoModal(true);
                  }}
                  style={{
                    borderBottom: `1px solid ${theme.colors.gray[800]}`,
                    backgroundColor: index % 2 === 0 ? theme.colors.background.secondary : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.colors.primary + '20';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = index % 2 === 0 ? theme.colors.background.secondary : 'transparent';
                  }}
                >
                  <td style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.text.primary, fontWeight: 600 }}>
                    {formatNumber(geo.listeners)}
                  </td>
                  <td style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.accent, fontWeight: 600 }}>
                    {geo.percentage}%
                  </td>
                  <td style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.success, fontWeight: 600 }}>
                    {geo.engagement}%
                  </td>
                  <td style={{ padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    {geo.topCity || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Regional Breakdown Chart */}
        <div style={{ marginTop: theme.spacing.lg, paddingTop: theme.spacing.lg, borderTop: `1px solid ${theme.colors.gray[800]}` }}>
          <h4 style={{ margin: '0 0 12px 0', color: theme.colors.text.primary }}>
            📊 Listener Distribution
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            {geoData.slice(0, 5).map((geo, index) => (
              <div key={index}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.xs }}>
                  <span style={{ color: theme.colors.text.primary, fontWeight: 600, fontSize: theme.typography.fontSize.sm }}>
                    {geo.flag} {geo.country}
                  </span>
                  <span style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.xs }}>
                    {geo.percentage}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.sm,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${geo.percentage}%`,
                    height: '100%',
                    backgroundColor: theme.colors.primary,
                    transition: 'width 0.3s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>
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

      {/* Geo Audience Segments Modal */}
      {showGeoModal && selectedGeoCountry && (
        <>
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onClick={() => setShowGeoModal(false)}
          />
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: theme.colors.background.secondary,
              borderRadius: theme.borderRadius.lg,
              border: `2px solid ${theme.colors.primary}`,
              padding: theme.spacing.xl,
              maxWidth: '700px',
              maxHeight: '80vh',
              overflowY: 'auto',
              zIndex: 1001,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.lg }}>
              <h2 style={{ margin: 0, color: theme.colors.text.primary }}>
                {selectedGeoCountry.flag} {selectedGeoCountry.country} - Audience Segments
              </h2>
              <button
                onClick={() => setShowGeoModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '28px',
                  cursor: 'pointer',
                  color: theme.colors.text.secondary,
                }}
              >
                ✕
              </button>
            </div>

            {/* Country Stats */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: theme.spacing.md,
              marginBottom: theme.spacing.lg,
            }}>
              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.tertiary,
                borderRadius: theme.borderRadius.md,
              }}>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                  Region
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: theme.typography.fontSize.base, fontWeight: 'bold', color: theme.colors.text.primary }}>
                  {selectedGeoCountry.region}
                </p>
              </div>
              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.tertiary,
                borderRadius: theme.borderRadius.md,
              }}>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                  Listeners
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: theme.typography.fontSize.base, fontWeight: 'bold', color: theme.colors.accent }}>
                  {formatNumber(selectedGeoCountry.listeners)}
                </p>
              </div>
              <div style={{
                padding: theme.spacing.md,
                backgroundColor: theme.colors.background.tertiary,
                borderRadius: theme.borderRadius.md,
              }}>
                <p style={{ margin: 0, fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                  Engagement
                </p>
                <p style={{ margin: '8px 0 0 0', fontSize: theme.typography.fontSize.base, fontWeight: 'bold', color: theme.colors.success }}>
                  {selectedGeoCountry.engagement}%
                </p>
              </div>
            </div>

            {/* Audience Segments for this Country */}
            <h3 style={{ margin: `${theme.spacing.lg} 0 ${theme.spacing.md} 0`, color: theme.colors.primary }}>
              👥 Audience Distribution
            </h3>
            
            {audienceSegments.map((segment) => (
              <div
                key={segment.id}
                style={{
                  padding: theme.spacing.md,
                  backgroundColor: theme.colors.background.tertiary,
                  borderRadius: theme.borderRadius.md,
                  marginBottom: theme.spacing.md,
                  borderLeft: `4px solid ${segment.color}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm }}>
                  <h4 style={{ margin: 0, color: segment.color }}>
                    {segment.title}
                  </h4>
                  <span style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
                    {Math.round((segment.count * selectedGeoCountry.percentage) / 100)} listeners
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: theme.colors.background.secondary,
                  borderRadius: theme.borderRadius.sm,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${segment.percentage}%`,
                    height: '100%',
                    backgroundColor: segment.color,
                  }} />
                </div>
                <p style={{ margin: '8px 0 0 0', fontSize: theme.typography.fontSize.xs, color: theme.colors.text.secondary }}>
                  {segment.engagementLevel === 'super' && '⭐ Highly engaged fans'}
                  {segment.engagementLevel === 'moderate' && '🎯 Regular listeners'}
                  {segment.engagementLevel === 'light' && '📱 Casual listeners'}
                </p>
              </div>
            ))}

            {/* Export Option */}
            <button
              onClick={() => {
                const csv = [`country,region,segment,listener_count,engagement\n${selectedGeoCountry.country},${selectedGeoCountry.region}`, ...audienceSegments.map(s => `"${s.title}",${Math.round((s.count * selectedGeoCountry.percentage) / 100)},${s.percentage}`)].join('\n');
                const element = document.createElement('a');
                element.setAttribute('href', 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv));
                element.setAttribute('download', `${selectedGeoCountry.country}-audience-segments.csv`);
                element.style.display = 'none';
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
                alert(`📥 ${selectedGeoCountry.country} audience segments exported`);
              }}
              style={{
                width: '100%',
                padding: `${theme.spacing.md} ${theme.spacing.lg}`,
                backgroundColor: theme.colors.primary,
                color: 'white',
                border: 'none',
                borderRadius: theme.borderRadius.md,
                cursor: 'pointer',
                fontWeight: 600,
                marginTop: theme.spacing.lg,
              }}
            >
              📥 Export Audience Data
            </button>
          </div>
        </>
      )}
    </Container>
  );
};

export default AnalyticsPage;
