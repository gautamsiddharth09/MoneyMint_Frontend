import { useState } from 'react'
import { registerUser } from '../api/auth'
import { validateEmail, validateName, validatePassword } from '../utils/validation'

import './RegisterForm.css'

function RegisterForm({ onSuccess, onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
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
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
      confirmPassword:
        form.password !== form.confirmPassword ? 'Passwords do not match' : '',
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
      const data = await registerUser({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      })
      onSuccess(data.message)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit} noValidate>
      <div className="auth-form__header">
        <h1>Create account</h1>
        <p>Start tracking expenses and income in minutes</p>
      </div>

      {submitError && <div className="auth-alert auth-alert--error">{submitError}</div>}

      <label className="auth-field">
        <span>Full name</span>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Jane Doe"
          autoComplete="name"
        />
        {errors.name && <small className="auth-field__error">{errors.name}</small>}
      </label>

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
            placeholder="Create a strong password"
            autoComplete="new-password"
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
        <small className="auth-field__hint">
          8+ characters with uppercase, lowercase, number, and special character
        </small>
      </label>

      <label className="auth-field">
        <span>Confirm password</span>
        <input
          type={showPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your password"
          autoComplete="new-password"
        />
        {errors.confirmPassword && (
          <small className="auth-field__error">{errors.confirmPassword}</small>
        )}
      </label>

      <button type="submit" className="auth-button" disabled={isSubmitting}>
        {isSubmitting ? 'Creating account...' : 'Create account'}
      </button>

      <p className="auth-switch">
        Already have an account?{' '}
        <button type="button" onClick={onSwitchToLogin}>
          Sign in
        </button>
      </p>
    </form>
  )
}

export default RegisterForm
