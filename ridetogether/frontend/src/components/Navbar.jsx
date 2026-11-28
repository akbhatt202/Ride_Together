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
  Compass,
  Sparkles,
  Zap
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isDriver, isAdmin, isPassenger, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdowns when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
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

            {/* If driver or admin: show Publish Ride and Driver Hub */}
            {isAuthenticated && (isDriver || isAdmin) && (
              <>
                <NavLink to="/create-ride" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <PlusCircle size={16} color="var(--accent)" />
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Publish a Ride</span>
                </NavLink>

                <NavLink to="/driver-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <LayoutDashboard size={16} />
                  <span>Driver Hub</span>
                </NavLink>
              </>
            )}

            {/* If logged in: show Bookings and Passenger Trips */}
            {isAuthenticated && (
              <>
                <NavLink to="/passenger-dashboard" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <Compass size={16} />
                  <span>My Trips</span>
                </NavLink>

                <NavLink to="/bookings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                  <CalendarCheck size={16} />
                  <span>Bookings</span>
                </NavLink>
              </>
            )}

            {/* If passenger only: show Become a Driver */}
            {isAuthenticated && !isDriver && !isAdmin && (
              <NavLink
                to="/driver-dashboard"
                className="nav-link"
                style={{
                  color: 'var(--accent)',
                  fontWeight: 700,
                  backgroundColor: '#f0fdf4',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '20px',
                  border: '1px solid #bbf7d0'
                }}
              >
                <Car size={15} color="var(--accent)" />
                <span>Become a Driver</span>
              </NavLink>
            )}

            {/* Admin link */}
            {isAuthenticated && isAdmin && (
              <NavLink to="/admin" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <ShieldAlert size={16} color="var(--danger)" />
                <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Admin Panel</span>
              </NavLink>
            )}

            {/* Unauthenticated: link directly to Driver Panel */}
            {!isAuthenticated && (
              <Link
                to="/login?portal=driver"
                className="nav-link"
                style={{
                  color: 'var(--accent)',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <Car size={16} color="var(--accent)" />
                <span>Driver Panel</span>
              </Link>
            )}
          </nav>

          {/* Right Section: User Profile or Auth Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

                    {/* Dual Account Navigation */}
                    {isDriver || isAdmin ? (
                      <>
                        <Link
                          to="/driver-dashboard"
                          className="user-menu-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Car size={16} color="var(--accent)" />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600 }}>Driver Hub</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Manage rides & earnings</div>
                          </div>
                        </Link>

                        <Link
                          to="/passenger-dashboard"
                          className="user-menu-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Compass size={16} color="#0284c7" />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 600 }}>Passenger Trips</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>View your booked seats</div>
                          </div>
                        </Link>

                        <Link
                          to="/create-ride"
                          className="user-menu-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <PlusCircle size={16} color="var(--accent)" />
                          <span>Publish a New Ride</span>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/driver-dashboard"
                          className="user-menu-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Car size={16} color="var(--accent)" />
                          <div style={{ textAlign: 'left' }}>
                            <div style={{ fontWeight: 700, color: 'var(--accent)' }}>Activate Driver Mode</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Register vehicle & offer rides</div>
                          </div>
                        </Link>

                        <Link
                          to="/passenger-dashboard"
                          className="user-menu-item"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Compass size={16} color="#0284c7" />
                          <span>Passenger Trips</span>
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="user-menu-item"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <ShieldAlert size={16} color="var(--danger)" />
                        <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Admin Panel</span>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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

            {isAuthenticated ? (
              <>
                {(isDriver || isAdmin) && (
                  <>
                    <Link
                      to="/create-ride"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <PlusCircle size={18} color="var(--accent)" />
                      <span>Publish a Ride</span>
                    </Link>

                    <Link
                      to="/driver-dashboard"
                      className="mobile-nav-link"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Car size={18} color="var(--accent)" />
                      <span>Driver Hub</span>
                    </Link>
                  </>
                )}

                <Link
                  to="/passenger-dashboard"
                  className="mobile-nav-link"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Compass size={18} />
                  <span>Passenger Trips</span>
                </Link>

                {!isDriver && !isAdmin && (
                  <Link
                    to="/driver-dashboard"
                    className="mobile-nav-link"
                    style={{ color: 'var(--accent)', fontWeight: 700 }}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Car size={18} />
                    <span>Become a Driver</span>
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
                  to="/login?portal=driver"
                  className="btn btn-outline"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Car size={16} />
                  <span>Driver Panel</span>
                </Link>
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
