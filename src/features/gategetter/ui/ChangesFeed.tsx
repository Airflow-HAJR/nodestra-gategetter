import type { Change } from '../types'

interface ChangesFeedProps {
  changes: Change[]
  tracked: string[]
}

function changeClass(field: string): string {
  switch (field) {
    case 'gate': return 'ft-change-gate'
    case 'status': return 'ft-change-status'
    case 'terminal': return 'ft-change-terminal'
    case 'call': return 'ft-change-call'
    default: return 'ft-change-time-field'
  }
}

export function ChangesFeed({ changes, tracked }: ChangesFeedProps) {
  const pinSet = new Set(tracked)

  return (
    <div className="ft-sidebar-island">
      <div className="ft-sidebar-header">Changes</div>
      <div className="ft-sidebar-scroll">
        {changes.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: 12, fontStyle: 'italic', padding: '16px 8px', textAlign: 'center' }}>
            Waiting for second poll to detect changes...
          </p>
        ) : (
          changes.map((c, i) => {
            const label = c.detail ? c.detail.replace(`${c.flight} `, '') : ''
            return (
              <div key={`${c.time}-${c.flight}-${c.field}-${i}`} className={`ft-change-item ${changeClass(c.field)}`}>
                <span className="ft-change-time">{c.time}</span>
                <span className="ft-change-flight">{c.flight}</span>
                {label}
                {pinSet.has(c.flight) && (
                  <span className="ft-change-pinned">[pinned]</span>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
