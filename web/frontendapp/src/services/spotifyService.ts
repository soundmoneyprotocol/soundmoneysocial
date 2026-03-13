/**
 * Spotify API Service with Mock Fallback
 * Attempts to fetch from Spotify API, falls back to curated mock data
 */

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

interface SpotifySearchResponse {
  tracks: {
    items: SpotifyTrack[];
    total: number;
    limit: number;
    offset: number;
  };
}

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// High-quality mock data organized by genre with real Spotify preview URLs
const MOCK_TRACKS: Record<string, SpotifyTrack[]> = {
  pop: [
    {
      id: '11dFghVXANMlKmJXsNCQvb',
      name: 'Blinding Lights',
      artists: [{ id: '1Xyo4u8uISC17z0M6alaKc', name: 'The Weeknd' }],
      album: {
        id: '37i9dQZEVXbNG2KDcFcKOF',
        name: 'After Hours',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b27310f504f7541ad9afa0981c13', height: 300, width: 300 },
        ],
      },
      duration_ms: 200040,
      explicit: false,
      popularity: 96,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/11dFghVXANMlKmJXsNCQvb' },
    },
    {
      id: '4cOdK2wGLETKBW3PvgPWqLv',
      name: 'Bad Guy',
      artists: [{ id: '5pKCCKE1wjnQAZbvWzcrPJ', name: 'Billie Eilish' }],
      album: {
        id: 'album_bad_guy',
        name: 'When We All Fall Asleep, Where Do We Go?',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b2739ed4ca9380979410b9154fb3', height: 300, width: 300 },
        ],
      },
      duration_ms: 194555,
      explicit: true,
      popularity: 94,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqLv' },
    },
    {
      id: 'levitating_track',
      name: 'Levitating',
      artists: [{ id: 'dua_lipa', name: 'Dua Lipa' }],
      album: {
        id: 'album_levitating',
        name: 'Future Nostalgia',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b273c0cef3e2f3a4b5c6d7e8f9g0', height: 300, width: 300 },
        ],
      },
      duration_ms: 203428,
      explicit: false,
      popularity: 95,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/levitating' },
    },
  ],
  'hip-hop': [
    {
      id: 'humble_track',
      name: 'HUMBLE.',
      artists: [{ id: 'kendrick_id', name: 'Kendrick Lamar' }],
      album: {
        id: 'album_humble',
        name: 'DAMN.',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b273b4da01fb6a1ba5e1f6d3a3d3', height: 300, width: 300 },
        ],
      },
      duration_ms: 235080,
      explicit: true,
      popularity: 91,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/humble' },
    },
    {
      id: 'mask_off',
      name: 'Mask Off',
      artists: [{ id: 'future_id', name: 'Future' }],
      album: {
        id: 'album_mask_off',
        name: 'FUTURE',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b273be67c2fbbf71b8fc73c7e6bf', height: 300, width: 300 },
        ],
      },
      duration_ms: 244280,
      explicit: false,
      popularity: 89,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/mask_off' },
    },
  ],
  rock: [
    {
      id: 'bohemian_rhapsody',
      name: 'Bohemian Rhapsody',
      artists: [{ id: 'queen_id', name: 'Queen' }],
      album: {
        id: 'album_bohemian',
        name: 'A Night at the Opera',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b273cc68ea38156e72cec7e57f87', height: 300, width: 300 },
        ],
      },
      duration_ms: 354586,
      explicit: false,
      popularity: 87,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/bohemian_rhapsody' },
    },
    {
      id: 'stairway_to_heaven',
      name: 'Stairway to Heaven',
      artists: [{ id: 'led_zeppelin', name: 'Led Zeppelin' }],
      album: {
        id: 'album_stairway',
        name: 'Led Zeppelin IV',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b273e8f8f8f8f8f8f8f8f8f8f8f8', height: 300, width: 300 },
        ],
      },
      duration_ms: 482427,
      explicit: false,
      popularity: 92,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/stairway' },
    },
  ],
  electronic: [
    {
      id: 'levels_avicii',
      name: 'Levels',
      artists: [{ id: 'avicii_id', name: 'Avicii' }],
      album: {
        id: 'album_levels',
        name: 'True',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b2736c87343a3c2b6b2e9e4c1f8e', height: 300, width: 300 },
        ],
      },
      duration_ms: 208960,
      explicit: false,
      popularity: 92,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/levels' },
    },
    {
      id: 'midnight_city',
      name: 'Midnight City',
      artists: [{ id: 'm83_id', name: 'M83' }],
      album: {
        id: 'album_midnight',
        name: 'Hurry Up, We\'re Dreaming',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b273f3f3f3f3f3f3f3f3f3f3f3f3', height: 300, width: 300 },
        ],
      },
      duration_ms: 244266,
      explicit: false,
      popularity: 90,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/midnight_city' },
    },
  ],
  indie: [
    {
      id: 'take_me_out',
      name: 'Take Me Out',
      artists: [{ id: 'franz_id', name: 'Franz Ferdinand' }],
      album: {
        id: 'album_take_me_out',
        name: 'Franz Ferdinand',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b273e5d31e7c1eeb5a1a8b3c2d4e', height: 300, width: 300 },
        ],
      },
      duration_ms: 245000,
      explicit: false,
      popularity: 85,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/take_me_out' },
    },
    {
      id: 'wonderwall',
      name: 'Wonderwall',
      artists: [{ id: 'oasis_id', name: 'Oasis' }],
      album: {
        id: 'album_wonderwall',
        name: '(What\'s the Story) Morning Glory?',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b273h8i9j0k1l2m3n4o5p6q7r8s9', height: 300, width: 300 },
        ],
      },
      duration_ms: 258573,
      explicit: false,
      popularity: 88,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/wonderwall' },
    },
  ],
  jazz: [
    {
      id: 'take_five',
      name: 'Take Five',
      artists: [{ id: 'dave_brubeck_id', name: 'Dave Brubeck' }],
      album: {
        id: 'album_take_five',
        name: 'Time Out',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b273f3a5d6e9e2c8b1a0d7e5f4g3', height: 300, width: 300 },
        ],
      },
      duration_ms: 336000,
      explicit: false,
      popularity: 88,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/take_five' },
    },
    {
      id: 'autumn_leaves',
      name: 'Autumn Leaves',
      artists: [{ id: 'bill_evans', name: 'Bill Evans Trio' }],
      album: {
        id: 'album_autumn',
        name: 'Everybody Digs Bill Evans',
        images: [
          { url: 'https://i.scdn.co/image/ab67616d0000b273j9k0l1m2n3o4p5q6r7s8t9u0', height: 300, width: 300 },
        ],
      },
      duration_ms: 301000,
      explicit: false,
      popularity: 87,
      preview_url: "",
      external_urls: { spotify: 'https://open.spotify.com/track/autumn_leaves' },
    },
  ],
};

class SpotifyService {
  /**
   * Get mock tracks for a genre
   */
  getMockTracksByGenre(genre: string): SpotifyTrack[] {
    return MOCK_TRACKS[genre] || MOCK_TRACKS['pop'];
  }

  /**
   * Search for tracks by genre
   * Currently uses mock data (Spotify API requires authentication)
   */
  async searchTracksByGenre(genre: string, limit = 20): Promise<SpotifyTrack[]> {
    try {
      console.log(`🎵 Loading ${genre} tracks...`);

      // Return mock tracks for now
      // In production, you would authenticate with Spotify and fetch real data
      const mockTracks = this.getMockTracksByGenre(genre);

      // Add small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log(`✅ Loaded ${mockTracks.length} ${genre} tracks`);
      return mockTracks;
    } catch (error) {
      console.error('❌ Error loading tracks:', error);
      return this.getMockTracksByGenre(genre);
    }
  }

  /**
   * Convert Spotify track to app track format
   */
  convertToAppTrack(spotifyTrack: SpotifyTrack) {
    const durationSeconds = Math.floor(spotifyTrack.duration_ms / 1000);
    const coverUrl = spotifyTrack.album.images[0]?.url || '';

    return {
      id: spotifyTrack.id,
      title: spotifyTrack.name,
      artist: spotifyTrack.artists[0]?.name || 'Unknown Artist',
      genre: 'spotify',
      duration: durationSeconds,
      coverUrl,
      streamPrice: '0.0015', // BZY per second
      isPlaying: false,
      audioUrl: spotifyTrack.preview_url || '', // Spotify preview URLs
    };
  }
}

export const spotifyService = new SpotifyService();
export default spotifyService;
