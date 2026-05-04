import { useState } from 'react'
import { subscribeToFlight, triggerNavigateCall } from '../api'
import { supabase } from '../../../lib/supabase'

type Tab = 'subscribe' | 'navigate'

export function FlightActionsPanel() {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('subscribe')

  return (
    <>
      {/* Floating trigger — bottom-left, mirrors NotificationsPanel on bottom-right */}
      <button className="ft-actions-btn" onClick={() => setOpen(true)} title="Flight Actions">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </button>

      {/* Overlay */}
      {open && (
        <div className="ft-notif-overlay" onClick={() => setOpen(false)}>
          <div className="ft-actions-frame" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="ft-notif-header">
              <span className="ft-notif-header-title">Flight Actions</span>
              <button className="ft-notif-close" onClick={() => setOpen(false)}>&times;</button>
            </div>

            {/* Tabs */}
            <div className="ft-actions-tabs">
              <button
                className={`ft-actions-tab ${tab === 'subscribe' ? 'active' : ''}`}
                onClick={() => setTab('subscribe')}
              >
                Subscribe
              </button>
              <button
                className={`ft-actions-tab ${tab === 'navigate' ? 'active' : ''}`}
                onClick={() => setTab('navigate')}
              >
                Navigate Call
              </button>
            </div>

            {/* Body */}
            <div className="ft-notif-body">
              {tab === 'subscribe' ? <SubscribeForm /> : <NavigateForm />}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ── Subscribe Form ──────────────────────────────────────────────────── */

function SubscribeForm() {
  const [flightNumber, setFlightNumber] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [airportId, setAirportId] = useState('SJC')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!flightNumber.trim() || !phoneNumber.trim()) return
    setLoading(true)
    setStatus(null)
    const fn = flightNumber.trim().toUpperCase()
    const phone = phoneNumber.trim()
    const airport = airportId.trim().toUpperCase()

    try {
      // 1. Upsert passenger by phone number
      const { data: existingPassenger } = await supabase
        .from('passengers')
        .select('id')
        .eq('phone_number', phone)
        .maybeSingle()

      let passengerId: string
      if (existingPassenger) {
        passengerId = existingPassenger.id
      } else {
        const { data: newPassenger, error: pErr } = await supabase
          .from('passengers')
          .insert({ phone_number: phone })
          .select('id')
          .single()
        if (pErr || !newPassenger) throw new Error(pErr?.message ?? 'Failed to create passenger')
        passengerId = newPassenger.id
      }

      // 2. Check if already subscribed
      const { data: existing } = await supabase
        .from('flight_passengers')
        .select('id')
        .eq('flight_id', fn)
        .eq('passenger_id', passengerId)
        .eq('airport_id', airport)
        .maybeSingle()

      if (existing) {
        setStatus({ type: 'success', msg: `Already subscribed to ${fn}` })
      } else {
        // 3. Insert flight_passengers record
        const { error: fpErr } = await supabase
          .from('flight_passengers')
          .insert({ flight_id: fn, passenger_id: passengerId, airport_id: airport })
        if (fpErr) throw new Error(fpErr.message)
        setStatus({ type: 'success', msg: `Subscribed to ${fn}` })
      }

      // 4. Also call backend API
      try {
        await subscribeToFlight({ flight_number: fn, phone_number: phone, airport_id: airport })
      } catch {
        // Backend call is best-effort; Supabase is the source of truth
      }

      setFlightNumber('')
      setPhoneNumber('')
    } catch (err) {
      setStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="ft-actions-form" onSubmit={handleSubmit}>
      <p className="ft-actions-desc">
        Subscribe a passenger to gate-change notifications for a flight.
      </p>
      <label className="ft-actions-label">Flight Number</label>
      <input
        className="ft-pin-input ft-actions-input"
        value={flightNumber}
        onChange={(e) => setFlightNumber(e.target.value)}
        placeholder="e.g. UA 123"
      />
      <label className="ft-actions-label">Phone Number</label>
      <input
        className="ft-pin-input ft-actions-input"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="e.g. +16695551234"
        type="tel"
      />
      <label className="ft-actions-label">Airport ID</label>
      <input
        className="ft-pin-input ft-actions-input"
        value={airportId}
        onChange={(e) => setAirportId(e.target.value)}
        placeholder="e.g. SJC"
      />
      <button type="submit" className="ft-pin-btn ft-actions-submit" disabled={loading}>
        {loading ? 'Subscribing...' : 'Subscribe'}
      </button>
      {status && (
        <p className={`ft-actions-status ${status.type}`}>{status.msg}</p>
      )}
    </form>
  )
}

/* ── Navigate Call Form ──────────────────────────────────────────────── */

function NavigateForm() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [airportId, setAirportId] = useState('SJC')
  const [oldGate, setOldGate] = useState('')
  const [newGate, setNewGate] = useState('')
  const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!phoneNumber.trim() || !oldGate.trim() || !newGate.trim()) return
    setLoading(true)
    setStatus(null)
    try {
      const res = await triggerNavigateCall({
        phone_number: phoneNumber.trim(),
        airport_id: airportId.trim().toUpperCase(),
        old_gate: oldGate.trim(),
        new_gate: newGate.trim(),
      })
      setStatus({ type: 'success', msg: `Call initiated (${res.call_id})` })
      setPhoneNumber('')
      setOldGate('')
      setNewGate('')
    } catch (err) {
      setStatus({ type: 'error', msg: err instanceof Error ? err.message : 'Request failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className="ft-actions-form" onSubmit={handleSubmit}>
      <p className="ft-actions-desc">
        Trigger an outbound Vapi navigation call for a gate change.
      </p>
      <label className="ft-actions-label">Phone Number</label>
      <input
        className="ft-pin-input ft-actions-input"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        placeholder="e.g. +16695551234"
        type="tel"
      />
      <label className="ft-actions-label">Airport ID</label>
      <input
        className="ft-pin-input ft-actions-input"
        value={airportId}
        onChange={(e) => setAirportId(e.target.value)}
        placeholder="e.g. SJC"
      />
      <div className="ft-actions-row">
        <div className="ft-actions-field">
          <label className="ft-actions-label">Old Gate</label>
          <input
            className="ft-pin-input ft-actions-input"
            value={oldGate}
            onChange={(e) => setOldGate(e.target.value)}
            placeholder="e.g. Gate B1"
          />
        </div>
        <div className="ft-actions-field">
          <label className="ft-actions-label">New Gate</label>
          <input
            className="ft-pin-input ft-actions-input"
            value={newGate}
            onChange={(e) => setNewGate(e.target.value)}
            placeholder="e.g. Gate B2"
          />
        </div>
      </div>
      <button type="submit" className="ft-pin-btn ft-actions-submit" disabled={loading}>
        {loading ? 'Calling...' : 'Trigger Call'}
      </button>
      {status && (
        <p className={`ft-actions-status ${status.type}`}>{status.msg}</p>
      )}
    </form>
  )
}
