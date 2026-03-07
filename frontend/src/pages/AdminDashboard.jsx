import { useState, useEffect, useMemo } from 'react';
import api, { doctorsAPI, appointmentsAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';

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

const EMPTY_DOCTOR = {
  name: '',
  specialization: '',
  email: '',
  phone: '',
  available_from: '09:00',
  available_to: '17:00',
  available_days: []
};

function AdminDashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [newDoctor, setNewDoctor] = useState(EMPTY_DOCTOR);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [doctorSearch, setDoctorSearch] = useState('');
  const [appointmentSearch, setAppointmentSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortByDate, setSortByDate] = useState('latest');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async () => {
    try {
      const [docResp, apptResp] = await Promise.all([
        doctorsAPI.getAll(),
        appointmentsAPI.adminList()
      ]);
      setDoctors(docResp.data);
      setAppointments(apptResp.data);
    } catch {
      setError('Failed to load admin data');
    }
  };

  const handleDoctorChange = (e) => {
    setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
  };

  const toggleAvailableDay = (day) => {
    const days = new Set(newDoctor.available_days || []);
    if (days.has(day)) days.delete(day); else days.add(day);
    setNewDoctor({ ...newDoctor, available_days: Array.from(days).sort((a, b) => a - b) });
  };

  const handleDoctorSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editingId) {
        await doctorsAPI.update(editingId, newDoctor);
        setEditingId(null);
      } else {
        await doctorsAPI.create(newDoctor);
      }
      setNewDoctor(EMPTY_DOCTOR);
      fetchData();
    } catch (err) {
      setError(err.response?.data || 'Error saving doctor');
    } finally {
      setLoading(false);
    }
  };

  const changeAppointmentStatus = async (id, status) => {
    try {
      await api.patch(`/admin/appointments/${id}/`, { status });
      fetchData();
    } catch {
      setError('Could not update appointment');
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment? This cannot be undone.')) return;
    try {
      await appointmentsAPI.adminDelete(id);
      fetchData();
    } catch {
      setError('Could not delete appointment');
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm('Delete this doctor? This cannot be undone.')) return;
    try {
      await doctorsAPI.delete(id);
      fetchData();
    } catch {
      setError('Could not delete doctor');
    }
  };

  const togglePatientDetails = (appointmentId) => {
    setSelectedPatientId((prev) => (prev === appointmentId ? null : appointmentId));
  };

  const dashboardStats = useMemo(() => {
    const pending = appointments.filter((a) => a.status === 'Pending').length;
    const approved = appointments.filter((a) => a.status === 'Approved').length;
    return {
      doctors: doctors.length,
      appointments: appointments.length,
      pending,
      approved
    };
  }, [appointments, doctors]);

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

  const downloadAppointmentsCsv = () => {
    const headers = ['ID', 'Patient', 'Doctor', 'Date', 'Status', 'Email'];
    const rows = filteredAppointments.map((a) => [
      a.id,
      `"${([a.patient_first_name, a.patient_last_name].filter(Boolean).join(' ') || a.user_name || '').replace(/"/g, '""')}"`,
      `"${(a.doctor_name || '').replace(/"/g, '""')}"`,
      `"${new Date(a.appointment_date).toLocaleString()}"`,
      `"${(a.status || '').replace(/"/g, '""')}"`,
      `"${(a.patient_email || '').replace(/"/g, '""')}"`
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
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
      <div className="admin-hero">
        <div>
          <span className="admin-kicker">System control</span>
          <h1><Icon name="shield" />Admin dashboard</h1>
          <p>Manage doctors, schedules, and appointments from one place.</p>
        </div>
        <button className="btn btn-secondary admin-back" onClick={() => navigate('/dashboard')}>
          <Icon name="back" />Back to user dashboard
        </button>
      </div>

      <div className="admin-stats">
        <article className="admin-stat-card">
          <span>Total doctors</span>
          <strong>{dashboardStats.doctors}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Total appointments</span>
          <strong>{dashboardStats.appointments}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Pending review</span>
          <strong>{dashboardStats.pending}</strong>
        </article>
        <article className="admin-stat-card">
          <span>Approved</span>
          <strong>{dashboardStats.approved}</strong>
        </article>
      </div>

      <div className="admin-live">
        <Icon name="clock" />Last sync view: {currentTime.toLocaleString()}
      </div>

      {error && <div className="message message-error">{error}</div>}

      <section className="admin-section">
        <h2><Icon name="doctor" />Doctors</h2>

        <div className="admin-toolbar">
          <label className="admin-search">
            <Icon name="search" />
            <input
              type="text"
              value={doctorSearch}
              onChange={(e) => setDoctorSearch(e.target.value)}
              placeholder="Search doctor by name, specialization, email or phone"
            />
          </label>
          <button type="button" className="btn btn-ghost" onClick={fetchData}>
            <Icon name="refresh" />Refresh
          </button>
        </div>

        <form onSubmit={handleDoctorSubmit} className="admin-form">
          <label>
            Name
            <input name="name" placeholder="Name" value={newDoctor.name} onChange={handleDoctorChange} required />
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
          <div className="admin-form-row">
            <label>
              From:
              <input type="time" name="available_from" value={newDoctor.available_from} onChange={handleDoctorChange} required />
            </label>
            <label>
              To:
              <input type="time" name="available_to" value={newDoctor.available_to} onChange={handleDoctorChange} required />
            </label>
          </div>
          <div className="admin-days">
            <label className="admin-days-label">Available days</label>
            <div className="admin-days-list">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, idx) => (
                <label key={idx} className="admin-day-pill">
                  <input type="checkbox" checked={(newDoctor.available_days || []).includes(idx)} onChange={() => toggleAvailableDay(idx)} />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="admin-actions">
            <button type="submit" disabled={loading}>
              <Icon name={editingId ? 'save' : 'plus'} />
              {loading ? (editingId ? 'Saving...' : 'Adding...') : (editingId ? 'Save changes' : 'Add doctor')}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setNewDoctor(EMPTY_DOCTOR); }} className="btn btn-secondary">
                <Icon name="close" />Cancel
              </button>
            )}
          </div>
        </form>

        <ul className="admin-doctor-list">
          {filteredDoctors.map((d) => (
            <li key={d.id} className="admin-doctor-card">
              <div className="admin-doctor-main">
                <div className="admin-doctor-name">{d.name}</div>
                <div className="admin-doctor-meta">
                  <span className="admin-chip">{d.specialization}</span>
                  <span className="admin-time">{d.available_from || '??'} - {d.available_to || '??'}</span>
                </div>
              </div>
              <div className="admin-row-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => {
                    setEditingId(d.id);
                    setNewDoctor({
                      name: d.name,
                      specialization: d.specialization,
                      email: d.email,
                      phone: d.phone,
                      available_from: d.available_from ? d.available_from.slice(0, 5) : '09:00',
                      available_to: d.available_to ? d.available_to.slice(0, 5) : '17:00',
                      available_days: d.available_days || []
                    });
                  }}
                >
                  <Icon name="edit" />Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => deleteDoctor(d.id)}
                >
                  <Icon name="trash" />Delete
                </button>
              </div>
            </li>
          ))}
        </ul>

        {!filteredDoctors.length && <p className="admin-empty">No doctors match your search.</p>}
      </section>

      <section className="admin-section">
        <h2><Icon name="calendar" />Appointments</h2>

        <div className="admin-toolbar">
          <label className="admin-search">
            <Icon name="search" />
            <input
              type="text"
              value={appointmentSearch}
              onChange={(e) => setAppointmentSearch(e.target.value)}
              placeholder="Search by patient, doctor or appointment ID"
            />
          </label>
          <select className="admin-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
          <select className="admin-select" value={sortByDate} onChange={(e) => setSortByDate(e.target.value)}>
            <option value="latest">Latest first</option>
            <option value="oldest">Oldest first</option>
          </select>
          <button type="button" className="btn btn-ghost" onClick={downloadAppointmentsCsv}>
            <Icon name="download" />Export CSV
          </button>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((a) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => togglePatientDetails(a.id)}
                    className="admin-link"
                  >
                    {[a.patient_first_name, a.patient_last_name].filter(Boolean).join(' ') || a.user_name}
                  </button>
                  {selectedPatientId === a.id && (
                    <div className="admin-patient-details">
                      <span>Email: {a.patient_email || 'N/A'}</span>
                      <span>
                        Gender: {a.patient_gender || 'N/A'}{typeof a.patient_age !== 'undefined' && a.patient_age !== null ? `, Age: ${a.patient_age}` : ', Age: N/A'}
                      </span>
                      <span>Address: {a.patient_address || 'N/A'}</span>
                    </div>
                  )}
                </td>
                <td>{a.doctor_name}</td>
                <td>{new Date(a.appointment_date).toLocaleString()}</td>
                <td>
                  <select
                    value={a.status}
                    onChange={(e) => changeAppointmentStatus(a.id, e.target.value)}
                    className="admin-select"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </td>
                <td>
                  {a.status !== 'Approved' && (
                    <button
                      className="btn btn-success"
                      onClick={() => changeAppointmentStatus(a.id, 'Approved')}
                    >
                      <Icon name="check" />Approve
                    </button>
                  )}
                  {a.status !== 'Rejected' && (
                    <button
                      className="btn btn-danger"
                      onClick={() => changeAppointmentStatus(a.id, 'Rejected')}
                    >
                      <Icon name="close" />Reject
                    </button>
                  )}
                  <button
                    className="btn btn-ghost"
                    onClick={() => deleteAppointment(a.id)}
                  >
                    <Icon name="trash" />Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {!filteredAppointments.length && <p className="admin-empty">No appointments found for current filters.</p>}
      </section>
    </div>
  );
}

export default AdminDashboard;
