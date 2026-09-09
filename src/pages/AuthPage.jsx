import { useState } from 'react'
import heroImage from '../assets/hero1.png'
import LoginForm from '../components/LoginForm'
import RegisterForm from '../components/RegisterForm'
import './AuthPage.css'

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [statusMessage, setStatusMessage] = useState('')

  const handleAuthSuccess = ({ message, user }) => {
    setStatusMessage(message)
    onAuthenticated({ user })
  }

  return (
    <div className="auth-page">
      <section className="auth-hero">
        <div className="auth-hero__overlay" />
        <img src={heroImage} alt="" className="auth-hero__image" />
        <div className="auth-hero__content">
          <span className="auth-brand">MoneyMint</span>
          <h2>Manage. Borrow. Repay.</h2>
         <p>
       Emphasize the velocity of getting instant funds paired with complete visibility over your money.
  </p>
          <ul>
            <li>Instant loan approval & repayment tracking</li>
    <li>Automated expense analytics & categorization</li>
    <li>End-to-end encrypted financial data</li>
          </ul>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-panel__card">

          <div className="auth-card-brand">
  <div className="auth-card-brand__icon">₹</div>
  <span>MoneyMint</span>
</div> 
          {statusMessage && (
            <div className="auth-alert auth-alert--success">{statusMessage}</div>
          )}

          {mode === 'login' ? (
            <LoginForm
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => {
                setMode('register')
                setStatusMessage('')
              }}
            />
          ) : (
            <RegisterForm
              onSuccess={(message) => {
                setStatusMessage(message)
                setMode('login')
              }}
              onSwitchToLogin={() => {
                setMode('login')
                setStatusMessage('')
              }}
            />
          )}
        </div>
      </section>
    </div>
  )
}

export default AuthPage



