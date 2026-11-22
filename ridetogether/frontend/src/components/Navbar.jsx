import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  Car,
  Search,
  PlusCircle,
  LayoutDashboard,
  CalendarCheck,
  User,
  LogOut,
  ShieldAlert,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Zap,
  Users
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isDriver, isAdmin, isPassenger, login, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const demoRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (demoRef.current && !demoRef.current.contains(event.target)) {
        setDemoMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    logout();
    navigate('/login');
  };

  // 1-Click quick role switcher for evaluators & testing
  const handleQuickSwitch = async (email, password, targetRoute) => {
    setDemoMenuOpen(false);
    setDropdownOpen(false);
    try {
      await login(email, password);
      navigate(targetRoute);
    } catch (err) {
      console.error('Quick switch failed:', err.message);
    }
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  return (
    <header className="navbar">
      <div className="container">
        <div className="navbar-inner">
          {/* Brand Logo */}
          <Link to="/" className="brand-logo" onClick={() => setMobileMenuOpen(false)}>
            <div className="brand-icon">
              <Car size={22} />
            </div>
            <span>Ride<span style={{ color: 'var(--accent)' }}>Together</span></span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="nav-links">
            <NavLink to="/rides" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
              <Search size={16} />
              <span>Find a Ride</span>
            </NavLink>

            {isDriver && (
              <NavLink to="/create-ride" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <PlusCircle size={16} color="var(--accent)" />
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Publish a Ride</span>
              </NavLink>
            )}

            {isAuthenticated && (
              <>
                {isDriver && (
                  <NavLink to="/driver-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={16} />
                    <span>Driver Hub</span>
                  </NavLink>
                )}

                {!isDriver && !isAdmin && (
                  <NavLink to="/passenger-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <LayoutDashboard size={16} />
                    <span>My Trips</span>
                  </NavLink>
                )}

                <NavLink to="/bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <CalendarCheck size={16} />
                  <span>Bookings</span>
                </NavLink>

                {isAdmin && (
                  <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <ShieldAlert size={16} color="var(--danger)" />
                    <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Admin Panel</span>
                  </NavLink>
                )}
              </>
            )}
          </nav>

          {/* Right Section: Evaluator Quick Switcher + User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Quick Demo Switcher Pill */}
            <div style={{ position: 'relative' }} ref={demoRef}>
              <button
                type="button"
                onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                className="btn btn-outline btn-sm"
                style={{
                  fontSize: '0.78rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  padding: '0.3rem 0.65rem',
                  borderRadius: '20px',
                  backgroundColor: '#f8fafc'
                }}
                title="1-Click Role Switcher for Testing"
              >
                <Sparkles size={13} color="#10b981" />
                <span style={{ fontWeight: 600 }}>Demo Switcher</span>
                <ChevronDown size={12} />
              </button>

              {demoMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '260px',
                    backgroundColor: '#ffffff',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
                    padding: '0.6rem',
                    zIndex: 1000
                  }}
                >
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', padding: '0.3rem 0.5rem', marginBottom: '0.3rem' }}>
                    1-Click Switch Account:
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitch('driver.rajesh@example.com', 'driver123', '/driver-dashboard')}
                    className="user-menu-item"
                    style={{ borderRadius: '6px', fontSize: '0.82rem', padding: '0.5rem' }}
                  >
                    <Car size={15} color="var(--accent)" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700 }}>Rajesh (Driver)</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Maruti Dzire • Mumbai-Pune</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitch('passenger.neha@example.com', 'passenger123', '/rides')}
                    className="user-menu-item"
                    style={{ borderRadius: '6px', fontSize: '0.82rem', padding: '0.5rem' }}
                  >
                    <Users size={15} color="#0284c7" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700 }}>Neha (Passenger)</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Search & Book Seats</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleQuickSwitch('admin@ridetogether.com', 'admin123', '/admin')}
                    className="user-menu-item"
                    style={{ borderRadius: '6px', fontSize: '0.82rem', padding: '0.5rem' }}
                  >
                    <ShieldAlert size={15} color="var(--danger)" />
                    <div style={{ textAlign: 'left' }}>
                      <div style={{ fontWeight: 700 }}>Vikram (Admin)</div>
                      <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Platform Control & Revenue</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {isAuthenticated ? (
              <div className="nav-user-dropdown" ref={dropdownRef}>
                <button
                  className="user-avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  aria-expanded={dropdownOpen}
                >
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="avatar-img" />
                  ) : (
                    <div className="avatar-img">{userInitial}</div>
                  )}
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--primary)' }}>
                    {user?.name?.split(' ')[0]}
                  </span>
                  <span className={`badge badge-${user?.role}`} style={{ fontSize: '0.68rem', padding: '0.15rem 0.45rem' }}>
                    {user?.role}
                  </span>
                  <ChevronDown size={14} color="#64748b" />
                </button>

                {dropdownOpen && (
                  <div className="user-menu-popover">
                    <div className="user-menu-header">
                      <div className="user-menu-name">{user?.name}</div>
                      <div className="user-menu-email">{user?.email}</div>
                      <span className={`badge badge-${user?.role}`} style={{ marginTop: '0.4rem' }}>
                        {user?.role?.toUpperCase()}
                      </span>
                    </div>

                    <Link
                      to="/profile"
                      className="user-menu-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <User size={16} />
                      <span>My Profile</span>
                    </Link>

                    {isDriver ? (
                      <Link
                        to="/driver-dashboard"
                        className="user-menu-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard size={16} />
                        <span>Driver Dashboard</span>
                      </Link>
                    ) : isAdmin ? (
                      <Link
                        to="/admin"
                        className="user-menu-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShieldAlert size={16} />
                        <span>Admin Dashboard</span>
                      </Link>
                    ) : (
                      <Link
                        to="/passenger-dashboard"
                        className="user-menu-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <LayoutDashboard size={16} />
                        <span>Passenger Dashboard</span>
                      </Link>
                    )}

                    <Link
                      to="/bookings"
                      className="user-menu-item"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <CalendarCheck size={16} />
                      <span>Booking Requests</span>
                    </Link>

                    <button
                      className="user-menu-item danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Link to="/login" className="btn btn-outline btn-sm">
                  Log In
                </Link>
                <Link to="/register" className="btn btn-primary btn-sm">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              className="mobile-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav">
            <Link
              to="/rides"
              className="mobile-nav-link"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search size={18} />
              <span>Find a Ride</span>
            </Link>

            {isDriver && (
              <Link
                to="/create-ride"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <PlusCircle size={18} color="var(--accent)" />
                <span>Publish a Ride</span>
              </Link>
            )}

            {isAuthenticated ? (
              <>
                {isDriver && (
                  <Link
                    to="/driver-dashboard"
                    className="mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    <span>Driver Hub</span>
                  </Link>
                )}

                {!isDriver && !isAdmin && (
                  <Link
                    to="/passenger-dashboard"
                    className="mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    <span>Passenger Trips</span>
                  </Link>
                )}

                <Link
                  to="/bookings"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CalendarCheck size={18} />
                  <span>Bookings</span>
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    className="mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShieldAlert size={18} color="var(--danger)" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <Link
                  to="/profile"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User size={18} />
                  <span>My Profile</span>
                </Link>

                <button
                  className="mobile-nav-link danger"
                  onClick={handleLogout}
                  style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none' }}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                <Link
                  to="/login"
                  className="btn btn-outline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
