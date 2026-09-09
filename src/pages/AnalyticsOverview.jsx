import { useEffect, useMemo, useState } from 'react'
import { getDashboardData } from '../api/dashboard'
import {
  buildMonthlyAnalytics,
  formatCurrency,
  getMonthLabel,
} from '../utils/analytics'

function SummaryCard({ label, value, tone = 'default', hint }) {
  return (
    <article className={`summary-card summary-card--${tone}`}>
      <p>{label}</p>
      <h3>{value}</h3>
      {hint && <small>{hint}</small>}
    </article>
  )
}

function BreakdownList({ title, items, emptyMessage }) {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card__header">
        <h2>{title}</h2>
      </div>
      {items.length === 0 ? (
        <p className="dashboard-empty">{emptyMessage}</p>
      ) : (
        <ul className="breakdown-list">
          {items.map((item) => (
            <li key={item.name}>
              <div className="breakdown-list__meta">
                <span>{item.name}</span>
                <strong>{formatCurrency(item.amount)}</strong>
              </div>
              <div className="breakdown-list__bar">
                <span style={{ width: `${item.percentage}%` }} />
              </div>
              <small>{item.percentage.toFixed(1)}%</small>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function BudgetTracker({ budgets }) {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card__header">
        <h2>Category budgets</h2>
      </div>
      {budgets.length === 0 ? (
        <p className="dashboard-empty">No category budgets set for this month.</p>
      ) : (
        <ul className="budget-list">
          {budgets.map((item) => (
            <li key={item.name}>
              <div className="budget-list__meta">
                <span>{item.name}</span>
                <strong>
                  {formatCurrency(item.spent)} / {formatCurrency(item.budget)}
                </strong>
              </div>
              <div className="budget-list__bar">
                <span
                  className={item.usage > 100 ? 'over-budget' : ''}
                  style={{ width: `${Math.min(item.usage, 100)}%` }}
                />
              </div>
              <small>
                {item.usage > 100
                  ? `Over budget by ${formatCurrency(Math.abs(item.remaining))}`
                  : `${formatCurrency(item.remaining)} remaining`}
              </small>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function RecentTransactions({ transactions }) {
  return (
    <section className="dashboard-card">
      <div className="dashboard-card__header">
        <h2>Recent activity</h2>
      </div>
      {transactions.length === 0 ? (
        <p className="dashboard-empty">No transactions recorded this month.</p>
      ) : (
        <ul className="transaction-list">
          {transactions.map((item) => (
            <li key={`${item.type}-${item.id}`}>
              <div>
                <strong>{item.title}</strong>
                <small>{item.meta}</small>
              </div>
              <div className="transaction-list__amount">
                <span className={item.type === 'income' ? 'income' : 'expense'}>
                  {item.type === 'income' ? '+' : '-'}
                  {formatCurrency(item.amount)}
                </span>
                <small>
                  {new Date(item.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </small>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function AnalyticsOverview({ user, year, month }) {
  const [data, setData] = useState({ expenses: [], incomes: [], categories: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const dashboardData = await getDashboardData()
        if (isMounted) {
          setData(dashboardData)
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message)
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const analytics = useMemo(
    () => buildMonthlyAnalytics(data, year, month),
    [data, year, month]
  )

  if (loading) {
    return <div className="dashboard-state">Loading your analytics...</div>
  }

  if (error) {
    return <div className="auth-alert auth-alert--error">{error}</div>
  }

  return (
    <>
      <section className="welcome-banner">
        <div>
          <span className="auth-brand">Monthly insights</span>
          <h2>Welcome back{user?.name ? `, ${user.name}` : ''}</h2>
          <p>Track income, expenses, and savings for {getMonthLabel(year, month)}.</p>
        </div>
      </section>

      <section className="summary-grid">
        <SummaryCard
          label="Total income"
          value={formatCurrency(analytics.totalIncome)}
          tone="income"
        />
        <SummaryCard
          label="Total expenses"
          value={formatCurrency(analytics.totalExpense)}
          tone="expense"
        />
        <SummaryCard
          label="Net savings"
          value={formatCurrency(analytics.netSavings)}
          tone={analytics.netSavings >= 0 ? 'positive' : 'negative'}
          hint={`${analytics.savingsRate.toFixed(1)}% savings rate`}
        />
        <SummaryCard
          label="Transactions"
          value={analytics.transactionCount}
          hint="Income and expense entries this month"
        />
      </section>

      <section className="dashboard-grid">
        <BreakdownList
          title="Spending by category"
          items={analytics.categoryBreakdown}
          emptyMessage="No expenses recorded for this month."
        />
        <BreakdownList
          title="Income by source"
          items={analytics.incomeSources}
          emptyMessage="No income recorded for this month."
        />
        <BreakdownList
          title="Payment methods"
          items={analytics.paymentMethods}
          emptyMessage="No payment data for this month."
        />
        <BudgetTracker budgets={analytics.categoryBudgets} />
        <RecentTransactions transactions={analytics.recentTransactions} />
      </section>
    </>
  )
}

export default AnalyticsOverview
