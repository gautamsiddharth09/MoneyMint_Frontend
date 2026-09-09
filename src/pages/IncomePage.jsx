import { useEffect, useMemo, useState } from 'react'
import {
  createIncome,
  deleteIncome,
  getIncomes,
  updateIncome,
} from '../api/incomes'
import { formatCurrency } from '../utils/analytics'
import { validateIncomeForm } from '../utils/incomeValidation'
import './ExpensesPage.css'
import './IncomePage.css'

const EMPTY_FORM = {
  source: '',
  amount: '',
  remark: '',
}

function IncomeForm({ isOpen, onClose, onSubmit, initialValues, isSubmitting, error }) {
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
    const nextErrors = validateIncomeForm(form)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    onSubmit(form)
  }

  return (
    <div className="expense-modal">
      <button type="button" className="expense-modal__backdrop" onClick={onClose} aria-label="Close" />
      <div className="expense-modal__card auth-panel__card">
        <div className="expense-modal__header">
          <h2>{initialValues ? 'Edit income' : 'Add income'}</h2>
          <button type="button" className="expense-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="auth-alert auth-alert--error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-field">
            <span>Source</span>
            <input
              type="text"
              name="source"
              value={form.source}
              onChange={handleChange}
              placeholder="e.g. Salary, Freelance"
            />
            {errors.source && <small className="auth-field__error">{errors.source}</small>}
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
            <span>Remark (optional)</span>
            <textarea
              name="remark"
              value={form.remark}
              onChange={handleChange}
              placeholder="Add a note about this income..."
              rows={3}
              className="income-textarea"
            />
            {errors.remark && <small className="auth-field__error">{errors.remark}</small>}
          </label>

          <div className="expense-modal__actions">
            <button type="button" className="auth-button auth-button--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="auth-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialValues ? 'Update income' : 'Add income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function IncomePage({ user }) {
  const [incomes, setIncomes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingIncome, setEditingIncome] = useState(null)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const incomeData = await getIncomes()
      setIncomes(incomeData.incomeSources || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const filteredIncomes = useMemo(() => {
    return incomes
      .filter((income) => {
        const query = search.toLowerCase()
        return (
          income.source.toLowerCase().includes(query) ||
          (income.remark || '').toLowerCase().includes(query)
        )
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [incomes, search])

  const totalAmount = useMemo(
    () => filteredIncomes.reduce((sum, income) => sum + income.amount, 0),
    [filteredIncomes]
  )

  const openCreateForm = () => {
    setEditingIncome(null)
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditForm = (income) => {
    setEditingIncome(income)
    setFormError('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingIncome(null)
    setFormError('')
  }

  const handleSubmit = async (form) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      const payload = {
        source: form.source.trim(),
        amount: Number(form.amount),
        remark: form.remark.trim(),
      }

      if (editingIncome) {
        await updateIncome(editingIncome._id, payload)
        setSuccessMessage('Income updated successfully')
      } else {
        await createIncome({
          ...payload,
          userId: user.id,
        })
        setSuccessMessage('Income added successfully')
      }

      closeForm()
      await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (incomeId) => {
    const confirmed = window.confirm('Are you sure you want to delete this income entry?')
    if (!confirmed) return

    setDeletingId(incomeId)
    setError('')

    try {
      await deleteIncome(incomeId)
      setSuccessMessage('Income deleted successfully')
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const formInitialValues = editingIncome
    ? {
        source: editingIncome.source,
        amount: String(editingIncome.amount),
        remark: editingIncome.remark || '',
      }
    : null

  return (
    <div className="income-page">
      <section className="expenses-toolbar dashboard-card">
        <div className="expenses-toolbar__stats">
          <div>
            <p>Total income</p>
            <h3 className="income-total">{formatCurrency(totalAmount)}</h3>
          </div>
          <div>
            <p>Entries</p>
            <h3>{filteredIncomes.length}</h3>
          </div>
        </div>
        <button type="button" className="auth-button expenses-toolbar__add" onClick={openCreateForm}>
          + Add income
        </button>
      </section>

      {successMessage && (
        <div className="auth-alert auth-alert--success">{successMessage}</div>
      )}
      {error && <div className="auth-alert auth-alert--error">{error}</div>}

      <section className="income-filters dashboard-card">
        <label className="auth-field">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by source or remark..."
          />
        </label>
      </section>

      <section className="dashboard-card expenses-table-card">
        {loading ? (
          <p className="dashboard-empty">Loading income entries...</p>
        ) : filteredIncomes.length === 0 ? (
          <div className="expenses-empty">
            <p>No income recorded yet. Add your first income source to get started.</p>
            <button type="button" className="auth-button" onClick={openCreateForm}>
              Add income
            </button>
          </div>
        ) : (
          <div className="expenses-table-wrap">
            <table className="expenses-table">
              <thead>
                <tr>
                  <th>Source</th>
                  <th>Remark</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredIncomes.map((income) => (
                  <tr key={income._id}>
                    <td>
                      <strong>{income.source}</strong>
                    </td>
                    <td>{income.remark || '—'}</td>
                    <td>
                      {new Date(income.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="income-amount">{formatCurrency(income.amount)}</td>
                    <td>
                      <div className="expense-actions">
                        <button type="button" onClick={() => openEditForm(income)}>
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger"
                          onClick={() => handleDelete(income._id)}
                          disabled={deletingId === income._id}
                        >
                          {deletingId === income._id ? 'Deleting...' : 'Delete'}
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

      <IncomeForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        initialValues={formInitialValues}
        isSubmitting={isSubmitting}
        error={formError}
      />
    </div>
  )
}

export default IncomePage
