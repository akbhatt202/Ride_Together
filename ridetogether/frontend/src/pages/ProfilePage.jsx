import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import Alert from '../components/Alert';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Calendar,
  Lock,
  Camera,
  CheckCircle2
} from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const payload = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        profileImage: formData.profileImage.trim()
      };

      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await api.users.updateProfile(payload);
      if (res.success && res.user) {
        updateUser(res.user);
        setSuccess('Your profile has been updated successfully');
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={{ padding: '3rem 1rem' }}>
      <div className="container" style={{ maxWidth: '680px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>Account Profile</h1>
          <p style={{ color: '#64748b' }}>Manage your personal details, contact number, and credentials</p>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}
        {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

        {/* User Profile Card */}
        <div className="card" style={{ marginBottom: '2rem', padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', flexWrap: 'wrap' }}>
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--accent)' }}
              />
            ) : (
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800
                }}
              >
                {userInitial}
              </div>
            )}

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <h2 style={{ fontSize: '1.4rem' }}>{user?.name}</h2>
                <span className={`badge badge-${user?.role}`}>{user?.role}</span>
              </div>
              <div style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>{user?.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                <Calendar size={13} />
                <span>Joined {new Date(user?.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                name="name"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address (Read-only)</label>
              <input
                type="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                name="phone"
                className="form-input"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Profile Image URL (Optional)</label>
              <input
                type="url"
                name="profileImage"
                className="form-input"
                placeholder="https://..."
                value={formData.profileImage}
                onChange={handleChange}
              />
            </div>

            <div style={{ margin: '1.75rem 0 1.25rem 0', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
              <h3 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Change Password</h3>
              <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>Leave blank if you do not want to change your password</p>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input
                    type="password"
                    name="password"
                    className="form-input"
                    placeholder="New password (min 6 chars)"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    className="form-input"
                    placeholder="Repeat new password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.85rem' }}
              disabled={loading}
            >
              {loading ? 'Saving Profile...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
