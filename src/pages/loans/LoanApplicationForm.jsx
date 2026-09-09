import { useState } from 'react'
import './LoanApplicationForm.css'
import {
  EMPTY_LOAN_FORM,
  LOAN_PURPOSES,
  validateLoanForm,
} from '../../utils/loanValidation'

/**
 * Step 1 — Loan application form.
 * Collects applicant details and submits to POST /api/loans/loan-form.
 */
function LoanApplicationForm({ user, onSubmit, isSubmitting, error }) {
  const [form, setForm] = useState({
    ...EMPTY_LOAN_FORM,
    applicantName: user?.name || '',
  })
  const [errors, setErrors] = useState({})

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateLoanForm(form)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    onSubmit({
      ...form,
      applicantPhone: form.applicantPhone.replace(/\s/g, ''),
      panNumber: form.panNumber.trim().toUpperCase(),
      creditScore: Number(form.creditScore),
    })
  }

  return (
    <div className="loan-flow">
      {/* Hero banner */}
      <div className="loan-hero">
        <div className="loan-hero__content">
          <span className="loan-hero__badge">Instant Approval</span>
          <h2>Apply for a Personal Loan</h2>
          <p>
            Get AI-powered risk assessment and competitive interest rates.
            Funds disbursed directly to your account.
          </p>
        </div>
        <div className="loan-hero__stats">
          <div className="loan-stat-pill">
            <strong>Up to ₹50L</strong>
            <span>Max loan amount</span>
          </div>
          <div className="loan-stat-pill">
            <strong>10–25%</strong>
            <span>Interest p.a.</span>
          </div>
          <div className="loan-stat-pill">
            <strong>48 mo</strong>
            <span>Max tenure</span>
          </div>
        </div>
      </div>

      {/* Application form card */}
      <div className="dashboard-card loan-form-card">
        <div className="loan-form-card__header">
          <h3>Loan Application</h3>
          <p>Fill in your details below. All fields are required.</p>
        </div>

        {error && <div className="auth-alert auth-alert--error">{error}</div>}

        <form className="auth-form loan-form-grid" onSubmit={handleSubmit} noValidate>
          <label className="auth-field">
            <span>Full Name</span>
            <input
              type="text"
              name="applicantName"
              value={form.applicantName}
              onChange={handleChange}
              placeholder="As per PAN card"
            />
            {errors.applicantName && (
              <small className="auth-field__error">{errors.applicantName}</small>
            )}
          </label>

          <label className="auth-field">
            <span>Email Address</span>
            <input
              type="email"
              name="applicantEmail"
              value={form.applicantEmail}
              onChange={handleChange}
              placeholder="you@example.com"
            />
            {errors.applicantEmail && (
              <small className="auth-field__error">{errors.applicantEmail}</small>
            )}
          </label>

          <label className="auth-field loan-form-grid__full">
            <span>Residential Address</span>
            <textarea
              name="applicantAddress"
              value={form.applicantAddress}
              onChange={handleChange}
              placeholder="House no., street, city, state, PIN"
              rows={2}
              className="loan-textarea"
            />
            {errors.applicantAddress && (
              <small className="auth-field__error">{errors.applicantAddress}</small>
            )}
          </label>

          <label className="auth-field">
            <span>Mobile Number</span>
            <input
              type="tel"
              name="applicantPhone"
              value={form.applicantPhone}
              onChange={handleChange}
              placeholder="9876543210"
              maxLength={10}
            />
            {errors.applicantPhone && (
              <small className="auth-field__error">{errors.applicantPhone}</small>
            )}
          </label>

          <label className="auth-field">
            <span>PAN Number</span>
            <input
              type="text"
              name="panNumber"
              value={form.panNumber}
              onChange={handleChange}
              placeholder="ABCDE1234F"
              maxLength={10}
              style={{ textTransform: 'uppercase' }}
            />
            {errors.panNumber && (
              <small className="auth-field__error">{errors.panNumber}</small>
            )}
          </label>

          <label className="auth-field">
            <span>Loan Purpose</span>
            <select
              name="loanPurpose"
              value={form.loanPurpose}
              onChange={handleChange}
              className="expense-select"
            >
              <option value="">Select purpose</option>
              {LOAN_PURPOSES.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {purpose}
                </option>
              ))}
            </select>
            {errors.loanPurpose && (
              <small className="auth-field__error">{errors.loanPurpose}</small>
            )}
          </label>

          <label className="auth-field">
            <span>Credit Score (CIBIL)</span>
            <input
              type="number"
              name="creditScore"
              value={form.creditScore}
              onChange={handleChange}
              placeholder="300 – 900"
              min={300}
              max={900}
            />
            {errors.creditScore && (
              <small className="auth-field__error">{errors.creditScore}</small>
            )}
          </label>

          <label className="auth-field loan-form-grid__full">
            <span>KYC Document URL</span>
            <input
              type="url"
              name="kycDocument"
              value={form.kycDocument}
              onChange={handleChange}
              placeholder="https://drive.google.com/... or document reference"
            />
            {errors.kycDocument && (
              <small className="auth-field__error">{errors.kycDocument}</small>
            )}
          </label>

          <div className="loan-form-grid__full loan-form-actions">
            <button type="submit" className="auth-button loan-btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Assessing your profile…' : 'Submit Application →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoanApplicationForm
