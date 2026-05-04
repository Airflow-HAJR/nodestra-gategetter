import { useState } from 'react'
import { useGateGetter } from '../useGateGetter'
import { useAuth } from '../../../hooks/useAuth'
import { useAirportCode } from '../../../hooks/useAirportCode'
import { supabase } from '../../../lib/supabase'

const SIGNIN_URL = import.meta.env.VITE_SIGNIN_URL ?? 'https://signin.nodestra.com'
import { NavigationOverlay } from '../../map-builder/ui/NavigationOverlay'
import { StatusBar } from './StatusBar'
import { TrackedFlightsBar } from './TrackedFlightsBar'
import { FlightsTable } from './FlightsTable'
import { ChangesFeed } from './ChangesFeed'
import { NotificationsPanel } from './NotificationsPanel'
import { FlightActionsPanel } from './FlightActionsPanel'
import '../../../styles/flight-tracker.css'

export function GateGetterDashboard() {
  const { airportCode, loading: airportLoading } = useAirportCode()
  const { data, error, isLoading, isConnected, pinFlight, unpinFlight, refresh } = useGateGetter(airportCode ?? undefined)
  const { user } = useAuth()
  const [navOpen, setNavOpen] = useState(false)

  if (isLoading || airportLoading) {
    return (
      <div className="flight-tracker">
        <div className="ft-center-state">
          <div style={{ textAlign: 'center' }}>
            <div className="ft-spinner" style={{ margin: '0 auto 12px' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: 13, fontWeight: 500 }}>
              Connecting to Flight Tracker...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isConnected && !data) {
    return (
      <div className="flight-tracker">
        <div className="ft-center-state">
          <div style={{ textAlign: 'center', maxWidth: 360 }}>
            <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: 15, marginBottom: 4 }}>
              Flight Tracker unavailable
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
              Could not reach the flight tracker service. Please try again later.
            </p>
            {error && <p style={{ color: '#dc2626', fontSize: 12, marginBottom: 12 }}>{error}</p>}
            <button className="ft-pin-btn" onClick={refresh}>Retry</button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="flight-tracker">
      <NavigationOverlay isOpen={navOpen} onClose={() => setNavOpen(false)} />

      {/* Top-left: Menu trigger island */}
      <div className="ft-floating-left">
        <button className="ft-menu-trigger" onClick={() => setNavOpen(true)}>
          <span className="ft-menu-badge" aria-hidden="true">
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#2A4A5E" />
              <path d="M7 14L14 7L21 14L14 21L7 14Z" fill="white" fillOpacity="0.9" />
              <path d="M14 10L18 14L14 18L10 14L14 10Z" fill="white" />
            </svg>
          </span>
          <span className="ft-menu-copy">
            <span className="ft-menu-eyebrow">Nodestra</span>
            <span className="ft-menu-title">Flight Tracker</span>
          </span>
        </button>
      </div>

      {/* Top-right: Status pill island */}
      <div className="ft-floating-right">
        <div className="ft-status-pill">
          <StatusBar data={data} />
          <span className="ft-divider" />
          <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
            {user?.email}
          </span>
          <button
            className="ft-topbar-btn"
            onClick={async () => { await supabase.auth.signOut(); window.location.href = SIGNIN_URL + '/sign-in' }}
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="ft-body">
        {/* Pin bar island */}
        <TrackedFlightsBar tracked={data.tracked} onPin={pinFlight} onUnpin={unpinFlight} />

        {/* Table island */}
        <FlightsTable flights={data.flights} tracked={data.tracked} airport={airportCode ?? undefined} />

        {/* Changes sidebar island */}
        <ChangesFeed changes={data.changes} tracked={data.tracked} />
      </div>

      {/* Flight actions floating button + overlay (bottom-left) */}
      <FlightActionsPanel />

      {/* Notifications floating button + overlay (bottom-right) */}
      <NotificationsPanel notifications={data.notifications} />

      {/* Connection warning */}
      {!isConnected && (
        <div className="ft-connection-warning">
          Connection lost — retrying...
        </div>
      )}
    </div>
  )
}
