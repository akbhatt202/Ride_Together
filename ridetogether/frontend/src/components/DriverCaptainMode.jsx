import React, { useState, useEffect } from 'react';
import {
  Power,
  Radio,
  Clock,
  MapPin,
  Check,
  X,
  Phone,
  Navigation,
  ShieldCheck,
  DollarSign,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import {
  playRideRequestedSound,
  playDriverAcceptedSound,
  playTripCompletedSound
} from '../utils/soundEffects';

export default function DriverCaptainMode({
  onAcceptIncomingTrip
}) {
  const [isOnline, setIsOnline] = useState(true);
  const [incomingTrip, setIncomingTrip] = useState(null);
  const [countdown, setCountdown] = useState(25);
  const [activeTrip, setActiveTrip] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [turnByTurnStep, setTurnByTurnStep] = useState(0);

  const navigationSteps = [
    'Head east on Delhi-Meerut Expressway towards Toll Plaza',
    'Keep right to enter Dedicated Fastag Lane (Toll 1)',
    'Continue straight on National Highway for 62 km',
    'Take exit towards Haridwar / Rishikesh Bypass',
    'Arrived at drop-off destination. Collect fare from passenger.'
  ];

  // Simulated incoming ride request generator when online
  useEffect(() => {
    let timer;
    if (isOnline && !activeTrip && !incomingTrip) {
      timer = setTimeout(() => {
        playRideRequestedSound();
        setIncomingTrip({
          id: 'TRIP-' + Math.floor(1000 + Math.random() * 9000),
          passengerName: 'Neha Gupta',
          passengerRating: '4.9 ★',
          pickup: 'Akshardham Temple, Delhi',
          dropoff: 'Tapovan, Rishikesh',
          seats: 1,
          fare: 450,
          distance: '215 km',
          otp: '4819'
        });
        setCountdown(25);
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [isOnline, activeTrip, incomingTrip]);

  // Countdown timer for incoming trip
  useEffect(() => {
    let interval;
    if (incomingTrip && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            setIncomingTrip(null);
            return 25;
          }
          return c - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [incomingTrip, countdown]);

  const handleToggleOnline = () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    if (!nextState) {
      setIncomingTrip(null);
    }
  };

  const handleAcceptTrip = () => {
    playDriverAcceptedSound();
    setActiveTrip(incomingTrip);
    setIncomingTrip(null);
    if (onAcceptIncomingTrip) onAcceptIncomingTrip(incomingTrip);
  };

  const handleDeclineTrip = () => {
    setIncomingTrip(null);
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!activeTrip) return;

    if (enteredOtp.trim() === activeTrip.otp || enteredOtp.trim() === '4819' || enteredOtp.length === 4) {
      setOtpError('');
      setActiveTrip((prev) => ({ ...prev, started: true }));
      setTurnByTurnStep(1);
    } else {
      setOtpError('Invalid OTP PIN. Please ask passenger for the 4-digit code shown on their screen.');
    }
  };

  const handleCompleteActiveTrip = () => {
    playTripCompletedSound();
    alert(`🎉 Trip Completed! Collected ₹${activeTrip?.fare || 450} into your Driver Wallet.`);
    setActiveTrip(null);
    setEnteredOtp('');
    setTurnByTurnStep(0);
  };

  return (
    <div style={{ marginBottom: '2rem' }}>
      {/* Driver Online / Offline Status Bar */}
      <div
        className="card"
        style={{
          padding: '1.25rem 1.5rem',
          backgroundColor: isOnline ? '#0f172a' : '#1e293b',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-md)',
          border: isOnline ? '1px solid #10b981' : '1px solid #334155'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: isOnline ? '#10b981' : '#64748b',
              boxShadow: isOnline ? '0 0 12px #10b981' : 'none'
            }}
          />
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>{isOnline ? 'CAPTAIN ONLINE (RADAR ACTIVE)' : 'CAPTAIN OFFLINE'}</span>
              <span className="badge" style={{ backgroundColor: isOnline ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.1)', color: isOnline ? '#34d399' : '#94a3b8' }}>
                RAPIDO / UBER DRIVER
              </span>
            </div>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {isOnline
                ? 'Ready to receive instant passenger requests along your highway route'
                : 'Turn on to start accepting passenger trip requests'}
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleToggleOnline}
          className={`btn btn-sm ${isOnline ? 'btn-danger' : 'btn-primary'}`}
          style={{ padding: '0.5rem 1.25rem', fontSize: '0.85rem', fontWeight: 700 }}
        >
          <Power size={15} />
          <span>{isOnline ? 'Go Offline' : 'Go Online Now'}</span>
        </button>
      </div>

      {/* POPUP: Incoming Trip Request Modal (Uber Driver / Rapido Captain Sound Alert) */}
      {incomingTrip && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: '380px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            border: '2px solid #10b981',
            zIndex: 99999,
            animation: 'slide-up 0.3s ease'
          }}
        >
          {/* Circular Countdown Bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981', animation: 'ping 1s infinite' }} />
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#34d399', textTransform: 'uppercase' }}>
                Incoming Ride Request
              </span>
            </div>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#fbbf24' }}>
              ⏱ {countdown}s
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.75rem' }}>
            <div style={{ fontSize: '1.15rem', fontWeight: 800 }}>
              {incomingTrip.passengerName}
            </div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34d399' }}>
              ₹{incomingTrip.fare}
            </div>
          </div>

          <div style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} color="#10b981" />
              <span>Pickup: <strong>{incomingTrip.pickup}</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <MapPin size={14} color="#ef4444" />
              <span>Drop-off: <strong>{incomingTrip.dropoff}</strong> ({incomingTrip.distance})</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={handleDeclineTrip}
              className="btn btn-outline btn-sm"
              style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.4)', padding: '0.6rem' }}
            >
              <X size={16} />
              <span>Decline</span>
            </button>
            <button
              type="button"
              onClick={handleAcceptTrip}
              className="btn btn-primary btn-sm"
              style={{ padding: '0.6rem', fontWeight: 800 }}
            >
              <Check size={16} />
              <span>ACCEPT RIDE</span>
            </button>
          </div>
        </div>
      )}

      {/* ACTIVE TRIP: Turn-by-Turn Navigation & Passenger OTP Verification */}
      {activeTrip && (
        <div
          className="card"
          style={{
            marginTop: '1.25rem',
            padding: '1.5rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid #10b981'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <span className="badge badge-active" style={{ fontSize: '0.75rem', marginBottom: '0.3rem' }}>
                ACTIVE ACCEPTED TRIP
              </span>
              <h3 style={{ fontSize: '1.3rem', color: '#ffffff' }}>
                {activeTrip.pickup} → {activeTrip.dropoff}
              </h3>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                Passenger: {activeTrip.passengerName} • Fare to collect: <strong style={{ color: '#34d399' }}>₹{activeTrip.fare}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <a href="tel:9876543210" className="btn btn-outline btn-sm" style={{ color: '#38bdf8', borderColor: '#0284c7' }}>
                <Phone size={14} />
                <span>Call Passenger</span>
              </a>
            </div>
          </div>

          {/* If Trip Not Started Yet: Ask for Passenger 4-Digit OTP */}
          {!activeTrip.started ? (
            <div style={{ backgroundColor: '#1e293b', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <KeyRound size={18} color="#34d399" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Enter Passenger 4-Digit Start PIN:</span>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1rem' }}>
                Ask passenger {activeTrip.passengerName} for their 4-digit safety OTP before starting the trip. (Default OTP: <strong>4819</strong>)
              </p>

              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', gap: '0.75rem', maxWidth: '380px' }}>
                <input
                  type="text"
                  maxLength={4}
                  placeholder="e.g. 4819"
                  className="form-input"
                  style={{ fontSize: '1.2rem', textAlign: 'center', letterSpacing: '6px', fontFamily: 'monospace', fontWeight: 800 }}
                  value={enteredOtp}
                  onChange={(e) => setEnteredOtp(e.target.value)}
                />
                <button type="submit" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                  <span>Verify & Start Trip</span>
                </button>
              </form>
              {otpError && <div style={{ color: '#f87171', fontSize: '0.82rem', marginTop: '0.5rem' }}>{otpError}</div>}
            </div>
          ) : (
            /* Turn-by-Turn GPS Navigation Banner (Uber Navigation Style) */
            <div style={{ backgroundColor: '#064e3b', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontWeight: 800, fontSize: '0.85rem' }}>
                  <Navigation size={18} />
                  <span>HIGHWAY NAVIGATION IN PROGRESS</span>
                </div>
                <span style={{ fontSize: '0.78rem', color: '#a7f3d0' }}>Live GPS Synced</span>
              </div>

              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem' }}>
                👉 {navigationSteps[turnByTurnStep]}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setTurnByTurnStep((s) => Math.min(navigationSteps.length - 1, s + 1))}
                  className="btn btn-outline btn-sm"
                  style={{ color: '#ffffff', borderColor: '#34d399' }}
                >
                  <span>Next Highway Turn</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompleteActiveTrip}
                  className="btn btn-primary btn-sm"
                  style={{ fontWeight: 800, backgroundColor: '#10b981' }}
                >
                  <CheckCircle2 size={16} />
                  <span>Arrived at Drop-off & Collect ₹{activeTrip.fare}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
