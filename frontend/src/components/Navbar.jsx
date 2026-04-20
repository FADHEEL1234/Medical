import { Link, NavLink, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';

function Navbar() {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem('token') !== null;

  if (!isAuthenticated) {
    return null;
  }

  const username = localStorage.getItem('username') || '';
  const isStaff = localStorage.getItem('is_staff') === 'true';

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  return (
    <header className="app-nav-wrap">
      <nav className="app-nav">
        <Link to="/dashboard" className="app-nav__brand">
          <span className="app-nav__brand-mark">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 11 5.16-1.26 9-5.45 9-11V7l-10-5z"/>
              <path d="M12 2v20"/>
            </svg>
          </span>
          <span>
            <strong>MediCare</strong>
            <small>Patient Portal</small>
          </span>
        </Link>

        <div className="app-nav__content">
          {username && (
            <div className="app-nav__avatar" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="avatar-placeholder" style={{
                width: '32px', height: '32px', borderRadius: '50%', 
                background: 'linear-gradient(135deg, var(--teal), var(--teal-strong))',
                display: 'grid', placeItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '14px'
              }}>
                {username.charAt(0).toUpperCase()}
              </div>
              <span className="app-nav__user" style={{ fontWeight: '600' }}>{username}</span>
            </div>
          )}

          <div className="app-nav__links">
            <NavLink to="/dashboard" className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/doctors" className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}>
              Doctors
            </NavLink>
            <NavLink to="/book-appointment" className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}>
              Book Appointment
            </NavLink>
            <NavLink to="/my-appointments" className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}>
              My Appointments
            </NavLink>
            {isStaff && (
              <NavLink to="/admin" className={({ isActive }) => `app-nav__link${isActive ? ' is-active' : ''}`}>
                Admin
              </NavLink>
            )}
            <button type="button" className="app-nav__logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
