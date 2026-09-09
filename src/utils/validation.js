const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export function validateEmail(email) {
  if (!email.trim()) return 'Email is required'
  if (!EMAIL_REGEX.test(email.trim())) return 'Enter a valid email address'
  return ''
}

export function validatePassword(password) {
  if (!password) return 'Password is required'
  if (!PASSWORD_REGEX.test(password)) {
    return 'Password must be 8+ chars with upper, lower, number, and special character'
  }
  return ''
}

export function validateName(name) {
  const trimmed = name.trim()
  if (!trimmed) return 'Name is required'
  if (trimmed.length < 2 || trimmed.length > 20) {
    return 'Name must be between 2 and 20 characters'
  }
  return ''
}
