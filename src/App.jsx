import { useEffect, useState } from 'react'
import { getCurrentUser } from './api/auth'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function restoreSession() {
      try {
        const data = await getCurrentUser()
        if (isMounted) {
          setUser(data.user)
          setIsAuthenticated(true)
        }
      } catch {
        if (isMounted) {
          setUser(null)
          setIsAuthenticated(false)
        }
      } finally {
        if (isMounted) {
          setIsCheckingSession(false)
        }
      }
    }

    restoreSession()

    return () => {
      isMounted = false
    }
  }, [])

  if (isCheckingSession) {
    return <div className="dashboard-state app-loading">Checking your session...</div>
  }

  if (isAuthenticated) {
    return (
      <Dashboard
        user={user}
        onLogout={() => {
          setIsAuthenticated(false)
          setUser(null)
        }}
      />
    )
  }

  return (
    <AuthPage
      onAuthenticated={({ user: loggedInUser }) => {
        setUser(loggedInUser || null)
        setIsAuthenticated(true)
      }}
    />
  )
}

export default App
