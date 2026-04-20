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
          <span className="app-nav__brand-mark">M</span>
          <span>
            <strong>Medical Appointments</strong>
            <small>Care coordination workspace</small>
          </span>
        </Link>

        <div className="app-nav__content">
          {username && <span className="app-nav__user">Signed in as {username}</span>}

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
