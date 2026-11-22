import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  DollarSign,
  Leaf,
  Clock,
  ArrowRight,
  Car,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [date, setDate] = useState('');
  const [seats, setSeats] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (source.trim()) params.append('source', source.trim());
    if (destination.trim()) params.append('destination', destination.trim());
    if (date) params.append('date', date);
    if (seats > 1) params.append('seats', seats);

    navigate(`/rides?${params.toString()}`);
  };

  const popularRoutes = [
    { from: 'New York', to: 'Boston', fare: 35, time: '4h 15m' },
    { from: 'San Francisco', to: 'Los Angeles', fare: 45, time: '5h 45m' },
    { from: 'Seattle', to: 'Portland', fare: 28, time: '3h 10m' },
    { from: 'Austin', to: 'Dallas', fare: 30, time: '3h 30m' }
  ];

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>Smart Mobility • Safe Community • Low Cost</span>
            </div>

            <h1 className="hero-title">
              Your pick of rides at <span style={{ color: '#34d399' }}>low prices</span>
            </h1>

            <p className="hero-subtitle">
              Connect with verified drivers and passengers heading your way. Share fuel costs, reduce traffic, and travel comfortably together.
            </p>

            {/* Floating Search Widget */}
            <form onSubmit={handleSearch} className="search-widget">
              <div className="search-field">
                <MapPin size={18} color="#10b981" />
                <input
                  type="text"
                  placeholder="Leaving from (e.g. New York)"
                  className="search-field-input"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                />
              </div>

              <div className="search-field">
                <MapPin size={18} color="#ef4444" />
                <input
                  type="text"
                  placeholder="Going to (e.g. Boston)"
                  className="search-field-input"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                />
              </div>

              <div className="search-field" style={{ minWidth: '150px' }}>
                <Calendar size={18} color="#64748b" />
                <input
                  type="date"
                  className="search-field-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="search-field" style={{ minWidth: '110px' }}>
                <Users size={18} color="#64748b" />
                <select
                  className="search-field-input"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                >
                  <option value={1}>1 seat</option>
                  <option value={2}>2 seats</option>
                  <option value={3}>3 seats</option>
                  <option value={4}>4 seats</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 'none' }}>
                <Search size={18} />
                <span>Search Rides</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.6rem', marginBottom: '0.3rem' }}>Popular Shared Routes</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Daily departures between major cities with verified drivers</p>
            </div>
            <Link to="/rides" className="btn btn-outline btn-sm">
              <span>View All</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {popularRoutes.map((route, idx) => (
              <div
                key={idx}
                className="card"
                style={{ cursor: 'pointer', padding: '1.25rem' }}
                onClick={() => navigate(`/rides?source=${encodeURIComponent(route.from)}&destination=${encodeURIComponent(route.to)}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--primary)' }}>
                    {route.from} → {route.to}
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--accent)', fontSize: '1.2rem' }}>
                    ${route.fare}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem', color: '#64748b' }}>
                  <span>Est. Travel Time: {route.time}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Explore rides →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '4.5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <h2 className="section-title">How RideTogether Works</h2>
            <p className="section-subtitle">Effortless ride sharing in three simple steps for everyone</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Step 1 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Search size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>1. Find Your Ride</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Enter your departure and destination points along with your travel date. Compare drivers, vehicle specs, and seat fares.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>2. Request Seats</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Submit a booking request for your desired number of seats. Our atomic seat locking system guarantees zero overbooking.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Car size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.75rem' }}>3. Travel Together</h3>
              <p style={{ color: '#64748b', fontSize: '0.92rem', lineHeight: 1.6 }}>
                Once your driver accepts, coordinate your pickup spot, hop in, and enjoy a safe, affordable, and eco-friendly journey!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section style={{ padding: '4.5rem 0', backgroundColor: '#ffffff', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3rem auto' }}>
            <h2 className="section-title">Why Choose RideTogether?</h2>
            <p className="section-subtitle">Real benefits for your wallet, community, and our planet</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 'none', width: '44px', height: '44px', borderRadius: '10px', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Huge Cost Savings</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Cut your travel expenses by up to 70% compared to trains or flying by splitting gas with friendly co-travelers.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 'none', width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#dbeafe', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Leaf size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Eco-Friendly Travel</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Filling empty car seats directly reduces greenhouse gas emissions and highway congestion on every single trip.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 'none', width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Verified Community</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Every member is phone and email verified. Drivers review and approve all booking requests before departure.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 'none', width: '44px', height: '44px', borderRadius: '10px', backgroundColor: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Clock size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>Flexible & Direct</h4>
                <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  Choose pickup times that fit your schedule without having to navigate crowded airports or train stations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Driver / Passenger Banner */}
      <section style={{ padding: '4rem 0', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', color: '#ffffff' }}>
        <div className="container">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
            <div style={{ maxWidth: '600px' }}>
              <h2 style={{ color: '#ffffff', fontSize: '2.2rem', marginBottom: '0.75rem' }}>Driving somewhere soon?</h2>
              <p style={{ color: '#cbd5e1', fontSize: '1.05rem', lineHeight: 1.6 }}>
                Publish your empty seats in less than 2 minutes. Offset your gas costs and earn extra income on routes you are already taking.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/create-ride" className="btn btn-primary btn-lg">
                Publish a Ride Now
              </Link>
              <Link to="/rides" className="btn btn-outline btn-lg" style={{ color: '#ffffff', borderColor: 'rgba(255,255,255,0.3)' }}>
                Find Available Rides
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
