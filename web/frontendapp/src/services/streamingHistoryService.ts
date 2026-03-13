/**
 * Streaming History Service
 * Tracks all streaming sessions and BZY earnings
 */

export interface StreamingSession {
  id: string;
  trackId: string;
  trackTitle: string;
  artist: string;
  genre: string;
  streamPrice: string; // BZY per second
  duration: number; // seconds streamed
  totalEarned: string; // Total BZY earned
  timestamp: string; // ISO datetime when session ended
}

export interface StreamingStats {
  totalSessions: number;
  totalDuration: number; // seconds
  totalEarned: string;
  sessions: StreamingSession[];
}

const STORAGE_KEY = 'soundmoney_streaming_history';

class StreamingHistoryService {
  /**
   * Record a streaming session
   */
  recordSession(
    trackId: string,
    trackTitle: string,
    artist: string,
    genre: string,
    streamPrice: string,
    duration: number,
    totalEarned: string
  ): StreamingSession {
    const session: StreamingSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      trackId,
      trackTitle,
      artist,
      genre,
      streamPrice,
      duration,
      totalEarned,
      timestamp: new Date().toISOString(),
    };

    // Save to localStorage
    const history = this.getHistory();
    history.sessions.push(session);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));

    console.log(`✅ Session recorded: ${trackTitle} by ${artist} - ${totalEarned} BZY`);
    return session;
  }

  /**
   * Get all streaming history
   */
  getHistory(): StreamingStats {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return {
          totalSessions: 0,
          totalDuration: 0,
          totalEarned: '0',
          sessions: [],
        };
      }

      const history = JSON.parse(stored) as StreamingStats;
      return history;
    } catch (error) {
      console.error('Failed to load streaming history:', error);
      return {
        totalSessions: 0,
        totalDuration: 0,
        totalEarned: '0',
        sessions: [],
      };
    }
  }

  /**
   * Get statistics
   */
  getStats(): StreamingStats {
    const history = this.getHistory();

    // Calculate totals
    const totalSessions = history.sessions.length;
    const totalDuration = history.sessions.reduce((sum, session) => sum + session.duration, 0);
    const totalEarned = history.sessions.reduce((sum, session) => {
      return (parseFloat(sum) + parseFloat(session.totalEarned)).toFixed(6);
    }, '0');

    return {
      totalSessions,
      totalDuration,
      totalEarned,
      sessions: history.sessions,
    };
  }

  /**
   * Get sessions for a specific track
   */
  getSessionsByTrack(trackId: string): StreamingSession[] {
    const history = this.getHistory();
    return history.sessions.filter(session => session.trackId === trackId);
  }

  /**
   * Get sessions for a specific genre
   */
  getSessionsByGenre(genre: string): StreamingSession[] {
    const history = this.getHistory();
    return history.sessions.filter(session => session.genre === genre);
  }

  /**
   * Get top streamed tracks
   */
  getTopTracks(limit = 10): Array<{
    trackTitle: string;
    artist: string;
    totalEarned: string;
    sessionCount: number;
    totalDuration: number;
  }> {
    const history = this.getHistory();
    const trackMap = new Map<string, any>();

    history.sessions.forEach(session => {
      const key = `${session.trackId}`;
      if (!trackMap.has(key)) {
        trackMap.set(key, {
          trackTitle: session.trackTitle,
          artist: session.artist,
          totalEarned: '0',
          sessionCount: 0,
          totalDuration: 0,
        });
      }

      const track = trackMap.get(key);
      track.totalEarned = (parseFloat(track.totalEarned) + parseFloat(session.totalEarned)).toFixed(6);
      track.sessionCount += 1;
      track.totalDuration += session.duration;
    });

    return Array.from(trackMap.values())
      .sort((a, b) => parseFloat(b.totalEarned) - parseFloat(a.totalEarned))
      .slice(0, limit);
  }

  /**
   * Clear all history
   */
  clearHistory(): void {
    localStorage.removeItem(STORAGE_KEY);
    console.log('✅ Streaming history cleared');
  }
}

export const streamingHistoryService = new StreamingHistoryService();
export default streamingHistoryService;
