import { NavLink } from 'react-router-dom';

const links = [
  { to: '/',  label: 'Dashboard' },
  { to: '/books',  label: 'Books' },
  { to: '/authors', label: 'Authors' },
  { to: '/stats', label: 'Stats & Reports' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h1>Library UI</h1>
        <span>Admin Panel</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Navigation</div>
        {links.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span className="icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
