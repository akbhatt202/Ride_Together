import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  Compass,
  CalendarCheck,
  Clock,
  XCircle,
  Car,
  MapPin,
  Calendar,
  Phone,
  Search,
  ArrowRight
} from 'lucide-react';

export default function PassengerDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.bookings.getMyBookings();
      if (res.success) {
        setBookings(res.bookings || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch your bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Any reserved seats will be returned.')) {
      return;
    }

    try {
      const res = await api.bookings.cancel(bookingId);
      if (res.success) {
        setActionSuccess('Booking cancelled successfully and seats released');
        fetchBookings();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel booking');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading your trips and bookings..." />;
  }

  // Calculate statistics
  const totalBookings = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const acceptedCount = bookings.filter((b) => b.status === 'accepted').length;
  const cancelledCount = bookings.filter((b) => b.status === 'cancelled').length;

  const upcomingAccepted = bookings.filter(
    (b) => b.status === 'accepted' && new Date(b.ride?.departureDate) >= new Date(Date.now() - 86400000)
  );

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>Passenger Dashboard</h1>
            <p style={{ color: '#64748b' }}>Track your active trips, booking requests, and travel history</p>
          </div>
          <Link to="/rides" className="btn btn-primary">
            <Search size={18} />
            <span>Search New Rides</span>
          </Link>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />}

        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard
            icon={Compass}
            label="Total Bookings"
            value={totalBookings}
            subtext="All time reservations"
            color="blue"
          />
          <StatsCard
            icon={CalendarCheck}
            label="Confirmed Trips"
            value={acceptedCount}
            subtext="Ready for travel"
            color="green"
          />
          <StatsCard
            icon={Clock}
            label="Pending Requests"
            value={pendingCount}
            subtext="Awaiting driver approval"
            color="amber"
          />
          <StatsCard
            icon={XCircle}
            label="Cancelled / Rejected"
            value={cancelledCount + bookings.filter((b) => b.status === 'rejected').length}
            subtext="Inactive bookings"
            color="purple"
          />
        </div>

        {/* Upcoming Confirmed Rides Section */}
        {upcomingAccepted.length > 0 && (
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '1rem' }}>Upcoming Journeys</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
              {upcomingAccepted.map((booking) => (
                <div key={booking._id} className="card" style={{ borderColor: 'var(--accent)', borderWidth: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span className="badge badge-accepted">Confirmed Trip</span>
                    <span style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.15rem' }}>
                      ₹{booking.totalFare}
                    </span>
                  </div>

                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>
                    {booking.ride?.source} → {booking.ride?.destination}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Calendar size={14} color="var(--accent)" />
                      <span>{new Date(booking.ride?.departureDate).toLocaleDateString()} at {booking.ride?.departureTime}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Car size={14} color="#64748b" />
                      <span>Driver: {booking.ride?.driver?.name} ({booking.ride?.driver?.phone})</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{booking.seatsBooked} seat(s) reserved</span>
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      className="btn btn-outline btn-sm"
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    >
                      Cancel Booking
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Booking History */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Booking History</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{bookings.length} reservations</span>
          </div>

          {bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
              <p style={{ color: '#64748b', marginBottom: '1.25rem' }}>You haven't requested any rides yet.</p>
              <Link to="/rides" className="btn btn-primary">
                Find a Ride to Book
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Departure</th>
                    <th>Driver</th>
                    <th>Seats</th>
                    <th>Total Fare</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking._id}>
                      <td style={{ fontWeight: 700 }}>
                        {booking.ride ? (
                          <Link to={`/rides/${booking.ride._id}`} style={{ color: 'var(--primary)' }}>
                            {booking.ride.source} → {booking.ride.destination}
                          </Link>
                        ) : (
                          'Unavailable Ride'
                        )}
                      </td>
                      <td>
                        {booking.ride ? (
                          <>
                            <div>{new Date(booking.ride.departureDate).toLocaleDateString()}</div>
                            <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{booking.ride.departureTime}</div>
                          </>
                        ) : '—'}
                      </td>
                      <td>
                        <div>{booking.ride?.driver?.name || 'Driver'}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{booking.ride?.driver?.phone}</div>
                      </td>
                      <td>{booking.seatsBooked} seat(s)</td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{booking.totalFare}</td>
                      <td>
                        <span className={`badge badge-${booking.status}`}>{booking.status}</span>
                      </td>
                      <td>
                        {['pending', 'accepted'].includes(booking.status) ? (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger)', borderColor: 'var(--border)' }}
                          >
                            Cancel
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Completed</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
