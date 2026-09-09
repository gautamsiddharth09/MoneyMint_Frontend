export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount || 0)
}

export function getMonthLabel(year, month) {
  return new Date(year, month, 1).toLocaleDateString('en-IN', {
    month: 'long',
    year: 'numeric',
  })
}

export function isInMonth(dateValue, year, month) {
  const date = new Date(dateValue)
  return date.getFullYear() === year && date.getMonth() === month
}

export function filterByMonth(items, year, month) {
  return items.filter((item) => isInMonth(item.createdAt, year, month))
}

export function sumAmounts(items) {
  return items.reduce((total, item) => total + (item.amount || 0), 0)
}

export function buildMonthlyAnalytics({ expenses, incomes, categories }, year, month) {
  const monthlyExpenses = filterByMonth(expenses, year, month)
  const monthlyIncomes = filterByMonth(incomes, year, month)

  const totalIncome = sumAmounts(monthlyIncomes)
  const totalExpense = sumAmounts(monthlyExpenses)
  const netSavings = totalIncome - totalExpense
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0

  const categoryMap = new Map(
    categories.map((category) => [String(category._id), category.categoryName])
  )

  const getCategoryId = (categoryId) => String(categoryId?._id || categoryId)

  const categorySpending = monthlyExpenses.reduce((acc, expense) => {
    const categoryId = getCategoryId(expense.categoryId)
    const categoryName = categoryMap.get(categoryId) || 'Uncategorized'
    acc[categoryName] = (acc[categoryName] || 0) + expense.amount
    return acc
  }, {})

  const categoryBreakdown = Object.entries(categorySpending)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const paymentBreakdown = monthlyExpenses.reduce((acc, expense) => {
    const method = expense.paymentMethod || 'Other'
    acc[method] = (acc[method] || 0) + expense.amount
    return acc
  }, {})

  const paymentMethods = Object.entries(paymentBreakdown)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const incomeBreakdown = monthlyIncomes.reduce((acc, income) => {
    const source = income.source || 'Other'
    acc[source] = (acc[source] || 0) + income.amount
    return acc
  }, {})

  const incomeSources = Object.entries(incomeBreakdown)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const recentTransactions = [
    ...monthlyExpenses.map((expense) => ({
      id: expense._id,
      type: 'expense',
      title: expense.title,
      amount: expense.amount,
      meta: categoryMap.get(getCategoryId(expense.categoryId)) || expense.paymentMethod,
      date: expense.createdAt,
    })),
    ...monthlyIncomes.map((income) => ({
      id: income._id,
      type: 'income',
      title: income.source,
      amount: income.amount,
      meta: income.remark || 'Income',
      date: income.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)

  const categoryBudgets = categories
    .map((category) => {
      const spent = monthlyExpenses
        .filter((expense) => getCategoryId(expense.categoryId) === String(category._id))
        .reduce((total, expense) => total + expense.amount, 0)

      return {
        name: category.categoryName,
        budget: category.categoryBudget,
        spent,
        remaining: category.categoryBudget - spent,
        usage: category.categoryBudget > 0 ? (spent / category.categoryBudget) * 100 : 0,
      }
    })
    .filter((item) => item.budget > 0)
    .sort((a, b) => b.usage - a.usage)

  return {
    totalIncome,
    totalExpense,
    netSavings,
    savingsRate,
    transactionCount: monthlyExpenses.length + monthlyIncomes.length,
    categoryBreakdown,
    paymentMethods,
    incomeSources,
    recentTransactions,
    categoryBudgets,
  }
}
