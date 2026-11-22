import React, { useState } from 'react';
import {
  ShieldAlert,
  Phone,
  MessageCircle,
  QrCode,
  Star,
  CheckCircle2,
  AlertTriangle,
  X,
  Send,
  Navigation,
  Clock,
  Car,
  DollarSign,
  Share2,
  FileText
} from 'lucide-react';
import {
  playTripCompletedSound,
  playSosAlertSound
} from '../utils/soundEffects';

export default function LiveTripExperience({
  booking,
  ride,
  onTripCompleted
}) {
  const [tripStage, setTripStage] = useState(booking?.tripStatus || 'in_progress'); // 'in_progress', 'completed'
  const [showSosModal, setShowSosModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  // Chat simulator state
  const [chatMessages, setChatMessages] = useState([
    { sender: 'driver', text: `Hi! I am heading towards ${ride?.source} pickup point. See you soon!`, time: 'Just now' }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Rating & Tip state
  const [rating, setRating] = useState(5);
  const [selectedTags, setSelectedTags] = useState(['Polite Driver', 'Clean Car']);
  const [tipAmount, setTipAmount] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const cleanPhone = (ride?.driver?.phone || '9876543210').replace(/[^\d]/g, '');
  const safetyOtp = booking?.otp || '4819';
  const totalFare = booking?.totalFare || ride?.farePerSeat || 350;

  // Handle passenger sending message in chat
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg = { sender: 'passenger', text: chatInput.trim(), time: 'Just now' };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Realistic driver auto-reply after 1.5 seconds
    setTimeout(() => {
      const driverReplies = [
        'Understood! I am about 2 minutes away.',
        'Got it, I am in the sedan with hazard lights blinking.',
        'Great, see you at the pickup spot!',
        'Traffic cleared, arriving shortly.'
      ];
      const randomReply = driverReplies[Math.floor(Math.random() * driverReplies.length)];
      setChatMessages((prev) => [...prev, { sender: 'driver', text: randomReply, time: 'Just now' }]);
    }, 1500);
  };

  const handleTriggerSos = () => {
    playSosAlertSound();
    alert('🚨 Emergency SOS Triggered! 24/7 Safety Command Center and local emergency services (112) have been alerted with your live GPS coordinates.');
  };

  const handleCompleteTrip = () => {
    setTripStage('completed');
    setShowRatingModal(true);
    playTripCompletedSound();
    if (onTripCompleted) onTripCompleted();
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleDownloadInvoice = () => {
    const invoiceText = `
=============================================
             RIDETOGETHER INVOICE
=============================================
Trip ID: ${booking?._id || 'RT-884920'}
Date: ${new Date().toLocaleDateString()}
Route: ${ride?.source} -> ${ride?.destination}
Driver: ${ride?.driver?.name || 'Rajesh Sharma'}
Vehicle: ${ride?.vehicleDetails?.make} ${ride?.vehicleDetails?.model} (${ride?.vehicleDetails?.licensePlate || 'DL-01-AB-1234'})
Passenger: You
---------------------------------------------
Base Carpool Fare: ₹${totalFare}
Fastag & Toll Allowance: ₹0 (Included)
Convenience Fee: ₹0 (Zero Surge)
Driver Tip: ₹${tipAmount}
---------------------------------------------
TOTAL PAID: ₹${totalFare + tipAmount}
Status: COMPLETED (UPI / Verified)
=============================================
Thank you for traveling sustainably with RideTogether!
    `;
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `RideTogether_Invoice_${Date.now()}.txt`;
    a.click();
  };

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      {/* Uber / Rapido In-Ride Control Card */}
      <div
        className="card"
        style={{
          padding: '1.25rem',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-md)'
        }}
      >
        {/* Active Stage & Safety PIN */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>{tripStage === 'completed' ? 'TRIP COMPLETED' : 'TRIP IN TRANSIT'}</span>
                <span className="badge" style={{ backgroundColor: 'rgba(16,185,129,0.2)', color: '#34d399', fontSize: '0.7rem' }}>
                  RAPIDO / UBER LIVE
                </span>
              </div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                {ride?.source} → {ride?.destination}
              </div>
            </div>
          </div>

          {/* 4-Digit Safety PIN Badge */}
          <div style={{ backgroundColor: '#1e293b', padding: '0.4rem 0.85rem', borderRadius: 'var(--radius-md)', textAlign: 'right', border: '1px solid #334155' }}>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8', textTransform: 'uppercase' }}>Safety PIN (OTP)</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34d399', letterSpacing: '2px', fontFamily: 'monospace' }}>
              {safetyOtp}
            </div>
          </div>
        </div>

        {/* Driver Quick Controls & Emergency Center */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
          {/* Call Driver */}
          <a
            href={`tel:${cleanPhone}`}
            className="btn btn-outline btn-sm"
            style={{
              backgroundColor: '#1e293b',
              color: '#ffffff',
              borderColor: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <Phone size={14} color="#38bdf8" />
            <span>Call Driver</span>
          </a>

          {/* In-App Chat */}
          <button
            type="button"
            onClick={() => setShowChatModal(true)}
            className="btn btn-outline btn-sm"
            style={{
              backgroundColor: '#1e293b',
              color: '#ffffff',
              borderColor: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <MessageCircle size={14} color="#34d399" />
            <span>Driver Chat</span>
          </button>

          {/* Pay via UPI / QR */}
          <button
            type="button"
            onClick={() => setShowPaymentModal(true)}
            className="btn btn-outline btn-sm"
            style={{
              backgroundColor: '#1e293b',
              color: '#ffffff',
              borderColor: '#334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <QrCode size={14} color="#fbbf24" />
            <span>Pay ₹{totalFare}</span>
          </button>

          {/* Safety SOS Shield */}
          <button
            type="button"
            onClick={() => setShowSosModal(true)}
            className="btn btn-outline btn-sm"
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              borderColor: 'rgba(239, 68, 68, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem'
            }}
          >
            <ShieldAlert size={14} color="#ef4444" />
            <span>Safety SOS</span>
          </button>

          {/* Complete Trip Simulation */}
          {tripStage !== 'completed' && (
            <button
              type="button"
              onClick={handleCompleteTrip}
              className="btn btn-primary btn-sm"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              <CheckCircle2 size={14} />
              <span>Complete Trip</span>
            </button>
          )}
        </div>
      </div>

      {/* MODAL 1: In-App Driver Chat Dialog */}
      {showChatModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
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
              maxWidth: '440px',
              height: '520px',
              display: 'flex',
              flexDirection: 'column',
              padding: 0,
              overflow: 'hidden'
            }}
          >
            {/* Chat Header */}
            <div style={{ backgroundColor: '#0f172a', color: '#ffffff', padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--accent)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  D
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{ride?.driver?.name || 'Rajesh Sharma'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399' }}>● Online • Maruti Dzire</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowChatModal(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'passenger' ? 'flex-end' : 'flex-start',
                    maxWidth: '80%'
                  }}
                >
                  <div
                    style={{
                      backgroundColor: msg.sender === 'passenger' ? 'var(--accent)' : '#ffffff',
                      color: msg.sender === 'passenger' ? '#ffffff' : 'var(--text-main)',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '12px',
                      border: msg.sender === 'passenger' ? 'none' : '1px solid var(--border)',
                      fontSize: '0.88rem',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                    }}
                  >
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#94a3b8', textAlign: msg.sender === 'passenger' ? 'right' : 'left', marginTop: '0.2rem' }}>
                    {msg.time}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick replies */}
            <div style={{ padding: '0.4rem 0.75rem', backgroundColor: '#ffffff', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.4rem', overflowX: 'auto' }}>
              {['I am at the main gate', 'Running 2 mins late', 'Traffic near toll plaza'].map((quick, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setChatInput(quick)}
                  className="btn btn-outline btn-sm"
                  style={{ fontSize: '0.72rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }}
                >
                  {quick}
                </button>
              ))}
            </div>

            {/* Chat Input Bar */}
            <form onSubmit={handleSendMessage} style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', backgroundColor: '#ffffff', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Message your driver..."
                className="form-input"
                style={{ fontSize: '0.88rem', padding: '0.5rem 0.75rem' }}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem 0.85rem' }}>
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Safety SOS Center (Uber Shield) */}
      {showSosModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div className="card" style={{ maxWidth: '420px', width: '100%', padding: '1.75rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <ShieldAlert size={32} />
            </div>

            <h3 style={{ fontSize: '1.35rem', marginBottom: '0.4rem', color: 'var(--primary)' }}>RideTogether Safety Center</h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Your ride is live monitored via GPS telemetry. In case of an emergency, tap below for instant response.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <button
                type="button"
                onClick={handleTriggerSos}
                className="btn btn-danger btn-block"
                style={{ padding: '0.8rem', fontSize: '1rem', fontWeight: 800 }}
              >
                <AlertTriangle size={18} />
                <span>Call Emergency Police (112)</span>
              </button>

              <a
                href="tel:108"
                className="btn btn-outline btn-block"
                style={{ borderColor: '#ef4444', color: '#ef4444' }}
              >
                <span>Call Ambulance (108)</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Live trip link copied! Share with friends or family on WhatsApp.');
                }}
                className="btn btn-outline btn-block"
              >
                <Share2 size={15} />
                <span>Share Live GPS Tracking Link</span>
              </button>
            </div>

            <button type="button" onClick={() => setShowSosModal(false)} className="btn btn-outline btn-sm">
              Close Safety Center
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: UPI / QR Payment Simulator */}
      {showPaymentModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '1.75rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.3rem' }}>Pay ₹{totalFare} via UPI</h3>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Scan QR code with any UPI app (GPay / PhonePe / Paytm / BHIM)
            </p>

            {/* Stylized QR Code Graphic */}
            <div style={{ width: '180px', height: '180px', margin: '0 auto 1.25rem auto', padding: '10px', border: '2px dashed var(--accent)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
              <QrCode size={140} color="#0f172a" />
            </div>

            <div style={{ backgroundColor: '#f1f5f9', padding: '0.65rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '1.25rem', fontFamily: 'monospace' }}>
              UPI ID: ridetogether.{cleanPhone}@upi
            </div>

            <button
              type="button"
              onClick={() => {
                setShowPaymentModal(false);
                alert(`Payment of ₹${totalFare} confirmed! Driver notified.`);
              }}
              className="btn btn-primary btn-block"
            >
              <CheckCircle2 size={16} />
              <span>I Have Made Payment</span>
            </button>

            <button
              type="button"
              onClick={() => setShowPaymentModal(false)}
              className="btn btn-outline btn-sm"
              style={{ marginTop: '0.75rem' }}
            >
              Pay Cash on Arrival Instead
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: Trip Rating & Tip Screen (Uber / Rapido Style) */}
      {showRatingModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div className="card" style={{ maxWidth: '460px', width: '100%', padding: '2rem', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'var(--accent-soft)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
              <CheckCircle2 size={32} />
            </div>

            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.3rem', color: 'var(--primary)' }}>
              How was your trip with {ride?.driver?.name || 'Rajesh'}?
            </h3>
            <p style={{ color: '#64748b', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Your feedback maintains high safety and courtesy across Indian expressways.
            </p>

            {/* 5-Star Rating Selector */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '0.2rem',
                    transition: 'transform 0.15s'
                  }}
                >
                  <Star
                    size={36}
                    color={star <= rating ? '#f59e0b' : '#cbd5e1'}
                    fill={star <= rating ? '#f59e0b' : 'none'}
                  />
                </button>
              ))}
            </div>

            {/* Praise Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', justifyContent: 'center', marginBottom: '1.5rem' }}>
              {['Polite Driver', 'Clean Car', 'Safe Driving', 'Fastag Fast', 'Great Music'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`btn btn-sm ${selectedTags.includes(tag) ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '0.78rem' }}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Tip Driver Selector */}
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>Add a Tip for Good Driving:</div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                {[0, 20, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setTipAmount(amt)}
                    className={`btn btn-sm ${tipAmount === amt ? 'btn-navy' : 'btn-outline'}`}
                    style={{ fontSize: '0.82rem', padding: '0.3rem 0.75rem' }}
                  >
                    {amt === 0 ? 'No Tip' : `₹${amt}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => {
                  setRatingSubmitted(true);
                  setShowRatingModal(false);
                  alert('Thank you! Your rating and tip have been recorded.');
                }}
                className="btn btn-primary btn-block"
              >
                Submit Feedback (★ {rating})
              </button>

              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="btn btn-outline btn-sm btn-block"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}
              >
                <FileText size={14} />
                <span>Download Trip Invoice & Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
