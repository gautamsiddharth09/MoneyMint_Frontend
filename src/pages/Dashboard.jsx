import { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { getMonthLabel } from '../utils/analytics'
import AnalyticsOverview from './AnalyticsOverview'
import ExpensesPage from './ExpensesPage'
import CategoriesPage from './CategoriesPage'
import IncomePage from './IncomePage'
import PlaceholderPage from './PlaceholderPage'
import LoansPage from './loans/LoansPage'
import './Dashboard.css'

const PAGE_META = {
  overview: {
    title: 'Overview',
    subtitle: 'Monthly analytics and financial insights',
  },
  expenses: {
    title: 'Expenses',
    subtitle: 'Track and manage your spending',
  },
  income: {
    title: 'Income',
    subtitle: 'Monitor your income sources',
  },
  categories: {
    title: 'Categories',
    subtitle: 'Organize budgets by category',
  },
  loans: {
    title: 'Loans',
    subtitle: 'Apply, manage, and repay your personal loan',
  },
  settings: {
    title: 'Settings',
    subtitle: 'Account and app preferences',
  },
}

function MonthSelector({ year, month, onChange }) {
  const goToMonth = (offset) => {
    const date = new Date(year, month + offset, 1)
    onChange(date.getFullYear(), date.getMonth())
  }

  return (
    <div className="month-selector">
      <button type="button" onClick={() => goToMonth(-1)} aria-label="Previous month">
        ←
      </button>
      <span>{getMonthLabel(year, month)}</span>
      <button type="button" onClick={() => goToMonth(1)} aria-label="Next month">
        →
      </button>
    </div>
  )
}

function Dashboard({ user, onLogout }) {
  const now = new Date()
  const [activePage, setActivePage] = useState('overview')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const pageMeta = PAGE_META[activePage]

  const handleMonthChange = (nextYear, nextMonth) => {
    setYear(nextYear)
    setMonth(nextMonth)
  }

  const renderPage = () => {
    switch (activePage) {
      case 'overview':
        return <AnalyticsOverview user={user} year={year} month={month} />
      case 'expenses':
        return <ExpensesPage user={user} />
      case 'income':
        return <IncomePage user={user} />
      case 'categories':
        return <CategoriesPage user={user} />
      case 'loans':
        return <LoansPage user={user} />
      case 'settings':
        return (
          <PlaceholderPage
            icon="⚙"
            title="Settings"
            description="Update your profile and app preferences."
          />
        )
      default:
        return null
    }
  }

  return (
    <DashboardLayout
      activePage={activePage}
      onNavigate={setActivePage}
      user={user}
      onLogout={onLogout}
      title={pageMeta.title}
      subtitle={pageMeta.subtitle}
      isSidebarOpen={isSidebarOpen}
      onSidebarOpen={() => setIsSidebarOpen(true)}
      onSidebarClose={() => setIsSidebarOpen(false)}
      actions={
        activePage === 'overview' ? (
          <MonthSelector year={year} month={month} onChange={handleMonthChange} />
        ) : null
      }
    >
      {renderPage()}
    </DashboardLayout>
  )
}

export default Dashboard
