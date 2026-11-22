import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import DriverCaptainMode from '../components/DriverCaptainMode';
import {
  Car,
  DollarSign,
  Users,
  Clock,
  PlusCircle,
  MapPin,
  Calendar,
  AlertCircle,
  TrendingUp,
  Trash2,
  ArrowRight
} from 'lucide-react';

export default function DriverDashboard() {
  const [stats, setStats] = useState(null);
  const [myRides, setMyRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [statsRes, ridesRes] = await Promise.all([
        api.rides.getDriverStats(),
        api.rides.getMyRides()
      ]);

      if (statsRes.success) {
        setStats(statsRes.data);
      }
      if (ridesRes.success) {
        setMyRides(ridesRes.rides || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch driver dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelRide = async (rideId) => {
    if (!window.confirm('Are you sure you want to cancel this ride? All pending and accepted bookings will be cancelled.')) {
      return;
    }

    try {
      const res = await api.rides.delete(rideId);
      if (res.success) {
        setActionSuccess('Ride cancelled successfully');
        fetchDashboardData();
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel ride');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading driver hub and earnings..." />;
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header with Title and Create Ride Action */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>Driver Dashboard</h1>
            <p style={{ color: '#64748b' }}>Manage your published rides, track earnings, and review passenger requests</p>
          </div>
          <Link to="/create-ride" className="btn btn-primary">
            <PlusCircle size={18} />
            <span>Publish a New Ride</span>
          </Link>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />}

        {/* Uber Driver & Rapido Captain Live Console */}
        <DriverCaptainMode
          onAcceptIncomingTrip={(trip) => {
            setActionSuccess(`Trip accepted! Navigating to pickup at ${trip.pickup}.`);
          }}
        />

        {/* Aggregated KPI Cards */}
        <div className="stats-grid">
          <StatsCard
            icon={DollarSign}
            label="Total Earnings"
            value={`₹${stats?.totalEarnings || 0}`}
            subtext="From accepted passenger bookings"
            color="green"
          />
          <StatsCard
            icon={Car}
            label="Published Rides"
            value={stats?.totalRidesPublished || 0}
            subtext={`${stats?.activeRidesCount || 0} currently active`}
            color="blue"
          />
          <StatsCard
            icon={Users}
            label="Accepted Bookings"
            value={stats?.totalAcceptedBookings || 0}
            subtext={`${stats?.totalSeatsSold || 0} total seats reserved`}
            color="purple"
          />
          <StatsCard
            icon={Clock}
            label="Pending Requests"
            value={stats?.pendingBookingRequests || 0}
            subtext="Awaiting your approval"
            color="amber"
          />
        </div>

        {/* If pending requests, highlight banner */}
        {stats?.pendingBookingRequests > 0 && (
          <div className="alert alert-info" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <AlertCircle size={20} />
              <span>You have <strong>{stats.pendingBookingRequests} pending booking request(s)</strong> waiting for your decision!</span>
            </div>
            <Link to="/bookings" className="btn btn-navy btn-sm">
              Review Requests Now
            </Link>
          </div>
        )}

        {/* Analytics Aggregations: Monthly Earnings & Popular Destinations */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2.5rem' }} id="driver-analytics-grid">
          {/* Monthly Earnings Aggregation */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="var(--accent)" />
              <span>Monthly Earnings (MongoDB Aggregation)</span>
            </h3>

            {stats?.monthlyEarnings?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.monthlyEarnings.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.month}</span>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.bookingsCount} booking(s) accepted</div>
                    </div>
                    <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent)' }}>
                      +₹{item.monthlyEarnings}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                No completed or accepted monthly earnings yet.
              </div>
            )}
          </div>

          {/* Popular Destinations Aggregation */}
          <div className="card">
            <h3 style={{ fontSize: '1.15rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={18} color="#2563eb" />
              <span>Top Destinations Driven</span>
            </h3>

            {stats?.popularDestinations?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.popularDestinations.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{item.destination}</span>
                    <span className="badge badge-driver">{item.rideCount} {item.rideCount === 1 ? 'ride' : 'rides'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem' }}>
                Publish rides to see your top destinations!
              </div>
            )}
          </div>
        </div>

        {/* Driver Published Rides Table */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>My Published Rides</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Total: {myRides.length}</span>
          </div>

          {myRides.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <p style={{ color: '#64748b', marginBottom: '1rem' }}>You have not published any rides yet.</p>
              <Link to="/create-ride" className="btn btn-primary">
                Create Your First Ride
              </Link>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Date & Time</th>
                    <th>Fare</th>
                    <th>Available Seats</th>
                    <th>Requests</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {myRides.map((ride) => (
                    <tr key={ride._id}>
                      <td style={{ fontWeight: 700 }}>
                        <Link to={`/rides/${ride._id}`} style={{ color: 'var(--primary)', hover: { color: 'var(--accent)' } }}>
                          {ride.source} → {ride.destination}
                        </Link>
                      </td>
                      <td>
                        <div>{new Date(ride.departureDate).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{ride.departureTime}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{ride.farePerSeat}</td>
                      <td>
                        <span style={{ fontWeight: 600 }}>
                          {ride.availableSeats} / {ride.totalSeats}
                        </span>
                      </td>
                      <td>
                        {ride.pendingBookingsCount > 0 ? (
                          <Link to="/bookings" className="badge badge-pending">
                            {ride.pendingBookingsCount} pending
                          </Link>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>0 pending</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${ride.status}`}>{ride.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Link to={`/rides/${ride._id}`} className="btn btn-outline btn-sm">
                            View
                          </Link>
                          {ride.status === 'active' && (
                            <button
                              onClick={() => handleCancelRide(ride._id)}
                              className="btn btn-danger btn-sm"
                              title="Cancel Ride"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
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
