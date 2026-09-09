import Sidebar from './Sidebar'
import "./DashboardLayout.css"


function DashboardLayout({
  activePage,
  onNavigate,
  user,
  onLogout,
  title,
  subtitle,
  actions,
  children,
  isSidebarOpen,
  onSidebarOpen,
  onSidebarClose,
}) {
  return (
    <div className="app-shell">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          onNavigate(page)
          onSidebarClose()
        }}
        user={user}
        onLogout={onLogout}
        isOpen={isSidebarOpen}
        onClose={onSidebarClose}
      />

      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar__left">
            <button
              type="button"
              className="app-topbar__menu"
              onClick={onSidebarOpen}
              aria-label="Open menu"
            >
              ☰
            </button>
            <div>
              <h1>{title}</h1>
              {subtitle && <p>{subtitle}</p>}
            </div>
          </div>
          {actions && <div className="app-topbar__actions">{actions}</div>}
        </header>

        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
