import type { GateGetterData } from '../types'

interface StatusBarProps {
  data: GateGetterData
}

export function StatusBar({ data }: StatusBarProps) {
  const dotColor =
    data.status === 'ok'
      ? '#059669'
      : data.status.includes('error')
        ? '#dc2626'
        : '#d97706'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div className="ft-status-context">
        <span className="ft-status-label">
          {data.airport ?? '—'} Departures
        </span>
        <span className="ft-status-meta">
          {data.flights.length} flights · Poll #{data.poll_count}
        </span>
      </div>
      <span className="ft-divider" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span className="ft-status-dot" style={{ background: dotColor }} />
        <span className="ft-status-text" style={{ color: dotColor }}>
          {data.last_poll ? `Last ${data.last_poll}` : 'Starting…'}
        </span>
      </div>
    </div>
  )
}
