import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Compass,
  CheckCircle2
} from 'lucide-react';

export default function DriverDashboard() {
  const { user, updateUser } = useAuth();
  const isDriverOrAdmin = user?.role === 'driver' || user?.isDriver === true || user?.role === 'admin';

  const [stats, setStats] = useState(null);
  const [myRides, setMyRides] = useState([]);
  const [loading, setLoading] = useState(isDriverOrAdmin);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Driver Onboarding Form State (for normal passenger users activating driver mode)
  const [vehicleData, setVehicleData] = useState({
    make: user?.vehicleDetails?.make || 'Maruti Suzuki',
    model: user?.vehicleDetails?.model || 'Dzire VXi',
    licensePlate: user?.vehicleDetails?.licensePlate || 'DL-01-AB-4050',
    color: user?.vehicleDetails?.color || 'Magma Grey'
  });
  const [activating, setActivating] = useState(false);

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
    if (isDriverOrAdmin) {
      fetchDashboardData();
    }
  }, [isDriverOrAdmin]);

  const handleActivateDriver = async (e) => {
    e.preventDefault();
    if (!vehicleData.make || !vehicleData.model || !vehicleData.licensePlate) {
      setError('Please fill in vehicle make, model, and license plate number');
      return;
    }

    try {
      setActivating(true);
      setError('');
      const res = await api.users.becomeDriver(vehicleData);
      if (res.success && res.user) {
        updateUser(res.user);
        setActionSuccess('🎉 Congratulations! Your Driver Account is now active. You have full access to both Driver and Passenger features.');
        await fetchDashboardData();
      }
    } catch (err) {
      setError(err.message || 'Failed to activate driver account. Please try again.');
    } finally {
      setActivating(false);
    }
  };

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

  // If user is a normal passenger who has not activated driver mode yet:
  if (!isDriverOrAdmin) {
    return (
      <div style={{ padding: '3.5rem 0' }}>
        <div className="container" style={{ maxWidth: '640px' }}>
          <div className="card" style={{ padding: '2.5rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div
                className="brand-icon"
                style={{
                  margin: '0 auto 1.25rem auto',
                  width: '54px',
                  height: '54px',
                  backgroundColor: '#f0fdf4',
                  color: 'var(--accent)'
                }}
              >
                <Car size={30} />
              </div>
              <h1 style={{ fontSize: '1.85rem', marginBottom: '0.5rem' }}>Activate Driver Account</h1>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Welcome, <strong>{user?.name}</strong>! You currently have a normal passenger account.
                Register your vehicle below to unlock the Driver Panel, publish rides, and start earning on Indian expressway corridors.
              </p>
            </div>

            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />}

            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.4rem' }}>
                <CheckCircle2 size={18} color="var(--accent)" />
                <span>Dual Account Privileges:</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                <li>Publish verified carpool rides across any Indian cities or expressways.</li>
                <li>Keep 100% of your passenger booking capabilities (search & book rides anytime).</li>
                <li>Instant access to the live Uber/Rapido style Captain Mode and earnings dashboard.</li>
              </ul>
            </div>

            <form onSubmit={handleActivateDriver}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Vehicle Make / Brand</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Maruti Suzuki, Tata, Hyundai"
                    value={vehicleData.make}
                    onChange={(e) => setVehicleData({ ...vehicleData, make: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Model Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Dzire, Nexon EV, Creta"
                    value={vehicleData.model}
                    onChange={(e) => setVehicleData({ ...vehicleData, model: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">License Plate Number</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. DL-01-AB-1234"
                    value={vehicleData.licensePlate}
                    onChange={(e) => setVehicleData({ ...vehicleData, licensePlate: e.target.value.toUpperCase() })}
                    required
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Vehicle Color</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. White, Magma Grey, Black"
                    value={vehicleData.color}
                    onChange={(e) => setVehicleData({ ...vehicleData, color: e.target.value })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                disabled={activating}
              >
                {activating ? 'Activating Driver Account...' : '🚀 Register Vehicle & Open Driver Panel'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner text="Loading driver hub and earnings..." />;
  }

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header with Title and Mode Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem' }}>
              <h1 style={{ fontSize: '2rem', margin: 0 }}>Driver Dashboard</h1>
              <span className="badge badge-driver" style={{ fontSize: '0.78rem' }}>Verified Driver</span>
            </div>
            <p style={{ color: '#64748b', margin: 0 }}>
              Vehicle: <strong>{user?.vehicleDetails?.make || 'Car'} {user?.vehicleDetails?.model || ''}</strong> ({user?.vehicleDetails?.licensePlate || 'Registered'})
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Link to="/passenger-dashboard" className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Compass size={17} color="#0284c7" />
              <span>Switch to Passenger View</span>
            </Link>

            <Link to="/create-ride" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <PlusCircle size={18} />
              <span>Publish a New Ride</span>
            </Link>
          </div>
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
                        <Link to={`/rides/${ride._id}`} style={{ color: 'var(--primary)' }}>
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
