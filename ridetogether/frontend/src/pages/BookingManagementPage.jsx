import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  CalendarCheck,
  UserCheck,
  Check,
  X,
  Clock,
  Phone,
  Mail,
  Car,
  AlertCircle,
  Filter
} from 'lucide-react';

export default function BookingManagementPage() {
  const { user, isDriver } = useAuth();

  // Active view: 'driver-requests' if driver, else 'my-bookings'
  const [activeTab, setActiveTab] = useState(isDriver ? 'driver-requests' : 'my-bookings');
  const [driverRequests, setDriverRequests] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      if (isDriver) {
        const [requestsRes, bookingsRes] = await Promise.all([
          api.bookings.getDriverRequests(),
          api.bookings.getMyBookings()
        ]);
        if (requestsRes.success) setDriverRequests(requestsRes.requests || []);
        if (bookingsRes.success) setMyBookings(bookingsRes.bookings || []);
      } else {
        const bookingsRes = await api.bookings.getMyBookings();
        if (bookingsRes.success) setMyBookings(bookingsRes.bookings || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch booking requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isDriver]);

  // Driver accepts booking
  const handleAccept = async (bookingId) => {
    try {
      setError('');
      const res = await api.bookings.accept(bookingId);
      if (res.success) {
        setActionSuccess(`Booking request accepted! Remaining available seats: ${res.remainingSeats}`);
        fetchData();
      }
    } catch (err) {
      setError(err.message || 'Failed to accept booking request');
    }
  };

  // Driver rejects booking
  const handleReject = async (bookingId) => {
    if (!window.confirm('Are you sure you want to decline this booking request?')) return;
    try {
      setError('');
      const res = await api.bookings.reject(bookingId);
      if (res.success) {
        setActionSuccess('Booking request declined.');
        fetchData();
      }
    } catch (err) {
      setError(err.message || 'Failed to reject booking request');
    }
  };

  // Passenger cancels booking
  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Any reserved seats will be restored.')) return;
    try {
      setError('');
      const res = await api.bookings.cancel(bookingId);
      if (res.success) {
        setActionSuccess('Booking cancelled. Reserved seats have been restored.');
        fetchData();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading booking management center..." />;
  }

  // Filter requests/bookings based on dropdown
  const filteredDriverRequests = driverRequests.filter((req) => {
    if (statusFilter === 'all') return true;
    return req.status === statusFilter;
  });

  const filteredMyBookings = myBookings.filter((b) => {
    if (statusFilter === 'all') return true;
    return b.status === statusFilter;
  });

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>Booking Management</h1>
          <p style={{ color: '#64748b' }}>Approve passenger seat requests and manage your travel reservations</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />}

        {/* Tab Selector & Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', backgroundColor: '#e2e8f0', padding: '0.3rem', borderRadius: 'var(--radius-md)' }}>
            {isDriver && (
              <button
                type="button"
                className={`btn btn-sm ${activeTab === 'driver-requests' ? 'btn-primary' : ''}`}
                style={{
                  backgroundColor: activeTab === 'driver-requests' ? 'var(--accent)' : 'transparent',
                  color: activeTab === 'driver-requests' ? '#ffffff' : 'var(--text-main)',
                  border: 'none'
                }}
                onClick={() => setActiveTab('driver-requests')}
              >
                <span>Passenger Requests ({driverRequests.filter((r) => r.status === 'pending').length} pending)</span>
              </button>
            )}

            <button
              type="button"
              className={`btn btn-sm ${activeTab === 'my-bookings' ? 'btn-primary' : ''}`}
              style={{
                backgroundColor: activeTab === 'my-bookings' ? 'var(--accent)' : 'transparent',
                color: activeTab === 'my-bookings' ? '#ffffff' : 'var(--text-main)',
                border: 'none'
              }}
              onClick={() => setActiveTab('my-bookings')}
            >
              <span>My Reservations ({myBookings.length})</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={15} color="#64748b" />
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Filter:</span>
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Content View: Driver Requests */}
        {activeTab === 'driver-requests' && (
          <div>
            {filteredDriverRequests.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <Clock size={36} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>No Requests Found</h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
                  {statusFilter === 'all'
                    ? 'No passengers have requested seats on your published rides yet.'
                    : `No booking requests with status '${statusFilter}'.`}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredDriverRequests.map((req) => (
                  <div key={req._id} className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'var(--primary)' }}>
                          {req.passenger?.name ? req.passenger.name.charAt(0).toUpperCase() : 'P'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)' }}>
                            {req.passenger?.name || 'Passenger'}
                          </div>
                          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.82rem', color: '#64748b' }}>
                            <span>{req.passenger?.phone}</span>
                            <span>{req.passenger?.email}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge badge-${req.status}`}>{req.status}</span>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '0.3rem' }}>
                          Requested on {new Date(req.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem' }}>
                          {req.ride?.source} → {req.ride?.destination}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '0.2rem' }}>
                          Departure: {new Date(req.ride?.departureDate).toLocaleDateString()} at {req.ride?.departureTime}
                        </div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--primary)', marginTop: '0.4rem' }}>
                          Seats Requested: <strong style={{ color: 'var(--accent)' }}>{req.seatsBooked}</strong> • Total Fare: <strong style={{ color: 'var(--accent)' }}>₹{req.totalFare}</strong>
                        </div>
                      </div>

                      {/* Driver Action Buttons */}
                      {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                          <button
                            onClick={() => handleAccept(req._id)}
                            className="btn btn-primary"
                          >
                            <Check size={16} />
                            <span>Accept ({req.seatsBooked} seats)</span>
                          </button>
                          <button
                            onClick={() => handleReject(req._id)}
                            className="btn btn-outline"
                            style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}
                          >
                            <X size={16} />
                            <span>Decline</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content View: My Bookings (Passenger) */}
        {activeTab === 'my-bookings' && (
          <div>
            {filteredMyBookings.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                <CalendarCheck size={36} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.4rem' }}>No Bookings</h3>
                <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
                  {statusFilter === 'all'
                    ? "You haven't requested any rides yet."
                    : `No reservations found with status '${statusFilter}'.`}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {filteredMyBookings.map((b) => (
                  <div key={b._id} className="card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)' }}>
                        {b.ride?.source} → {b.ride?.destination}
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span className={`badge badge-${b.status}`}>{b.status}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                      <div style={{ fontSize: '0.88rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <div>Date: <strong>{new Date(b.ride?.departureDate).toLocaleDateString()} at {b.ride?.departureTime}</strong></div>
                        <div>Driver: <strong>{b.ride?.driver?.name}</strong> ({b.ride?.driver?.phone})</div>
                        <div>Seats Reserved: <strong>{b.seatsBooked}</strong> • Total: <strong style={{ color: 'var(--accent)' }}>₹{b.totalFare}</strong></div>
                      </div>

                      {['pending', 'accepted'].includes(b.status) && (
                        <button
                          onClick={() => handleCancel(b._id)}
                          className="btn btn-outline btn-sm"
                          style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
