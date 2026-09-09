/**
 * Client-side validation for the loan application form.
 * Mirrors the Joi schema on the backend (loanFormController.js).
 */

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
const PHONE_REGEX = /^[6-9]\d{9}$/

export const LOAN_PURPOSES = [
  'Home Renovation',
  'Education',
  'Medical Emergency',
  'Business Expansion',
  'Debt Consolidation',
  'Personal Use',
  'Travel',
  'Other',
]

export const EMPTY_LOAN_FORM = {
  applicantName: '',
  applicantEmail: '',
  applicantAddress: '',
  applicantPhone: '',
  loanPurpose: '',
  creditScore: '',
  kycDocument: '',
  panNumber: '',
}

/** Validate all loan form fields; returns an errors object (empty = valid). */
export function validateLoanForm(form) {
  const errors = {}

  if (!form.applicantName?.trim()) {
    errors.applicantName = 'Full name is required'
  }

  if (!form.applicantEmail?.trim()) {
    errors.applicantEmail = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.applicantEmail)) {
    errors.applicantEmail = 'Enter a valid email address'
  }

  if (!form.applicantAddress?.trim()) {
    errors.applicantAddress = 'Address is required'
  }

  if (!form.applicantPhone?.trim()) {
    errors.applicantPhone = 'Phone number is required'
  } else if (!PHONE_REGEX.test(form.applicantPhone.replace(/\s/g, ''))) {
    errors.applicantPhone = 'Enter a valid 10-digit Indian mobile number'
  }

  if (!form.loanPurpose) {
    errors.loanPurpose = 'Select a loan purpose'
  }

  const score = Number(form.creditScore)
  if (!form.creditScore) {
    errors.creditScore = 'Credit score is required'
  } else if (score < 300 || score > 900) {
    errors.creditScore = 'Credit score must be between 300 and 900'
  }

  if (!form.kycDocument?.trim()) {
    errors.kycDocument = 'KYC document URL or reference is required'
  }

  const pan = form.panNumber?.trim().toUpperCase()
  if (!pan) {
    errors.panNumber = 'PAN number is required'
  } else if (!PAN_REGEX.test(pan)) {
    errors.panNumber = 'Enter a valid PAN (e.g. ABCDE1234F)'
  }

  return errors
}

/** Validate partial prepayment amount against remaining principal. */
export function validatePrepayAmount(amount, principalLeft) {
  const num = Number(amount)
  if (!num || num <= 0) return 'Enter a valid amount greater than zero'
  if (num >= principalLeft) return 'Partial prepay must be less than remaining principal'
  if (num < 1000) return 'Minimum partial prepayment is ₹1,000'
  return null
}
