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
  ChevronLeft,
  Navigation,
  Share2,
  MessageCircle,
  AlertTriangle,
  Trash2,
  Check,
  X
} from 'lucide-react';

export default function RideDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isPassenger, isDriver } = useAuth();

  const [ride, setRide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Booking states
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [myExistingBooking, setMyExistingBooking] = useState(null);

  // Driver ride management
  const [rideRequests, setRideRequests] = useState([]);
  const [copySuccess, setCopySuccess] = useState(false);

  const fetchRideAndBookingDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await api.rides.getById(id);
      if (res.success && res.ride) {
        setRide(res.ride);

        // Check if logged in user already booked this ride
        if (isAuthenticated) {
          const bookingsRes = await api.bookings.getMyBookings();
          if (bookingsRes.success && bookingsRes.bookings) {
            const matched = bookingsRes.bookings.find(
              (b) => (b.ride?._id === id || b.ride === id) && ['pending', 'accepted'].includes(b.status)
            );
            setMyExistingBooking(matched || null);
          }

          // If current user is the driver of this ride, load passenger requests for this ride
          const isOwner = user && (user.id === res.ride.driver?._id || user._id === res.ride.driver?._id);
          if (isOwner) {
            const driverReqsRes = await api.bookings.getDriverRequests();
            if (driverReqsRes.success && driverReqsRes.requests) {
              const matchedRequests = driverReqsRes.requests.filter(
                (req) => (req.ride?._id === id || req.ride === id)
              );
              setRideRequests(matchedRequests);
            }
          }
        }
      } else {
        setError('Ride not found');
      }
    } catch (err) {
      setError(err.message || 'Failed to load ride details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRideAndBookingDetails();
  }, [id, isAuthenticated]);

  // Passenger submits booking request
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
        setActionSuccess('Booking request sent to driver! Awaiting driver confirmation.');
        fetchRideAndBookingDetails();
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to submit booking request');
    } finally {
      setBookingLoading(false);
    }
  };

  // Passenger cancels their booking
  const handleCancelMyBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking request? Reserved seats will be released.')) return;
    try {
      setBookingLoading(true);
      const res = await api.bookings.cancel(bookingId);
      if (res.success) {
        setActionSuccess('Your booking request was cancelled.');
        setMyExistingBooking(null);
        fetchRideAndBookingDetails();
      }
    } catch (err) {
      setBookingError(err.message || 'Failed to cancel booking');
    } finally {
      setBookingLoading(false);
    }
  };

  // Driver cancels ride
  const handleCancelRideAsDriver = async () => {
    if (!window.confirm('Are you sure you want to cancel this published ride? All passengers will be notified.')) return;
    try {
      setLoading(true);
      const res = await api.rides.delete(ride._id);
      if (res.success) {
        navigate('/driver-dashboard');
      }
    } catch (err) {
      setError(err.message || 'Failed to cancel ride');
    } finally {
      setLoading(false);
    }
  };

  // Driver accepts request from this ride
  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await api.bookings.accept(requestId);
      if (res.success) {
        setActionSuccess('Passenger request accepted! Available seats updated.');
        fetchRideAndBookingDetails();
      }
    } catch (err) {
      setError(err.message || 'Failed to accept request');
    }
  };

  // Driver rejects request
  const handleRejectRequest = async (requestId) => {
    try {
      const res = await api.bookings.reject(requestId);
      if (res.success) {
        setActionSuccess('Passenger request rejected.');
        fetchRideAndBookingDetails();
      }
    } catch (err) {
      setError(err.message || 'Failed to reject request');
    }
  };

  // Share ride link
  const handleShareRide = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  if (loading) {
    return <LoadingSpinner text="Loading journey itinerary & live map..." />;
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
  const cleanPhone = (ride.driver?.phone || '').replace(/[^\d]/g, '');

  return (
    <div style={{ padding: '3rem 0' }}>
      <div className="container">
        {/* Navigation Breadcrumb & Share Button */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <Link to="/rides" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: '#64748b', fontSize: '0.9rem', fontWeight: 600 }}>
            <ChevronLeft size={16} />
            <span>Back to Search Results</span>
          </Link>

          <button
            type="button"
            onClick={handleShareRide}
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem' }}
          >
            <Share2 size={14} />
            <span>{copySuccess ? 'Link Copied to Clipboard!' : 'Share Ride'}</span>
          </button>
        </div>

        {actionSuccess && <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess('')} />}
        {bookingError && <Alert type="error" message={bookingError} onClose={() => setBookingError('')} />}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 390px', gap: '2.5rem', alignItems: 'start' }} id="ride-details-grid">
          {/* Left Column: Ride Journey, Live Map & Driver Details */}
          <div>
            {/* Journey Header Card */}
            <div className="card" style={{ padding: '2rem', marginBottom: '1.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
                <span className={`badge badge-${ride.status}`}>
                  {ride.status.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.88rem', color: '#64748b' }}>
                  Posted on {new Date(ride.createdAt).toLocaleDateString()}
                </span>
              </div>

              {/* Itinerary Visualization */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative', paddingLeft: '1.5rem' }}>
                <div style={{ position: 'absolute', left: '6px', top: '10px', bottom: '10px', width: '2px', backgroundColor: 'var(--accent)' }} />

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-1.85rem', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent)', border: '2px solid #ffffff', boxShadow: '0 0 0 2px var(--accent)' }} />
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>PICKUP POINT (A)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{ride.source}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem', marginTop: '0.2rem' }}>
                    <Calendar size={15} color="var(--accent)" />
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <Clock size={15} color="var(--accent)" />
                    <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{ride.departureTime}</span>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: '-1.85rem', top: '2px', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#ef4444', border: '2px solid #ffffff', boxShadow: '0 0 0 2px #ef4444' }} />
                  <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>DROP-OFF POINT (B)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary)' }}>{ride.destination}</div>
                  <div style={{ color: '#64748b', fontSize: '0.88rem', marginTop: '0.2rem' }}>
                    Express drop-off along the national highway corridor
                  </div>
                </div>
              </div>

              {ride.description && (
                <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '0.6rem' }}>Driver Notes & Luggage Rules</h3>
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
                  <span>Live GPS Tracking & Route Waypoints</span>
                </h3>
                <span className="badge badge-active" style={{ fontSize: '0.75rem' }}>
                  Interactive Map
                </span>
              </div>
              <RideMap
                source={ride.source}
                destination={ride.destination}
                driverName={ride.driver?.name}
                vehicleModel={`${ride.vehicleDetails?.make || ''} ${ride.vehicleDetails?.model || ''}`.trim() || 'Cab'}
                height="430px"
                interactiveTracking={true}
              />
            </div>

            {/* If Logged-in user is the Driver of this ride: Show Passenger Requests on this ride */}
            {isDriverOfRide && (
              <div className="card" style={{ padding: '1.75rem', marginBottom: '1.75rem', borderColor: 'var(--accent)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Users size={18} color="var(--accent)" />
                    <span>Passenger Requests for this Ride ({rideRequests.length})</span>
                  </h3>
                  <button
                    type="button"
                    onClick={handleCancelRideAsDriver}
                    className="btn btn-outline btn-sm"
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    <Trash2 size={14} />
                    <span>Cancel This Ride</span>
                  </button>
                </div>

                {rideRequests.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                    No passenger requests for this ride yet. They will appear here when submitted.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {rideRequests.map((req) => (
                      <div
                        key={req._id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.85rem 1rem',
                          backgroundColor: '#f8fafc',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border)',
                          flexWrap: 'wrap',
                          gap: '0.75rem'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>
                            {req.passenger?.name} ({req.seatsBooked} seat{req.seatsBooked > 1 ? 's' : ''})
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                            {req.passenger?.phone} • ₹{req.totalFare}
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span className={`badge badge-${req.status}`}>{req.status}</span>
                          {req.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleAcceptRequest(req._id)}
                                className="btn btn-primary btn-sm"
                                style={{ padding: '0.25rem 0.6rem' }}
                              >
                                <Check size={14} />
                                <span>Accept</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectRequest(req._id)}
                                className="btn btn-outline btn-sm"
                                style={{ padding: '0.25rem 0.6rem' }}
                              >
                                <X size={14} />
                                <span>Decline</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Vehicle & Safety Specs Card */}
            <div className="card" style={{ padding: '1.75rem', marginBottom: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Car size={20} color="var(--accent)" />
                <span>Vehicle Specifications</span>
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '1.25rem' }}>
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Car Model</span>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                    {ride.vehicleDetails?.make || ''} {ride.vehicleDetails?.model || 'Standard Sedan'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Color</span>
                  <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--primary)', marginTop: '0.2rem' }}>
                    {ride.vehicleDetails?.color || 'White'}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>License Registration</span>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)', marginTop: '0.2rem', fontFamily: 'monospace' }}>
                    {ride.vehicleDetails?.licensePlate || 'Registered'}
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Profile & Direct Contact Card */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', marginBottom: '1.25rem' }}>Driver Contact & Profile</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
                {ride.driver?.profileImage ? (
                  <img src={ride.driver.profileImage} alt={ride.driver.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 800 }}>
                    {driverInitial}
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--primary)' }}>
                      {ride.driver?.name}
                    </span>
                    <span className="badge badge-active" style={{ fontSize: '0.72rem' }}>
                      <ShieldCheck size={12} />
                      <span>Verified Driver</span>
                    </span>
                  </div>

                  {/* Direct Contact Buttons */}
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.75rem', flexWrap: 'wrap' }}>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Phone size={13} />
                      <span>Call ({ride.driver?.phone})</span>
                    </a>

                    <a
                      href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(ride.driver?.name || '')},%20I%20am%20inquiring%20about%20your%20ride%20from%20${encodeURIComponent(ride.source)}%20to%20${encodeURIComponent(ride.destination)}%20on%20RideTogether.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-sm"
                      style={{ backgroundColor: '#25D366', color: '#ffffff', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <MessageCircle size={13} />
                      <span>WhatsApp Driver</span>
                    </a>

                    <a
                      href={`mailto:${ride.driver?.email}?subject=RideTogether%20Carpool%20Query`}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Mail size={13} />
                      <span>Email</span>
                    </a>
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

            {/* State A: Current User already booked this ride */}
            {myExistingBooking ? (
              <div style={{ backgroundColor: 'var(--accent-soft)', border: '1px solid var(--accent)', borderRadius: 'var(--radius-md)', padding: '1.25rem', textAlign: 'center' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto' }}>
                  <CheckCircle2 size={24} />
                </div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.3rem', color: 'var(--primary)' }}>
                  You Have Reserved Seats!
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#065f46', marginBottom: '1rem' }}>
                  Status: <strong style={{ textTransform: 'uppercase' }}>{myExistingBooking.status}</strong><br />
                  {myExistingBooking.seatsBooked} seat(s) • Total: ₹{myExistingBooking.totalFare}
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Link to="/bookings" className="btn btn-primary btn-sm btn-block">
                    View in My Reservations
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleCancelMyBooking(myExistingBooking._id)}
                    className="btn btn-outline btn-sm btn-block"
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                    disabled={bookingLoading}
                  >
                    Cancel Booking Request
                  </button>
                </div>
              </div>
            ) : isDriverOfRide ? (
              <div className="alert alert-info" style={{ fontSize: '0.88rem' }}>
                <Info size={16} />
                <span>You are the driver of this ride. You can manage incoming requests and passengers below.</span>
              </div>
            ) : user && user.role === 'driver' ? (
              <div className="alert alert-warning" style={{ fontSize: '0.88rem' }}>
                <Info size={16} />
                <div>
                  <strong>Signed in as Driver.</strong> To book a seat as a passenger, please log in with a passenger account.
                </div>
              </div>
            ) : ride.availableSeats === 0 ? (
              <div className="alert alert-error">
                <Info size={16} />
                <span>This ride is completely full. No remaining seats are available.</span>
              </div>
            ) : (
              <form onSubmit={handleBookingSubmit}>
                <div className="form-group">
                  <label className="form-label">Number of Seats to Reserve</label>
                  <select
                    className="form-select"
                    value={selectedSeats}
                    onChange={(e) => setSelectedSeats(Number(e.target.value))}
                    disabled={bookingLoading}
                  >
                    {Array.from({ length: Math.min(ride.availableSeats, 4) }, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Seat' : 'Seats'} (₹{num * ride.farePerSeat})
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#64748b' }}>
                    <span>{selectedSeats} seat × ₹{ride.farePerSeat}</span>
                    <span>₹{totalFare}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', fontSize: '0.88rem', color: '#64748b' }}>
                    <span>Fastag & Toll Allowance</span>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>Included</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.5rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--primary)' }}>
                    <span>Total Fare</span>
                    <span style={{ color: 'var(--accent)' }}>₹{totalFare}</span>
                  </div>
                </div>

                {isAuthenticated ? (
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg btn-block"
                    disabled={bookingLoading}
                  >
                    <CheckCircle2 size={18} />
                    <span>{bookingLoading ? 'Submitting Request...' : 'Request to Book Seats'}</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    state={{ from: { pathname: `/rides/${id}` } }}
                    className="btn btn-primary btn-lg btn-block"
                  >
                    Log In to Reserve Seats
                  </Link>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', fontSize: '0.78rem', color: '#64748b', marginTop: '1rem' }}>
                  <ShieldCheck size={14} color="#10b981" />
                  <span>Instant driver notification • Free cancellation</span>
                </div>
              </form>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}
