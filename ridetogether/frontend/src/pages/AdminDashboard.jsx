import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatsCard from '../components/StatsCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  Users,
  Car,
  CalendarCheck,
  DollarSign,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  PieChart
} from 'lucide-react';

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Active view tab in admin panel
  const [adminTab, setAdminTab] = useState('overview'); // 'overview', 'users', 'rides'
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError('');

      const [dashRes, analyticsRes, usersRes, ridesRes] = await Promise.all([
        api.admin.getDashboard(),
        api.admin.getAnalytics(),
        api.admin.getRides('limit=50'),
        api.users.getAllUsers('limit=50')
      ]);

      if (dashRes.success) setDashboardData(dashRes.data);
      if (analyticsRes.success) setAnalytics(analyticsRes.analytics);
      if (usersRes.success) setRides(usersRes.rides || []);
      if (ridesRes.success) setUsers(ridesRes.users || []);
    } catch (err) {
      setError(err.message || 'Failed to load admin analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? All their rides and bookings will also be deleted.')) {
      return;
    }

    try {
      const res = await api.users.deleteUser(userId);
      if (res.success) {
        setSuccess('User removed successfully from platform');
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleUpdateRideStatus = async (rideId, status) => {
    try {
      const res = await api.admin.updateRideStatus(rideId, status);
      if (res.success) {
        setSuccess(`Ride status successfully set to ${status}`);
        fetchAdminData();
      }
    } catch (err) {
      setError(err.message || 'Failed to update ride status');
    }
  };

  if (loading) {
    return <LoadingSpinner text="Aggregating platform statistics and analytics..." />;
  }

  const filteredUsers = users.filter((u) => {
    const matchesSearch = !userSearch ||
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = !userRoleFilter || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--danger)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            <ShieldCheck size={16} />
            <span>Platform Governance & Analytics</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Admin Control Center</h1>
          <p style={{ color: '#64748b' }}>Real-time MongoDB aggregation pipelines, user management, and route popularity monitoring</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* Aggregated KPI Cards */}
        <div className="stats-grid">
          <StatsCard
            icon={Users}
            label="Total Platform Users"
            value={dashboardData?.totalUsers || 0}
            subtext={`${dashboardData?.totalDrivers || 0} Drivers • ${dashboardData?.totalPassengers || 0} Passengers`}
            color="blue"
          />
          <StatsCard
            icon={Car}
            label="Published Rides"
            value={dashboardData?.totalRides || 0}
            subtext="Across all regional routes"
            color="green"
          />
          <StatsCard
            icon={CalendarCheck}
            label="Total Bookings"
            value={dashboardData?.totalBookings || 0}
            subtext="Passenger reservations"
            color="amber"
          />
          <StatsCard
            icon={DollarSign}
            label="Gross Platform Revenue"
            value={`₹${dashboardData?.totalRevenue || 0}`}
            subtext="From accepted bookings ($sum)"
            color="green"
          />
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
          <button
            className={`btn btn-sm ${adminTab === 'overview' ? 'btn-navy' : 'btn-outline'}`}
            onClick={() => setAdminTab('overview')}
          >
            Analytics & Aggregations
          </button>
          <button
            className={`btn btn-sm ${adminTab === 'users' ? 'btn-navy' : 'btn-outline'}`}
            onClick={() => setAdminTab('users')}
          >
            Manage Users ({users.length})
          </button>
          <button
            className={`btn btn-sm ${adminTab === 'rides' ? 'btn-navy' : 'btn-outline'}`}
            onClick={() => setAdminTab('rides')}
          >
            Manage Rides ({rides.length})
          </button>
        </div>

        {/* Tab 1: Overview & Aggregation Pipelines */}
        {adminTab === 'overview' && (
          <div>
            {/* Top Row: Popular Routes & Booking Status Distribution */}
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '1.75rem', marginBottom: '2rem' }} id="admin-analytics-grid">
              {/* Popular Routes Aggregation Table */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={18} color="var(--accent)" />
                  <span>Most Popular Routes (MongoDB Aggregation)</span>
                </h3>

                {analytics?.popularRoutes?.length > 0 ? (
                  <div className="table-responsive">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Route</th>
                          <th>Total Bookings</th>
                          <th>Accepted</th>
                          <th>Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.popularRoutes.map((r, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 700 }}>
                              {r.source} → {r.destination}
                            </td>
                            <td>{r.totalBookings}</td>
                            <td>
                              <span className="badge badge-accepted">{r.acceptedBookings}</span>
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--accent)' }}>
                              ₹{r.totalRevenue}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No route booking data recorded yet.
                  </div>
                )}
              </div>

              {/* Booking Status Distribution */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <PieChart size={18} color="#2563eb" />
                  <span>Booking Status Distribution</span>
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {analytics?.bookingStatusStats?.map((s, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className={`badge badge-${s.status}`}>{s.status}</span>
                      </div>
                      <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {s.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row: Monthly Revenue Trend & Top Performing Drivers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
              {/* Monthly Revenue Trend */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <TrendingUp size={18} color="var(--accent)" />
                  <span>Monthly Platform Revenue ($)</span>
                </h3>

                {analytics?.monthlyRevenue?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analytics.monthlyRevenue.map((m, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{m.month}</strong>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.bookingsCount} accepted bookings</div>
                        </div>
                        <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>
                          ₹{m.revenue}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No monthly revenue data available.
                  </div>
                )}
              </div>

              {/* Top Performing Drivers */}
              <div className="card">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <ShieldCheck size={18} color="var(--accent)" />
                  <span>Top Performing Drivers</span>
                </h3>

                {analytics?.topDrivers?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {analytics.topDrivers.map((d, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)' }}>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{d.driverName}</div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{d.driverEmail}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.1rem' }}>₹{d.totalEarnings}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{d.totalAcceptedBookings} bookings</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No driver earnings records found.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: User Management Table */}
        {adminTab === 'users' && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem' }}>Registered Users Directory</h3>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ paddingLeft: '2rem', fontSize: '0.85rem' }}
                  />
                  <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>

                <select
                  className="form-select"
                  value={userRoleFilter}
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{ width: 'auto', fontSize: '0.85rem' }}
                >
                  <option value="">All Roles</option>
                  <option value="driver">Drivers</option>
                  <option value="passenger">Passengers</option>
                  <option value="admin">Admins</option>
                </select>
              </div>
            </div>

            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.phone}</td>
                      <td>
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#64748b' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="btn btn-outline btn-sm"
                            style={{ color: 'var(--danger)', borderColor: 'var(--danger)', padding: '0.25rem 0.5rem' }}
                            title="Delete User"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Ride Management Table */}
        {adminTab === 'rides' && (
          <div className="card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>All Platform Rides</h3>
            <div className="table-responsive">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Route</th>
                    <th>Driver</th>
                    <th>Departure</th>
                    <th>Fare</th>
                    <th>Seats Left</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rides.map((r) => (
                    <tr key={r._id}>
                      <td style={{ fontWeight: 700 }}>{r.source} → {r.destination}</td>
                      <td>
                        <div>{r.driver?.name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.driver?.phone}</div>
                      </td>
                      <td>
                        <div>{new Date(r.departureDate).toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{r.departureTime}</div>
                      </td>
                      <td style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{r.farePerSeat}</td>
                      <td>{r.availableSeats} / {r.totalSeats}</td>
                      <td>
                        <span className={`badge badge-${r.status}`}>{r.status}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.4rem' }}>
                          {r.status === 'active' && (
                            <button
                              onClick={() => handleUpdateRideStatus(r._id, 'cancelled')}
                              className="btn btn-outline btn-sm"
                              style={{ color: 'var(--danger)', fontSize: '0.78rem' }}
                            >
                              Cancel
                            </button>
                          )}
                          {r.status === 'cancelled' && (
                            <button
                              onClick={() => handleUpdateRideStatus(r._id, 'active')}
                              className="btn btn-outline btn-sm"
                              style={{ color: 'var(--accent)', fontSize: '0.78rem' }}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
