import { API_URL } from './config'

const API_BASE = `${API_URL}/api/auth`

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message =
      data.message ||
      data.error?.details?.[0]?.message ||
      'Something went wrong. Please try again.'
    throw new Error(message)
  }

  return data
}

export async function registerUser({ name, email, password }) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  })

  return parseResponse(response)
}

export async function loginUser({ email, password }) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  })

  return parseResponse(response)
}

export async function getCurrentUser() {
  const response = await fetch(`${API_BASE}/me`, {
    credentials: 'include',
  })

  return parseResponse(response)
}
