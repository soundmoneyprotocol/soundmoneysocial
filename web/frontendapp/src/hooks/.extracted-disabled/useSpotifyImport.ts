/**
 * useSpotifyImport Hook
 * Manages Spotify track imports and BEZY conversions
 */

import { useState, useCallback } from 'react';
import { spotifyImportService, ImportedSpotifyTrack } from '../services/spotifyImportService';
import { spotifyService } from '../services/spotifyService';
import { priceConversionService } from '../services/priceConversionService';
import { useAuth } from './useAuth';

interface SpotifyImportState {
  importedTracks: ImportedSpotifyTrack[];
  loading: boolean;
  error: string | null;
  stats: {
    totalTracks: number;
    totalEstimatedBezy: number;
    averagePopularity: number;
    totalUsdValue: number;
  } | null;
}

export const useSpotifyImport = () => {
  const { user, isAuthenticated } = useAuth();
  const [state, setState] = useState<SpotifyImportState>({
    importedTracks: [],
    loading: false,
    error: null,
    stats: null,
  });

  /**
   * Load user's imported Spotify tracks
   */
  const loadImportedTracks = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setState(prev => ({ ...prev, error: 'User not authenticated' }));
      return false;
    }

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const tracksResult = await spotifyImportService.getUserImportedTracks(user.id);

      if (!tracksResult.success) {
        throw new Error(tracksResult.error || 'Failed to load tracks');
      }

      // Transform database records to ImportedSpotifyTrack format
      const tracks = (tracksResult.tracks || []).map((t: any) => ({
        id: t.id,
        userId: t.user_id,
        spotifyTrackId: t.spotify_track_id,
        title: t.title,
        artist: t.artist,
        album: t.album,
        durationMs: t.duration_ms,
        popularity: t.popularity,
        energy: t.energy,
        danceability: t.danceability,
        acousticness: t.acousticness,
        albumArtUrl: t.album_art_url,
        spotifyUrl: t.spotify_url,
        previewUrl: t.preview_url,
        popularityStreamEstimate: t.popularity_stream_estimate,
        totalEstimatedBezy: t.total_estimated_bezy,
        importedAt: t.imported_at,
        lastSyncedAt: t.last_synced_at,
      }));

      // Calculate stats
      const totalBezy = tracks.reduce((sum: number, t: ImportedSpotifyTrack) => sum + t.totalEstimatedBezy, 0);
      const avgPopularity = tracks.length > 0
        ? Math.round(tracks.reduce((sum: number, t: ImportedSpotifyTrack) => sum + t.popularity, 0) / tracks.length)
        : 0;

      const usdValue = priceConversionService.convertToUSD(totalBezy, 'BEZY');

      const stats = {
        totalTracks: tracks.length,
        totalEstimatedBezy: totalBezy,
        averagePopularity: avgPopularity,
        totalUsdValue: usdValue,
      };

      setState({
        importedTracks: tracks,
        loading: false,
        error: null,
        stats,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load tracks';
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [user, isAuthenticated]);

  /**
   * Import user's top Spotify tracks
   */
  const importTopTracks = useCallback(
    async (limit = 20, timeRange: 'short_term' | 'medium_term' | 'long_term' = 'medium_term') => {
      if (!isAuthenticated || !user) {
        setState(prev => ({ ...prev, error: 'User not authenticated' }));
        return false;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const result = await spotifyImportService.importUserTopTracks(user.id, limit, timeRange);

        if (!result.success) {
          throw new Error(result.error || 'Failed to import top tracks');
        }

        // Reload imported tracks
        await loadImportedTracks();

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to import tracks';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return false;
      }
    },
    [user, isAuthenticated, loadImportedTracks]
  );

  /**
   * Import user's saved tracks
   */
  const importSavedTracks = useCallback(
    async (limit = 50) => {
      if (!isAuthenticated || !user) {
        setState(prev => ({ ...prev, error: 'User not authenticated' }));
        return false;
      }

      try {
        setState(prev => ({ ...prev, loading: true, error: null }));

        const result = await spotifyImportService.importUserSavedTracks(user.id, limit);

        if (!result.success) {
          throw new Error(result.error || 'Failed to import saved tracks');
        }

        // Reload imported tracks
        await loadImportedTracks();

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to import tracks';
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorMessage,
        }));
        return false;
      }
    },
    [user, isAuthenticated, loadImportedTracks]
  );

  /**
   * Delete an imported track
   */
  const deleteTrack = useCallback(
    async (trackId: string) => {
      try {
        const result = await spotifyImportService.deleteImportedTrack(trackId);

        if (!result.success) {
          throw new Error(result.error || 'Failed to delete track');
        }

        // Update local state
        setState(prev => ({
          ...prev,
          importedTracks: prev.importedTracks.filter(t => t.id !== trackId),
        }));

        // Reload stats
        await loadImportedTracks();

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete track';
        setState(prev => ({ ...prev, error: errorMessage }));
        return false;
      }
    },
    [loadImportedTracks]
  );

  /**
   * Check if Spotify is authenticated
   */
  const isSpotifyAuthenticated = useCallback(async () => {
    const profile = await spotifyService.getUserProfile();
    return profile !== null;
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    loadImportedTracks,
    importTopTracks,
    importSavedTracks,
    deleteTrack,
    isSpotifyAuthenticated,
    clearError,
  };
};
