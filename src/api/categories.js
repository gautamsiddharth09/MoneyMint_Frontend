import { API_URL } from './config'
import { apiDelete, apiGet, apiPost, apiPut } from './http'

const BASE = `${API_URL}/api/categories`

export function getCategories() {
  return apiGet(`${BASE}/get-categories`)
}

export function getCategoryById(id) {
  return apiGet(`${BASE}/get-category/${id}`)
}

export function createCategory(payload) {
  return apiPost(`${BASE}/create-category`, payload)
}

export function updateCategory(id, payload) {
  return apiPut(`${BASE}/update-category/${id}`, payload)
}

export function deleteCategory(id) {
  return apiDelete(`${BASE}/delete-category/${id}`)
}
