import { useState, useEffect, useCallback, useRef } from 'react'
import type { GateGetterData } from './types'
import { fetchData, trackFlight, untrackFlight, startAirport } from './api'

const POLL_INTERVAL = 10_000

export function useGateGetter(airport?: string) {
  const [data, setData] = useState<GateGetterData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(true)
  const mountedRef = useRef(true)

  const refresh = useCallback(async () => {
    try {
      const result = await fetchData(airport)
      if (!mountedRef.current) return
      setData(result)
      setError(null)
      setIsConnected(true)
      setIsLoading(false)
    } catch (e) {
      if (!mountedRef.current) return
      setError(e instanceof Error ? e.message : 'Failed to fetch')
      setIsConnected(false)
      setIsLoading(false)
    }
  }, [airport])

  useEffect(() => {
    // Don't start polling until we have an airport code
    if (!airport) return
    mountedRef.current = true
    setIsLoading(true)

    // Ensure the airport is active on the backend before polling
    startAirport(airport).catch(() => {/* already active or unsupported — ok */})

    refresh()
    const id = setInterval(refresh, POLL_INTERVAL)
    return () => {
      mountedRef.current = false
      clearInterval(id)
    }
  }, [refresh, airport])

  const pinFlight = useCallback(async (flight: string) => {
    try {
      await trackFlight(flight, airport)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to pin flight')
    }
  }, [refresh, airport])

  const unpinFlight = useCallback(async (flight: string) => {
    try {
      await untrackFlight(flight, airport)
      refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to unpin flight')
    }
  }, [refresh, airport])

  return { data, error, isLoading, isConnected, pinFlight, unpinFlight, refresh }
}
