import { useEffect, useMemo, useState } from 'react';
import { authAPI, appointmentsAPI, doctorsAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';

const STORAGE = {
  theme: 'dashboard_theme',
  activity: 'dashboard_activity',
  reminders: 'dashboard_reminders',
  reminderTriggers: 'dashboard_reminder_triggers',
  notifications: 'dashboard_notifications',
  profile: 'dashboard_profile',
  apptStatusMap: 'dashboard_appointment_status_map'
};

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
    case 'search':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case 'bell':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
          <path d="M10 17a2 2 0 0 0 4 0" />
        </svg>
      );
    case 'sun':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      );
    case 'moon':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      );
    case 'plus':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'repeat':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 1l4 4-4 4" />
          <path d="M3 11V9a4 4 0 0 1 4-4h14" />
          <path d="M7 23l-4-4 4-4" />
          <path d="M21 13v2a4 4 0 0 1-4 4H3" />
        </svg>
      );
    default:
      return null;
  }
};

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'User';
  const isStaff = localStorage.getItem('is_staff') === 'true';

  const [now, setNow] = useState(new Date());
  const [theme, setTheme] = useState(localStorage.getItem(STORAGE.theme) || 'light');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [doctorQuery, setDoctorQuery] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activity, setActivity] = useState(() => readJSON(STORAGE.activity, []));
  const [notifications, setNotifications] = useState(() => readJSON(STORAGE.notifications, []));
  const [reminders, setReminders] = useState(() => readJSON(STORAGE.reminders, []));
  const [reminderDraft, setReminderDraft] = useState({ title: '', time: '' });
  const [profile, setProfile] = useState(() => readJSON(STORAGE.profile, {
    email: '',
    phone: '',
    address: '',
    gender: '',
    age: ''
  }));

  const addActivity = (message) => {
    const item = { id: Date.now(), message, time: new Date().toISOString() };
    const next = [item, ...activity].slice(0, 12);
    setActivity(next);
    writeJSON(STORAGE.activity, next);
  };

  const addNotification = (message, type = 'info') => {
    const item = { id: Date.now() + Math.floor(Math.random() * 1000), message, type, seen: false, time: new Date().toISOString() };
    const next = [item, ...notifications].slice(0, 20);
    setNotifications(next);
    writeJSON(STORAGE.notifications, next);
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE.theme, theme);
    document.body.classList.toggle('theme-dark', theme === 'dark');
    document.body.classList.toggle('theme-light', theme !== 'dark');
  }, [theme]);

  useEffect(() => {
    let active = true;
    const fetchDashboardData = async () => {
      try {
        const [doctorsResp, appointmentsResp] = await Promise.all([
          doctorsAPI.getAll(),
          appointmentsAPI.getMyAppointments()
        ]);
        if (!active) return;
        const doctorData = doctorsResp.data || [];
        const appointmentData = appointmentsResp.data || [];
        setDoctors(doctorData);
        setAppointments(appointmentData);

        const previousMap = readJSON(STORAGE.apptStatusMap, {});
        const currentMap = {};
        appointmentData.forEach((appt) => {
          currentMap[appt.id] = appt.status;
          if (previousMap[appt.id] && previousMap[appt.id] !== appt.status) {
            addNotification(`Appointment #${appt.id} status changed to ${appt.status}.`, appt.status === 'Approved' ? 'success' : 'warning');
          }
        });
        writeJSON(STORAGE.apptStatusMap, currentMap);
      } catch {
        if (!active) return;
        setError('Failed to load dashboard data.');
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboardData();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!reminders.length) return;
    const hhmm = now.toTimeString().slice(0, 5);
    const today = now.toISOString().slice(0, 10);
    const triggers = readJSON(STORAGE.reminderTriggers, {});

    reminders.forEach((reminder) => {
      const triggerKey = `${reminder.id}:${today}`;
      if (reminder.time === hhmm && !triggers[triggerKey]) {
        addNotification(`Reminder: ${reminder.title} (${reminder.time})`, 'warning');
        triggers[triggerKey] = true;
      }
    });

    writeJSON(STORAGE.reminderTriggers, triggers);
  }, [now, reminders]);

  useEffect(() => {
    const upcoming = appointments
      .filter((a) => new Date(a.appointment_date).getTime() > now.getTime() && a.status !== 'Rejected')
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];

    if (!upcoming) return;
    const diffHrs = (new Date(upcoming.appointment_date).getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHrs > 0 && diffHrs <= 24) {
      const dailyFlag = `${upcoming.id}:${now.toISOString().slice(0, 10)}`;
      const seenMap = readJSON('dashboard_upcoming_alerts', {});
      if (!seenMap[dailyFlag]) {
        addNotification(`Upcoming appointment in less than 24 hours with Dr. ${upcoming.doctor_name}.`, 'warning');
        seenMap[dailyFlag] = true;
        writeJSON('dashboard_upcoming_alerts', seenMap);
      }
    }
  }, [appointments, now]);

  const upcomingAppointment = useMemo(() => {
    return appointments
      .filter((a) => new Date(a.appointment_date).getTime() > now.getTime() && a.status !== 'Rejected')
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0] || null;
  }, [appointments, now]);

  const recentAppointments = useMemo(() => {
    return [...appointments]
      .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime())
      .slice(0, 3);
  }, [appointments]);

  const actions = useMemo(() => {
    const base = [
      { key: 'doctors', title: 'View Doctors', desc: 'Browse specialist doctors', icon: 'doctor', onClick: () => { addActivity('Opened doctors list'); navigate('/doctors'); } },
      { key: 'book', title: 'Book Appointment', desc: 'Create a new booking', icon: 'calendar', onClick: () => { addActivity('Opened booking form'); navigate('/book-appointment'); } },
      { key: 'appointments', title: 'My Appointments', desc: 'Manage your appointments', icon: 'list', onClick: () => { addActivity('Opened my appointments'); navigate('/my-appointments'); } }
    ];
    if (isStaff) {
      base.push({ key: 'admin', title: 'Admin Panel', desc: 'System doctor/appointment control', icon: 'shield', onClick: () => { addActivity('Opened admin panel'); navigate('/admin'); } });
    }
    return base;
  }, [isStaff, navigate, activity]);

  const filteredDoctors = useMemo(() => {
    const q = doctorQuery.trim().toLowerCase();
    if (!q) return [];
    return doctors.filter((d) =>
      [d.name, d.specialization, d.email]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [doctors, doctorQuery]);

  const unresolvedNotifications = notifications.filter((n) => !n.seen).length;

  const profileCompleteness = useMemo(() => {
    const fields = [username, profile.email, profile.phone, profile.address, profile.gender, profile.age];
    const filled = fields.filter((f) => String(f || '').trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [username, profile]);

  const markNotificationsSeen = () => {
    const next = notifications.map((n) => ({ ...n, seen: true }));
    setNotifications(next);
    writeJSON(STORAGE.notifications, next);
  };

  const handleLogout = () => {
    addActivity('Logged out');
    authAPI.logout();
    navigate('/login');
  };

  const handleAddReminder = (e) => {
    e.preventDefault();
    if (!reminderDraft.title.trim() || !reminderDraft.time) return;
    const next = [{
      id: Date.now(),
      title: reminderDraft.title.trim(),
      time: reminderDraft.time
    }, ...reminders].slice(0, 8);
    setReminders(next);
    writeJSON(STORAGE.reminders, next);
    setReminderDraft({ title: '', time: '' });
    addActivity('Added a health reminder');
    addNotification('New health reminder added.', 'success');
  };

  const removeReminder = (id) => {
    const next = reminders.filter((r) => r.id !== id);
    setReminders(next);
    writeJSON(STORAGE.reminders, next);
    addActivity('Removed a health reminder');
  };

  const handleProfileSave = () => {
    writeJSON(STORAGE.profile, profile);
    addActivity('Updated profile details');
    addNotification('Profile updated successfully.', 'success');
  };

  const resolveDoctorId = (appointment) => {
    if (appointment.doctor) return appointment.doctor;
    const match = doctors.find((d) => d.name === appointment.doctor_name);
    return match?.id;
  };

  const handleRebook = (appointment) => {
    const doctorId = resolveDoctorId(appointment);
    addActivity(`Rebook started for Dr. ${appointment.doctor_name}`);
    if (doctorId) {
      navigate(`/book-appointment?doctor=${doctorId}`);
    } else {
      navigate('/book-appointment');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className={`user-dashboard user-theme-${theme}`}>
      <div className="user-topbar">
        <button type="button" className="btn btn-ghost user-theme-toggle" onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}>
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>

        <div className="user-notification-wrap">
          <button
            type="button"
            className="btn btn-ghost user-notification-btn"
            onClick={() => {
              const open = !notificationsOpen;
              setNotificationsOpen(open);
              if (open) markNotificationsSeen();
            }}
          >
            <Icon name="bell" />Notifications
            {unresolvedNotifications > 0 && <span className="user-badge">{unresolvedNotifications}</span>}
          </button>
          {notificationsOpen && (
            <div className="user-notification-panel">
              {notifications.length === 0 && <p className="user-empty">No notifications yet.</p>}
              {notifications.map((note) => (
                <div key={note.id} className={`user-note user-note-${note.type}`}>
                  <strong>{new Date(note.time).toLocaleString()}</strong>
                  <span>{note.message}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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

      {error && <div className="message message-error">{error}</div>}

      <div className="user-stats">
        <article className="user-stat-card">
          <span>Quick actions</span>
          <strong>{actions.length}</strong>
        </article>
        <article className="user-stat-card">
          <span>Profile completeness</span>
          <strong>{profileCompleteness}%</strong>
        </article>
        <article className="user-stat-card">
          <span>My appointments</span>
          <strong>{appointments.length}</strong>
        </article>
        <article className="user-stat-card">
          <span>Reminders</span>
          <strong>{reminders.length}</strong>
        </article>
      </div>

      <div className="user-grid">
        <section className="user-panel">
          <h3><Icon name="calendar" />Upcoming appointment</h3>
          {upcomingAppointment ? (
            <div className="user-upcoming-box">
              <p><strong>Doctor:</strong> Dr. {upcomingAppointment.doctor_name}</p>
              <p><strong>Date:</strong> {new Date(upcomingAppointment.appointment_date).toLocaleString()}</p>
              <p><strong>Status:</strong> {upcomingAppointment.status}</p>
            </div>
          ) : (
            <p className="user-empty">No upcoming appointment found.</p>
          )}
        </section>

        <section className="user-panel">
          <h3><Icon name="search" />Quick doctor search</h3>
          <label className="admin-search">
            <Icon name="search" />
            <input
              type="text"
              value={doctorQuery}
              onChange={(e) => setDoctorQuery(e.target.value)}
              placeholder="Search doctor by name or specialization"
            />
          </label>
          <div className="user-search-results">
            {doctorQuery && filteredDoctors.length === 0 && <p className="user-empty">No matching doctors.</p>}
            {filteredDoctors.map((doctor) => (
              <button key={doctor.id} type="button" className="user-inline-card" onClick={() => navigate(`/book-appointment?doctor=${doctor.id}`)}>
                <span>Dr. {doctor.name}</span>
                <small>{doctor.specialization}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="user-panel">
          <h3><Icon name="clock" />Health reminders</h3>
          <form className="user-reminder-form" onSubmit={handleAddReminder}>
            <input
              type="text"
              value={reminderDraft.title}
              onChange={(e) => setReminderDraft((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Reminder title (e.g. Take BP meds)"
            />
            <input
              type="time"
              value={reminderDraft.time}
              onChange={(e) => setReminderDraft((prev) => ({ ...prev, time: e.target.value }))}
            />
            <button type="submit" className="btn btn-primary"><Icon name="plus" />Add</button>
          </form>
          <div className="user-list">
            {reminders.length === 0 && <p className="user-empty">No reminders yet.</p>}
            {reminders.map((reminder) => (
              <div key={reminder.id} className="user-list-item">
                <span>{reminder.title} at {reminder.time}</span>
                <button type="button" className="btn btn-danger" onClick={() => removeReminder(reminder.id)}>Delete</button>
              </div>
            ))}
          </div>
        </section>

        <section className="user-panel">
          <h3><Icon name="user" />Profile completeness</h3>
          <div className="user-profile-grid">
            <input type="email" placeholder="Email" value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
            <input type="text" placeholder="Phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
            <input type="text" placeholder="Address" value={profile.address} onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))} />
            <input type="text" placeholder="Gender" value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))} />
            <input type="number" placeholder="Age" value={profile.age} onChange={(e) => setProfile((p) => ({ ...p, age: e.target.value }))} />
          </div>
          <div className="user-progress-wrap">
            <div className="user-progress-bar" style={{ width: `${profileCompleteness}%` }} />
          </div>
          <button type="button" className="btn btn-primary" onClick={handleProfileSave}>Save profile</button>
        </section>
      </div>

      <section className="user-panel user-panel-full">
        <h3><Icon name="repeat" />One-click rebook</h3>
        <div className="user-list">
          {recentAppointments.length === 0 && <p className="user-empty">No appointment history yet.</p>}
          {recentAppointments.map((appt) => (
            <div key={appt.id} className="user-list-item">
              <span>Dr. {appt.doctor_name} on {new Date(appt.appointment_date).toLocaleString()} ({appt.status})</span>
              <button type="button" className="btn btn-secondary" onClick={() => handleRebook(appt)}>
                <Icon name="repeat" />Rebook
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="user-panel user-panel-full">
        <h3><Icon name="list" />Recent activity</h3>
        <div className="user-list">
          {activity.length === 0 && <p className="user-empty">No recent activity yet.</p>}
          {activity.map((item) => (
            <div key={item.id} className="user-list-item user-list-muted">
              <span>{item.message}</span>
              <small>{new Date(item.time).toLocaleString()}</small>
            </div>
          ))}
        </div>
      </section>

      <div className="user-logout-wrap">
        <button onClick={handleLogout} className="btn btn-secondary">
          <Icon name="logout" />Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
