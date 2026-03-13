/**
 * Spotify API Service - Enhanced
 * Fetches tracks, audio features, and user data from Spotify Web API
 */

import { spotifyOAuthService } from './spotifyOAuthService';

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{
    id: string;
    name: string;
  }>;
  album: {
    id: string;
    name: string;
    images: Array<{
      url: string;
      height: number;
      width: number;
    }>;
  };
  duration_ms: number;
  explicit: boolean;
  popularity: number;
  preview_url?: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyAudioFeatures {
  id: string;
  energy: number;
  danceability: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  loudness: number;
  speechiness: number;
  tempo: number;
  valence: number;
}

export interface SpotifyUserProfile {
  id: string;
  display_name: string;
  email?: string;
  images?: Array<{
    url: string;
    height?: number;
    width?: number;
  }>;
  followers: {
    total: number;
  };
  external_urls: {
    spotify: string;
  };
}

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
}

interface SpotifyArtistTopTracksResponse {
  tracks: SpotifyTrack[];
}

interface SpotifyUserTopTracksResponse {
  items: SpotifyTrack[];
  total: number;
  limit: number;
}

interface SpotifyAudioFeaturesResponse {
  audio_features: SpotifyAudioFeatures[];
}

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

class SpotifyService {
  /**
   * Get authorization header from stored token
   */
  private async getAuthHeader(): Promise<string | null> {
    const header = await spotifyOAuthService.getAuthorizationHeader();
    return header;
  }

  /**
   * Make authenticated request to Spotify API
   */
  private async fetchSpotify(endpoint: string, options: RequestInit = {}): Promise<any> {
    const authHeader = await this.getAuthHeader();

    const headers = {
      ...options.headers,
      'Content-Type': 'application/json',
      ...(authHeader && { 'Authorization': authHeader }),
    };

    try {
      const response = await fetch(`${SPOTIFY_API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.warn('⚠️ Spotify: Unauthorized - token may have expired');
          return null;
        }
        console.error(`❌ Spotify API error: ${response.status}`);
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Spotify API request failed:', error);
      return null;
    }
  }

  /**
   * Search for tracks on Spotify
   */
  async searchTracks(query: string, limit = 20): Promise<SpotifyTrack[]> {
    try {
      console.log(`🎵 Spotify: Searching for "${query}"`);

      const response = await fetch(
        `${SPOTIFY_API_BASE}/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`
      );

      if (!response.ok) {
        console.warn('⚠️ Spotify API unavailable');
        return [];
      }

      const data: SpotifySearchResponse = await response.json();
      console.log(`✅ Spotify: Found ${data.tracks.items.length} tracks`);
      return data.tracks.items;
    } catch (error) {
      console.error('❌ Spotify: Error searching tracks:', error);
      return [];
    }
  }

  /**
   * Get user's top tracks (requires authentication)
   */
  async getUserTopTracks(limit = 20, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'): Promise<SpotifyTrack[]> {
    try {
      console.log(`🎵 Spotify: Fetching user's top tracks (${timeRange})`);

      const data = await this.fetchSpotify(
        `/me/top/tracks?limit=${limit}&time_range=${timeRange}`
      );

      if (!data || !data.items) {
        console.warn('⚠️ Spotify: Failed to fetch user top tracks');
        return [];
      }

      console.log(`✅ Spotify: Retrieved ${data.items.length} top tracks`);
      return data.items;
    } catch (error) {
      console.error('❌ Spotify: Error fetching user top tracks:', error);
      return [];
    }
  }

  /**
   * Get user's saved/liked tracks (requires authentication)
   */
  async getUserSavedTracks(limit = 50): Promise<SpotifyTrack[]> {
    try {
      console.log('🎵 Spotify: Fetching user\'s saved tracks');

      const data = await this.fetchSpotify(
        `/me/tracks?limit=${limit}`
      );

      if (!data || !data.items) {
        console.warn('⚠️ Spotify: Failed to fetch saved tracks');
        return [];
      }

      const tracks = data.items.map((item: any) => item.track).filter(Boolean);
      console.log(`✅ Spotify: Retrieved ${tracks.length} saved tracks`);
      return tracks;
    } catch (error) {
      console.error('❌ Spotify: Error fetching saved tracks:', error);
      return [];
    }
  }

  /**
   * Get audio features for multiple tracks
   */
  async getAudioFeatures(trackIds: string[]): Promise<Map<string, SpotifyAudioFeatures>> {
    try {
      if (trackIds.length === 0) return new Map();

      console.log(`🎵 Spotify: Fetching audio features for ${trackIds.length} tracks`);

      // Spotify allows max 100 IDs per request
      const features = new Map<string, SpotifyAudioFeatures>();
      const chunks = [];

      for (let i = 0; i < trackIds.length; i += 100) {
        chunks.push(trackIds.slice(i, i + 100));
      }

      for (const chunk of chunks) {
        const data = await this.fetchSpotify(
          `/audio-features?ids=${chunk.join(',')}`
        );

        if (data && data.audio_features) {
          data.audio_features.forEach((feature: SpotifyAudioFeatures) => {
            features.set(feature.id, feature);
          });
        }
      }

      console.log(`✅ Spotify: Retrieved audio features for ${features.size} tracks`);
      return features;
    } catch (error) {
      console.error('❌ Spotify: Error fetching audio features:', error);
      return new Map();
    }
  }

  /**
   * Get audio features for a single track
   */
  async getAudioFeaturesForTrack(trackId: string): Promise<SpotifyAudioFeatures | null> {
    try {
      const features = await this.getAudioFeatures([trackId]);
      return features.get(trackId) || null;
    } catch (error) {
      console.error('❌ Spotify: Error fetching track audio features:', error);
      return null;
    }
  }

  /**
   * Get artist's top tracks
   */
  async getArtistTopTracks(artistId: string, limit = 10): Promise<SpotifyTrack[]> {
    try {
      console.log(`🎵 Spotify: Fetching top tracks for artist ${artistId}`);

      const response = await fetch(
        `${SPOTIFY_API_BASE}/artists/${artistId}/top-tracks?market=US&limit=${limit}`
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data: SpotifyArtistTopTracksResponse = await response.json();
      console.log(`✅ Spotify: Retrieved ${data.tracks.length} top tracks`);
      return data.tracks;
    } catch (error) {
      console.error('❌ Spotify: Error fetching artist top tracks:', error);
      return [];
    }
  }

  /**
   * Get recommendations based on seed tracks/artists/genres
   */
  async getRecommendations(
    seedTrackIds: string[],
    seedArtistIds: string[] = [],
    seedGenres: string[] = [],
    limit = 20
  ): Promise<SpotifyTrack[]> {
    try {
      if (seedTrackIds.length === 0 && seedArtistIds.length === 0 && seedGenres.length === 0) {
        return [];
      }

      console.log('🎵 Spotify: Fetching recommendations');

      const seedTracks = seedTrackIds.slice(0, 5).join(',');
      const seedArtists = seedArtistIds.slice(0, 5).join(',');
      const seedGenresStr = seedGenres.slice(0, 5).join(',');

      let queryParams = `?limit=${limit}`;
      if (seedTracks) queryParams += `&seed_tracks=${seedTracks}`;
      if (seedArtists) queryParams += `&seed_artists=${seedArtists}`;
      if (seedGenresStr) queryParams += `&seed_genres=${seedGenresStr}`;

      const response = await fetch(
        `${SPOTIFY_API_BASE}/recommendations${queryParams}`
      );

      if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ Spotify: Retrieved ${data.tracks.length} recommendations`);
      return data.tracks;
    } catch (error) {
      console.error('❌ Spotify: Error fetching recommendations:', error);
      return [];
    }
  }

  /**
   * Get user profile (requires authentication)
   */
  async getUserProfile(): Promise<SpotifyUserProfile | null> {
    try {
      console.log('👤 Spotify: Fetching user profile');

      const data = await this.fetchSpotify('/me');

      if (!data) {
        console.warn('⚠️ Spotify: Failed to fetch user profile');
        return null;
      }

      console.log(`✅ Spotify: Profile retrieved for ${data.display_name}`);
      return data;
    } catch (error) {
      console.error('❌ Spotify: Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Convert Spotify track to app format
   */
  convertToAppTrack(spotifyTrack: SpotifyTrack, audioFeatures?: SpotifyAudioFeatures) {
    const durationSeconds = Math.floor(spotifyTrack.duration_ms / 1000);
    const minutes = Math.floor(durationSeconds / 60);
    const seconds = durationSeconds % 60;
    const durationFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const artistName = spotifyTrack.artists[0]?.name || 'Unknown Artist';
    const albumArt = spotifyTrack.album.images[0]?.url || '';

    return {
      id: spotifyTrack.id,
      title: spotifyTrack.name,
      artist: artistName,
      artistHandle: spotifyTrack.artists[0]?.id || '',
      genre: 'Spotify',
      duration: durationFormatted,
      durationMs: spotifyTrack.duration_ms,
      streamPrice: '0.001',
      coverArt: albumArt,
      isPlaying: false,
      isImported: true,
      isSpotify: true,
      spotifyId: spotifyTrack.id,
      popularity: spotifyTrack.popularity,
      preview: spotifyTrack.preview_url,
      audioUrl: spotifyTrack.preview_url,
      spotifyUrl: spotifyTrack.external_urls.spotify,
      audioFeatures: audioFeatures || undefined,
    };
  }
}

export const spotifyService = new SpotifyService();
export type { SpotifyTrack, SpotifyAudioFeatures, SpotifyUserProfile };
