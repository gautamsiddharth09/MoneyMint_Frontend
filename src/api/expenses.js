import { API_URL } from './config'
import { apiDelete, apiGet, apiPost, apiPut } from './http'

const BASE = `${API_URL}/api/expenses`

export function getExpenses() {
  return apiGet(`${BASE}/user-expenses`)
}

export function getExpenseById(id) {
  return apiGet(`${BASE}/get-expense/${id}`)
}

export function getExpensesByCategory(categoryId) {
  return apiGet(`${BASE}/get-expense-by-category/${categoryId}`)
}

export function createExpense(payload) {
  return apiPost(`${BASE}/create-expense`, payload)
}

export function updateExpense(id, payload) {
  return apiPut(`${BASE}/update-expense/${id}`, payload)
}

export function deleteExpense(id) {
  return apiDelete(`${BASE}/delete-expense/${id}`)
}
