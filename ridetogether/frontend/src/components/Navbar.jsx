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
  X
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isDriver, isAdmin, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicked outside
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

          {/* Right Section: Auth buttons / User Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
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
                  <ChevronDown size={14} color="#64748b" />
                </button>

                {dropdownOpen && (
                  <div className="user-menu-popover">
                    <div className="user-menu-header">
                      <div className="user-menu-name">{user?.name}</div>
                      <div className="user-menu-email">{user?.email}</div>
                      <span className={`badge badge-${user?.role}`} style={{ marginTop: '0.4rem' }}>
                        {user?.role}
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
              className="btn btn-outline btn-sm"
              style={{ display: 'none' }}
              id="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
