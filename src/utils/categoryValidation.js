export function validateCategoryForm({ categoryName, categoryBudget }) {
  const errors = {}

  const trimmedName = categoryName.trim()
  if (!trimmedName) {
    errors.categoryName = 'Category name is required'
  } else if (trimmedName.length < 3 || trimmedName.length > 50) {
    errors.categoryName = 'Category name must be between 3 and 50 characters'
  }

  const parsedBudget = Number(categoryBudget)
  if (categoryBudget === '' || Number.isNaN(parsedBudget)) {
    errors.categoryBudget = 'Budget is required'
  } else if (parsedBudget < 0) {
    errors.categoryBudget = 'Budget must be 0 or greater'
  }

  return errors
}

export function filterUserCategories(categories, userId) {
  if (!userId) return categories
  return categories.filter((category) => String(category.userId) === String(userId))
}
