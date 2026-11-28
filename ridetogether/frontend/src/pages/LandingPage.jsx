import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { POPULAR_INDIAN_CITIES } from '../utils/indianCities';
import RideMap from '../components/RideMap';
import PlaceAutocompleteInput from '../components/PlaceAutocompleteInput';
import { getGoogleMapsDirectionsUrl } from '../utils/googleMapsLoader';
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
  Sparkles,
  Radio,
  Zap,
  PhoneCall,
  Lock
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
    { from: 'Delhi', to: 'Rishikesh', fare: 450, time: '4h 30m', highway: 'Delhi-Meerut Expressway' },
    { from: 'Mumbai', to: 'Pune', fare: 350, time: '2h 45m', highway: 'Mumbai-Pune Expressway' },
    { from: 'Delhi', to: 'Jaipur', fare: 500, time: '4h 30m', highway: 'Delhi-Jaipur Expressway' },
    { from: 'Bengaluru', to: 'Mysuru', fare: 300, time: '2h 15m', highway: 'Bengaluru-Mysuru Expressway' },
    { from: 'Ahmedabad', to: 'Surat', fare: 450, time: '3h 45m', highway: 'National Expressway 1' },
    { from: 'Chandigarh', to: 'Delhi', fare: 400, time: '4h 00m', highway: 'Grand Trunk Road / NH 44' }
  ];

  return (
    <div>
      {/* City Autocomplete Datalist */}
      <datalist id="hero-cities">
        {POPULAR_INDIAN_CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={14} />
              <span>Smart Mobility • Indian Highways • Low Cost</span>
            </div>

            <h1 className="hero-title">
              Your pick of rides at <span style={{ color: '#34d399' }}>low prices in ₹</span>
            </h1>

            <p className="hero-subtitle">
              Connect with verified drivers and passengers traveling on Indian expressways. Share fuel costs, track live location on GPS map, and travel comfortably.
            </p>

            {/* Floating Search Widget */}
            <form onSubmit={handleSearch} className="search-widget">
              <div className="search-field" style={{ minWidth: '220px', flex: 1.2 }}>
                <PlaceAutocompleteInput
                  value={source}
                  onChange={setSource}
                  placeholder="Leaving from (e.g. Delhi, Uttarakhand)"
                  icon={<MapPin size={18} color="#10b981" />}
                />
              </div>

              <div className="search-field" style={{ minWidth: '220px', flex: 1.2 }}>
                <PlaceAutocompleteInput
                  value={destination}
                  onChange={setDestination}
                  placeholder="Going to (e.g. Rishikesh, Maharashtra)"
                  icon={<MapPin size={18} color="#ef4444" />}
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.3rem' }}>Popular Express Corridors</h2>
              <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Daily departures between major Indian cities with verified drivers</p>
            </div>
            <Link to="/rides" className="btn btn-outline btn-sm">
              <span>View All Rides</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {popularRoutes.map((route, idx) => (
              <div
                key={idx}
                className="card"
                style={{ cursor: 'pointer', padding: '1.35rem', transition: 'transform 0.2s, box-shadow 0.2s' }}
                onClick={() => navigate(`/rides?source=${encodeURIComponent(route.from)}&destination=${encodeURIComponent(route.to)}`)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)' }}>
                    {route.from} → {route.to}
                  </div>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--accent)' }}>
                    ₹{route.fare}
                  </span>
                </div>

                <div style={{ fontSize: '0.82rem', color: '#10b981', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Radio size={13} />
                  <span>{route.highway}</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#64748b', borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={14} />
                    <span>~{route.time}</span>
                  </div>
                  <span style={{ color: 'var(--accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <span>Book Seat</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Real-time Map & Live GPS Tracking Feature Highlight */}
      <section style={{ padding: '4rem 0', backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }} id="hero-map-feature-grid">
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                <Zap size={16} />
                <span>Google Maps API & Live Highway Telemetry</span>
              </div>
              <h2 style={{ fontSize: '2.2rem', marginBottom: '1rem', lineHeight: 1.2 }}>
                Live Google Maps GPS Tracking & Highway Milestones
              </h2>
              <p style={{ color: '#475569', fontSize: '1rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Never wonder where your ride is. Powered by Google Maps JavaScript API with turn-by-turn driving directions, real-time speedometer HUD, remaining distance in kilometers, live ETA countdown, and milestone alerts along national expressways.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)' }}>
                    Official Google Maps JavaScript API with high-resolution vector roadmap fallback
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)' }}>
                    Auto-rotating vehicle bearing along highway bends & curves
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--primary)' }}>
                    1-Tap Turn-by-Turn Navigation directly in the Google Maps App
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <Link to="/rides" className="btn btn-primary btn-lg">
                  <Search size={18} />
                  <span>Explore Live Rides</span>
                </Link>
                <a
                  href={getGoogleMapsDirectionsUrl('Delhi', 'Rishikesh')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline btn-lg"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <MapPin size={18} color="#ea4335" />
                  <span>Google Maps App</span>
                </a>
              </div>
            </div>

            <div>
              <RideMap
                source="Delhi"
                destination="Rishikesh"
                driverName="Rajesh Sharma (Verified Captain)"
                vehicleModel="Maruti Dzire • DL 01 AB 4092"
                height="460px"
              />
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section style={{ padding: '4rem 0', backgroundColor: '#ffffff', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 3rem auto' }}>
            <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>How RideTogether Works</h2>
            <p style={{ color: '#64748b' }}>Carpooling made simple, transparent, and secure in three easy steps</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Search size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>1. Search Your Route</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Enter your departure and destination cities across Indian corridors. Filter by date, fare, and available seats.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <Car size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>2. Request Seats</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Select your required seats and send a request. Verified drivers review and approve with atomic seat reservation.
              </p>
            </div>

            <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
                <CheckCircle2 size={28} />
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>3. Travel & Track Live</h3>
              <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.5 }}>
                Track the car's live location on the interactive route map, coordinate via phone/WhatsApp, and enjoy a comfortable journey.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Community Trust */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#0f172a', color: '#ffffff' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 2.5rem auto' }}>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.5rem', color: '#ffffff' }}>Your Safety is Our Top Priority</h2>
            <p style={{ color: '#94a3b8' }}>Built with security, verified profiles, and community ratings</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <ShieldCheck size={28} color="#10b981" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.4rem' }}>Government ID & Driving License Verification</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                All drivers submit official identification and vehicle registration details before publishing rides.
              </p>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <DollarSign size={28} color="#38bdf8" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.4rem' }}>Zero Hidden Platform Fees</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Transparent fixed pricing in Indian Rupees (`₹`). Pay directly and save up to 70% compared to private taxis.
              </p>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <Leaf size={28} color="#34d399" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.4rem' }}>Eco-Friendly & Green Mobility</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Filling empty car seats dramatically reduces highway congestion, carbon emissions, and fuel consumption.
              </p>
            </div>

            <div style={{ backgroundColor: '#1e293b', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <PhoneCall size={28} color="#fbbf24" style={{ marginBottom: '0.75rem' }} />
              <h4 style={{ fontSize: '1.05rem', color: '#ffffff', marginBottom: '0.4rem' }}>Direct Driver Contact & Live SOS</h4>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5 }}>
                Call or WhatsApp your driver with 1-tap upon booking confirmation for smooth expressway pickups.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
