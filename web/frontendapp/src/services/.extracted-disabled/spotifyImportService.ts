/**
 * Spotify Track Import Service
 * Manages importing Spotify tracks and calculating BEZY values
 */

import { supabaseService } from './supabaseService';
import { spotifyService, SpotifyTrack, SpotifyAudioFeatures } from './spotifyService';
import { spotifyStreamConversionService } from './spotifyStreamConversionService';

export interface ImportedSpotifyTrack {
  id?: string;
  userId: string;
  spotifyTrackId: string;
  title: string;
  artist: string;
  album?: string;
  genre?: string;
  durationMs: number;
  popularity: number;
  energy?: number;
  danceability?: number;
  acousticness?: number;
  albumArtUrl?: string;
  spotifyUrl: string;
  previewUrl?: string;
  popularityStreamEstimate: number;
  totalEstimatedBezy: number;
  isFavorite?: boolean;
  notes?: string;
  importedAt?: string;
  lastSyncedAt?: string;
}

class SpotifyImportService {
  /**
   * Import a single Spotify track
   */
  async importTrack(
    userId: string,
    spotifyTrack: SpotifyTrack,
    audioFeatures?: SpotifyAudioFeatures
  ): Promise<{ success: boolean; track?: ImportedSpotifyTrack; error?: string }> {
    try {
      console.log(`🎵 Importing Spotify track: ${spotifyTrack.name}`);

      // Calculate BEZY value
      const bezyCalc = spotifyStreamConversionService.calculateTrackBezyValue(
        spotifyTrack.popularity,
        audioFeatures ? {
          energy: audioFeatures.energy,
          danceability: audioFeatures.danceability,
          acousticness: audioFeatures.acousticness,
        } : undefined
      );

      const importedTrack: ImportedSpotifyTrack = {
        userId,
        spotifyTrackId: spotifyTrack.id,
        title: spotifyTrack.name,
        artist: spotifyTrack.artists[0]?.name || 'Unknown Artist',
        album: spotifyTrack.album.name,
        durationMs: spotifyTrack.duration_ms,
        popularity: spotifyTrack.popularity,
        energy: audioFeatures?.energy,
        danceability: audioFeatures?.danceability,
        acousticness: audioFeatures?.acousticness,
        albumArtUrl: spotifyTrack.album.images[0]?.url,
        spotifyUrl: spotifyTrack.external_urls.spotify,
        previewUrl: spotifyTrack.preview_url,
        popularityStreamEstimate: Math.round(bezyCalc.estimatedStreams),
        totalEstimatedBezy: bezyCalc.totalBezy,
        importedAt: new Date().toISOString(),
        lastSyncedAt: new Date().toISOString(),
      };

      // Save to database
      const { data, error } = await supabaseService.supabase
        .from('spotify_imported_tracks')
        .upsert(
          {
            user_id: userId,
            spotify_track_id: importedTrack.spotifyTrackId,
            title: importedTrack.title,
            artist: importedTrack.artist,
            album: importedTrack.album,
            duration_ms: importedTrack.durationMs,
            popularity: importedTrack.popularity,
            energy: importedTrack.energy,
            danceability: importedTrack.danceability,
            acousticness: importedTrack.acousticness,
            album_art_url: importedTrack.albumArtUrl,
            spotify_url: importedTrack.spotifyUrl,
            preview_url: importedTrack.previewUrl,
            popularity_stream_estimate: importedTrack.popularityStreamEstimate,
            total_estimated_bezy: importedTrack.totalEstimatedBezy,
            imported_at: importedTrack.importedAt,
            last_synced_at: importedTrack.lastSyncedAt,
          },
          { onConflict: 'user_id,spotify_track_id' }
        )
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to save imported track:', error);
        return { success: false, error: error.message };
      }

      console.log(`✅ Track imported: ${importedTrack.title}`);
      return { success: true, track: importedTrack };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import track';
      console.error('❌ Import error:', errorMessage);
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Import multiple Spotify tracks
   */
  async importTracks(
    userId: string,
    spotifyTracks: SpotifyTrack[],
    audioFeaturesMap?: Map<string, SpotifyAudioFeatures>
  ): Promise<{
    success: boolean;
    importedCount: number;
    tracks?: ImportedSpotifyTrack[];
    errors?: string[];
  }> {
    try {
      console.log(`🎵 Importing ${spotifyTracks.length} Spotify tracks...`);

      const results = await Promise.all(
        spotifyTracks.map(track =>
          this.importTrack(userId, track, audioFeaturesMap?.get(track.id))
        )
      );

      const imported = results
        .filter(r => r.success && r.track)
        .map(r => r.track!) as ImportedSpotifyTrack[];

      const errors = results
        .filter(r => !r.success && r.error)
        .map(r => r.error!) as string[];

      console.log(`✅ Imported ${imported.length} tracks, ${errors.length} errors`);

      return {
        success: errors.length === 0,
        importedCount: imported.length,
        tracks: imported,
        errors: errors.length > 0 ? errors : undefined,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import tracks';
      console.error('❌ Bulk import error:', errorMessage);
      return { success: false, importedCount: 0, errors: [errorMessage] };
    }
  }

  /**
   * Import user's top Spotify tracks
   */
  async importUserTopTracks(
    userId: string,
    limit = 20,
    timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term'
  ): Promise<{
    success: boolean;
    importedCount: number;
    totalBezy: number;
    error?: string;
  }> {
    try {
      console.log(`🎵 Importing user's top ${limit} tracks (${timeRange})`);

      // Get top tracks from Spotify
      const topTracks = await spotifyService.getUserTopTracks(limit, timeRange);

      if (topTracks.length === 0) {
        return { success: false, importedCount: 0, totalBezy: 0, error: 'No tracks found' };
      }

      // Get audio features
      const trackIds = topTracks.map(t => t.id);
      const audioFeaturesMap = await spotifyService.getAudioFeatures(trackIds);

      // Import all tracks
      const result = await this.importTracks(userId, topTracks, audioFeaturesMap);

      const totalBezy = (result.tracks || []).reduce((sum, track) => sum + track.totalEstimatedBezy, 0);

      return {
        success: result.success,
        importedCount: result.importedCount,
        totalBezy,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import top tracks';
      console.error('❌ Top tracks import error:', errorMessage);
      return { success: false, importedCount: 0, totalBezy: 0, error: errorMessage };
    }
  }

  /**
   * Import user's saved/liked tracks
   */
  async importUserSavedTracks(
    userId: string,
    limit = 50
  ): Promise<{
    success: boolean;
    importedCount: number;
    totalBezy: number;
    error?: string;
  }> {
    try {
      console.log(`🎵 Importing user's ${limit} saved tracks`);

      // Get saved tracks from Spotify
      const savedTracks = await spotifyService.getUserSavedTracks(limit);

      if (savedTracks.length === 0) {
        return { success: false, importedCount: 0, totalBezy: 0, error: 'No saved tracks found' };
      }

      // Get audio features
      const trackIds = savedTracks.map(t => t.id);
      const audioFeaturesMap = await spotifyService.getAudioFeatures(trackIds);

      // Import all tracks
      const result = await this.importTracks(userId, savedTracks, audioFeaturesMap);

      const totalBezy = (result.tracks || []).reduce((sum, track) => sum + track.totalEstimatedBezy, 0);

      return {
        success: result.success,
        importedCount: result.importedCount,
        totalBezy,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to import saved tracks';
      console.error('❌ Saved tracks import error:', errorMessage);
      return { success: false, importedCount: 0, totalBezy: 0, error: errorMessage };
    }
  }

  /**
   * Get user's imported tracks from database
   */
  async getUserImportedTracks(userId: string): Promise<{
    success: boolean;
    tracks?: any[];
    error?: string;
  }> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('spotify_imported_tracks')
        .select('*')
        .eq('user_id', userId)
        .order('imported_at', { ascending: false });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, tracks: data || [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch imported tracks';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get imported track by ID
   */
  async getImportedTrack(trackId: string): Promise<{
    success: boolean;
    track?: any;
    error?: string;
  }> {
    try {
      const { data, error } = await supabaseService.supabase
        .from('spotify_imported_tracks')
        .select('*')
        .eq('id', trackId)
        .single();

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, track: data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch track';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Delete imported track
   */
  async deleteImportedTrack(trackId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await supabaseService.supabase
        .from('spotify_imported_tracks')
        .delete()
        .eq('id', trackId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete track';
      return { success: false, error: errorMessage };
    }
  }

  /**
   * Get summary stats for imported tracks
   */
  async getImportedTracksStats(userId: string): Promise<{
    success: boolean;
    stats?: {
      totalTracks: number;
      totalEstimatedBezy: number;
      averagePopularity: number;
      topTrack?: any;
    };
    error?: string;
  }> {
    try {
      const result = await this.getUserImportedTracks(userId);

      if (!result.success || !result.tracks) {
        return { success: false, error: result.error };
      }

      const tracks = result.tracks;
      const totalBezy = tracks.reduce((sum: number, t: any) => sum + (t.total_estimated_bezy || 0), 0);
      const avgPopularity = tracks.length > 0
        ? tracks.reduce((sum: number, t: any) => sum + (t.popularity || 0), 0) / tracks.length
        : 0;

      const topTrack = tracks.length > 0
        ? tracks.reduce((max: any, t: any) => (t.total_estimated_bezy || 0) > (max.total_estimated_bezy || 0) ? t : max)
        : undefined;

      return {
        success: true,
        stats: {
          totalTracks: tracks.length,
          totalEstimatedBezy: totalBezy,
          averagePopularity: Math.round(avgPopularity),
          topTrack,
        },
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch stats';
      return { success: false, error: errorMessage };
    }
  }
}

export const spotifyImportService = new SpotifyImportService();
export type { ImportedSpotifyTrack };
