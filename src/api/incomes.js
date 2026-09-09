import { API_URL } from './config'
import { apiDelete, apiGet, apiPost, apiPut } from './http'

const BASE = `${API_URL}/api/incomes`

export function getIncomes() {
  return apiGet(`${BASE}/user-incomes`)
}

export function getIncomeById(id) {
  return apiGet(`${BASE}/get-income-by-id/${id}`)
}

export function createIncome(payload) {
  return apiPost(`${BASE}/create-income`, payload)
}

export function updateIncome(id, payload) {
  return apiPut(`${BASE}/update-income/${id}`, payload)
}

export function deleteIncome(id) {
  return apiDelete(`${BASE}/delete-income/${id}`)
}
