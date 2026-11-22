import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Alert from '../components/Alert';
import { User, Mail, Lock, Phone, Car, Compass, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'passenger'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      setError('Please fill out all required fields');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role
      });

      if (res.success) {
        if (formData.role === 'driver') {
          navigate('/driver-dashboard');
        } else {
          navigate('/rides');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3.5rem 1rem', display: 'flex', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', padding: '2.25rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1rem auto', width: '42px', height: '42px' }}>
            <Car size={24} />
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.4rem' }}>Join RideTogether</h1>
          <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
            Sign up to share journeys, save on travel, and meet people
          </p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        {/* Role Toggle Selector */}
        <div style={{ marginBottom: '1.5rem' }}>
          <label className="form-label" style={{ marginBottom: '0.6rem' }}>I want to use RideTogether as:</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => handleRoleSelect('passenger')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: formData.role === 'passenger' ? '2px solid var(--accent)' : '1px solid var(--border)',
                backgroundColor: formData.role === 'passenger' ? 'var(--accent-soft)' : '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                color: formData.role === 'passenger' ? 'var(--accent-hover)' : 'var(--text-muted)'
              }}
            >
              <Compass size={22} color={formData.role === 'passenger' ? 'var(--accent)' : '#94a3b8'} />
              <span>Passenger</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>Book available rides</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('driver')}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.85rem',
                borderRadius: 'var(--radius-md)',
                border: formData.role === 'driver' ? '2px solid var(--accent)' : '1px solid var(--border)',
                backgroundColor: formData.role === 'driver' ? 'var(--accent-soft)' : '#ffffff',
                cursor: 'pointer',
                fontWeight: 600,
                color: formData.role === 'driver' ? 'var(--accent-hover)' : 'var(--text-muted)'
              }}
            >
              <Car size={22} color={formData.role === 'driver' ? 'var(--accent)' : '#94a3b8'} />
              <span>Driver</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 400 }}>Publish your trips</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              name="phone"
              className="form-input"
              placeholder="+1 (555) 000-0000"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="At least 6 characters"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              className="form-input"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : `Register as ${formData.role === 'driver' ? 'Driver' : 'Passenger'}`}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.9rem', color: '#64748b' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}
