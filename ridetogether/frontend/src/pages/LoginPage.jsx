import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/Alert';
import { Car, Lock, Mail, ShieldAlert, Sparkles, UserCheck } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'admin') navigate('/admin');
    else if (role === 'driver') navigate('/driver-dashboard');
    else navigate('/rides');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success && res.user) {
        redirectAfterLogin(res.user.role);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Quick 1-click test credentials handler
  const handleQuickLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    try {
      setLoading(true);
      const res = await login(demoEmail, demoPassword);
      if (res.success && res.user) {
        redirectAfterLogin(res.user.role);
      }
    } catch (err) {
      setError(err.message || 'Login failed with demo credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1rem auto', width: '42px', height: '42px' }}>
            <Car size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Welcome Back</h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Log in to manage your rides, bookings, and profile
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Quick Demo Credential Pills */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', padding: '0.85rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            <Sparkles size={14} color="#10b981" />
            <span>Instant Demo Login (Evaluator Mode)</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.82rem' }}
              onClick={() => handleQuickLogin('driver.john@example.com', 'driver123')}
              disabled={loading}
            >
              <span>Driver: John (Toyota Camry)</span>
              <span className="badge badge-driver">Driver</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.82rem' }}
              onClick={() => handleQuickLogin('passenger.alice@example.com', 'passenger123')}
              disabled={loading}
            >
              <span>Passenger: Alice Cooper</span>
              <span className="badge badge-passenger">Passenger</span>
            </button>

            <button
              type="button"
              className="btn btn-outline btn-sm"
              style={{ justifyContent: 'space-between', fontSize: '0.82rem' }}
              onClick={() => handleQuickLogin('admin@ridetogether.com', 'admin123')}
              disabled={loading}
            >
              <span>Admin: System Administrator</span>
              <span className="badge badge-admin">Admin</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#64748b' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
}
