import { useState, useEffect } from 'react';
import api, { doctorsAPI, appointmentsAPI } from '../api/api';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [newDoctor, setNewDoctor] = useState({ name: '', specialization: '', email: '', phone: '', available_from: '09:00', available_to: '17:00', available_days: [] });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [docResp, apptResp] = await Promise.all([
        doctorsAPI.getAll(),
        appointmentsAPI.adminList()
      ]);
      setDoctors(docResp.data);
      setAppointments(apptResp.data);
    } catch (err) {
      setError('Failed to load admin data');
    }
  };

  const handleDoctorChange = (e) => {
    setNewDoctor({ ...newDoctor, [e.target.name]: e.target.value });
  };

  const toggleAvailableDay = (day) => {
    const days = new Set(newDoctor.available_days || []);
    if (days.has(day)) days.delete(day); else days.add(day);
    setNewDoctor({ ...newDoctor, available_days: Array.from(days).sort((a,b)=>a-b) });
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
      setNewDoctor({ name: '', specialization: '', email: '', phone: '', available_from: '09:00', available_to: '17:00' });
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
    } catch (err) {
      setError('Could not update appointment');
    }
  };

  const deleteAppointment = async (id) => {
    if (!window.confirm('Delete this appointment? This cannot be undone.')) return;
    try {
      await appointmentsAPI.adminDelete(id);
      fetchData();
    } catch (err) {
      setError('Could not delete appointment');
    }
  };

  const deleteDoctor = async (id) => {
    if (!window.confirm('Delete this doctor? This cannot be undone.')) return;
    try {
      await doctorsAPI.delete(id);
      fetchData();
    } catch (err) {
      setError('Could not delete doctor');
    }
  };

  const togglePatientDetails = (appointmentId) => {
    setSelectedPatientId((prev) => (prev === appointmentId ? null : appointmentId));
  };

  return (
    <div className="admin-dashboard">
      <h1>Admin dashboard</h1>
      {error && <div className="message message-error">{error}</div>}
      <section className="admin-section">
        <h2>Doctors</h2>
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
          <div style={{ display: 'flex', gap: '10px' }}>
            <label>
              From:
              <input type="time" name="available_from" value={newDoctor.available_from} onChange={handleDoctorChange} required />
            </label>
            <label>
              To:
              <input type="time" name="available_to" value={newDoctor.available_to} onChange={handleDoctorChange} required />
            </label>
          </div>
          <div style={{ marginTop: '8px' }}>
            <label style={{ display: 'block', marginBottom: '6px' }}>Available days</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((label, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" checked={(newDoctor.available_days||[]).includes(idx)} onChange={() => toggleAvailableDay(idx)} />
                  <span style={{ fontSize: '13px' }}>{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button type="submit" disabled={loading}>
              {loading ? (editingId ? 'Saving...' : 'Adding...') : (editingId ? 'Save changes' : 'Add doctor')}
            </button>
            {editingId && (
              <button type="button" onClick={() => { setEditingId(null); setNewDoctor({ name: '', specialization: '', email: '', phone: '', available_from: '09:00', available_to: '17:00' }); }} className="btn btn-secondary">
                Cancel
              </button>
            )}
          </div>
        </form>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {doctors.map(d => (
            <li key={d.id} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center' }}>
              <span style={{ flex: 1 }}>
                {d.name} ({d.specialization}) – {d.available_from || '??'} to {d.available_to || '??'}
              </span>
              <button
                className="btn"
                style={{ fontSize: '12px' }}
                onClick={() => {
                  setEditingId(d.id);
                  setNewDoctor({
                    name: d.name,
                    specialization: d.specialization,
                    email: d.email,
                    phone: d.phone,
                    available_from: d.available_from ? d.available_from.slice(0,5) : '09:00',
                    available_to: d.available_to ? d.available_to.slice(0,5) : '17:00',
                  });
                }}
              >
                Edit
              </button>
              <button
                className="btn"
                style={{ fontSize: '12px', marginLeft: '8px', backgroundColor: '#dc3545', color: '#fff' }}
                onClick={() => deleteDoctor(d.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-section">
        <h2>Appointments</h2>
        {/*
          The status and action buttons below are designed to be touchable on
          mobile devices.  In addition to the Approve/Reject buttons, you can
          directly change the current status with the dropdown — the entire
          control has been padded and styled for easy tapping.
        */}
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Patient</th><th>Doctor</th><th>Date</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>
                  <button
                    type="button"
                    onClick={() => togglePatientDetails(a.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: 0,
                      color: '#007bff',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    {[a.patient_first_name, a.patient_last_name].filter(Boolean).join(' ') || a.user_name}
                  </button>
                  {selectedPatientId === a.id && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                      <span style={{ fontSize: '12px' }}>Email: {a.patient_email || 'N/A'}</span>
                      <span style={{ fontSize: '12px' }}>
                        Gender: {a.patient_gender || 'N/A'}{typeof a.patient_age !== 'undefined' && a.patient_age !== null ? `, Age: ${a.patient_age}` : ', Age: N/A'}
                      </span>
                      <span style={{ fontSize: '12px' }}>Address: {a.patient_address || 'N/A'}</span>
                    </div>
                  )}
                </td>
                <td>{a.doctor_name}</td>
                <td>{new Date(a.appointment_date).toLocaleString()}</td>
                <td>
            {/* status editable via select for touch devices */}
            <select
              value={a.status}
              onChange={(e) => changeAppointmentStatus(a.id, e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </td>
          <td>
            {a.status !== 'Approved' && (
              <button
                className="btn"
                onClick={() => changeAppointmentStatus(a.id, 'Approved')}
                style={{backgroundColor:'#28a745',color:'#fff'}}
              >
                Approve
              </button>
            )}
            {a.status !== 'Rejected' && (
              <button
                className="btn"
                onClick={() => changeAppointmentStatus(a.id, 'Rejected')}
                style={{backgroundColor:'#dc3545',color:'#fff'}}
              >
                Reject
              </button>
            )}
            <button
              className="btn"
              onClick={() => deleteAppointment(a.id)}
              style={{ backgroundColor: '#6c757d', color: '#fff', marginLeft: '6px' }}
            >
              Delete
            </button>
          </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>Back to user dashboard</button>
    </div>
  );
}

export default AdminDashboard;
