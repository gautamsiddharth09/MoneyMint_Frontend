/**
 * Loan API module — thin wrappers around backend loan endpoints.
 * All requests use cookie-based auth (see api/http.js).
 */
import { API_URL } from './config'
import { apiGet, apiPost } from './http'

const BASE = `${API_URL}/api/loans`

/** Submit a new loan application form. Returns offer (amount + interest rate). */
export function submitLoanForm(formData) {
  return apiPost(`${BASE}/loan-form`, formData)
}

/** Fetch a loan form by its MongoDB _id. */
export function getLoanForm(loanFormId) {
  return apiGet(`${BASE}/loan-form/${loanFormId}`)
}

/** Disburse a loan after the user confirms amount and tenure. */
export function disburseLoan(payload) {
  return apiPost(`${BASE}/loan-disbursed`, payload)
}

/** Get the authenticated user's currently active loan (404 if none). */
export function getActiveLoan() {
  return apiGet(`${BASE}/get-loan`)
}

/** Fetch a specific disbursed loan record by _id. */
export function getLoanDisbursed(loanId) {
  return apiGet(`${BASE}/loan-disbursed/${loanId}`)
}

/** Record a payment transaction (EMI / prepayment) after Razorpay success. */
export function createLoanTransaction(payload) {
  return apiPost(`${BASE}/loan-transaction`, payload)
}

/** List all payment transactions for a disbursed loan. */
export function getLoanTransactions(loanDisbursedId) {
  return apiGet(`${BASE}/loan-transactions/${loanDisbursedId}`)
}

/** Create a Razorpay order for a loan payment. Returns { keyId, orderId, amount, currency }. */
export function createRazorpayOrder(payload) {
  return apiPost(`${BASE}/razorpay/create-order`, payload)
}

/** Verify Razorpay checkout signature and record the loan transaction. */
export function verifyRazorpayCheckout(payload) {
  return apiPost(`${BASE}/razorpay/verify`, payload)
}
