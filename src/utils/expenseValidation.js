import { PAYMENT_METHODS } from '../api/http'

export function validateExpenseForm({ title, amount, categoryId, paymentMethod }) {
  const errors = {}

  const trimmedTitle = title.trim()
  if (!trimmedTitle) {
    errors.title = 'Title is required'
  } else if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
    errors.title = 'Title must be between 3 and 100 characters'
  }

  const parsedAmount = Number(amount)
  if (amount === '' || Number.isNaN(parsedAmount)) {
    errors.amount = 'Amount is required'
  } else if (parsedAmount < 0) {
    errors.amount = 'Amount must be 0 or greater'
  }

  if (!categoryId) {
    errors.categoryId = 'Category is required'
  }

  if (!paymentMethod) {
    errors.paymentMethod = 'Payment method is required'
  } else if (!PAYMENT_METHODS.includes(paymentMethod)) {
    errors.paymentMethod = 'Select a valid payment method'
  }

  return errors
}

export function getCategoryId(categoryId) {
  return String(categoryId?._id || categoryId || '')
}
