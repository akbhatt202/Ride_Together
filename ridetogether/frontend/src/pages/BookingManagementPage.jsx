import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Filter,
  Navigation,
  MessageCircle,
  MapPin,
  Calendar,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export default function BookingManagementPage() {
  const { user, isDriver, isAdmin } = useAuth();

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

  // Cancel booking (passenger or driver)
  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Reserved seats will be restored.')) return;
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
          <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>Booking & Ride Management</h1>
          <p style={{ color: '#64748b' }}>Approve passenger seat requests, track live route maps, and manage reservations</p>
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
            <select
              className="form-select"
              style={{ width: 'auto', padding: '0.3rem 1.75rem 0.3rem 0.75rem', fontSize: '0.85rem' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Approval</option>
              <option value="accepted">Accepted / Confirmed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* TAB 1: Driver Requests (Incoming Passenger Requests) */}
        {activeTab === 'driver-requests' && isDriver && (
          <div>
            {filteredDriverRequests.length === 0 ? (
              <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
                <Clock size={36} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Requests Matching Filter</h3>
                <p style={{ color: '#64748b' }}>When passengers request seats on your published rides, they will appear here.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {filteredDriverRequests.map((req) => {
                  const cleanPassengerPhone = (req.passenger?.phone || '').replace(/[^\d]/g, '');
                  return (
                    <div key={req._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        {/* Status & Fare Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                          <span className={`badge badge-${req.status}`}>{req.status.toUpperCase()}</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>
                            ₹{req.totalFare}
                          </span>
                        </div>

                        {/* Route Info */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                            {req.ride?.source} → {req.ride?.destination}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                            <Calendar size={13} color="var(--accent)" />
                            <span>{new Date(req.ride?.departureDate).toLocaleDateString()} at {req.ride?.departureTime}</span>
                          </div>
                        </div>

                        {/* Passenger Details */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                            {req.passenger?.name} • <span style={{ color: 'var(--accent)' }}>{req.seatsBooked} seat(s) requested</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                            <a href={`tel:${cleanPassengerPhone}`} style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Phone size={12} />
                              <span>{req.passenger?.phone}</span>
                            </a>
                            <a
                              href={`https://wa.me/91${cleanPassengerPhone}?text=Hi%20${encodeURIComponent(req.passenger?.name || '')},%20regarding%20your%20booking%20on%20RideTogether.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              <MessageCircle size={12} />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to={`/rides/${req.ride?._id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.8rem' }}>
                          <Navigation size={13} />
                          <span>View Route Map</span>
                        </Link>

                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {req.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAccept(req._id)}
                                className="btn btn-primary btn-sm"
                                style={{ fontSize: '0.8rem' }}
                              >
                                <Check size={14} />
                                <span>Accept</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleReject(req._id)}
                                className="btn btn-outline btn-sm"
                                style={{ fontSize: '0.8rem' }}
                              >
                                <X size={14} />
                                <span>Decline</span>
                              </button>
                            </>
                          )}
                          {req.status === 'accepted' && (
                            <button
                              type="button"
                              onClick={() => handleCancel(req._id)}
                              className="btn btn-outline btn-sm"
                              style={{ fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            >
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Passenger Reservations (My Bookings) */}
        {activeTab === 'my-bookings' && (
          <div>
            {filteredMyBookings.length === 0 ? (
              <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
                <CalendarCheck size={36} color="#94a3b8" style={{ margin: '0 auto 1rem auto' }} />
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Reservations Found</h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>You have not booked any shared rides matching this filter.</p>
                <Link to="/rides" className="btn btn-primary">
                  Search Available Rides
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
                {filteredMyBookings.map((booking) => {
                  const cleanDriverPhone = (booking.ride?.driver?.phone || '').replace(/[^\d]/g, '');
                  return (
                    <div key={booking._id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        {/* Status & Fare Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem' }}>
                          <span className={`badge badge-${booking.status}`}>{booking.status.toUpperCase()}</span>
                          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent)' }}>
                            ₹{booking.totalFare}
                          </span>
                        </div>

                        {/* Route Info */}
                        <div style={{ marginBottom: '0.75rem' }}>
                          <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)', marginBottom: '0.2rem' }}>
                            {booking.ride?.source} → {booking.ride?.destination}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b' }}>
                            <Calendar size={13} color="var(--accent)" />
                            <span>{new Date(booking.ride?.departureDate).toLocaleDateString()} at {booking.ride?.departureTime}</span>
                          </div>
                        </div>

                        {/* Driver & Vehicle Details */}
                        <div style={{ backgroundColor: '#f8fafc', padding: '0.85rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', border: '1px solid var(--border)' }}>
                          <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--primary)' }}>
                            Driver: {booking.ride?.driver?.name || 'Verified Driver'}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.2rem' }}>
                            {booking.seatsBooked} seat(s) reserved • {booking.ride?.vehicleDetails?.make} {booking.ride?.vehicleDetails?.model}
                          </div>
                          {booking.status === 'accepted' && (
                            <div style={{ marginTop: '0.4rem', backgroundColor: '#e0f2fe', padding: '0.3rem 0.6rem', borderRadius: '4px', fontSize: '0.78rem', color: '#0369a1', fontWeight: 700 }}>
                              🔑 Start Ride PIN: <span style={{ fontFamily: 'monospace', fontSize: '0.95rem', letterSpacing: '2px' }}>{booking.otp || '4819'}</span>
                            </div>
                          )}

                          <div style={{ fontSize: '0.82rem', color: '#64748b', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.4rem' }}>
                            <a href={`tel:${cleanDriverPhone}`} style={{ color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                              <Phone size={12} />
                              <span>{booking.ride?.driver?.phone}</span>
                            </a>
                            <a
                              href={`https://wa.me/91${cleanDriverPhone}?text=Hi%20${encodeURIComponent(booking.ride?.driver?.name || '')},%20regarding%20our%20ride%20on%20RideTogether.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                            >
                              <MessageCircle size={12} />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Link to={`/rides/${booking.ride?._id}`} className="btn btn-outline btn-sm" style={{ fontSize: '0.8rem' }}>
                          <Navigation size={13} />
                          <span>Track Live GPS Map</span>
                        </Link>

                        {['pending', 'accepted'].includes(booking.status) && (
                          <button
                            type="button"
                            onClick={() => handleCancel(booking._id)}
                            className="btn btn-outline btn-sm"
                            style={{ fontSize: '0.8rem', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                          >
                            <span>Cancel Booking</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
