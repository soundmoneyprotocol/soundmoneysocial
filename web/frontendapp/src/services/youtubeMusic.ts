/**
 * YouTube Music Integration Service
 * Manages track catalog and streaming data for non-technical users
 */

export interface TrackMetadata {
  description?: string;
  releaseDate?: string;
  version?: string;
  remixInfo?: string;
  producer?: string;
  songwriter?: string;
  credits?: string;
  tags?: string[];
}

export interface ManagedTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  streamPrice: string; // BZY per second
  youtubeUrl?: string;
  spotifyUrl?: string;
  coverUrl?: string;
  fileData?: string; // Base64 encoded file data (audio/video/gif)
  fileType?: string; // MIME type (audio/mpeg, video/mp4, image/gif, etc.)
  fileName?: string; // Original file name
  duration: number; // seconds
  metadata?: TrackMetadata;
  enabled: boolean; // Whether track is available for streaming
  addedAt: string; // ISO timestamp
}

export interface TrackCatalog {
  tracks: ManagedTrack[];
  totalTracks: number;
  lastUpdated: string;
}

const STORAGE_KEY = 'soundmoney_track_catalog';

class YouTubeMusicService {
  /**
   * Add a track to the user's catalog
   */
  addTrack(
    title: string,
    artist: string,
    genre: string,
    youtubeUrl: string,
    streamPrice: string = '0.0015',
    duration: number = 180,
    spotifyUrl?: string,
    metadata?: TrackMetadata
  ): ManagedTrack {
    const track: ManagedTrack = {
      id: `track_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title,
      artist,
      genre,
      streamPrice,
      youtubeUrl,
      spotifyUrl,
      duration,
      metadata,
      enabled: true,
      addedAt: new Date().toISOString(),
    };

    const catalog = this.getCatalog();
    catalog.tracks.push(track);
    this.saveCatalog(catalog);

    console.log(`✅ Track added: ${title} by ${artist}`);
    return track;
  }

  /**
   * Get all tracks in user's catalog
   */
  getCatalog(): TrackCatalog {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {
          tracks: [],
          totalTracks: 0,
          lastUpdated: new Date().toISOString(),
        };
      }

      return JSON.parse(stored) as TrackCatalog;
    } catch (error) {
      console.error('Failed to load track catalog:', error);
      return {
        tracks: [],
        totalTracks: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
  }

  /**
   * Get enabled tracks only
   */
  getEnabledTracks(): ManagedTrack[] {
    const catalog = this.getCatalog();
    return catalog.tracks.filter(track => track.enabled);
  }

  /**
   * Update track details
   */
  updateTrack(trackId: string, updates: Partial<ManagedTrack>): ManagedTrack | null {
    const catalog = this.getCatalog();
    const track = catalog.tracks.find(t => t.id === trackId);

    if (!track) return null;

    const updated = { ...track, ...updates };
    const index = catalog.tracks.findIndex(t => t.id === trackId);
    catalog.tracks[index] = updated;

    this.saveCatalog(catalog);
    console.log(`✅ Track updated: ${updated.title}`);
    return updated;
  }

  /**
   * Toggle track enabled/disabled
   */
  toggleTrack(trackId: string): boolean {
    const catalog = this.getCatalog();
    const track = catalog.tracks.find(t => t.id === trackId);

    if (!track) return false;

    track.enabled = !track.enabled;
    this.saveCatalog(catalog);

    console.log(`${track.enabled ? '✅' : '❌'} Track toggled: ${track.title}`);
    return track.enabled;
  }

  /**
   * Delete track from catalog
   */
  deleteTrack(trackId: string): boolean {
    const catalog = this.getCatalog();
    const index = catalog.tracks.findIndex(t => t.id === trackId);

    if (index === -1) return false;

    const removed = catalog.tracks.splice(index, 1)[0];
    this.saveCatalog(catalog);

    console.log(`🗑️ Track deleted: ${removed.title}`);
    return true;
  }

  /**
   * Get tracks by genre
   */
  getTracksByGenre(genre: string): ManagedTrack[] {
    const catalog = this.getCatalog();
    return catalog.tracks.filter(t => t.genre === genre && t.enabled);
  }

  /**
   * Get top earning tracks
   */
  getTopTracks(limit = 10): ManagedTrack[] {
    const catalog = this.getCatalog();
    return catalog.tracks
      .filter(t => t.enabled)
      .sort((a, b) => parseFloat(b.streamPrice) - parseFloat(a.streamPrice))
      .slice(0, limit);
  }

  /**
   * Search tracks
   */
  searchTracks(query: string): ManagedTrack[] {
    const catalog = this.getCatalog();
    const lowerQuery = query.toLowerCase();

    return catalog.tracks.filter(
      t =>
        t.enabled &&
        (t.title.toLowerCase().includes(lowerQuery) ||
          t.artist.toLowerCase().includes(lowerQuery))
    );
  }

  /**
   * Update catalog metadata
   */
  private saveCatalog(catalog: TrackCatalog): void {
    catalog.totalTracks = catalog.tracks.length;
    catalog.lastUpdated = new Date().toISOString();
    
    // Strip fileData from tracks before saving to localStorage (stored in IndexedDB instead)
    const catalogWithoutFiles = {
      ...catalog,
      tracks: catalog.tracks.map(t => {
        const { fileData, ...trackWithoutFile } = t;
        return trackWithoutFile;
      })
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catalogWithoutFiles));
  }

  /**
   * Import tracks from URL (simulated)
   */
  async importFromURL(playlistUrl: string): Promise<ManagedTrack[]> {
    console.log(`📥 Importing from YouTube Music URL: ${playlistUrl}`);
    // In production, this would use ytmusic-api or backend service
    // For now, return empty array
    return [];
  }

  /**
   * Export catalog as JSON
   */
  exportCatalog(): string {
    const catalog = this.getCatalog();
    return JSON.stringify(catalog, null, 2);
  }

  /**
   * Clear all tracks
   */
  clearCatalog(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log('🗑️ Catalog cleared');
  }
}

export const youtubeMusicService = new YouTubeMusicService();
export default youtubeMusicService;
