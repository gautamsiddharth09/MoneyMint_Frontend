import "./Sidebar.css"

const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: '◈' },
  { id: 'expenses', label: 'Expenses', icon: '↘' },
  { id: 'income', label: 'Income', icon: '↗' },
  { id: 'categories', label: 'Categories', icon: '▦' },
  { id: 'loans', label: 'Loans', icon: '₹' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

function Sidebar({ activePage, onNavigate, user, onLogout, isOpen, onClose }) {
  return (
    <>
      <button
        type="button"
        className={`sidebar-backdrop ${isOpen ? 'sidebar-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-label="Close menu"
      />

      <aside className={`app-sidebar ${isOpen ? 'app-sidebar--open' : ''}`}>
        <div className="app-sidebar__brand">
          <span className="auth-brand">MoneyMint</span>
          <p>Finance Bridge</p>
        </div>

        <nav className="app-sidebar__nav">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`app-sidebar__link ${activePage === item.id ? 'app-sidebar__link--active' : ''}`}
              onClick={() => onNavigate(item.id)}
            >
              <span className="app-sidebar__icon">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="app-sidebar__footer">
          <div className="app-sidebar__user">
            <div className="app-sidebar__avatar">
              {(user?.name || 'U').charAt(0).toUpperCase()}
            </div>
            <div>
              <strong>{user?.name || 'User'}</strong>
              <small>Signed in</small>
            </div>
          </div>
          <button type="button" className="auth-button auth-button--secondary" onClick={onLogout}>
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
