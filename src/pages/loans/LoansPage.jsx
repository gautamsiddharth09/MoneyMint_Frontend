import { useCallback, useEffect, useState } from 'react'
import {
  disburseLoan,
  getActiveLoan,
  getLoanForm,
  getLoanTransactions,
  submitLoanForm,
} from '../../api/loans'
import LoanApplicationForm from './LoanApplicationForm'
import LoanDisbursementPage from './LoanDisbursementPage'
import LoanDashboard from './LoanDashboard'
import LoanPaymentPage from './LoanPaymentPage'
import './LoansPage.css'

/**
 * Loan flow views — the page acts as a simple state machine:
 *
 *   loading  → checking if user already has an active loan
 *   form     → no active loan, show application form
 *   disburse → form approved, user picks amount & tenure
 *   dashboard→ loan disbursed, show overview + schedule
 *   payment  → user wants to pay EMI / prepay
 */
const VIEWS = {
  LOADING: 'loading',
  FORM: 'form',
  DISBURSE: 'disburse',
  DASHBOARD: 'dashboard',
  PAYMENT: 'payment',
}

function LoansPage({ user }) {
  const [view, setView] = useState(VIEWS.LOADING)
  const [activeLoan, setActiveLoan] = useState(null)
  const [loanForm, setLoanForm] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [offer, setOffer] = useState(null) // { loanForm, loanAmount, interestRate }
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  /** Fetch active loan + related data. Called on mount and after payments. */
  const loadActiveLoan = useCallback(async () => {
    try {
      const res = await getActiveLoan()
      const loan = res.data
      setActiveLoan(loan)

      // Fetch loan form details and transaction history in parallel
      const [formRes, txnRes] = await Promise.all([
        getLoanForm(loan.loanFormId).catch(() => null),
        getLoanTransactions(loan._id).catch(() => ({ data: [] })),
      ])

      setLoanForm(formRes?.data || null)
      setTransactions(txnRes.data || [])
      setView(VIEWS.DASHBOARD)
    } catch {
      // 404 = no active loan → show application form
      setActiveLoan(null)
      setView(VIEWS.FORM)
    }
  }, [])

  useEffect(() => {
    loadActiveLoan()
  }, [loadActiveLoan])

  /** Step 1: Submit loan application form. */
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true)
    setError('')
    try {
      const res = await submitLoanForm(formData)
      setOffer({
        loanForm: res.data.loanForm,
        loanAmount: res.data.loanAmount,
        interestRate: res.data.interestRate,
      })
      setView(VIEWS.DISBURSE)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  /** Step 2: Disburse the loan with chosen amount and tenure. */
  const handleDisburse = async (payload) => {
    setIsSubmitting(true)
    setError('')
    try {
      const res = await disburseLoan(payload)
      setActiveLoan(res.data)
      setOffer(null)

      // Load form + transactions for the dashboard
      const formRes = await getLoanForm(payload.loanFormId).catch(() => null)
      setLoanForm(formRes?.data || null)
      setTransactions([])
      setView(VIEWS.DASHBOARD)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  /** Step 4: Refresh loan data after Razorpay payment is verified on the server. */
  const handlePaymentSuccess = async () => {
    await loadActiveLoan()
    setView(VIEWS.DASHBOARD)
  }



  if (view === VIEWS.LOADING) {
    return (
      <div className="loan-flow loan-loading">
        <div className="loan-spinner" />
        <p>Loading your loan details…</p>
      </div>
    )
  }

  if (view === VIEWS.FORM) {
    return (
      <LoanApplicationForm
        user={user}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
        error={error}
      />
    )
  }

  if (view === VIEWS.DISBURSE && offer) {
    return (
      <LoanDisbursementPage
        offer={offer}
        onDisburse={handleDisburse}
        onBack={() => {
          setOffer(null)
          setView(VIEWS.FORM)
          setError('')
        }}
        isSubmitting={isSubmitting}
        error={error}
      />
    )
  }

  if (view === VIEWS.PAYMENT && activeLoan) {
    return (
      <LoanPaymentPage
        loan={activeLoan}
        loanForm={loanForm}
        user={user}
        onPaymentSuccess={handlePaymentSuccess}
        onBack={() => {
          setView(VIEWS.DASHBOARD)
          setError('')
        }}
        isProcessing={isSubmitting}
        setIsProcessing={setIsSubmitting}
        error={error}
        setError={setError}
      />
    )
  }

  if (view === VIEWS.DASHBOARD && activeLoan) {
    return (
      <LoanDashboard
        loan={activeLoan}
        loanForm={loanForm}
        transactions={transactions}
        onPayLoan={() => setView(VIEWS.PAYMENT)}
        onRefresh={loadActiveLoan}
      />
    )
  }

  return null
}

export default LoansPage
