import { useEffect, useMemo, useState } from 'react';
import { doctorsAPI, appointmentsAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';
import useBackendStatus from '../hooks/useBackendStatus';

const EMPTY_DOCTOR = {
  name: '',
  specialization: '',
  email: '',
  phone: '',
  available_from: '09:00',
  available_to: '17:00',
  available_days: []
};

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const Icon = ({ name, className = '' }) => {
  const classes = `icon ${className}`.trim();

  switch (name) {
    case 'shield':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3l7 3v6c0 5-3.5 9-7 10-3.5-1-7-5-7-10V6l7-3z" />
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
    case 'plus':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      );
    case 'save':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
          <path d="M17 21v-8H7v8" />
          <path d="M7 3v5h8" />
        </svg>
      );
    case 'edit':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      );
    case 'trash':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 6h18" />
          <path d="M8 6V4h8v2" />
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        </svg>
      );
    case 'check':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      );
    case 'close':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      );
    case 'back':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      );
    case 'search':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      );
    case 'refresh':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </svg>
      );
    case 'download':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M4 21h16" />
        </svg>
      );
    case 'clock':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6l4 2" />
        </svg>
      );
    default:
      return null;
  }
};

const normalizeAvailableDays = (value) => {
  if (Array.isArray(value)) {
    return value.map((day) => Number(day)).filter((day) => Number.isInteger(day) && day >= 0 && day <= 6).sort((a, b) => a - b);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((day) => Number(day))
      .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      .sort((a, b) => a - b);
  }

  return [];
};

const formatDateTime = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Invalid date';
  }

  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

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

const getPatientName = (appointment) => {
  return [appointment.patient_first_name, appointment.patient_last_name].filter(Boolean).join(' ') || appointment.user_name || 'Unknown patient';
};

const getApiErrorMessage = (value, fallback) => {
  if (!value) return fallback;
  if (typeof value === 'string') return value;

  if (typeof value === 'object') {
    const parts = Object.values(value).flat().filter(Boolean);
    if (parts.length) {
      return parts.join(' ');
    }
  }

  return fallback;
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [newDoctor, setNewDoctor] = useState(EMPTY_DOCTOR);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortByDate, setSortByDate] = useState('latest');
  const [currentTime, setCurrentTime] = useState(new Date());
  const { backendUp, error: backendError } = useBackendStatus();

  useEffect(() => {
    if (backendUp) {
      fetchData();
    } else {
      setError(backendError || 'Backend unavailable');
      setInitialLoad(false);
    }
  }, [backendUp, backendError]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [doctorsResponse, appointmentsResponse] = await Promise.all([
        doctorsAPI.getAll(),
        appointmentsAPI.adminList()
      ]);

      setDoctors(doctorsResponse.data || []);
      setAppointments(appointmentsResponse.data || []);
      setError('');
    } catch {
      setError('Failed to load admin data.');
    } finally {
      setInitialLoad(false);
    }
  };

  const handleDoctorChange = (event) => {
    setNewDoctor({ ...newDoctor, [event.target.name]: event.target.value });
  };

  const toggleAvailableDay = (day) => {
    const days = new Set(newDoctor.available_days || []);
    if (days.has(day)) {
      days.delete(day);
    } else {
      days.add(day);
    }

    setNewDoctor({ ...newDoctor, available_days: Array.from(days).sort((a, b) => a - b) });
  };

  const handleDoctorSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingId) {
        await doctorsAPI.update(editingId, newDoctor);
      } else {
        await doctorsAPI.create(newDoctor);
      }

      setEditingId(null);
      setNewDoctor(EMPTY_DOCTOR);
      fetchData();
    } catch (err) {
      setError(getApiErrorMessage(err.response?.data, 'Error saving doctor.'));
    } finally {
      setLoading(false);
    }
  };

  const changeAppointmentStatus = async (id, status) => {
    try {
      await appointmentsAPI.adminUpdate(id, { status });
      fetchData();
    } catch {
      setError('Could not update appointment.');
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment? This cannot be undone.')) return;

    try {
      await appointmentsAPI.adminDelete(id);
      fetchData();
    } catch {
      setError('Could not delete appointment.');
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm('Delete this doctor? This cannot be undone.')) return;

    try {
      await doctorsAPI.delete(id);
      fetchData();
    } catch {
      setError('Could not delete doctor.');
    }
  };

  const dashboardStats = useMemo(() => {
    const today = new Date().toDateString();
    const todayIndex = (new Date().getDay() + 6) % 7;
    const pending = appointments.filter((appointment) => appointment.status === 'Pending').length;
    const approved = appointments.filter((appointment) => appointment.status === 'Approved').length;
    const rejected = appointments.filter((appointment) => appointment.status === 'Rejected').length;
    const onDuty = doctors.filter((doctor) => normalizeAvailableDays(doctor.available_days).includes(todayIndex)).length;
    const todayAppointments = appointments.filter((appointment) => new Date(appointment.appointment_date).toDateString() === today).length;

    return {
      doctors: doctors.length,
      appointments: appointments.length,
      pending,
      approved,
      rejected,
      onDuty,
      todayAppointments
    };
  }, [appointments, doctors]);

  const specializationCount = useMemo(() => (
    new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean)).size
  ), [doctors]);

  const filteredDoctors = useMemo(() => {
    const query = doctorSearch.trim().toLowerCase();

    if (!query) return doctors;

    return doctors.filter((doctor) =>
      [doctor.name, doctor.specialization, doctor.email, doctor.phone]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query))
    );
  }, [doctorSearch, doctors]);

  const filteredAppointments = useMemo(() => {
    const query = appointmentSearch.trim().toLowerCase();
    let items = appointments.filter((appointment) => {
      const statusMatches = statusFilter === 'All' || appointment.status === statusFilter;
      if (!statusMatches) return false;
      if (!query) return true;

      return [
        appointment.user_name,
        appointment.doctor_name,
        appointment.patient_first_name,
        appointment.patient_last_name,
        appointment.patient_email,
        String(appointment.id)
      ]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query));
    });

    items = [...items].sort((a, b) => {
      const aDate = new Date(a.appointment_date).getTime();
      const bDate = new Date(b.appointment_date).getTime();
      return sortByDate === 'latest' ? bDate - aDate : aDate - bDate;
    });

    return items;
  }, [appointments, appointmentSearch, statusFilter, sortByDate]);

  const nextPendingAppointment = useMemo(() => (
    [...appointments]
      .filter((appointment) => appointment.status === 'Pending')
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0] || null
  ), [appointments]);

  const downloadAppointmentsCsv = () => {
    const headers = ['ID', 'Patient', 'Doctor', 'Date', 'Status', 'Email'];
    const rows = filteredAppointments.map((appointment) => [
      appointment.id,
      `"${getPatientName(appointment).replace(/"/g, '""')}"`,
      `"${(appointment.doctor_name || '').replace(/"/g, '""')}"`,
      `"${formatDateTime(appointment.appointment_date)}"`,
      `"${(appointment.status || '').replace(/"/g, '""')}"`,
      `"${(appointment.patient_email || '').replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `appointments-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="admin-dashboard">
      <section className="admin-hero-card">
        <div className="admin-hero-card__copy">
          <span className="admin-hero-card__eyebrow">Operations desk</span>
          <h1>
            <Icon name="shield" />
            Clinical operations dashboard
          </h1>
          <p>
            Manage the doctor roster, review appointments, and keep the day’s schedule moving from one focused workspace.
          </p>

          <div className="admin-hero-card__actions">
            <button type="button" className="btn btn-ghost" onClick={fetchData}>
              <Icon name="refresh" />
              Refresh data
            </button>
            <button type="button" className="btn btn-secondary" onClick={downloadAppointmentsCsv}>
              <Icon name="download" />
              Export CSV
            </button>
            <button type="button" className="btn btn-ghost" onClick={() => navigate('/dashboard')}>
              <Icon name="back" />
              Back to patient view
            </button>
          </div>
        </div>

        <aside className="admin-hero-card__aside">
          <div className="admin-focus-card">
            <span>Pending queue</span>
            <strong>{dashboardStats.pending}</strong>
            <p>
              {nextPendingAppointment
                ? `${getPatientName(nextPendingAppointment)} with Dr. ${nextPendingAppointment.doctor_name} on ${formatDateTime(nextPendingAppointment.appointment_date)}`
                : 'No pending appointment requests right now.'}
            </p>
          </div>

          <div className="admin-focus-grid">
            <article className="admin-focus-grid__item">
              <span>Doctors on duty</span>
              <strong>{dashboardStats.onDuty}</strong>
            </article>
            <article className="admin-focus-grid__item">
              <span>Today&apos;s visits</span>
              <strong>{dashboardStats.todayAppointments}</strong>
            </article>
            <article className="admin-focus-grid__item">
              <span>Specialties</span>
              <strong>{specializationCount}</strong>
            </article>
            <article className="admin-focus-grid__item">
              <span>Last refresh</span>
              <strong>{currentTime.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</strong>
            </article>
          </div>
        </aside>
      </section>

      {error && <div className="message message-error">{error}</div>}

      <section className="admin-metrics">
        <article className="admin-metric-card">
          <span>Total doctors</span>
          <strong>{dashboardStats.doctors}</strong>
          <p>{specializationCount} specialties available</p>
        </article>
        <article className="admin-metric-card">
          <span>Total appointments</span>
          <strong>{dashboardStats.appointments}</strong>
          <p>{filteredAppointments.length} match current filters</p>
        </article>
        <article className="admin-metric-card">
          <span>Pending review</span>
          <strong>{dashboardStats.pending}</strong>
          <p>Needs action from staff</p>
        </article>
        <article className="admin-metric-card">
          <span>Approved</span>
          <strong>{dashboardStats.approved}</strong>
          <p>Confirmed and scheduled</p>
        </article>
        <article className="admin-metric-card">
          <span>Rejected</span>
          <strong>{dashboardStats.rejected}</strong>
          <p>Closed appointment requests</p>
        </article>
        <article className="admin-metric-card">
          <span>Today&apos;s load</span>
          <strong>{dashboardStats.todayAppointments}</strong>
          <p>Appointments due today</p>
        </article>
      </section>
      <div className="admin-layout">
        <section className="dashboard-panel admin-panel">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__eyebrow">{editingId ? 'Editing doctor' : 'Doctor roster'}</span>
              <h3>{editingId ? 'Update doctor details' : 'Add a new doctor'}</h3>
            </div>
          </div>

          <form onSubmit={handleDoctorSubmit} className="admin-form-grid">
            <label>
              Name
              <input name="name" placeholder="Doctor name" value={newDoctor.name} onChange={handleDoctorChange} required />
            </label>
            <label>
              Specialization
              <input name="specialization" placeholder="Specialization" value={newDoctor.specialization} onChange={handleDoctorChange} required />
            </label>
            <label>
              Email
              <input name="email" placeholder="Email" value={newDoctor.email} onChange={handleDoctorChange} required />
            </label>
            <label>
              Phone
              <input name="phone" placeholder="Phone" value={newDoctor.phone} onChange={handleDoctorChange} required />
            </label>

            <div className="admin-form-grid__row">
              <label>
                Available from
                <input type="time" name="available_from" value={newDoctor.available_from} onChange={handleDoctorChange} required />
              </label>
              <label>
                Available to
                <input type="time" name="available_to" value={newDoctor.available_to} onChange={handleDoctorChange} required />
              </label>
            </div>

            <div className="admin-day-selector">
              <span>Available days</span>
              <div className="admin-day-selector__list">
                {WEEKDAY_LABELS.map((label, index) => (
                  <label key={label} className="admin-day-chip">
                    <input
                      type="checkbox"
                      checked={(newDoctor.available_days || []).includes(index)}
                      onChange={() => toggleAvailableDay(index)}
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="panel-footer">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                <Icon name={editingId ? 'save' : 'plus'} />
                {loading ? 'Saving...' : editingId ? 'Save changes' : 'Add doctor'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditingId(null);
                    setNewDoctor(EMPTY_DOCTOR);
                  }}
                >
                  <Icon name="close" />
                  Cancel edit
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="dashboard-panel admin-panel">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__eyebrow">Snapshot</span>
              <h3>Control room summary</h3>
            </div>
          </div>

          <div className="admin-summary-list">
            <div className="admin-summary-list__item">
              <span>Visible appointments</span>
              <strong>{filteredAppointments.length}</strong>
            </div>
            <div className="admin-summary-list__item">
              <span>Visible doctors</span>
              <strong>{filteredDoctors.length}</strong>
            </div>
            <div className="admin-summary-list__item">
              <span>Status filter</span>
              <strong>{statusFilter}</strong>
            </div>
            <div className="admin-summary-list__item">
              <span>Sort order</span>
              <strong>{sortByDate === 'latest' ? 'Latest first' : 'Oldest first'}</strong>
            </div>
            <div className="admin-summary-list__item">
              <span>Current time</span>
              <strong>{currentTime.toLocaleString()}</strong>
            </div>
            <div className="admin-summary-list__item">
              <span>Editing state</span>
              <strong>{editingId ? 'Doctor record open' : 'No draft open'}</strong>
            </div>
          </div>
        </section>

        <section className="dashboard-panel dashboard-panel-wide admin-panel">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__eyebrow">Doctors</span>
              <h3>Roster and availability</h3>
            </div>
          </div>

          <label className="search-field">
            <Icon name="search" />
            <input
              type="text"
              value={doctorSearch}
              onChange={(event) => setDoctorSearch(event.target.value)}
              placeholder="Search by name, specialization, email, or phone"
            />
          </label>

          <div className="admin-doctor-grid">
            {filteredDoctors.map((doctor) => (
              <article key={doctor.id} className={`admin-doctor-tile${editingId === doctor.id ? ' is-editing' : ''}`}>
                <div className="admin-doctor-tile__top">
                  <div>
                    <h4>Dr. {doctor.name}</h4>
                    <p>{doctor.specialization}</p>
                  </div>
                  <span className="status-pill status-pill-neutral">
                    {doctor.available_from || '09:00'} - {doctor.available_to || '17:00'}
                  </span>
                </div>

                <div className="admin-doctor-tile__meta">
                  <span>{doctor.email}</span>
                  <span>{doctor.phone}</span>
                </div>

                <div className="admin-doctor-tile__days">
                  {normalizeAvailableDays(doctor.available_days).map((day) => (
                    <span key={day} className="day-pill">{WEEKDAY_LABELS[day]}</span>
                  ))}
                </div>

                <div className="panel-footer">
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      setEditingId(doctor.id);
                      setNewDoctor({
                        name: doctor.name,
                        specialization: doctor.specialization,
                        email: doctor.email,
                        phone: doctor.phone,
                        available_from: doctor.available_from ? doctor.available_from.slice(0, 5) : '09:00',
                        available_to: doctor.available_to ? doctor.available_to.slice(0, 5) : '17:00',
                        available_days: normalizeAvailableDays(doctor.available_days)
                      });
                    }}
                  >
                    <Icon name="edit" />
                    Edit
                  </button>
                  <button type="button" className="btn btn-danger" onClick={() => deleteDoctor(doctor.id)}>
                    <Icon name="trash" />
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          {!filteredDoctors.length && <p className="patient-dashboard__empty">No doctors match this search.</p>}
        </section>

        <section className="dashboard-panel dashboard-panel-wide admin-panel">
          <div className="dashboard-panel__header">
            <div>
              <span className="dashboard-panel__eyebrow">Appointments</span>
              <h3>Review, approve, and clean up requests</h3>
            </div>
          </div>

          <div className="admin-toolbar">
            <label className="search-field">
              <Icon name="search" />
              <input
                type="text"
                value={appointmentSearch}
                onChange={(event) => setAppointmentSearch(event.target.value)}
                placeholder="Search by patient, doctor, or appointment ID"
              />
            </label>

            <select className="admin-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="All">All statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select className="admin-select" value={sortByDate} onChange={(event) => setSortByDate(event.target.value)}>
              <option value="latest">Latest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>

          <div className="admin-appointment-list">
            {filteredAppointments.map((appointment) => (
              <article key={appointment.id} className="admin-appointment-card">
                <div className="admin-appointment-card__top">
                  <div>
                    <span className="appointment-timeline__eyebrow">Appointment #{appointment.id}</span>
                    <h4>{getPatientName(appointment)}</h4>
                    <p>Dr. {appointment.doctor_name}</p>
                  </div>
                  <span className={`status-pill status-pill-${getStatusTone(appointment.status)}`}>
                    {appointment.status}
                  </span>
                </div>

                <div className="admin-appointment-card__meta">
                  <div>
                    <small>Date</small>
                    <strong>{formatDateTime(appointment.appointment_date)}</strong>
                  </div>
                  <div>
                    <small>Email</small>
                    <strong>{appointment.patient_email || 'N/A'}</strong>
                  </div>
                </div>

                <div className="admin-appointment-card__controls">
                  <select
                    className="admin-select"
                    value={appointment.status}
                    onChange={(event) => changeAppointmentStatus(appointment.id, event.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>

                  <div className="panel-footer">
                    {appointment.status !== 'Approved' && (
                      <button type="button" className="btn btn-success" onClick={() => changeAppointmentStatus(appointment.id, 'Approved')}>
                        <Icon name="check" />
                        Approve
                      </button>
                    )}
                    {appointment.status !== 'Rejected' && (
                      <button type="button" className="btn btn-danger" onClick={() => changeAppointmentStatus(appointment.id, 'Rejected')}>
                        <Icon name="close" />
                        Reject
                      </button>
                    )}
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setSelectedPatientId((current) => (current === appointment.id ? null : appointment.id))}
                    >
                      {selectedPatientId === appointment.id ? 'Hide details' : 'Patient details'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => deleteAppointment(appointment.id)}>
                      <Icon name="trash" />
                      Delete
                    </button>
                  </div>
                </div>

                {selectedPatientId === appointment.id && (
                  <div className="admin-patient-details">
                    <span>Email: {appointment.patient_email || 'N/A'}</span>
                    <span>
                      Gender: {appointment.patient_gender || 'N/A'}
                      {typeof appointment.patient_age !== 'undefined' && appointment.patient_age !== null ? `, Age: ${appointment.patient_age}` : ', Age: N/A'}
                    </span>
                    <span>Address: {appointment.patient_address || 'N/A'}</span>
                  </div>
                )}
              </article>
            ))}
          </div>

          {!filteredAppointments.length && <p className="patient-dashboard__empty">No appointments match the current filters.</p>}
        </section>
      </div>
    </div>
  );
}

export default AdminDashboard;
