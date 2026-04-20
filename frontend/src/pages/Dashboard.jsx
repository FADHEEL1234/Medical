import { useEffect, useMemo, useState } from 'react';
import { doctorsAPI, appointmentsAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';

const STORAGE = {
  theme: 'dashboard_theme',
  activity: 'dashboard_activity',
  reminders: 'dashboard_reminders',
  reminderTriggers: 'dashboard_reminder_triggers',
  notifications: 'dashboard_notifications',
  profile: 'dashboard_profile',
  apptStatusMap: 'dashboard_appointment_status_map',
  upcomingAlerts: 'dashboard_upcoming_alerts'
};

const Icon = ({ name, className = '' }) => {
  const classes = `icon ${className}`.trim();

  switch (name) {
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
    case 'pulse':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 12h-4l-3 7-4-14-3 7H2" />
        </svg>
      );
    case 'spark':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l1.7 5.3L19 10l-5.3 1.7L12 17l-1.7-5.3L5 10l5.3-1.7z" />
          <path d="M19 3v4" />
          <path d="M21 5h-4" />
        </svg>
      );
    case 'check':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    default:
      return null;
  }
};

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: 'numeric',
  minute: '2-digit'
});

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: 'numeric'
});

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

const formatDateTime = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Invalid date' : dateTimeFormatter.format(date);
};

const formatNextVisit = (value, now) => {
  const target = new Date(value);
  const diffMs = target.getTime() - now.getTime();

  if (Number.isNaN(target.getTime())) {
    return 'No time available';
  }

  if (diffMs <= 0) {
    return 'Happening now';
  }

  const hours = Math.round(diffMs / (1000 * 60 * 60));
  if (hours < 24) {
    return `In ${hours} hour${hours === 1 ? '' : 's'}`;
  }

  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));
  return `In ${days} day${days === 1 ? '' : 's'}`;
};

const getGreeting = (date) => {
  const hour = date.getHours();

  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const healthTips = [
  'Drink plenty of water before your visit to stay energized and alert.',
  'Write down your top three questions before your appointment so nothing gets missed.',
  'A short evening walk can help you relax and improve sleep quality.',
  'Set a reminder for medication and follow-up notes to keep your care plan on track.',
  'Track a simple mood log for better conversations with your provider.'
];

const getStatusTone = (status) => {
  switch (status) {
    case 'Approved':
      return 'success';
    case 'Rejected':
      return 'danger';
    default:
      return 'warning';
  }
};

function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem('username') || 'Patient';
  const isStaff = localStorage.getItem('is_staff') === 'true';

  const [now, setNow] = useState(new Date());
  const [theme, setTheme] = useState(localStorage.getItem(STORAGE.theme) || 'light');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [metricPulse, setMetricPulse] = useState(false);
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
    setActivity((current) => {
      const next = [item, ...current].slice(0, 10);
      writeJSON(STORAGE.activity, next);
      return next;
    });
  };

  const addNotification = (message, type = 'info') => {
    const item = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      message,
      type,
      seen: false,
      time: new Date().toISOString()
    };

    setNotifications((current) => {
      const next = [item, ...current].slice(0, 18);
      writeJSON(STORAGE.notifications, next);
      return next;
    });
  };

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE.theme, theme);
  }, [theme]);

  useEffect(() => {
    if (!loading) {
      setMetricPulse(true);
      const timer = setTimeout(() => setMetricPulse(false), 1200);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [loading]);

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      try {
        const [doctorsResponse, appointmentsResponse] = await Promise.all([
          doctorsAPI.getAll(),
          appointmentsAPI.getMyAppointments()
        ]);

        if (!active) return;

        const doctorData = doctorsResponse.data || [];
        const appointmentData = appointmentsResponse.data || [];
        const previousMap = readJSON(STORAGE.apptStatusMap, {});
        const currentMap = {};

        setDoctors(doctorData);
        setAppointments(appointmentData);
        setError('');

        appointmentData.forEach((appointment) => {
          currentMap[appointment.id] = appointment.status;
          if (previousMap[appointment.id] && previousMap[appointment.id] !== appointment.status) {
            addNotification(
              `Appointment #${appointment.id} changed to ${appointment.status}.`,
              appointment.status === 'Approved' ? 'success' : 'warning'
            );
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

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!reminders.length) return;

    const hhmm = now.toTimeString().slice(0, 5);
    const today = now.toISOString().slice(0, 10);
    const triggers = readJSON(STORAGE.reminderTriggers, {});

    reminders.forEach((reminder) => {
      const triggerKey = `${reminder.id}:${today}`;
      if (reminder.time === hhmm && !triggers[triggerKey]) {
        addNotification(`Reminder: ${reminder.title} at ${reminder.time}`, 'warning');
        triggers[triggerKey] = true;
      }
    });

    writeJSON(STORAGE.reminderTriggers, triggers);
  }, [now, reminders]);

  useEffect(() => {
    const upcoming = appointments
      .filter((appointment) => new Date(appointment.appointment_date).getTime() > now.getTime() && appointment.status !== 'Rejected')
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];

    if (!upcoming) return;

    const diffHours = (new Date(upcoming.appointment_date).getTime() - now.getTime()) / (1000 * 60 * 60);
    if (diffHours > 0 && diffHours <= 24) {
      const dailyFlag = `${upcoming.id}:${now.toISOString().slice(0, 10)}`;
      const seenMap = readJSON(STORAGE.upcomingAlerts, {});

      if (!seenMap[dailyFlag]) {
        addNotification(`Upcoming appointment within 24 hours with Dr. ${upcoming.doctor_name}.`, 'warning');
        seenMap[dailyFlag] = true;
        writeJSON(STORAGE.upcomingAlerts, seenMap);
      }
    }
  }, [appointments, now]);

  const upcomingAppointment = useMemo(() => (
    appointments
      .filter((appointment) => new Date(appointment.appointment_date).getTime() > now.getTime() && appointment.status !== 'Rejected')
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0] || null
  ), [appointments, now]);

  const recentAppointments = useMemo(() => (
    [...appointments]
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
      .slice(0, 4)
  ), [appointments]);

  const filteredDoctors = useMemo(() => {
    const query = doctorQuery.trim().toLowerCase();

    if (!query) {
      return doctors.slice(0, 4);
    }

    return doctors.filter((doctor) =>
      [doctor.name, doctor.specialization, doctor.email]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query))
    ).slice(0, 6);
  }, [doctorQuery, doctors]);

  const profileCompleteness = useMemo(() => {
    const fields = [username, profile.email, profile.phone, profile.address, profile.gender, profile.age];
    const filled = fields.filter((field) => String(field || '').trim().length > 0).length;
    return Math.round((filled / fields.length) * 100);
  }, [username, profile]);

  const statusCounts = useMemo(() => ({
    pending: appointments.filter((appointment) => appointment.status === 'Pending').length,
    approved: appointments.filter((appointment) => appointment.status === 'Approved').length,
    rejected: appointments.filter((appointment) => appointment.status === 'Rejected').length
  }), [appointments]);

  const specialtyCount = useMemo(() => (
    new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean)).size
  ), [doctors]);

  const careChecklist = useMemo(() => ([
    {
      id: 'profile',
      title: 'Finish your profile',
      detail: `${profileCompleteness}% complete`,
      done: profileCompleteness >= 80
    },
    {
      id: 'appointment',
      title: 'Keep an upcoming appointment',
      detail: upcomingAppointment ? formatDateTime(upcomingAppointment.appointment_date) : 'No future visit booked',
      done: Boolean(upcomingAppointment)
    },
    {
      id: 'reminders',
      title: 'Set a medication reminder',
      detail: reminders.length ? `${reminders.length} active reminder${reminders.length === 1 ? '' : 's'}` : 'No reminders configured yet',
      done: reminders.length > 0
    }
  ]), [profileCompleteness, upcomingAppointment, reminders]);

  const dailyHealthTip = useMemo(
    () => healthTips[now.getDate() % healthTips.length],
    [now]
  );

  const unresolvedNotifications = notifications.filter((item) => !item.seen).length;

  const metrics = [
    {
      label: 'Appointments',
      value: appointments.length,
      detail: `${statusCounts.pending} pending`,
      icon: 'calendar'
    },
    {
      label: 'Approved visits',
      value: statusCounts.approved,
      detail: statusCounts.rejected ? `${statusCounts.rejected} rejected` : 'No rejected visits',
      icon: 'check'
    },
    {
      label: 'Available doctors',
      value: doctors.length,
      detail: `${specialtyCount} specialties`,
      icon: 'doctor'
    },
    {
      label: 'Care profile',
      value: `${profileCompleteness}%`,
      detail: reminders.length ? `${reminders.length} reminder${reminders.length === 1 ? '' : 's'} running` : 'Add your first reminder',
      icon: 'pulse'
    }
  ];

  const openRoute = (path, activityMessage) => {
    addActivity(activityMessage);
    navigate(path);
  };

  const actions = [
    {
      key: 'book',
      title: 'Book a visit',
      description: 'Reserve the next available consultation.',
      icon: 'calendar',
      onClick: () => openRoute('/book-appointment', 'Opened booking form')
    },
    {
      key: 'doctors',
      title: 'Explore doctors',
      description: 'Scan specialists and choose the right fit.',
      icon: 'doctor',
      onClick: () => openRoute('/doctors', 'Opened doctors list')
    },
    {
      key: 'appointments',
      title: 'Review appointments',
      description: 'Track the status of every request.',
      icon: 'list',
      onClick: () => openRoute('/my-appointments', 'Opened my appointments')
    },
    ...(isStaff ? [{
      key: 'admin',
      title: 'Open admin desk',
      description: 'Switch to system oversight tools.',
      icon: 'shield',
      onClick: () => openRoute('/admin', 'Opened admin dashboard')
    }] : [])
  ];

  const markNotificationsSeen = () => {
    setNotifications((current) => {
      const next = current.map((item) => ({ ...item, seen: true }));
      writeJSON(STORAGE.notifications, next);
      return next;
    });
  };

  const handleAddReminder = (event) => {
    event.preventDefault();

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
    addNotification('New reminder added.', 'success');
  };

  const removeReminder = (id) => {
    const next = reminders.filter((reminder) => reminder.id !== id);
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

    const match = doctors.find((doctor) => doctor.name === appointment.doctor_name);
    return match?.id;
  };

  const handleRebook = (appointment) => {
    const doctorId = resolveDoctorId(appointment);
    addActivity(`Started rebook for Dr. ${appointment.doctor_name}`);

    if (doctorId) {
      navigate(`/book-appointment?doctor=${doctorId}`);
      return;
    }

    navigate('/book-appointment');
  };

  if (loading) {
    return (
      <div className={`patient-dashboard patient-dashboard-${theme}`}>
        <div className="patient-dashboard__toolbar">
          <div className="skeleton-line skeleton-line--medium"></div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="skeleton" style={{ width: '120px', height: '40px', borderRadius: '999px' }}></div>
            <div className="skeleton" style={{ width: '80px', height: '40px', borderRadius: '999px' }}></div>
          </div>
        </div>

        <section className="patient-hero" style={{ gridTemplateColumns: '1fr', gap: '24px' }}>
          <div className="skeleton" style={{ height: '300px', borderRadius: 'var(--radius-xl)' }}></div>
          <div style={{ display: 'grid', gap: '16px' }}>
            <div className="skeleton skeleton-line skeleton-line--long"></div>
            <div className="skeleton-line skeleton-line--medium"></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              <div className="skeleton" style={{ height: '120px' }}></div>
              <div className="skeleton" style={{ height: '120px' }}></div>
            </div>
          </div>
        </section>

        <section className="patient-metrics" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          {Array(4).fill(0).map((_, i) => (
            <article key={i} className="patient-metric-card">
              <div className="skeleton-avatar"></div>
              <div>
                <div className="skeleton-line skeleton-line--short"></div>
                <div className="skeleton-line skeleton-line--medium"></div>
              </div>
            </article>
          ))}
        </section>

        <div className="patient-layout">
          {Array(4).fill(0).map((_, i) => (
            <section key={i} className="dashboard-panel" style={{ gridColumn: i % 2 === 0 ? '1' : 'span 2' }}>
              <div className="dashboard-panel__header">
                <div className="skeleton-line skeleton-line--medium"></div>
              </div>
              <div style={{ display: 'grid', gap: '12px', marginTop: '16px' }}>
                {Array(3).fill(0).map((_, j) => (
                  <div key={j} className="skeleton-line" style={{ height: '20px' }}></div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`patient-dashboard patient-dashboard-${theme}`}>
      <div className="patient-dashboard__toolbar">
        <div>
          <span className="patient-dashboard__eyebrow">Patient workspace</span>
          <div className="patient-dashboard__clock">
            <Icon name="clock" />
            <span>{dateFormatter.format(now)}</span>
            <strong>{now.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong>
          </div>
        </div>

        <div className="patient-dashboard__toolbar-actions">
          <button
            type="button"
            className="btn btn-ghost patient-dashboard__theme-toggle"
            onClick={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <div className="patient-dashboard__notifications">
            <button
              type="button"
              className="btn btn-ghost patient-dashboard__notification-button"
              onClick={() => {
                const open = !notificationsOpen;
                setNotificationsOpen(open);
                if (open) markNotificationsSeen();
              }}
            >
              <Icon name="bell" />
              Alerts
              {unresolvedNotifications > 0 && <span className="patient-dashboard__notification-count">{unresolvedNotifications}</span>}
            </button>

            {notificationsOpen && (
              <div className="patient-dashboard__notification-panel">
                {notifications.length === 0 && <p className="patient-dashboard__empty">No alerts yet.</p>}
                {notifications.map((item) => (
                  <div key={item.id} className={`patient-dashboard__notification patient-dashboard__notification-${item.type}`}>
                    <strong>{formatDateTime(item.time)}</strong>
                    <span>{item.message}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="patient-hero">
        <div className="patient-hero__copy">
          <span className="patient-hero__eyebrow">{getGreeting(now)}, {username}</span>
          <h1>Everything you need for follow-ups, bookings, and care reminders.</h1>
          <p>
            This dashboard keeps your schedule, doctors, reminders, and profile details in one clean place so the next step is always obvious.
          </p>

          <div className="patient-hero__actions">
            {actions.map((action, index) => (
              <button 
                key={action.key} 
                type="button" 
                className="patient-action-card dashboard-card-upgrade"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={action.onClick}
              >
                <span className="patient-action-card__icon">
                  <Icon name={action.icon} />
                </span>
                <span className="patient-action-card__body">
                  <strong>{action.title}</strong>
                  <small>{action.description}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <aside className="patient-hero__aside">
          <div className="patient-next-visit">
            <div className="patient-next-visit__header">
              <span>Next visit</span>
              <span className={`status-pill status-pill-${upcomingAppointment ? getStatusTone(upcomingAppointment.status) : 'neutral'}`}>
                {upcomingAppointment ? upcomingAppointment.status : 'Not scheduled'}
              </span>
            </div>

            {upcomingAppointment ? (
              <>
                <h2>Dr. {upcomingAppointment.doctor_name}</h2>
                <p>{formatDateTime(upcomingAppointment.appointment_date)}</p>
                <strong>{formatNextVisit(upcomingAppointment.appointment_date, now)}</strong>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => openRoute('/my-appointments', 'Checked appointment timeline')}
                >
                  View appointment
                </button>
              </>
            ) : (
              <>
                <h2>No visit booked yet</h2>
                <p>Choose a specialist and secure the next available slot.</p>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => openRoute('/book-appointment', 'Started new appointment booking')}
                >
                  Book now
                </button>
              </>
            )}
          </div>

          <div className="patient-hero__mini-grid">
            <article className="patient-mini-card">
              <span>Profile completion</span>
              <strong>{profileCompleteness}%</strong>
            </article>
            <article className="patient-mini-card">
              <span>Active reminders</span>
              <strong>{reminders.length}</strong>
            </article>
            <article className="patient-mini-card">
              <span>Doctors available</span>
              <strong>{doctors.length}</strong>
            </article>
            <article className="patient-mini-card">
              <span>Unread alerts</span>
              <strong>{unresolvedNotifications}</strong>
            </article>
          </div>

          <div className="patient-health-tip">
            <strong>Today’s health tip</strong>
            <p>{dailyHealthTip}</p>
          </div>
        </aside>
      </section>

      {error && <div className="message message-error">{error}</div>}

      <section className="patient-metrics">
        {metrics.map((metric) => (
          <article key={metric.label} className="patient-metric-card">
            <span className="patient-metric-card__icon">
              <Icon name={metric.icon} />
            </span>
            <div>
              <small>{metric.label}</small>
              <strong>{metric.value}</strong>
              <p>{metric.detail}</p>
            </div>
          </article>
        ))}
      </section>
      <div className="patient-layout">
        <section className="dashboard-panel dashboard-panel-wide">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__eyebrow">Appointment flow</span>
              <h3>Upcoming and recent visits</h3>
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => openRoute('/my-appointments', 'Opened my appointments')}>
              <Icon name="list" />
              Full history
            </button>
          </div>

          <div className="appointment-timeline">
            {recentAppointments.length === 0 && (
              <div className="dashboard-empty-state">
                <Icon name="calendar" />
                <p>No appointments yet. Book a consultation to start your care timeline.</p>
              </div>
            )}

            {recentAppointments.map((appointment) => (
              <article key={appointment.id} className="appointment-timeline__card">
                <div className="appointment-timeline__top">
                  <div>
                    <span className="appointment-timeline__eyebrow">Appointment #{appointment.id}</span>
                    <h4>Dr. {appointment.doctor_name}</h4>
                  </div>
                  <span className={`status-pill status-pill-${getStatusTone(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>

                <div className="appointment-timeline__meta">
                  <div>
                    <small>Date</small>
                    <strong>{formatDateTime(appointment.appointment_date)}</strong>
                  </div>
                  <div>
                    <small>Specialization</small>
                    <strong>{appointment.doctor_specialization || 'General practice'}</strong>
                  </div>
                </div>

                <div className="appointment-timeline__actions">
                  <button type="button" className="btn btn-secondary" onClick={() => handleRebook(appointment)}>
                    <Icon name="repeat" />
                    Rebook
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__eyebrow">Find care faster</span>
              <h3>Doctor search</h3>
            </div>
          </div>

          <label className="search-field">
            <Icon name="search" />
            <input
              type="text"
              value={doctorQuery}
              onChange={(event) => setDoctorQuery(event.target.value)}
              placeholder="Search by name, email, or specialization"
            />
          </label>

          <div className="doctor-suggestion-list">
            {doctorQuery && filteredDoctors.length === 0 && <p className="patient-dashboard__empty">No doctor matches this search.</p>}

            {filteredDoctors.map((doctor) => (
              <button
                key={doctor.id}
                type="button"
                className="doctor-suggestion-card"
                onClick={() => {
                  addActivity(`Opened booking for Dr. ${doctor.name}`);
                  navigate(`/book-appointment?doctor=${doctor.id}`);
                }}
              >
                <div>
                  <strong>Dr. {doctor.name}</strong>
                  <small>{doctor.specialization}</small>
                </div>
                <span>Book</span>
              </button>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__eyebrow">Care progress</span>
              <h3>Checklist</h3>
            </div>
          </div>

          <div className="care-checklist">
            {careChecklist.map((item) => (
              <div key={item.id} className={`care-checklist__item${item.done ? ' is-done' : ''}`}>
                <span className="care-checklist__icon">
                  <Icon name={item.done ? 'check' : 'spark'} />
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <small>{item.detail}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__eyebrow">Reminders</span>
              <h3>Medication and follow-up alerts</h3>
            </div>
          </div>

          <form className="reminder-form" onSubmit={handleAddReminder}>
            <input
              type="text"
              value={reminderDraft.title}
              onChange={(event) => setReminderDraft((current) => ({ ...current, title: event.target.value }))}
              placeholder="Reminder title"
            />
            <input
              type="time"
              value={reminderDraft.time}
              onChange={(event) => setReminderDraft((current) => ({ ...current, time: event.target.value }))}
            />
            <button type="submit" className="btn btn-primary">
              <Icon name="plus" />
              Add
            </button>
          </form>

          <div className="stack-list">
            {reminders.length === 0 && <p className="patient-dashboard__empty">No reminders set yet.</p>}

            {reminders.map((reminder) => (
              <div key={reminder.id} className="stack-list__item">
                <div>
                  <strong>{reminder.title}</strong>
                  <small>{reminder.time}</small>
                </div>
                <button type="button" className="btn btn-ghost" onClick={() => removeReminder(reminder.id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel-wide">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__eyebrow">Personal details</span>
              <h3>Profile and contact information</h3>
            </div>
            <span className="status-pill status-pill-neutral">{profileCompleteness}% complete</span>
          </div>

          <div className="profile-progress">
            <div className="profile-progress__bar" style={{ width: `${profileCompleteness}%` }} />
          </div>

          <div className="profile-grid">
            <input type="email" placeholder="Email" value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} />
            <input type="text" placeholder="Phone" value={profile.phone} onChange={(event) => setProfile((current) => ({ ...current, phone: event.target.value }))} />
            <input type="text" placeholder="Address" value={profile.address} onChange={(event) => setProfile((current) => ({ ...current, address: event.target.value }))} />
            <input type="text" placeholder="Gender" value={profile.gender} onChange={(event) => setProfile((current) => ({ ...current, gender: event.target.value }))} />
            <input type="number" placeholder="Age" value={profile.age} onChange={(event) => setProfile((current) => ({ ...current, age: event.target.value }))} />
          </div>

          <div className="panel-footer">
            <button type="button" className="btn btn-primary" onClick={handleProfileSave}>
              Save profile
            </button>
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel-wide">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__eyebrow">Recent activity</span>
              <h3>What you did recently</h3>
            </div>
          </div>

          <div className="activity-feed">
            {activity.length === 0 && <p className="patient-dashboard__empty">No recent activity yet.</p>}

            {activity.map((item) => (
              <div key={item.id} className="activity-feed__item">
                <span className="activity-feed__dot" />
                <div>
                  <strong>{item.message}</strong>
                  <small>{formatDateTime(item.time)}</small>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
