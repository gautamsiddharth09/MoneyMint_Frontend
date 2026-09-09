import { getExpenses } from './expenses'
import { getCategories } from './categories'
import { getIncomes } from './incomes'

export async function getDashboardData() {
  const [expenseData, incomeData, categoryData] = await Promise.all([
    getExpenses(),
    getIncomes(),
    getCategories(),
  ])

  return {
    expenses: expenseData.expenses || [],
    incomes: incomeData.incomeSources || [],
    categories: categoryData.categories || [],
  }
}
