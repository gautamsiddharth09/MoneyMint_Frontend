import { useMemo, useState } from 'react'
import { formatCurrency } from '../../utils/analytics'
import './LoanDisbursementPage.css'
import {
  calculateEMI,
  MAX_LOAN_TENURE_MONTHS,
  MIN_LOAN_TENURE_MONTHS,
} from '../../utils/loanCalculations'

/**
 * Step 2 — Disbursement confirmation.
 * User adjusts amount & tenure sliders; EMI recalculates live.
 * Submits to POST /api/loans/loan-disbursed.
 */
function LoanDisbursementPage({ offer, onDisburse, onBack, isSubmitting, error }) {
  const { loanForm, loanAmount, interestRate } = offer

  // Slider state — start at max approved amount and 36 months
  const [amount, setAmount] = useState(Math.round(loanAmount))
  const [tenure, setTenure] = useState(36)

  // Recalculate EMI whenever amount or tenure changes
  const emi = useMemo(
    () => calculateEMI(amount, interestRate, tenure),
    [amount, interestRate, tenure]
  )

  const totalPayable = emi * tenure
  const totalInterest = totalPayable - amount

  const handleDisburse = () => {
    onDisburse({
      loanFormId: loanForm._id,
      disbursedAmount: amount,
      isActive: true,
      disbursedInterest: interestRate,
      disbursedDuration: tenure,
      emiAmount: emi,
      principalAmountLeft: amount,
    })
  }

  return (
    <div className="loan-flow">
      {/* Success banner from application */}
      <div className="loan-offer-banner">
        <div className="loan-offer-banner__icon">✓</div>
        <div>
          <h3>Congratulations! Your loan is approved.</h3>
          <p>
            Based on your profile, you're eligible for up to{' '}
            <strong>{formatCurrency(loanAmount)}</strong> at{' '}
            <strong>{interestRate}% p.a.</strong>
          </p>
        </div>
      </div>

      <div className="loan-disburse-grid">
        {/* Left — sliders */}
        <div className="dashboard-card loan-sliders-card">
          <h3>Customize Your Loan</h3>
          <p className="loan-sliders-card__sub">Adjust amount and tenure to see your EMI</p>

          {error && <div className="auth-alert auth-alert--error">{error}</div>}

          {/* Amount slider */}
          <div className="loan-slider-group">
            <div className="loan-slider-group__header">
              <label htmlFor="amount-slider">Loan Amount</label>
              <span className="loan-slider-value">{formatCurrency(amount)}</span>
            </div>
            <input
              id="amount-slider"
              type="range"
              min={50000}
              max={Math.round(loanAmount)}
              step={10000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="loan-range"
            />
            <div className="loan-range-labels">
              <span>₹50,000</span>
              <span>{formatCurrency(loanAmount)}</span>
            </div>
          </div>

          {/* Tenure slider */}
          <div className="loan-slider-group">
            <div className="loan-slider-group__header">
              <label htmlFor="tenure-slider">Loan Tenure</label>
              <span className="loan-slider-value">{tenure} months</span>
            </div>
            <input
              id="tenure-slider"
              type="range"
              min={MIN_LOAN_TENURE_MONTHS}
              max={MAX_LOAN_TENURE_MONTHS}
              step={1}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="loan-range"
            />
            <div className="loan-range-labels">
              <span>{MIN_LOAN_TENURE_MONTHS} mo</span>
              <span>{MAX_LOAN_TENURE_MONTHS} mo</span>
            </div>
          </div>

          <div className="loan-disburse-actions">
            <button type="button" className="auth-button auth-button--secondary" onClick={onBack}>
              ← Back
            </button>
            <button
              type="button"
              className="auth-button loan-btn-primary"
              onClick={handleDisburse}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Disbursing…' : 'Disburse Loan →'}
            </button>
          </div>
        </div>

        {/* Right — EMI summary card */}
        <div className="loan-emi-card">
          <div className="loan-emi-card__glow" />
          <p className="loan-emi-card__label">Your Monthly EMI</p>
          <h2 className="loan-emi-card__amount">{formatCurrency(emi)}</h2>
          <p className="loan-emi-card__tenure">for {tenure} months @ {interestRate}% p.a.</p>

          <div className="loan-emi-breakdown">
            <div className="loan-emi-breakdown__row">
              <span>Principal</span>
              <strong>{formatCurrency(amount)}</strong>
            </div>
            <div className="loan-emi-breakdown__row">
              <span>Total Interest</span>
              <strong>{formatCurrency(totalInterest)}</strong>
            </div>
            <div className="loan-emi-breakdown__row loan-emi-breakdown__row--total">
              <span>Total Payable</span>
              <strong>{formatCurrency(totalPayable)}</strong>
            </div>
          </div>

          {/* Visual principal vs interest bar */}
          <div className="loan-ratio-bar">
            <div
              className="loan-ratio-bar__principal"
              style={{ width: `${(amount / totalPayable) * 100}%` }}
            />
            <div
              className="loan-ratio-bar__interest"
              style={{ width: `${(totalInterest / totalPayable) * 100}%` }}
            />
          </div>
          <div className="loan-ratio-legend">
            <span><i className="dot dot--green" /> Principal</span>
            <span><i className="dot dot--amber" /> Interest</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoanDisbursementPage
