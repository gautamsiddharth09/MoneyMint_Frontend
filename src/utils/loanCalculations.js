/**
 * Loan math helpers — EMI calculation and amortization schedule generation.
 * Uses the standard reducing-balance EMI formula used by most Indian lenders.
 */

/** Maximum loan tenure allowed in months (business rule). */
export const MAX_LOAN_TENURE_MONTHS = 48

/** Minimum loan tenure in months. */
export const MIN_LOAN_TENURE_MONTHS = 6

/**
 * Calculate monthly EMI for a given principal, annual interest rate, and tenure.
 *
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n - 1)
 *   P = principal, r = monthly rate, n = tenure in months
 */
export function calculateEMI(principal, annualInterestRate, tenureMonths) {
  if (!principal || !tenureMonths) return 0

  const monthlyRate = annualInterestRate / 12 / 100

  // Zero-interest edge case — simple division
  if (monthlyRate === 0) {
    return Math.round(principal / tenureMonths)
  }

  const factor = Math.pow(1 + monthlyRate, tenureMonths)
  const emi = (principal * monthlyRate * factor) / (factor - 1)

  return Math.round(emi)
}

/**
 * Generate a month-by-month repayment schedule (amortization table).
 *
 * @param {number} principal       - Loan amount disbursed
 * @param {number} annualRate      - Annual interest rate (%)
 * @param {number} tenureMonths    - Total loan duration in months
 * @param {string|Date} startDate  - Disbursement date (first EMI due next month)
 * @returns {Array<{ month, dueDate, emi, principal, interest, balance, status }>}
 */
export function generateRepaymentSchedule(principal, annualRate, tenureMonths, startDate) {
  const monthlyRate = annualRate / 12 / 100
  const emi = calculateEMI(principal, annualRate, tenureMonths)
  let balance = principal
  const schedule = []
  const baseDate = new Date(startDate)

  for (let month = 1; month <= tenureMonths; month += 1) {
    const interest = Math.round(balance * monthlyRate)
    const principalPart = Math.min(emi - interest, balance)
    balance = Math.max(0, balance - principalPart)

    // Due date = start date + month number
    const dueDate = new Date(baseDate)
    dueDate.setMonth(dueDate.getMonth() + month)

    schedule.push({
      month,
      dueDate: dueDate.toISOString(),
      emi,
      principal: principalPart,
      interest,
      balance: Math.round(balance),
      status: 'pending', // updated later when we overlay transactions
    })
  }

  return schedule
}

/**
 * Overlay payment transactions onto the schedule to mark paid months.
 *
 * @param {Array} schedule      - Output of generateRepaymentSchedule
 * @param {Array} transactions  - LoanTransaction documents from the API
 * @returns {Array} Updated schedule with status: 'paid' | 'pending' | 'partial'
 */
export function applyTransactionsToSchedule(schedule, transactions) {
  const updated = schedule.map((row) => ({ ...row }))

  // Sort transactions oldest-first so we apply them in order
  const sorted = [...transactions].sort(
    (a, b) => new Date(a.transactionDate) - new Date(b.transactionDate)
  )

  let emiPaidCount = 0

  for (const txn of sorted) {
    if (txn.transactionType === 'EMI') {
      // Mark the next pending EMI row as paid
      const nextPending = updated.find(
        (row) => row.status === 'pending' && emiPaidCount < row.month
      )
      // Find first pending row by month order
      const target = updated.find((row) => row.status === 'pending')
      if (target) {
        target.status = 'paid'
        target.paidOn = txn.transactionDate
        target.paidAmount = txn.transactionAmount
      }
      emiPaidCount += 1
    } else if (txn.transactionType === 'Partial Prepayment') {
      // Mark a visual indicator — reduce remaining balances conceptually
      const firstPending = updated.find((row) => row.status === 'pending')
      if (firstPending) {
        firstPending.status = 'partial-prepay'
        firstPending.prepayAmount = txn.transactionAmount
        firstPending.paidOn = txn.transactionDate
      }
    } else if (txn.transactionType === 'Full Prepayment') {
      updated.forEach((row) => {
        if (row.status === 'pending') row.status = 'closed'
      })
    }
  }

  return updated
}

/**
 * Calculate loan progress percentage (principal repaid / total disbursed).
 */
export function calculateLoanProgress(disbursedAmount, principalLeft) {
  if (!disbursedAmount) return 0
  const repaid = disbursedAmount - principalLeft
  return Math.min(100, Math.round((repaid / disbursedAmount) * 100))
}

/**
 * Count how many EMIs have been paid based on transaction history.
 */
export function countPaidEmis(transactions) {
  return transactions.filter((t) => t.transactionType === 'EMI').length
}
