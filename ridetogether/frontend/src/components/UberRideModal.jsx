import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  MapPin,
  X,
  CreditCard,
  QrCode,
  DollarSign,
  Phone,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import {
  playRideRequestedSound,
  playDriverAcceptedSound
} from '../utils/soundEffects';

export default function UberRideModal({
  ride,
  onClose,
  onBookingConfirmed
}) {
  const navigate = useNavigate();

  // Tier selection
  const [selectedTier, setSelectedTier] = useState('go');
  const [seats, setSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Matching lifecycle: 'select' -> 'matching' -> 'matched'
  const [matchState, setMatchState] = useState('select');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [etaArrivalMin, setEtaArrivalMin] = useState(4);

  const baseFare = ride?.farePerSeat || 350;

  const tiers = [
    {
      id: 'go',
      name: 'RideTogether Go',
      desc: 'Affordable, everyday sedan carpool',
      multiplier: 1.0,
      icon: Car,
      color: '#10b981',
      eta: '4 mins away'
    },
    {
      id: 'premier',
      name: 'RideTogether Premier',
      desc: 'Top-rated drivers, spacious SUV with AC',
      multiplier: 1.25,
      icon: Sparkles,
      color: '#3b82f6',
      eta: '6 mins away'
    },
    {
      id: 'green',
      name: 'RideTogether Green EV',
      desc: '100% Electric, zero-emission highway trip',
      multiplier: 1.1,
      icon: Zap,
      color: '#059669',
      eta: '5 mins away'
    }
  ];

  const currentTier = tiers.find((t) => t.id === selectedTier) || tiers[0];
  const calculatedFarePerSeat = Math.round(baseFare * currentTier.multiplier);
  const totalAmount = calculatedFarePerSeat * seats;

  const handleStartMatching = () => {
    setMatchState('matching');
    playRideRequestedSound();

    // Generate 4-digit safety OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedOtp(otp);

    // Simulate authentic Uber matching after 2.2 seconds
    setTimeout(() => {
      setMatchState('matched');
      playDriverAcceptedSound();
      if (onBookingConfirmed) {
        onBookingConfirmed({
          tier: currentTier.name,
          seats,
          totalFare: totalAmount,
          otp,
          paymentMethod
        });
      }
    }, 2200);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(5px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: 0
        }}
      >
        {/* Header */}
        <div
          style={{
            backgroundColor: '#0f172a',
            color: '#ffffff',
            padding: '1.25rem 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Car size={18} color="#ffffff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>Instant Carpool Booking</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {ride?.source} → {ride?.destination}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.3rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* STEP 1: Select Tier & Fare */}
        {matchState === 'select' && (
          <div style={{ padding: '1.5rem' }}>
            {/* Route Summary */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#f8fafc',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                border: '1px solid var(--border)'
              }}
            >
              <MapPin size={16} color="var(--accent)" />
              <div style={{ fontSize: '0.88rem', color: 'var(--primary)', fontWeight: 600 }}>
                Pickup: <strong>{ride?.source}</strong> • Drop-off: <strong>{ride?.destination}</strong>
              </div>
            </div>

            {/* Ride Categories (Uber / Rapido Options) */}
            <div style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ marginBottom: '0.6rem' }}>Select Ride Category</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {tiers.map((t) => {
                  const Icon = t.icon;
                  const isSelected = selectedTier === t.id;
                  const price = Math.round(baseFare * t.multiplier);
                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTier(t.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.85rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--accent)' : '1px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--accent-soft)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            backgroundColor: isSelected ? 'var(--accent)' : '#f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Icon size={20} color={isSelected ? '#ffffff' : '#475569'} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--primary)' }}>
                            {t.name}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: '#64748b' }}>
                            {t.desc} • <span style={{ color: '#10b981', fontWeight: 600 }}>{t.eta}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--primary)' }}>
                          ₹{price}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b' }}>/ seat</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Seat & Payment Options */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Passenger Seats</label>
                <select
                  className="form-select"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                >
                  <option value={1}>1 Seat (Solo)</option>
                  <option value={2}>2 Seats</option>
                  <option value={3}>3 Seats</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Payment Mode</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="upi">UPI (GPay/PhonePe)</option>
                  <option value="cash">Cash to Driver</option>
                  <option value="card">Card / NetBanking</option>
                </select>
              </div>
            </div>

            {/* Total Fare & CTA */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border)',
                paddingTop: '1rem',
                marginBottom: '1rem'
              }}
            >
              <div>
                <span style={{ fontSize: '0.82rem', color: '#64748b' }}>Total Estimated Fare</span>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--primary)' }}>
                  ₹{totalAmount}
                </div>
              </div>

              <button
                type="button"
                onClick={handleStartMatching}
                className="btn btn-primary btn-lg"
                style={{ padding: '0.75rem 1.75rem' }}
              >
                <span>Confirm {currentTier.name}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Radar Search Animation */}
        {matchState === 'matching' && (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: '100px',
                height: '100px',
                margin: '0 auto 2rem auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.2)',
                  animation: 'radar-wave 1.6s cubic-bezier(0, 0.2, 0.8, 1) infinite'
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: '-15px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(16, 185, 129, 0.1)',
                  animation: 'radar-wave 1.6s cubic-bezier(0, 0.2, 0.8, 1) 0.5s infinite'
                }}
              />
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#0f172a',
                  border: '3px solid #10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                <Car size={26} color="#34d399" />
              </div>
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--primary)' }}>
              Matching with nearby drivers...
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.92rem', maxWidth: '340px', margin: '0 auto' }}>
              Broadcasting ride request to verified drivers heading towards <strong>{ride?.destination}</strong>.
            </p>
          </div>
        )}

        {/* STEP 3: Driver Confirmed & 4-Digit Safety PIN (Uber / Rapido Style) */}
        {matchState === 'matched' && (
          <div style={{ padding: '1.75rem' }}>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 0.75rem auto'
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '1.4rem', marginBottom: '0.3rem', color: 'var(--primary)' }}>
                Ride Confirmed!
              </h3>
              <p style={{ color: '#10b981', fontWeight: 600, fontSize: '0.92rem' }}>
                Driver {ride?.driver?.name || 'Rajesh Sharma'} accepted your trip!
              </p>
            </div>

            {/* 4-Digit Safety PIN / OTP Card (Uber / Rapido Signature Feature) */}
            <div
              style={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                padding: '1.25rem',
                textAlign: 'center',
                marginBottom: '1.5rem',
                boxShadow: '0 10px 20px -5px rgba(15, 23, 42, 0.4)'
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.3rem' }}>
                START TRIP PIN / SAFETY OTP
              </div>
              <div
                style={{
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  letterSpacing: '8px',
                  color: '#34d399',
                  fontFamily: 'monospace'
                }}
              >
                {generatedOtp}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#cbd5e1', marginTop: '0.3rem' }}>
                Share this 4-digit PIN with your driver to start your ride
              </div>
            </div>

            {/* Driver & Car Summary Card */}
            <div
              style={{
                backgroundColor: '#f8fafc',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--primary)' }}>
                  {ride?.driver?.name || 'Rajesh Sharma'}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  ★ 4.9 • {ride?.vehicleDetails?.make} {ride?.vehicleDetails?.model || 'Maruti Dzire'}
                </div>
                <div
                  style={{
                    fontSize: '0.82rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: 'var(--primary)',
                    marginTop: '0.2rem'
                  }}
                >
                  {ride?.vehicleDetails?.licensePlate || 'DL-01-AB-1234'}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span className="badge badge-active">Arriving in {etaArrivalMin} min</span>
                <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--accent)', marginTop: '0.4rem' }}>
                  ₹{totalAmount}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(`/rides/${ride?._id}`);
                }}
                className="btn btn-primary btn-block"
              >
                <span>Track Ride on Live GPS Map</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes radar-wave {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
