import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const SIGNIN_URL = import.meta.env.VITE_SIGNIN_URL ?? 'https://signin.nodestra.com'

export function ProtectedRoute() {
  const { session, loading } = useAuth()

  useEffect(() => {
    if (!loading && !session) {
      window.location.href = SIGNIN_URL + '/sign-in'
    }
  }, [session, loading])

  if (loading || !session) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-base)',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid rgba(0,0,0,0.1)',
          borderTopColor: '#2A4A5E',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      </div>
    )
  }

  return <Outlet />
}
