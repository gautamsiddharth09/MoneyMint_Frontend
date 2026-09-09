export const PAYMENT_METHODS = ['UPI', 'Cash', 'Credit Card', 'Debit Card', 'NetBanking']

export async function parseResponse(response) {
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const message = data.message || 'Something went wrong. Please try again.'
    throw new Error(message)
  }

  if (response.status === 204) {
    return { success: true }
  }

  return data
}

export async function apiGet(url) {
  const response = await fetch(url, { credentials: 'include' })
  return parseResponse(response)
}

export async function apiPost(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  return parseResponse(response)
}

export async function apiPut(url, body) {
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  })
  return parseResponse(response)
}

export async function apiDelete(url) {
  const response = await fetch(url, {
    method: 'DELETE',
    credentials: 'include',
  })
  return parseResponse(response)
}
