import { useState } from 'react'
import { loginUser } from '../api/auth'
import { validateEmail, validatePassword } from '../utils/validation'
import './LoginForm.css'

function LoginForm({ onSuccess, onSwitchToRegister }) {
  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setSubmitError('')
  }

  const validateForm = () => {
    const nextErrors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    }

    setErrors(nextErrors)
    return !Object.values(nextErrors).some(Boolean)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      const data = await loginUser({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      onSuccess({ message: data.message, user: data.user })
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__header">
        <h1>Welcome back</h1>
        <p>Sign in to manage your finances</p>
      </div>

      {submitError && <div className="auth-alert auth-alert--error">{submitError}</div>}

      <label className="auth-field">
        <span>Email</span>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
        />
        {errors.email && <small className="auth-field__error">{errors.email}</small>}
      </label>

      <label className="auth-field">
        <span>Password</span>
        <div className="auth-field__password">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          <button
            type="button"
            className="auth-field__toggle"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
        {errors.password && <small className="auth-field__error">{errors.password}</small>}
      </label>

      <button type="submit" className="auth-button" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="auth-switch">
        Don&apos;t have an account?{' '}
        <button type="button" onClick={onSwitchToRegister}>
          Create one
        </button>
      </p>
    </form>
  )
}

export default LoginForm
