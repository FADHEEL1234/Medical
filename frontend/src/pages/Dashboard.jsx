import { useEffect, useMemo, useState } from 'react';
import { authAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';

const Icon = ({ name, className = '' }) => {
  const classes = `icon ${className}`.trim();
  switch (name) {
    case 'user':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4" />
          <path d="M4 20a8 8 0 0 1 16 0" />
        </svg>
      );
    case 'doctor':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 3h8v4H8z" />
          <path d="M4 20v-5a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v5" />
          <path d="M12 9v5" />
          <path d="M9.5 11.5h5" />
        </svg>
      );
    case 'calendar':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v4M16 2v4" />
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18" />
        </svg>
      );
    case 'list':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 6h13M8 12h13M8 18h13" />
          <circle cx="4" cy="6" r="1" />
          <circle cx="4" cy="12" r="1" />
          <circle cx="4" cy="18" r="1" />
        </svg>
      );
    case 'shield':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l7 3v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z" />
        </svg>
      );
    case 'clock':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6l4 2" />
        </svg>
      );
    case 'logout':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      );
    default:
      return null;
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';
  const [now, setNow] = useState(new Date());
  const isStaff = localStorage.getItem('is_staff') === 'true';

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const actions = useMemo(() => {
    const base = [
      {
        key: 'doctors',
        title: 'View Doctors',
        desc: 'Browse our list of specialist doctors',
        icon: 'doctor',
        onClick: () => navigate('/doctors')
      },
      {
        key: 'book',
        title: 'Book Appointment',
        desc: 'Schedule a new appointment quickly',
        icon: 'calendar',
        onClick: () => navigate('/book-appointment')
      },
      {
        key: 'appointments',
        title: 'My Appointments',
        desc: 'Track, manage, and review all bookings',
        icon: 'list',
        onClick: () => navigate('/my-appointments')
      }
    ];

    if (isStaff) {
      base.push({
        key: 'admin',
        title: 'Admin Panel',
        desc: 'Manage doctors and appointments system-wide',
        icon: 'shield',
        onClick: () => navigate('/admin')
      });
    }

    return base;
  }, [isStaff, navigate]);

  const handleLogout = () => {
    authAPI.logout();
    navigate('/login');
  };

  return (
    <div className="user-dashboard">
      <div className="user-hero">
        <div>
          <span className="user-kicker">Patient portal</span>
          <h1><Icon name="user" />Welcome, {username}</h1>
          <p>Manage your medical appointments with speed and clarity.</p>
        </div>
        <div className="user-live">
          <Icon name="clock" />
          <span>{now.toLocaleString()}</span>
        </div>
      </div>

      <div className="user-stats">
        <article className="user-stat-card">
          <span>Quick actions</span>
          <strong>{actions.length}</strong>
        </article>
        <article className="user-stat-card">
          <span>Account role</span>
          <strong>{isStaff ? 'Staff' : 'Patient'}</strong>
        </article>
      </div>

      <div className="quick-actions user-actions-grid">
        {actions.map((action) => (
          <button key={action.key} type="button" className="action-card user-action-card" onClick={action.onClick}>
            <div className="user-action-icon"><Icon name={action.icon} /></div>
            <h3>{action.title}</h3>
            <p>{action.desc}</p>
          </button>
        ))}
      </div>

      <div className="user-logout-wrap">
        <button onClick={handleLogout} className="btn btn-secondary">
          <Icon name="logout" />Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
