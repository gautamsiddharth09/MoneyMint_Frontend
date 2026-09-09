export function validateIncomeForm({ source, amount, remark }) {
  const errors = {}

  const trimmedSource = source.trim()
  if (!trimmedSource) {
    errors.source = 'Income source is required'
  }

  const parsedAmount = Number(amount)
  if (amount === '' || Number.isNaN(parsedAmount)) {
    errors.amount = 'Amount is required'
  } else if (parsedAmount < 0) {
    errors.amount = 'Amount must be 0 or greater'
  }

  if (remark && remark.trim().length > 200) {
    errors.remark = 'Remark must be 200 characters or less'
  }

  return errors
}
