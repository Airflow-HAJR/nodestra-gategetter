import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../../lib/supabase'
import type { Flight } from '../types'

interface FlightsTableProps {
  flights: Flight[]
  tracked: string[]
  airport?: string
}

function statusClass(status: string | null): string {
  if (!status) return 'ft-st-scheduled'
  const l = status.toLowerCase()
  if (l.includes('cancel')) return 'ft-st-canceled'
  if (l.includes('late') || l.includes('delay')) return 'ft-st-late'
  if (l.includes('early')) return 'ft-st-early'
  if (l.includes('depart')) return 'ft-st-departed'
  return 'ft-st-scheduled'
}

export function FlightsTable({ flights, tracked, airport }: FlightsTableProps) {
  const pinSet = new Set(tracked)
  const pinned = flights.filter((f) => pinSet.has(f.flight_number ?? ''))
  const rest = flights.filter((f) => !pinSet.has(f.flight_number ?? ''))

  const [expandedFlights, setExpandedFlights] = useState<Set<string>>(new Set())

  const toggle = useCallback((flightNumber: string) => {
    setExpandedFlights((prev) => {
      const next = new Set(prev)
      if (next.has(flightNumber)) {
        next.delete(flightNumber)
      } else {
        next.add(flightNumber)
      }
      return next
    })
  }, [])

  return (
    <div className="ft-table-island">
      <div className="ft-table-header">All Departures</div>
      <div className="ft-table-scroll">
        {flights.length === 0 ? (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>
            Waiting for first scrape...
          </div>
        ) : (
          <table className="ft-table">
            <thead>
              <tr>
                <th>Sched</th>
                <th>Actual</th>
                <th>Flight</th>
                <th>Destination</th>
                <th>Airline</th>
                <th>T</th>
                <th>Gate</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pinned.map((f) => (
                <FlightRow
                  key={`pin-${f.flight_number}`}
                  flight={f}
                  isPinned
                  expanded={expandedFlights.has(f.flight_number ?? '')}
                  onToggle={toggle}
                  airport={airport}
                />
              ))}
              {pinned.length > 0 && rest.length > 0 && (
                <tr className="separator"><td colSpan={9} /></tr>
              )}
              {rest.map((f) => (
                <FlightRow
                  key={f.flight_number}
                  flight={f}
                  isPinned={false}
                  expanded={expandedFlights.has(f.flight_number ?? '')}
                  onToggle={toggle}
                  airport={airport}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

interface FlightRowProps {
  flight: Flight
  isPinned: boolean
  expanded: boolean
  onToggle: (flightNumber: string) => void
  airport?: string
}

function FlightRow({ flight: f, isPinned, expanded, onToggle, airport }: FlightRowProps) {
  const fn = f.flight_number ?? ''

  return (
    <>
      <tr className={isPinned ? 'pinned' : ''}>
        <td>{f.scheduled_time ?? '-'}</td>
        <td>{f.actual_time ?? '-'}</td>
        <td>
          <span className="flight-num">{fn || '-'}</span>
          {isPinned && <span className="pin-star">&#9733;</span>}
        </td>
        <td>
          <span className="dest-city">{f.destination_city ?? '-'}</span>
          {f.destination_iata && <span className="dest-iata">{f.destination_iata}</span>}
        </td>
        <td>{f.airline ?? '-'}</td>
        <td>{f.terminal ?? '-'}</td>
        <td>{f.gate ?? '-'}</td>
        <td className={statusClass(f.status)}>{f.status ?? '-'}</td>
        <td>
          {fn && (
            <button
              className="ft-passengers-toggle"
              onClick={() => onToggle(fn)}
              title="See subscribed passengers"
            >
              <span className="ft-passengers-toggle-label">Passengers</span>
              <svg
                width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
              >
                <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </td>
      </tr>
      {expanded && fn && (
        <tr className="ft-passengers-row">
          <td colSpan={9} style={{ padding: 0 }}>
            <PassengersDropdown flightNumber={fn} airport={airport} />
          </td>
        </tr>
      )}
    </>
  )
}

function PassengersDropdown({ flightNumber, airport }: { flightNumber: string; airport?: string }) {
  const [phones, setPhones] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError(null)

      // Query flight_passengers → passengers to get phone numbers
      let query = supabase
        .from('flight_passengers')
        .select('passenger_id, passengers(phone_number)')
        .eq('flight_id', flightNumber)

      if (airport) {
        query = query.eq('airport_id', airport)
      }

      const { data, error: err } = await query

      if (cancelled) return

      if (err) {
        setError(err.message)
        setLoading(false)
        return
      }

      const numbers = (data ?? [])
        .map((row: any) => row.passengers?.phone_number)
        .filter(Boolean) as string[]

      setPhones(numbers)
      setLoading(false)
    })()

    return () => { cancelled = true }
  }, [flightNumber, airport])

  return (
    <div className="ft-passengers-dropdown">
      <div className="ft-passengers-header">
        Subscribed Passengers — {flightNumber}
      </div>
      {loading ? (
        <div className="ft-passengers-loading">
          <div className="ft-spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
          <span>Loading...</span>
        </div>
      ) : error ? (
        <div className="ft-passengers-empty" style={{ color: '#dc2626' }}>
          Error: {error}
        </div>
      ) : phones.length === 0 ? (
        <div className="ft-passengers-empty">
          No passengers subscribed to this flight.
        </div>
      ) : (
        <ul className="ft-passengers-list">
          {phones.map((phone, i) => (
            <li key={i} className="ft-passenger-item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{phone}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
