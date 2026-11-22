import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import RideMap from '../components/RideMap';
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Users,
  ShieldCheck,
  Phone,
  Mail,
  CheckCircle2,
  ArrowRight,
  Info,
  ChevronLeft
} from 'lucide-react';

export default function RideDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isPassenger } = useAuth();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking state
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    const fetchRide = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await api.rides.getById(id);
        if (res.success && res.ride) {
          setRide(res.ride);
        } else {
          setError('Ride not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load ride details');
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/rides/${id}` } } });
      return;
    }

    try {
      setBookingLoading(true);
      setBookingError('');
      const res = await api.bookings.create({
        rideId: ride._id,
        seatsBooked: selectedSeats
      });

      if (res.success) {
        setBookingSuccess(true);
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to submit booking request');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading journey itinerary..." />;
  }

  if (error || !ride) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <Alert type="error" message={error || 'Ride not found'} />
        <Link to="/rides" className="btn btn-outline" style={{ marginTop: '1rem' }}>
          <ChevronLeft size={16} />
          <span>Back to All Rides</span>
        </Link>
      </div>
    );
  }

  const isDriverOfRide = user && ride.driver && (user.id === ride.driver._id || user._id === ride.driver._id);
  const formattedDate = new Date(ride.departureDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const totalFare = selectedSeats * ride.farePerSeat;
  const driverInitial = ride.driver?.name ? ride.driver.name.charAt(0).toUpperCase() : 'D';

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container">
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem' }}>
          <Link to="/rides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            <ChevronLeft size={16} />
            <span>Back to Search Results</span>
          </Link>
        </div>

        {bookingSuccess && (
          <div className="card" style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--accent)', padding: '2rem', marginBottom: '2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-subtle)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <CheckCircle2 size={32} />
            </div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
              Booking Request Submitted!
            </h2>
            <p style={{ color: '#065f46', maxWidth: '520px', margin: '0 auto 1.5rem auto' }}>
              Your request for <strong>{selectedSeats} seat(s)</strong> has been sent to <strong>{ride.driver?.name}</strong>. The driver will review and accept your request.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <Link to="/bookings" className="btn btn-primary">
                View in My Bookings
              </Link>
              <Link to="/rides" className="btn btn-outline">
                Search More Rides
              </Link>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '2.5rem', alignItems: 'start' }} id="ride-details-grid">
          {/* Left Column: Ride Journey & Driver Details */}
          <div>
            {/* Journey Header Card */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <span className={`badge badge-${ride.status}`}>
                  {ride.status}
                </span>
                <span style={{ fontSize: '0.9rem', color: '#64748b' }}>
                  Posted on {new Date(ride.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Itinerary Visualization */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative', paddingLeft: '1.5rem' }}>
                <div style={{ position: 'absolute', left: '6px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--accent)' }} />

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-1.85rem', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent)', border: '2px solid #ffffff', boxShadow: '0 0 0 2px var(--accent)' }} />
                  <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>DEPARTURE POINT</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{ride.source}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    <Calendar size={15} color="var(--accent)" />
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <Clock size={15} color="var(--accent)" />
                    <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{ride.departureTime}</span>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-1.85rem', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #ffffff', boxShadow: '0 0 0 2px #ef4444' }} />
                  <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>DESTINATION POINT</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>{ride.destination}</div>
                  <div style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                    Direct drop-off along the route
                  </div>
                </div>
              </div>

              {ride.description && (
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.6rem' }}>Notes from the Driver</h3>
                  <p style={{ color: '#475569', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {ride.description}
                  </p>
                </div>
              )}
            </div>

            {/* Interactive Route & Live GPS Tracking Map (Uber & Rapido Style) */}
            <div style={{ marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Navigation size={20} color="var(--accent)" />
                  <span>Live Route Map & GPS Simulation</span>
                </h3>
                <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>
                  Live Tracking Ready
                </span>
              </div>
              <RideMap
                source={ride.source}
                destination={ride.destination}
                driverName={ride.driver?.name}
                vehicleModel={`${ride.vehicleDetails?.make || ''} ${ride.vehicleDetails?.model || ''}`.trim() || 'Cab'}
                height="420px"
                interactiveTracking={true}
              />
            </div>

            {/* Vehicle & Safety Specs Card */}
            <div className="card" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Car size={20} color="var(--accent)" />
                <span>Vehicle Information</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Car Make & Model</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                    {ride.vehicleDetails?.make || ''} {ride.vehicleDetails?.model || 'Standard Sedan'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Color</span>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                    {ride.vehicleDetails?.color || 'Not specified'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>License Plate</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                    {ride.vehicleDetails?.licensePlate || 'Registered'}
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Profile Card */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Driver Profile</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                {ride.driver?.profileImage ? (
                  <img src={ride.driver.profileImage} alt={ride.driver.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                    {driverInitial}
                  </div>
                )}

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {ride.driver?.name}
                    </span>
                    <span className="badge badge-active" style={{ fontSize: '0.72rem' }}>
                      <ShieldCheck size={12} />
                      <span>Verified Driver</span>
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.88rem', color: '#64748b', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Phone size={14} />
                      <span>{ride.driver?.phone}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                      <Mail size={14} />
                      <span>{ride.driver?.email}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Booking Interface Card */}
          <aside className="card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent)' }}>₹{ride.farePerSeat}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}> / seat</span>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontWeight: 700, fontSize: '1rem', color: ride.availableSeats > 0 ? '#10b981' : '#ef4444' }}>
                  {ride.availableSeats} seats left
                </span>
                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>out of {ride.totalSeats} total</div>
              </div>
            </div>

            {bookingError && <Alert type="error" message={bookingError} onClose={() => setBookingError('')} />}

            {isDriverOfRide ? (
              <div className="alert alert-info" style={{ fontSize: '0.88rem' }}>
                <Info size={16} />
                <span>You are the driver of this ride. You can manage passenger requests from your Driver Hub.</span>
              </div>
            ) : ride.availableSeats === 0 ? (
              <div className="alert alert-error">
                <Info size={16} />
                <span>This ride is completely full. No more seats are currently available.</span>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label className="form-label">Number of Seats to Reserve</label>
                  <select
                    className="form-select"
                    value={selectedSeats}
                    onChange={(e) => setSelectedSeats(Number(e.target.value))}
                    disabled={bookingLoading || bookingSuccess}
                  >
                    {Array.from({ length: ride.availableSeats }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'seat' : 'seats'}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', margin: '1.25rem 0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.4rem', color: '#64748b' }}>
                    <span>₹{ride.farePerSeat} × {selectedSeats} seat{selectedSeats > 1 ? 's' : ''}</span>
                    <span>₹{totalFare}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', marginBottom: '0.6rem', color: '#64748b' }}>
                    <span>Platform Booking Fee</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>₹0 (Free)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 800, borderTop: '1px solid var(--border)', paddingTop: '0.6rem', color: 'var(--primary)' }}>
                    <span>Total Fare</span>
                    <span style={{ color: 'var(--accent)' }}>₹{totalFare}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  disabled={bookingLoading || bookingSuccess}
                >
                  {bookingLoading ? 'Submitting Request...' : bookingSuccess ? 'Request Sent' : 'Request to Book'}
                </button>

                <p style={{ fontSize: '0.78rem', color: '#94a3b8', textAlign: 'center', marginTop: '0.75rem', lineHeight: 1.4 }}>
                  Atomic seat locking enabled. You will not be charged until the driver accepts your booking.
                </p>
              </form>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
