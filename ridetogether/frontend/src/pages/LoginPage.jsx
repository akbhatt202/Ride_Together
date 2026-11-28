import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/Alert';
import { Car, Lock, Mail, Users, ShieldCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [portal, setPortal] = useState('passenger'); // 'passenger' | 'driver'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const requestedPortal = searchParams.get('portal');
    if (requestedPortal === 'driver') {
      setPortal('driver');
    }
  }, [searchParams]);

  const redirectAfterLogin = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    if (role === 'admin') {
      navigate('/admin');
      return;
    }

    if (portal === 'driver' || role === 'driver') {
      navigate('/driver-dashboard');
    } else {
      navigate('/rides');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await login(email, password);
      if (res.success && res.user) {
        redirectAfterLogin(res.user.role);
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '2.25rem' }}>
        {/* Portal Mode Switcher */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.4rem',
            backgroundColor: '#f1f5f9',
            padding: '0.3rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem'
          }}
        >
          <button
            type="button"
            onClick={() => { setPortal('passenger'); setError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.65rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              transition: 'all 0.2s ease',
              backgroundColor: portal === 'passenger' ? '#ffffff' : 'transparent',
              color: portal === 'passenger' ? 'var(--primary)' : '#64748b',
              boxShadow: portal === 'passenger' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Users size={16} color={portal === 'passenger' ? '#0284c7' : '#94a3b8'} />
            <span>Passenger</span>
          </button>

          <button
            type="button"
            onClick={() => { setPortal('driver'); setError(''); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              padding: '0.65rem',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.88rem',
              transition: 'all 0.2s ease',
              backgroundColor: portal === 'driver' ? '#ffffff' : 'transparent',
              color: portal === 'driver' ? 'var(--accent)' : '#64748b',
              boxShadow: portal === 'driver' ? '0 2px 4px rgba(0,0,0,0.06)' : 'none'
            }}
          >
            <Car size={16} color={portal === 'driver' ? 'var(--accent)' : '#94a3b8'} />
            <span>Driver Panel</span>
          </button>
        </div>

        {/* Portal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div
            className="brand-icon"
            style={{
              margin: '0 auto 1rem auto',
              width: '46px',
              height: '46px',
              backgroundColor: portal === 'driver' ? '#f0fdf4' : '#f0f9ff',
              color: portal === 'driver' ? 'var(--accent)' : '#0284c7'
            }}
          >
            {portal === 'driver' ? <Car size={26} /> : <Users size={26} />}
          </div>
          <h1 style={{ fontSize: '1.65rem', marginBottom: '0.35rem' }}>
            {portal === 'driver' ? 'Driver Portal Login' : 'Passenger Login'}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
            {portal === 'driver'
              ? 'Sign in to access your Driver Hub, publish expressway rides, and manage bookings'
              : 'Sign in to book seats, search expressway routes, and track live rides across India'}
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} color="#64748b" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={14} color="#64748b" />
              <span>Password</span>
            </label>
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
            style={{
              width: '100%',
              marginTop: '0.85rem',
              padding: '0.85rem',
              backgroundColor: portal === 'driver' ? 'var(--accent)' : 'var(--primary)',
              borderColor: portal === 'driver' ? 'var(--accent)' : 'var(--primary)'
            }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : portal === 'driver' ? 'Open Driver Panel' : 'Sign In'}
          </button>
        </form>

        {portal === 'driver' && (
          <div
            style={{
              marginTop: '1.25rem',
              padding: '0.85rem',
              backgroundColor: '#f8fafc',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.82rem',
              color: '#475569',
              lineHeight: 1.5
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, marginBottom: '0.3rem', color: 'var(--primary)' }}>
              <ShieldCheck size={16} color="var(--accent)" />
              <span>New to driving on RideTogether?</span>
            </div>
            Sign in with your normal account to activate your Driver Profile with vehicle details in 1 click! Drivers enjoy full access to both Driver Hub and Passenger Trips.
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: '#64748b' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Create one free
          </Link>
        </div>
      </div>
    </div>
  );
}
