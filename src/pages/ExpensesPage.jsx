import { useEffect, useMemo, useState } from 'react'
import {
  createExpense,
  deleteExpense,
  getExpenses,
  updateExpense,
} from '../api/expenses'
import { getCategories } from '../api/categories'
import { PAYMENT_METHODS } from '../api/http'
import { formatCurrency } from '../utils/analytics'
import { getCategoryId, validateExpenseForm } from '../utils/expenseValidation'
import './ExpensesPage.css'

const EMPTY_FORM = {
  title: '',
  amount: '',
  categoryId: '',
  paymentMethod: 'Cash',
}

function ExpenseForm({ isOpen, onClose, onSubmit, categories, initialValues, isSubmitting, error }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setForm(initialValues || EMPTY_FORM)
      setErrors({})
    }
  }, [isOpen, initialValues])

  if (!isOpen) return null

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateExpenseForm(form)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    onSubmit(form)
  }

  return (
    <div className="expense-modal">
      <button type="button" className="expense-modal__backdrop" onClick={onClose} aria-label="Close" />
      <div className="expense-modal__card auth-panel__card">
        <div className="expense-modal__header">
          <h2>{initialValues ? 'Edit expense' : 'Add expense'}</h2>
          <button type="button" className="expense-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="auth-alert auth-alert--error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-field">
            <span>Title</span>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Grocery shopping"
            />
            {errors.title && <small className="auth-field__error">{errors.title}</small>}
          </label>

          <label className="auth-field">
            <span>Amount (₹)</span>
            <input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="0"
              min="0"
              step="0.01"
            />
            {errors.amount && <small className="auth-field__error">{errors.amount}</small>}
          </label>

          <label className="auth-field">
            <span>Category</span>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="expense-select"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.categoryName}
                </option>
              ))}
            </select>
            {errors.categoryId && <small className="auth-field__error">{errors.categoryId}</small>}
          </label>

          <label className="auth-field">
            <span>Payment method</span>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={handleChange}
              className="expense-select"
            >
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            {errors.paymentMethod && (
              <small className="auth-field__error">{errors.paymentMethod}</small>
            )}
          </label>

          <div className="expense-modal__actions">
            <button type="button" className="auth-button auth-button--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="auth-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialValues ? 'Update expense' : 'Add expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ExpensesPage({ user }) {
  const [expenses, setExpenses] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [paymentFilter, setPaymentFilter] = useState('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [String(category._id), category.categoryName])),
    [categories]
  )

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const [expenseData, categoryData] = await Promise.all([getExpenses(), getCategories()])
      setExpenses(expenseData.expenses || [])
      setCategories(categoryData.categories || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((expense) => {
        const matchesSearch = expense.title.toLowerCase().includes(search.toLowerCase())
        const matchesCategory =
          categoryFilter === 'all' || getCategoryId(expense.categoryId) === categoryFilter
        const matchesPayment =
          paymentFilter === 'all' || expense.paymentMethod === paymentFilter
        return matchesSearch && matchesCategory && matchesPayment
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [expenses, search, categoryFilter, paymentFilter])

  const totalAmount = useMemo(
    () => filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0),
    [filteredExpenses]
  )

  const openCreateForm = () => {
    setEditingExpense(null)
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditForm = (expense) => {
    setEditingExpense(expense)
    setFormError('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingExpense(null)
    setFormError('')
  }

  const handleSubmit = async (form) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      const payload = {
        title: form.title.trim(),
        amount: Number(form.amount),
        categoryId: form.categoryId,
        paymentMethod: form.paymentMethod,
      }

      if (editingExpense) {
        await updateExpense(editingExpense._id, payload)
        setSuccessMessage('Expense updated successfully')
      } else {
        await createExpense({
          ...payload,
          userId: user.id,
        })
        setSuccessMessage('Expense created successfully')
      }

      closeForm()
      await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (expenseId) => {
    const confirmed = window.confirm('Are you sure you want to delete this expense?')
    if (!confirmed) return

    setDeletingId(expenseId)
    setError('')

    try {
      await deleteExpense(expenseId)
      setSuccessMessage('Expense deleted successfully')
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const formInitialValues = editingExpense
    ? {
        title: editingExpense.title,
        amount: String(editingExpense.amount),
        categoryId: getCategoryId(editingExpense.categoryId),
        paymentMethod: editingExpense.paymentMethod,
      }
    : null

  return (
    <div className="expenses-page">
      <section className="expenses-toolbar dashboard-card">
        <div className="expenses-toolbar__stats">
          <div>
            <p>Total expenses</p>
            <h3>{formatCurrency(totalAmount)}</h3>
          </div>
          <div>
            <p>Entries</p>
            <h3>{filteredExpenses.length}</h3>
          </div>
        </div>
        <button type="button" className="auth-button expenses-toolbar__add" onClick={openCreateForm}>
          + Add expense
        </button>
      </section>

      {successMessage && (
        <div className="auth-alert auth-alert--success">{successMessage}</div>
      )}
      {error && <div className="auth-alert auth-alert--error">{error}</div>}

      <section className="expenses-filters dashboard-card">
        <label className="auth-field">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by title..."
          />
        </label>

        <label className="auth-field">
          <span>Category</span>
          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="expense-select"
          >
            <option value="all">All categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.categoryName}
              </option>
            ))}
          </select>
        </label>

        <label className="auth-field">
          <span>Payment method</span>
          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
            className="expense-select"
          >
            <option value="all">All methods</option>
            {PAYMENT_METHODS.map((method) => (
              <option key={method} value={method}>
                {method}
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="dashboard-card expenses-table-card">
        {loading ? (
          <p className="dashboard-empty">Loading expenses...</p>
        ) : categories.length === 0 ? (
          <div className="expenses-empty">
            <p>No categories found. Create categories first before adding expenses.</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="expenses-empty">
            <p>No expenses found. Add your first expense to get started.</p>
            <button type="button" className="auth-button" onClick={openCreateForm}>
              Add expense
            </button>
          </div>
        ) : (
          <div className="expenses-table-wrap">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Payment</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr key={expense._id}>
                    <td>
                      <strong>{expense.title}</strong>
                    </td>
                    <td>
                      {categoryMap.get(getCategoryId(expense.categoryId)) || 'Uncategorized'}
                    </td>
                    <td>
                      <span className="expense-badge">{expense.paymentMethod}</span>
                    </td>
                    <td>
                      {new Date(expense.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="expense-amount">{formatCurrency(expense.amount)}</td>
                    <td>
                      <div className="expense-actions">
                        <button type="button" onClick={() => openEditForm(expense)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDelete(expense._id)}
                          disabled={deletingId === expense._id}
                        >
                          {deletingId === expense._id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ExpenseForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        categories={categories}
        initialValues={formInitialValues}
        isSubmitting={isSubmitting}
        error={formError}
      />
    </div>
  )
}

export default ExpensesPage
