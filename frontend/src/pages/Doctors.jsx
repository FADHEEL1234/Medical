import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorsAPI } from '../api/api';
import useBackendStatus from '../hooks/useBackendStatus';

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const ALL_SPECIALIZATIONS = 'All specializations';

const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit'
});

const Icon = ({ name, className = '' }) => {
  const classes = `icon ${className}`.trim();

  switch (name) {
    case 'search':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
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
    case 'clock':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v6l4 2" />
        </svg>
      );
    case 'mail':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16v12H4z" />
          <path d="m4 8 8 6 8-6" />
        </svg>
      );
    case 'phone':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72l.35 2.81a2 2 0 0 1-.57 1.72l-1.6 1.6a16 16 0 0 0 6 6l1.6-1.6a2 2 0 0 1 1.72-.57l2.81.35A2 2 0 0 1 22 16.92z" />
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
    case 'refresh':
      return (
        <svg className={classes} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 1 1-2.64-6.36" />
          <path d="M21 3v6h-6" />
        </svg>
      );
    default:
      return null;
  }
};

const normalizeAvailableDays = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((day) => Number(day))
      .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      .sort((a, b) => a - b);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((day) => Number(day.trim()))
      .filter((day) => Number.isInteger(day) && day >= 0 && day <= 6)
      .sort((a, b) => a - b);
  }

  return [];
};

const parseTimeParts = (value) => {
  const [rawHour = '', rawMinute = ''] = String(value || '').slice(0, 5).split(':');
  const hour = Number(rawHour);
  const minute = Number(rawMinute);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  return { hour, minute };
};

const formatTime = (value) => {
  const parts = parseTimeParts(value);

  if (!parts) {
    return 'Not set';
  }

  return timeFormatter.format(new Date(2024, 0, 1, parts.hour, parts.minute));
};

const getDoctorInitials = (name) => {
  const value = String(name || 'Doctor').trim();
  const initials = value
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  return initials || 'DR';
};

const isAvailableToday = (doctor, todayIndex) => {
  return normalizeAvailableDays(doctor.available_days).includes(todayIndex);
};

const matchesAvailability = (doctor, availabilityFilter, todayIndex) => {
  if (availabilityFilter === 'today') {
    return isAvailableToday(doctor, todayIndex);
  }

  if (availabilityFilter === 'morning') {
    const start = parseTimeParts(doctor.available_from);
    return Boolean(start && start.hour < 12);
  }

  if (availabilityFilter === 'evening') {
    const end = parseTimeParts(doctor.available_to);
    return Boolean(end && end.hour >= 17);
  }

  return true;
};

function Doctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState(ALL_SPECIALIZATIONS);
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [refreshNonce, setRefreshNonce] = useState(0);
  const { backendUp, error: backendError } = useBackendStatus();

  const todayIndex = (new Date().getDay() + 6) % 7;

  useEffect(() => {
    let cancelled = false;

    const fetchDoctors = async () => {
      if (!backendUp) {
        if (!cancelled) {
          setDoctors([]);
          setError(backendError || 'Unable to reach backend.');
          setLoading(false);
        }
        return;
      }

      if (!cancelled) {
        setLoading(true);
        setError('');
      }

      try {
        const response = await doctorsAPI.getAll();

        if (!cancelled) {
          setDoctors(response.data || []);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load doctors. Please try again later.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    fetchDoctors();

    return () => {
      cancelled = true;
    };
  }, [backendUp, backendError, refreshNonce]);

  const specializations = useMemo(() => (
    Array.from(new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))).sort()
  ), [doctors]);

  const filteredDoctors = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return doctors.filter((doctor) => {
      const matchesQuery = !query || [doctor.name, doctor.specialization, doctor.email, doctor.phone]
        .filter(Boolean)
        .some((field) => field.toLowerCase().includes(query));

      const matchesSpecialization = selectedSpecialization === ALL_SPECIALIZATIONS
        || doctor.specialization === selectedSpecialization;

      return matchesQuery
        && matchesSpecialization
        && matchesAvailability(doctor, availabilityFilter, todayIndex);
    });
  }, [availabilityFilter, doctors, searchQuery, selectedSpecialization, todayIndex]);

  const featuredDoctor = useMemo(() => (
    filteredDoctors.find((doctor) => isAvailableToday(doctor, todayIndex))
    || filteredDoctors[0]
    || doctors.find((doctor) => isAvailableToday(doctor, todayIndex))
    || doctors[0]
    || null
  ), [doctors, filteredDoctors, todayIndex]);

  const directoryStats = useMemo(() => ({
    total: doctors.length,
    availableToday: doctors.filter((doctor) => isAvailableToday(doctor, todayIndex)).length,
    specializations: specializations.length,
    eveningHours: doctors.filter((doctor) => matchesAvailability(doctor, 'evening', todayIndex)).length
  }), [doctors, specializations, todayIndex]);

  const handleBookAppointment = (doctorId) => {
    navigate(`/book-appointment?doctor=${doctorId}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSpecialization(ALL_SPECIALIZATIONS);
    setAvailabilityFilter('all');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="doctor-directory">
      <section className="doctor-directory__hero">
        <div className="doctor-directory__hero-copy">
          <span className="doctor-directory__eyebrow">Care directory</span>
          <h1>Browse doctors with cleaner filters, clearer schedules, and faster booking.</h1>
          <p>
            Compare specialists, scan availability, and move to the booking flow without digging through plain cards.
          </p>

          <div className="doctor-directory__hero-actions">
            <label className="search-field doctor-directory__hero-search">
              <Icon name="search" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, specialty, email, or phone"
              />
            </label>

            <button
              type="button"
              className="btn btn-primary"
              disabled={!featuredDoctor}
              onClick={() => featuredDoctor && handleBookAppointment(featuredDoctor.id)}
            >
              <Icon name="calendar" />
              Book featured doctor
            </button>

            <button type="button" className="btn btn-ghost" onClick={clearFilters}>
              Reset filters
            </button>
          </div>

          <div className="doctor-directory__stat-grid">
            <article className="doctor-directory__stat-card">
              <span>Doctors listed</span>
              <strong>{directoryStats.total}</strong>
              <p>Complete clinician roster in one place.</p>
            </article>
            <article className="doctor-directory__stat-card">
              <span>Available today</span>
              <strong>{directoryStats.availableToday}</strong>
              <p>Doctors whose day schedule includes today.</p>
            </article>
            <article className="doctor-directory__stat-card">
              <span>Specialties</span>
              <strong>{directoryStats.specializations}</strong>
              <p>Different care paths ready to book.</p>
            </article>
            <article className="doctor-directory__stat-card">
              <span>Late hours</span>
              <strong>{directoryStats.eveningHours}</strong>
              <p>Clinicians who extend into evening coverage.</p>
            </article>
          </div>
        </div>

        <aside className="doctor-directory__spotlight">
          <div className="doctor-directory__spotlight-top">
            <span className="doctor-directory__spotlight-label">Featured match</span>
            <button type="button" className="btn btn-ghost" onClick={() => setRefreshNonce((current) => current + 1)}>
              <Icon name="refresh" />
              Refresh
            </button>
          </div>

          {featuredDoctor ? (
            <>
              <div className="doctor-directory__spotlight-avatar">{getDoctorInitials(featuredDoctor.name)}</div>

              <div className="doctor-directory__spotlight-header">
                <span className={`status-pill ${isAvailableToday(featuredDoctor, todayIndex) ? 'status-pill-success' : 'status-pill-neutral'}`}>
                  {isAvailableToday(featuredDoctor, todayIndex) ? 'Available today' : 'Book ahead'}
                </span>
                <h2>Dr. {featuredDoctor.name}</h2>
                <p>{featuredDoctor.specialization || 'General practice'}</p>
              </div>

              <div className="doctor-directory__spotlight-meta">
                <div className="doctor-directory__spotlight-item">
                  <Icon name="clock" />
                  <div>
                    <small>Consultation window</small>
                    <strong>{formatTime(featuredDoctor.available_from)} - {formatTime(featuredDoctor.available_to)}</strong>
                  </div>
                </div>

                <div className="doctor-directory__spotlight-item">
                  <Icon name="mail" />
                  <div>
                    <small>Contact email</small>
                    <strong>{featuredDoctor.email || 'Not listed'}</strong>
                  </div>
                </div>
              </div>

              <div className="doctor-directory__spotlight-days">
                {normalizeAvailableDays(featuredDoctor.available_days).length > 0 ? (
                  normalizeAvailableDays(featuredDoctor.available_days).map((day) => (
                    <span key={day} className="day-pill">{WEEKDAY_LABELS[day]}</span>
                  ))
                ) : (
                  <span className="doctor-directory__spotlight-note">Schedule days not configured yet.</span>
                )}
              </div>

              <button
                type="button"
                className="btn btn-primary doctor-directory__spotlight-button"
                onClick={() => handleBookAppointment(featuredDoctor.id)}
              >
                <Icon name="calendar" />
                Book this doctor
              </button>
            </>
          ) : (
            <div className="doctor-directory__spotlight-empty">
              <span className="doctor-directory__spotlight-note">No doctor data is available yet.</span>
            </div>
          )}
        </aside>
      </section>

      {error && <div className="message message-error">{error}</div>}

      <section className="doctor-directory__toolbar">
        <div>
          <span className="doctor-directory__eyebrow">Filter roster</span>
          <h2>{filteredDoctors.length} doctor{filteredDoctors.length === 1 ? '' : 's'} ready to browse</h2>
        </div>

        <div className="doctor-directory__filter-row">
          <label className="doctor-directory__filter-field">
            <span>Specialty</span>
            <select
              className="doctor-directory__select"
              value={selectedSpecialization}
              onChange={(event) => setSelectedSpecialization(event.target.value)}
            >
              <option value={ALL_SPECIALIZATIONS}>{ALL_SPECIALIZATIONS}</option>
              {specializations.map((specialization) => (
                <option key={specialization} value={specialization}>
                  {specialization}
                </option>
              ))}
            </select>
          </label>

          <label className="doctor-directory__filter-field">
            <span>Availability</span>
            <select
              className="doctor-directory__select"
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value)}
            >
              <option value="all">All schedules</option>
              <option value="today">Available today</option>
              <option value="morning">Morning hours</option>
              <option value="evening">Evening hours</option>
            </select>
          </label>

          <button type="button" className="btn btn-ghost" onClick={clearFilters}>
            Clear
          </button>
        </div>
      </section>

      {filteredDoctors.length === 0 ? (
        <section className="doctor-directory__empty">
          <div className="doctor-directory__empty-badge">
            <Icon name="spark" />
          </div>
          <h3>No doctors match the current filters.</h3>
          <p>Try a broader specialty, remove the availability filter, or reset the search and start again.</p>
          <button type="button" className="btn btn-primary" onClick={clearFilters}>
            Reset and show all doctors
          </button>
        </section>
      ) : (
        <section className="doctor-directory__grid">
          {filteredDoctors.map((doctor, index) => {
            const availableDays = normalizeAvailableDays(doctor.available_days);
            const availableToday = isAvailableToday(doctor, todayIndex);

            return (
              <article
                key={doctor.id}
                className="doctor-profile-card"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="doctor-profile-card__top">
                  <div className="doctor-profile-card__identity">
                    <span className="doctor-profile-card__avatar">{getDoctorInitials(doctor.name)}</span>
                    <div>
                      <span className="doctor-profile-card__eyebrow">{availableToday ? 'Open today' : 'Planned bookings'}</span>
                      <h3>Dr. {doctor.name}</h3>
                      <p>{doctor.specialization || 'General practice'}</p>
                    </div>
                  </div>

                  <span className={`status-pill ${availableToday ? 'status-pill-success' : 'status-pill-neutral'}`}>
                    {availableToday ? 'Today' : 'Ahead'}
                  </span>
                </div>

                <div className="doctor-profile-card__meta">
                  <div className="doctor-contact-pill">
                    <Icon name="mail" />
                    <span>{doctor.email || 'No email listed'}</span>
                  </div>
                  <div className="doctor-contact-pill">
                    <Icon name="phone" />
                    <span>{doctor.phone || 'No phone listed'}</span>
                  </div>
                </div>

                <div className="doctor-profile-card__schedule">
                  <div className="doctor-schedule-stat">
                    <small>Consultation hours</small>
                    <strong>{formatTime(doctor.available_from)} - {formatTime(doctor.available_to)}</strong>
                  </div>
                  <div className="doctor-schedule-stat">
                    <small>Available days</small>
                    <strong>{availableDays.length ? `${availableDays.length} day${availableDays.length === 1 ? '' : 's'}` : 'Not listed'}</strong>
                  </div>
                </div>

                <div className="doctor-profile-card__days">
                  {availableDays.length > 0 ? (
                    availableDays.map((day) => (
                      <span key={day} className="day-pill">{WEEKDAY_LABELS[day]}</span>
                    ))
                  ) : (
                    <span className="doctor-profile-card__hint">Schedule days not configured yet.</span>
                  )}
                </div>

                <div className="doctor-profile-card__footer">
                  <div className="doctor-profile-card__note">
                    <Icon name="spark" />
                    <span>{availableToday ? 'Best option if you want a faster booking.' : 'Good pick for planned follow-up visits.'}</span>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleBookAppointment(doctor.id)}
                  >
                    <Icon name="calendar" />
                    Book appointment
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default Doctors;
