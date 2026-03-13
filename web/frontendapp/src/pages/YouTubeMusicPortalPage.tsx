import React, { useState, useEffect } from 'react';
import { Container, Header, Card, Button, Badge } from '../components';
import { theme } from '../theme/theme';
import { youtubeMusicService, ManagedTrack, TrackCatalog } from '../services/youtubeMusic';
import { streamingHistoryService } from '../services/streamingHistoryService';
import fileStorageService from '../services/fileStorageService';

interface TrackWithEarnings extends ManagedTrack {
  earnings?: number;
  sessions?: number;
}

interface FormData {
  title: string;
  artist: string;
  genre: string;
  youtubeUrl: string;
  streamPrice: string;
  duration: number;
  fileData?: string;
  fileType?: string;
  fileName?: string;
}

const YouTubeMusicPortalPage: React.FC = () => {
  const [tracks, setTracks] = useState<TrackWithEarnings[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    artist: '',
    genre: 'pop',
    youtubeUrl: '',
    streamPrice: '0.0015',
    duration: 180,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Load tracks on mount
  useEffect(() => {
    loadTracks();
  }, []);

  const loadTracks = () => {
    const catalog = youtubeMusicService.getCatalog();
    const stats = streamingHistoryService.getStats();

    // Merge track data with earnings information
    const tracksWithEarnings = catalog.tracks.map(track => {
      const trackStats = stats.sessions.filter(s => s.trackId === track.id);
      return {
        ...track,
        earnings: trackStats.reduce((sum, s) => sum + parseFloat(s.totalEarned || '0'), 0),
        sessions: trackStats.length,
      };
    });

    setTracks(tracksWithEarnings);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Supported formats
    const supportedFormats = [
      'audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/aac', 'audio/flac', 'audio/aiff',
      'video/mp4', 'video/quicktime', 'video/webm', 'video/ogg',
      'image/gif', 'image/jpeg', 'image/png'
    ];

    if (!supportedFormats.includes(file.type)) {
      alert('❌ Unsupported file format. Supported: MP3, WAV, AIF, MP4, MOV, GIF, and other audio/video formats');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const fileData = event.target?.result as string;
      setFormData(prev => ({
        ...prev,
        fileData,
        fileType: file.type,
        fileName: file.name,
      }));
      setUploadedFileName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleAddTrack = async () => {
    if (!formData.title || !formData.artist) {
      alert('Please fill in title and artist');
      return;
    }

    if (!formData.youtubeUrl && !formData.fileData) {
      alert('Please provide either a YouTube URL or upload a file');
      return;
    }

    try {
      if (editingId) {
        const updated = youtubeMusicService.updateTrack(editingId, {
          title: formData.title,
          artist: formData.artist,
          genre: formData.genre,
          youtubeUrl: formData.youtubeUrl,
          streamPrice: formData.streamPrice,
          duration: formData.duration,
        });
        if (updated) {
          // Store file in IndexedDB if provided
          if (formData.fileData && formData.fileType) {
            await fileStorageService.saveFile(
              editingId,
              formData.fileData,
              formData.fileType,
              formData.fileName || 'audio'
            );
          }
          alert('✅ Track updated successfully');
        }
        setEditingId(null);
      } else {
        const track = youtubeMusicService.addTrack(
          formData.title,
          formData.artist,
          formData.genre,
          formData.youtubeUrl,
          formData.streamPrice,
          formData.duration
        );

        // Store file in IndexedDB if provided
        if (formData.fileData && formData.fileType) {
          await fileStorageService.saveFile(
            track.id,
            formData.fileData,
            formData.fileType,
            formData.fileName || 'audio'
          );
        }

        alert('✅ Track added successfully');
      }

      setFormData({
        title: '',
        artist: '',
        genre: 'pop',
        youtubeUrl: '',
        streamPrice: '0.0015',
        duration: 180,
      });
      setUploadedFileName('');
      setShowAddForm(false);
      loadTracks();
    } catch (error) {
      console.error('Error adding track:', error);
      alert('❌ Error adding track. Please try again.');
    }
  };

  const handleEditTrack = (track: TrackWithEarnings) => {
    setFormData({
      title: track.title,
      artist: track.artist,
      genre: track.genre,
      youtubeUrl: track.youtubeUrl || '',
      streamPrice: track.streamPrice,
      duration: track.duration,
      fileData: track.fileData,
      fileType: track.fileType,
      fileName: track.fileName,
    });
    setUploadedFileName(track.fileName || '');
    setEditingId(track.id);
    setShowAddForm(true);
  };

  const handleDeleteTrack = async (trackId: string) => {
    if (window.confirm('Are you sure you want to delete this track?')) {
      if (youtubeMusicService.deleteTrack(trackId)) {
        // Also delete file from IndexedDB if it exists
        try {
          await fileStorageService.deleteFile(trackId);
        } catch (error) {
          console.error('Error deleting file:', error);
        }
        alert('🗑️ Track deleted');
        loadTracks();
      }
    }
  };

  const handleToggleTrack = (trackId: string) => {
    const enabled = youtubeMusicService.toggleTrack(trackId);
    loadTracks();
  };

  const handleExport = () => {
    const json = youtubeMusicService.exportCatalog();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(json));
    element.setAttribute('download', 'soundmoney-tracks.json');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    alert('📥 Catalog exported');
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          try {
            const catalog = JSON.parse(event.target.result) as TrackCatalog;
            localStorage.setItem('soundmoney_track_catalog', JSON.stringify(catalog));
            alert('📤 Catalog imported successfully');
            loadTracks();
          } catch (error) {
            alert('❌ Invalid catalog file');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const filteredTracks = tracks.filter(t =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEarnings = tracks.reduce((sum, t) => sum + (t.earnings || 0), 0);
  const totalTracks = tracks.length;
  const enabledTracks = tracks.filter(t => t.enabled).length;

  const getFileTypeLabel = (fileType?: string): string => {
    if (!fileType) return '';
    if (fileType.startsWith('audio/')) return '🎵 Audio';
    if (fileType.startsWith('video/')) return '🎬 Video';
    if (fileType.startsWith('image/')) return '🖼️ Image';
    return '📄 File';
  };

  return (
    <Container maxWidth="lg" padding="lg">
      <Header
        title="🎵 Music Portal"
        subtitle="Manage your streaming track catalog"
      />

      {/* Stats Overview */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
      }}>
        <Card style={{ padding: theme.spacing.lg, textAlign: 'center' }}>
          <p style={{ margin: 0, marginBottom: theme.spacing.sm, color: theme.colors.text.secondary }}>
            Total Tracks
          </p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: theme.colors.primary }}>
            {totalTracks}
          </p>
          <p style={{ margin: 0, marginTop: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
            {enabledTracks} enabled
          </p>
        </Card>

        <Card style={{ padding: theme.spacing.lg, textAlign: 'center' }}>
          <p style={{ margin: 0, marginBottom: theme.spacing.sm, color: theme.colors.text.secondary }}>
            Total Earnings
          </p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: theme.colors.accent }}>
            {totalEarnings.toFixed(6)} BZY
          </p>
          <p style={{ margin: 0, marginTop: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
            From streaming sessions
          </p>
        </Card>

        <Card style={{ padding: theme.spacing.lg, textAlign: 'center' }}>
          <p style={{ margin: 0, marginBottom: theme.spacing.sm, color: theme.colors.text.secondary }}>
            Avg. Per Track
          </p>
          <p style={{ margin: 0, fontSize: '32px', fontWeight: 'bold', color: theme.colors.info }}>
            {totalTracks > 0 ? (totalEarnings / totalTracks).toFixed(6) : '0'} BZY
          </p>
          <p style={{ margin: 0, marginTop: '4px', color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
            Average earnings
          </p>
        </Card>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.lg,
        flexWrap: 'wrap',
      }}>
        <Button
          variant="primary"
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setFormData({
              title: '',
              artist: '',
              genre: 'pop',
              youtubeUrl: '',
              streamPrice: '0.0015',
              duration: 180,
            });
            setUploadedFileName('');
          }}
        >
          {showAddForm ? '✕ Cancel' : '➕ Add Track'}
        </Button>
        <Button variant="secondary" onClick={handleExport}>
          📥 Export Catalog
        </Button>
        <Button variant="secondary" onClick={handleImport}>
          📤 Import Catalog
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card style={{ marginBottom: theme.spacing.lg, padding: theme.spacing.lg }}>
          <h3 style={{ margin: 0, marginBottom: theme.spacing.md, color: theme.colors.text.primary }}>
            {editingId ? '✏️ Edit Track' : '➕ Add New Track'}
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
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
                Track Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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
                Artist *
              </label>
              <input
                type="text"
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
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
                Genre
              </label>
              <select
                value={formData.genre}
                onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
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
              >
                <option value="pop">Pop</option>
                <option value="hip-hop">Hip Hop</option>
                <option value="rock">Rock</option>
                <option value="electronic">Electronic</option>
                <option value="indie">Indie</option>
                <option value="jazz">Jazz</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.xs,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}>
                YouTube URL
              </label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
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
                placeholder="https://www.youtube.com/..."
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.xs,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}>
                Stream Price (BZY/sec)
              </label>
              <input
                type="number"
                step="0.0001"
                value={formData.streamPrice}
                onChange={(e) => setFormData({ ...formData, streamPrice: e.target.value })}
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
                placeholder="0.0015"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: theme.spacing.xs,
                color: theme.colors.text.secondary,
                fontSize: theme.typography.fontSize.sm,
              }}>
                Duration (seconds)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 180 })}
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
                placeholder="180"
              />
            </div>
          </div>

          {/* File Upload Section */}
          <div style={{ marginBottom: theme.spacing.md }}>
            <label style={{
              display: 'block',
              marginBottom: theme.spacing.xs,
              color: theme.colors.text.secondary,
              fontSize: theme.typography.fontSize.sm,
            }}>
              📁 Upload Audio/Video/GIF (MP3, WAV, MP4, MOV, GIF, etc.)
            </label>
            <input
              type="file"
              accept="audio/*,video/*,.gif,.aif,.aiff"
              onChange={handleFileUpload}
              style={{
                width: '100%',
                padding: theme.spacing.sm,
                borderRadius: theme.borderRadius.md,
                border: `2px dashed ${theme.colors.gray[700]}`,
                backgroundColor: theme.colors.background.secondary,
                color: theme.colors.text.primary,
                fontSize: theme.typography.fontSize.base,
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            />
            {uploadedFileName && (
              <p style={{
                marginTop: theme.spacing.xs,
                color: theme.colors.success || '#10b981',
                fontSize: theme.typography.fontSize.sm,
              }}>
                ✓ File selected: {uploadedFileName}
              </p>
            )}
          </div>

          <Button variant="primary" onClick={handleAddTrack}>
            {editingId ? '💾 Update Track' : '➕ Add Track'}
          </Button>
        </Card>
      )}

      {/* Search */}
      <div style={{ marginBottom: theme.spacing.lg }}>
        <input
          type="text"
          placeholder="🔍 Search tracks by title or artist..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: theme.spacing.md,
            borderRadius: theme.borderRadius.md,
            border: `1px solid ${theme.colors.gray[700]}`,
            backgroundColor: theme.colors.background.secondary,
            color: theme.colors.text.primary,
            fontSize: theme.typography.fontSize.base,
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Tracks Table */}
      <Card>
        {filteredTracks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: theme.spacing.lg }}>
            <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.lg }}>
              {tracks.length === 0 ? '🎵 No tracks yet' : '🔍 No matching tracks'}
            </p>
            <p style={{ color: theme.colors.text.secondary, fontSize: theme.typography.fontSize.sm }}>
              {tracks.length === 0 ? 'Click "Add Track" to start building your catalog' : 'Try a different search'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              color: theme.colors.text.primary,
            }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                  <th style={{ textAlign: 'left', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Track
                  </th>
                  <th style={{ textAlign: 'left', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Artist
                  </th>
                  <th style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Genre
                  </th>
                  <th style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Type
                  </th>
                  <th style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Price/sec
                  </th>
                  <th style={{ textAlign: 'right', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Sessions
                  </th>
                  <th style={{ textAlign: 'right', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Earnings
                  </th>
                  <th style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Status
                  </th>
                  <th style={{ textAlign: 'center', padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTracks.map((track) => (
                  <tr key={track.id} style={{ borderBottom: `1px solid ${theme.colors.gray[800]}` }}>
                    <td style={{ padding: theme.spacing.md, color: theme.colors.text.primary }}>
                      {track.title}
                    </td>
                    <td style={{ padding: theme.spacing.md, color: theme.colors.text.secondary }}>
                      {track.artist}
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'center', color: theme.colors.text.secondary }}>
                      <Badge variant="info" size="sm">
                        {track.genre}
                      </Badge>
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'center', color: theme.colors.text.secondary }}>
                      {track.fileType ? (
                        <Badge variant="success" size="sm">
                          {getFileTypeLabel(track.fileType)}
                        </Badge>
                      ) : (
                        <Badge variant="info" size="sm">
                          🔗 URL
                        </Badge>
                      )}
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'center', color: theme.colors.text.secondary }}>
                      {track.streamPrice}
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.text.secondary }}>
                      {track.sessions || 0}
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'right', color: theme.colors.accent, fontWeight: 600 }}>
                      {(track.earnings || 0).toFixed(6)} BZY
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'center' }}>
                      <button
                        onClick={() => handleToggleTrack(track.id)}
                        style={{
                          padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                          borderRadius: theme.borderRadius.md,
                          border: 'none',
                          backgroundColor: track.enabled ? '#10b981' : theme.colors.gray[700],
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: theme.typography.fontSize.sm,
                          fontWeight: 600,
                        }}
                      >
                        {track.enabled ? '✓ On' : '○ Off'}
                      </button>
                    </td>
                    <td style={{ padding: theme.spacing.md, textAlign: 'center' }}>
                      <div style={{ display: 'flex', gap: theme.spacing.xs, justifyContent: 'center' }}>
                        <button
                          onClick={() => handleEditTrack(track)}
                          style={{
                            padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                            borderRadius: theme.borderRadius.md,
                            border: 'none',
                            backgroundColor: theme.colors.primary,
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: theme.typography.fontSize.sm,
                          }}
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteTrack(track.id)}
                          style={{
                            padding: `${theme.spacing.xs} ${theme.spacing.md}`,
                            borderRadius: theme.borderRadius.md,
                            border: 'none',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: theme.typography.fontSize.sm,
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </Container>
  );
};

export default YouTubeMusicPortalPage;
