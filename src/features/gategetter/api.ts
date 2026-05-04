import type {
  GateGetterData,
  HealthResponse,
  SubscribeToFlightRequest,
  SubscribeToFlightResponse,
  NavigateCallRequest,
  NavigateCallResponse,
  FlightChangeCallRequest,
  FlightChangeCallResponse,
} from './types'

const BASE_URL = import.meta.env.VITE_GATEGETTER_API_URL ?? 'https://airflowbackendv2-production.up.railway.app'
const BACKEND_URL = import.meta.env.VITE_AIRFLOW_BACKEND_URL ?? 'https://airflowbackendv2-production.up.railway.app'

export async function fetchData(airport?: string): Promise<GateGetterData> {
  const params = airport ? `?airport=${encodeURIComponent(airport)}` : ''
  const res = await fetch(`${BASE_URL}/gategetter/data${params}`)
  if (!res.ok) throw new Error(`GET /api/data failed: ${res.status}`)
  return res.json()
}

export async function fetchHealth(airport?: string): Promise<HealthResponse> {
  const params = airport ? `?airport=${encodeURIComponent(airport)}` : ''
  const res = await fetch(`${BASE_URL}/gategetter/health${params}`)
  if (!res.ok) throw new Error(`GET /api/health failed: ${res.status}`)
  return res.json()
}

export async function trackFlight(flight: string, airport?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/gategetter/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flight, ...(airport ? { airport } : {}) }),
  })
  if (!res.ok) throw new Error(`POST /api/track failed: ${res.status}`)
}

export async function untrackFlight(flight: string, airport?: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/gategetter/track`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flight, ...(airport ? { airport } : {}) }),
  })
  if (!res.ok) throw new Error(`DELETE /api/track failed: ${res.status}`)
}

export async function fetchAirports(): Promise<{ active: string[]; supported: string[] }> {
  const res = await fetch(`${BASE_URL}/gategetter/airports`)
  if (!res.ok) throw new Error(`GET /api/airports failed: ${res.status}`)
  return res.json()
}

export async function startAirport(airport: string): Promise<void> {
  const res = await fetch(`${BASE_URL}/gategetter/airports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ airport }),
  })
  if (!res.ok) throw new Error(`POST /gategetter/airports failed: ${res.status}`)
}

/* ── Nodestra Backend API ───────────────────────────────────────────── */

export async function subscribeToFlight(
  req: SubscribeToFlightRequest,
): Promise<SubscribeToFlightResponse> {
  const res = await fetch(`${BACKEND_URL}/subscribe-to-flight`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`POST /subscribe-to-flight failed: ${res.status}`)
  return res.json()
}

export async function triggerNavigateCall(
  req: NavigateCallRequest,
): Promise<NavigateCallResponse> {
  const res = await fetch(`${BACKEND_URL}/call/navigate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`POST /call/navigate failed: ${res.status}`)
  return res.json()
}

export async function triggerFlightChangeCall(
  req: FlightChangeCallRequest,
): Promise<FlightChangeCallResponse> {
  const res = await fetch(`${BACKEND_URL}/call/flight-change`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!res.ok) throw new Error(`POST /call/flight-change failed: ${res.status}`)
  return res.json()
}
