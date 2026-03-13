import { useState, useEffect } from 'react'

export interface ArtistStats {
  handle: string
  name: string
  streams: number
  earnings: number
  monthlyStreams: number
  weeklyStreams: number
  topTrack: string
  topTrackStreams: number
  listeners: number
  growthRate: number
  lastUpdated: string
  platform: 'spotify' | 'youtube' | 'soundmoney' | 'multi'
  currency: 'BZY' | 'USD'
  thumbnail?: string
  cached?: boolean
  version?: string
}

export interface ArtistStatsState {
  data: ArtistStats | null
  isLoading: boolean
  error: Error | null
  isCached?: boolean
}

interface UseArtistStatsOptions {
  pollInterval?: number // ms, default 5 minutes
  useCache?: boolean // default true
  forceRefresh?: boolean // default false
  sources?: string[] // which sources to fetch from
}

export const useArtistStats = (
  artistHandle: string,
  options: UseArtistStatsOptions = {}
): ArtistStatsState => {
  const {
    pollInterval = 5 * 60 * 1000, // 5 minutes default
    useCache = true,
    forceRefresh = false,
    sources = ['spotify', 'youtube', 'soundmoney'],
  } = options

  const [state, setState] = useState<ArtistStatsState>({
    data: null,
    isLoading: true,
    error: null,
    isCached: false,
  })

  useEffect(() => {
    let isMounted = true
    let pollTimer: NodeJS.Timeout | null = null

    const fetchStats = async () => {
      try {
        setState((prev) => ({
          ...prev,
          isLoading: true,
          error: null,
        }))

        const queryParams = new URLSearchParams()
        if (!useCache) queryParams.append('cache', 'false')
        if (forceRefresh) queryParams.append('refresh', 'true')
        if (sources.length > 0) queryParams.append('sources', sources.join(','))

        const url = `/api/artists/${artistHandle}/stats${queryParams.toString() ? '?' + queryParams.toString() : ''}`
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Failed to fetch artist stats: ${response.statusText}`)
        }

        const data = await response.json()

        if (isMounted) {
          setState({
            data,
            isLoading: false,
            error: null,
            isCached: data.cached || false,
          })
        }
      } catch (err) {
        if (isMounted) {
          setState({
            data: null,
            isLoading: false,
            error: err instanceof Error ? err : new Error('Unknown error'),
            isCached: false,
          })
        }
      }
    }

    // Initial fetch
    fetchStats()

    // Set up polling interval
    if (pollInterval > 0) {
      pollTimer = setInterval(fetchStats, pollInterval)
    }

    return () => {
      isMounted = false
      if (pollTimer) {
        clearInterval(pollTimer)
      }
    }
  }, [artistHandle, useCache, forceRefresh, sources.join(',')])

  return state
}

export default useArtistStats
