import { useState } from 'react'
import './LoanPaymentPage.css'
import { createRazorpayOrder, verifyRazorpayCheckout } from '../../api/loans'
import { formatCurrency } from '../../utils/analytics'
import { validatePrepayAmount } from '../../utils/loanValidation'
import { openLoanRazorpayCheckout } from '../../utils/razorpay'

/** Payment type constants — must match backend LoanTransaction enum. */
const PAYMENT_TYPES = {
  EMI: 'EMI',
  PARTIAL: 'Partial Prepayment',
  FULL: 'Full Prepayment',
}

/**
 * Step 4 — Loan payment page.
 * Three payment modes, all routed through Razorpay checkout:
 *   1. Pay EMI — current month's fixed EMI amount
 *   2. Partial Prepay — user enters a custom amount
 *   3. Full Prepay — pay off entire remaining principal
 *
 * Flow (mirrors ShopVault pattern):
 *   createRazorpayOrder → open checkout → verifyRazorpayCheckout → refresh dashboard
 */
function LoanPaymentPage({ loan, loanForm, user, onPaymentSuccess, onBack, isProcessing, setIsProcessing, error, setError }) {
  const [selectedMode, setSelectedMode] = useState('EMI')
  const [prepayAmount, setPrepayAmount] = useState('')
  const [prepayError, setPrepayError] = useState('')

  const paymentModes = [
    {
      id: 'EMI',
      icon: '📅',
      title: 'Pay EMI',
      description: `Pay this month's EMI of ${formatCurrency(loan.emiAmount)}`,
      amount: loan.emiAmount,
      type: PAYMENT_TYPES.EMI,
    },
    {
      id: 'PARTIAL',
      icon: '💰',
      title: 'Partial Prepayment',
      description: 'Reduce your principal with a lump-sum payment',
      amount: null,
      type: PAYMENT_TYPES.PARTIAL,
    },
    {
      id: 'FULL',
      icon: '✅',
      title: 'Pay Loan Fully',
      description: `Close your loan by paying ${formatCurrency(loan.principalAmountLeft)}`,
      amount: loan.principalAmountLeft,
      type: PAYMENT_TYPES.FULL,
    },
  ]

  const getPaymentAmount = () => {
    if (selectedMode === 'PARTIAL') return Number(prepayAmount)
    const mode = paymentModes.find((m) => m.id === selectedMode)
    return mode?.amount || 0
  }

  /** Razorpay payment handler — create order, open checkout, verify on success. */
  const handleRazorpay = async () => {
    setError('')
    setPrepayError('')

    let amount = getPaymentAmount()
    const mode = paymentModes.find((m) => m.id === selectedMode)

    if (selectedMode === 'PARTIAL') {
      const validationError = validatePrepayAmount(prepayAmount, loan.principalAmountLeft)
      if (validationError) {
        setPrepayError(validationError)
        return
      }
      amount = Number(prepayAmount)
    }

    if (!amount || amount <= 0) {
      setError('Invalid payment amount')
      return
    }

    const paymentPayload = {
      loanDisbursedId: loan._id,
      transactionAmount: amount,
      transactionType: mode.type,
    }

    setIsProcessing(true)

    try {
      // Step 1: Create Razorpay order on the server
      const orderRes = await createRazorpayOrder(paymentPayload)
      const order = orderRes.data

      // Step 2: Open Razorpay checkout and verify payment on success
      await openLoanRazorpayCheckout({
        order,
        paymentPayload,
        verifyPayment: verifyRazorpayCheckout,
        description: `${mode.title} — FinTrack Loan`,
        prefill: {
          name: user?.name,
          email: loanForm?.applicantEmail,
          contact: loanForm?.applicantPhone,
        },
      })

      // Step 3: Refresh dashboard after verified payment
      await onPaymentSuccess()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment error'
      if (!message.includes('cancelled')) {
        setError(message)
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="loan-flow">
      <div className="loan-payment-header">
        <button type="button" className="loan-back-btn" onClick={onBack}>
          ← Back to Dashboard
        </button>
        <h2>Make a Payment</h2>
        <p>
          Remaining principal: <strong>{formatCurrency(loan.principalAmountLeft)}</strong>
        </p>
      </div>

      {error && <div className="auth-alert auth-alert--error">{error}</div>}

      {/* Payment mode selector */}
      <div className="loan-payment-modes">
        {paymentModes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            className={`loan-payment-mode ${selectedMode === mode.id ? 'loan-payment-mode--active' : ''}`}
            onClick={() => {
              setSelectedMode(mode.id)
              setPrepayError('')
            }}
          >
            <span className="loan-payment-mode__icon">{mode.icon}</span>
            <div>
              <strong>{mode.title}</strong>
              <p>{mode.description}</p>
            </div>
            {mode.amount !== null && (
              <span className="loan-payment-mode__amount">{formatCurrency(mode.amount)}</span>
            )}
          </button>
        ))}
      </div>

      {/* Partial prepay amount input */}
      {selectedMode === 'PARTIAL' && (
        <div className="dashboard-card loan-prepay-input">
          <label className="auth-field">
            <span>Prepayment Amount (₹)</span>
            <input
              type="number"
              value={prepayAmount}
              onChange={(e) => {
                setPrepayAmount(e.target.value)
                setPrepayError('')
              }}
              placeholder={`Min ₹1,000 — Max ${formatCurrency(loan.principalAmountLeft - 1)}`}
              min={1000}
              max={loan.principalAmountLeft - 1}
            />
            {prepayError && <small className="auth-field__error">{prepayError}</small>}
          </label>
        </div>
      )}

      {/* Payment summary + confirm */}
      <div className="dashboard-card loan-payment-summary">
        <div className="loan-payment-summary__row">
          <span>Payment Type</span>
          <strong>{paymentModes.find((m) => m.id === selectedMode)?.title}</strong>
        </div>
        <div className="loan-payment-summary__row loan-payment-summary__row--total">
          <span>Amount to Pay</span>
          <strong>
            {selectedMode === 'PARTIAL' && !prepayAmount
              ? '—'
              : formatCurrency(getPaymentAmount())}
          </strong>
        </div>

        <button
          type="button"
          className="auth-button loan-btn-primary loan-payment-confirm"
          onClick={handleRazorpay}
          disabled={isProcessing || (selectedMode === 'PARTIAL' && !prepayAmount)}
        >
          {isProcessing ? 'Processing payment…' : 'Pay via Razorpay →'}
        </button>

        <p className="loan-payment-note">
          Secured by Razorpay · UPI, Cards, NetBanking accepted
        </p>
      </div>
    </div>
  )
}

export default LoanPaymentPage
