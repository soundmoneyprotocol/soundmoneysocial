# useArtistStats Hook - Implementation Guide

## Overview

The `useArtistStats` hook provides real-time artist statistics by fetching data from the `/api/artists/[handle]/stats` endpoint with automatic polling and caching support.

## Hook Signature

```typescript
useArtistStats(
  artistHandle: string,
  options?: UseArtistStatsOptions
): ArtistStatsState
```

### Parameters

- **artistHandle** (string, required): The unique identifier for the artist (e.g., "djbenito304")
- **options** (UseArtistStatsOptions, optional):
  - `pollInterval` (number): Time in milliseconds between automatic fetches. Default: 5 minutes (300000ms). Set to 0 to disable polling.
  - `useCache` (boolean): Whether to use cached data on the server. Default: true
  - `forceRefresh` (boolean): Force refresh from sources, bypassing cache. Default: false
  - `sources` (string[]): Which data sources to fetch from. Default: ['spotify', 'youtube', 'soundmoney']

### Return Type

```typescript
interface ArtistStatsState {
  data: ArtistStats | null        // Fetched artist stats, null while loading or on error
  isLoading: boolean              // True during initial fetch or refresh
  error: Error | null             // Error object if fetch fails, null on success
  isCached?: boolean              // True if data came from server cache
}

interface ArtistStats {
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
```

## Usage Examples

### Basic Usage

```tsx
import { useArtistStats } from '@/hooks'

export default function ArtistProfileCard({ artistHandle }: { artistHandle: string }) {
  const { data, isLoading, error } = useArtistStats(artistHandle)

  if (isLoading) return <div>Loading stats...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      <h2>{data?.name}</h2>
      <p>Streams: {data?.streams.toLocaleString()}</p>
      <p>Earnings: {data?.earnings.toFixed(2)} {data?.currency}</p>
    </div>
  )
}
```

### Custom Polling Interval

```tsx
// Poll every 30 seconds for real-time updates
const { data, isLoading } = useArtistStats('djbenito304', {
  pollInterval: 30 * 1000, // 30 seconds
})
```

### Force Refresh from Sources

```tsx
// Bypass server cache and fetch fresh data
const { data } = useArtistStats('djbenito304', {
  forceRefresh: true,
})
```

### Specific Data Sources

```tsx
// Only fetch from Spotify
const { data } = useArtistStats('djbenito304', {
  sources: ['spotify'],
})

// Fetch from Spotify and YouTube only
const { data } = useArtistStats('djbenito304', {
  sources: ['spotify', 'youtube'],
})
```

### With SoundMoneyWidget Component

```tsx
import { useArtistStats } from '@/hooks'
import SoundMoneyWidget from '@/components/SoundMoneyWidget'

export default function DJBenitoProfile() {
  const { data, isLoading } = useArtistStats('djbenito304')

  return (
    <SoundMoneyWidget
      artistName={data?.name || 'DJ Benito 304'}
      artistHandle="djbenito304"
      streams={data?.streams || 0}
      earnings={data?.earnings || 0}
      monthlyStreams={data?.monthlyStreams || 0}
      theme="dark"
      size="medium"
    />
  )
}
```

### Advanced: Manual Refresh Control

```tsx
import { useArtistStats } from '@/hooks'
import { useState } from 'react'

export default function AdvancedProfile() {
  const [forceRefresh, setForceRefresh] = useState(false)
  const { data, isLoading, isCached } = useArtistStats('djbenito304', {
    forceRefresh,
  })

  const handleManualRefresh = () => {
    setForceRefresh(true)
    // Reset after fetch completes
    setTimeout(() => setForceRefresh(false), 100)
  }

  return (
    <div>
      <button onClick={handleManualRefresh} disabled={isLoading}>
        {isLoading ? 'Refreshing...' : 'Refresh Stats'}
      </button>
      {isCached && <span className="text-sm text-gray-500">(Cached)</span>}
      {/* Stats display */}
    </div>
  )
}
```

### Multiple Artists

```tsx
import { useArtistStats } from '@/hooks'

export default function ArtistComparison() {
  const artist1 = useArtistStats('djbenito304')
  const artist2 = useArtistStats('other_artist')

  return (
    <div>
      <div>
        <h3>{artist1.data?.name}</h3>
        <p>Streams: {artist1.data?.streams}</p>
      </div>
      <div>
        <h3>{artist2.data?.name}</h3>
        <p>Streams: {artist2.data?.streams}</p>
      </div>
    </div>
  )
}
```

## Implementation Details

### Polling Mechanism

- Initial fetch happens when component mounts
- Automatic polling starts after first successful fetch
- Polling continues at the specified interval
- To disable polling, set `pollInterval: 0`
- All polling timers are cleaned up on unmount

### Cache Behavior

- When `useCache: true` (default), the server uses its 5-minute TTL cache
- When `forceRefresh: true`, the server bypasses its cache
- The `isCached` flag indicates if the returned data came from server cache
- Client-side caching headers are set for browser caching (5 minutes)

### Error Handling

- Network errors are caught and returned in the `error` state
- The hook does not throw - it returns errors in state
- Failed fetches still maintain previous data if available
- Check `error !== null` to detect fetch failures

### Memory Management

- Tracks mounted state to prevent state updates after unmount
- Clears polling interval on unmount
- No memory leaks with cleanup function in useEffect

## Performance Optimization

### When to Use Short Polls (30s - 2min)

```tsx
// Real-time livestream stats
useArtistStats(artistHandle, { pollInterval: 30 * 1000 })
```

### When to Use Default Polls (5min)

```tsx
// General dashboard - balance between freshness and server load
useArtistStats(artistHandle)
```

### When to Use Long Polls (15-30min)

```tsx
// Background data that doesn't need frequent updates
useArtistStats(artistHandle, { pollInterval: 15 * 60 * 1000 })
```

### Disable Polling for One-Time Fetch

```tsx
// Just load initial data, no polling
useArtistStats(artistHandle, { pollInterval: 0 })
```

## Integration Points

### With soundmoneymusic-main Project

Location: `/soundmoneymusic-main/src/app/profile/djbenito304/page.tsx`

```tsx
'use client'
import { useArtistStats } from '@/hooks'
import SoundMoneyWidget from '@/components/SoundMoneyWidget'

export default function DJBenitoProfile() {
  const { data, isLoading } = useArtistStats('djbenito304', {
    pollInterval: 2 * 60 * 1000, // Update every 2 minutes for profile
  })

  return (
    <div className="relative">
      {/* Existing banner and profile content */}
      <SoundMoneyWidget
        artistName={data?.name || 'DJ Benito 304'}
        artistHandle="djbenito304"
        streams={data?.streams || 0}
        earnings={data?.earnings || 0}
        monthlyStreams={data?.monthlyStreams || 0}
        theme="dark"
        size="medium"
      />
    </div>
  )
}
```

### With soundmoneysocial FrontendApp

Location: `/soundmoneysocial/web/frontendapp/src/pages/ArtistDashboard.tsx`

```tsx
import { useArtistStats } from '@/hooks'

export default function ArtistDashboard() {
  const { data, isLoading, isCached } = useArtistStats('current-artist-handle', {
    pollInterval: 60 * 1000, // Update every minute
  })

  return (
    <div className="dashboard">
      {isLoading && <LoadingSpinner />}
      {data && (
        <>
          <StatsCard title="Streams" value={data.streams} />
          <StatsCard title="Earnings" value={`${data.earnings} ${data.currency}`} />
          <StatsCard title="Listeners" value={data.listeners} />
          {isCached && <CachedBadge />}
        </>
      )}
    </div>
  )
}
```

## Query Parameters Reference

The hook automatically constructs query parameters for the API endpoint:

| Parameter | Set When | Value |
|-----------|----------|-------|
| `cache` | `useCache: false` | `'false'` |
| `refresh` | `forceRefresh: true` | `'true'` |
| `sources` | `sources` provided | `'spotify,youtube,soundmoney'` |

Example URL generated:
```
GET /api/artists/djbenito304/stats?cache=true&sources=spotify,youtube,soundmoney
```

## Testing

```tsx
import { useArtistStats } from '@/hooks'
import { render, screen, waitFor } from '@testing-library/react'

describe('useArtistStats', () => {
  test('loads artist stats', async () => {
    function TestComponent() {
      const { data, isLoading } = useArtistStats('test-artist')
      return <div>{isLoading ? 'Loading' : data?.name}</div>
    }

    render(<TestComponent />)

    expect(screen.getByText('Loading')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText('Loading')).not.toBeInTheDocument()
    })
  })

  test('polls at specified interval', async () => {
    jest.useFakeTimers()

    function TestComponent() {
      const { data } = useArtistStats('test-artist', {
        pollInterval: 1000,
      })
      return <div>{data?.streams || 0}</div>
    }

    render(<TestComponent />)

    jest.advanceTimersByTime(1000)
    // Verify refetch occurred

    jest.useRealTimers()
  })
})
```

## API Endpoint Reference

See: `/soundmoneymusic-main/src/app/api/artists/[handle]/stats/route.ts`

The hook communicates with this endpoint which:
- Returns cached data by default (5-minute TTL)
- Supports force refresh with `refresh=true`
- Integrates with Spotify, YouTube Music, and SoundMoney APIs
- Returns BZY earnings calculations
- Includes listener demographics and growth metrics
