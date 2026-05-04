import { useState, useEffect } from 'react'
import type { Notification } from '../types'

interface NotificationsPanelProps {
  notifications: Notification[]
}

function bubbleClass(msg: string): string {
  const l = msg.toLowerCase()
  if (l.includes('cancel')) return 'cancel'
  if (l.includes('delay')) return 'delay'
  if (l.includes('gate')) return 'gate'
  return 'default'
}

export function NotificationsPanel({ notifications }: NotificationsPanelProps) {
  const [open, setOpen] = useState(false)
  const [seenCount, setSeenCount] = useState(0)
  const unseen = notifications.length - seenCount

  useEffect(() => {
    if (open) {
      setSeenCount(notifications.length)
    }
  }, [open, notifications.length])

  return (
    <>
      <button className="ft-notif-btn" onClick={() => setOpen(!open)}>
        &#128241;
        {unseen > 0 && !open && (
          <span className="ft-notif-badge">
            {unseen > 99 ? '99+' : unseen}
          </span>
        )}
      </button>

      {open && (
        <div
          className="ft-notif-overlay"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
        >
          <div className="ft-notif-frame">
            <div className="ft-notif-header">
              <span className="ft-notif-header-title">Messages</span>
              <button className="ft-notif-close" onClick={() => setOpen(false)}>&times;</button>
            </div>
            <div className="ft-notif-body">
              {notifications.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', marginTop: 40, fontStyle: 'italic' }}>
                  No alerts yet. Changes will appear as SMS here.
                </p>
              ) : (
                notifications.map((n, i) => (
                  <div key={`${n.time}-${n.flight}-${i}`} className="ft-sms-group">
                    <div className="ft-sms-phone">{n.phone}</div>
                    <div className={`ft-sms-bubble ${bubbleClass(n.msg)}`}>{n.msg}</div>
                    <div className="ft-sms-time">{n.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
