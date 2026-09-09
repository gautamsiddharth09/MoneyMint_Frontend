import { useEffect, useMemo, useState } from 'react'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../api/categories'
import { formatCurrency } from '../utils/analytics'
import {
  filterUserCategories,
  validateCategoryForm,
} from '../utils/categoryValidation'
import './ExpensesPage.css'
import './CategoriesPage.css'

const EMPTY_FORM = {
  categoryName: '',
  categoryBudget: '',
}

function CategoryForm({ isOpen, onClose, onSubmit, initialValues, isSubmitting, error }) {
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
    const nextErrors = validateCategoryForm(form)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return
    onSubmit(form)
  }

  return (
    <div className="expense-modal">
      <button type="button" className="expense-modal__backdrop" onClick={onClose} aria-label="Close" />
      <div className="expense-modal__card auth-panel__card">
        <div className="expense-modal__header">
          <h2>{initialValues ? 'Edit category' : 'Add category'}</h2>
          <button type="button" className="expense-modal__close" onClick={onClose}>
            ×
          </button>
        </div>

        {error && <div className="auth-alert auth-alert--error">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <label className="auth-field">
            <span>Category name</span>
            <input
              type="text"
              name="categoryName"
              value={form.categoryName}
              onChange={handleChange}
              placeholder="e.g. Food & Dining"
            />
            {errors.categoryName && (
              <small className="auth-field__error">{errors.categoryName}</small>
            )}
          </label>

          <label className="auth-field">
            <span>Monthly budget (₹)</span>
            <input
              type="number"
              name="categoryBudget"
              value={form.categoryBudget}
              onChange={handleChange}
              placeholder="e.g. 5000"
              min="0"
              step="1"
            />
            {errors.categoryBudget && (
              <small className="auth-field__error">{errors.categoryBudget}</small>
            )}
            <small className="auth-field__hint">Set a monthly spending limit for this category</small>
          </label>

          <div className="expense-modal__actions">
            <button type="button" className="auth-button auth-button--secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="auth-button" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : initialValues ? 'Update category' : 'Add category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CategoriesPage({ user }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  const loadData = async () => {
    setLoading(true)
    setError('')

    try {
      const categoryData = await getCategories()
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

  const userCategories = useMemo(
    () => filterUserCategories(categories, user?.id),
    [categories, user?.id]
  )

  const filteredCategories = useMemo(() => {
    return userCategories
      .filter((category) =>
        category.categoryName.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => a.categoryName.localeCompare(b.categoryName))
  }, [userCategories, search])

  const totalBudget = useMemo(
    () => filteredCategories.reduce((sum, category) => sum + category.categoryBudget, 0),
    [filteredCategories]
  )

  const openCreateForm = () => {
    setEditingCategory(null)
    setFormError('')
    setIsFormOpen(true)
  }

  const openEditForm = (category) => {
    setEditingCategory(category)
    setFormError('')
    setIsFormOpen(true)
  }

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingCategory(null)
    setFormError('')
  }

  const handleSubmit = async (form) => {
    setIsSubmitting(true)
    setFormError('')

    try {
      const payload = {
        categoryName: form.categoryName.trim(),
        categoryBudget: Number(form.categoryBudget),
      }

      if (editingCategory) {
        await updateCategory(editingCategory._id, payload)
        setSuccessMessage('Category updated successfully')
      } else {
        await createCategory({
          ...payload,
          userId: user.id,
        })
        setSuccessMessage('Category created successfully')
      }

      closeForm()
      await loadData()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (categoryId) => {
    const confirmed = window.confirm('Are you sure you want to delete this category?')
    if (!confirmed) return

    setDeletingId(categoryId)
    setError('')

    try {
      await deleteCategory(categoryId)
      setSuccessMessage('Category deleted successfully')
      await loadData()
    } catch (err) {
      setError(err.message)
    } finally {
      setDeletingId(null)
    }
  }

  const formInitialValues = editingCategory
    ? {
        categoryName: editingCategory.categoryName,
        categoryBudget: String(editingCategory.categoryBudget),
      }
    : null

  return (
    <div className="categories-page">
      <section className="expenses-toolbar dashboard-card">
        <div className="expenses-toolbar__stats">
          <div>
            <p>Total monthly budget</p>
            <h3>{formatCurrency(totalBudget)}</h3>
          </div>
          <div>
            <p>Categories</p>
            <h3>{filteredCategories.length}</h3>
          </div>
        </div>
        <button type="button" className="auth-button expenses-toolbar__add" onClick={openCreateForm}>
          + Add category
        </button>
      </section>

      {successMessage && (
        <div className="auth-alert auth-alert--success">{successMessage}</div>
      )}
      {error && <div className="auth-alert auth-alert--error">{error}</div>}

      <section className="categories-filters dashboard-card">
        <label className="auth-field">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by category name..."
          />
        </label>
      </section>

      <section className="dashboard-card expenses-table-card">
        {loading ? (
          <p className="dashboard-empty">Loading categories...</p>
        ) : filteredCategories.length === 0 ? (
          <div className="expenses-empty">
            <p>No categories found. Create your first category to organize expenses.</p>
            <button type="button" className="auth-button" onClick={openCreateForm}>
              Add category
            </button>
          </div>
        ) : (
          <div className="categories-grid">
            {filteredCategories.map((category) => (
              <article key={category._id} className="category-card">
                <div className="category-card__header">
                  <h3>{category.categoryName}</h3>
                  <span className="expense-badge">Budget</span>
                </div>
                <p className="category-card__budget">{formatCurrency(category.categoryBudget)}</p>
                <small className="category-card__date">
                  Created{' '}
                  {new Date(category.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </small>
                <div className="expense-actions category-card__actions">
                  <button type="button" onClick={() => openEditForm(category)}>
                    Edit
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => handleDelete(category._id)}
                    disabled={deletingId === category._id}
                  >
                    {deletingId === category._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <CategoryForm
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

export default CategoriesPage
