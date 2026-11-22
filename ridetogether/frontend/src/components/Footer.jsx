import React from 'react';
import { Link } from 'react-router-dom';
import { Car, Leaf, Shield, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div className="brand-icon">
                <Car size={20} />
              </div>
              <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>Ride<span style={{ color: 'var(--accent)' }}>Together</span></span>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              The modern, community-driven carpooling platform connecting verified drivers and passengers traveling on the same route. Save money, meet friendly people, and cut carbon emissions together.
            </p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-full)', color: '#34d399', fontSize: '0.8rem', fontWeight: 600 }}>
              <Leaf size={14} />
              <span>Reduced CO₂ through smart shared mobility</span>
            </div>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.2rem' }}>Discover</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <li><Link to="/rides" style={{ color: 'inherit' }}>Search All Rides</Link></li>
              <li><Link to="/create-ride" style={{ color: 'inherit' }}>Publish a Ride</Link></li>
              <li><Link to="/rides?source=New+York&destination=Boston" style={{ color: 'inherit' }}>NY to Boston Express</Link></li>
              <li><Link to="/rides?source=San+Francisco&destination=Los+Angeles" style={{ color: 'inherit' }}>SF to LA Coastal</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.2rem' }}>Platform</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <li><Link to="/login" style={{ color: 'inherit' }}>Member Sign In</Link></li>
              <li><Link to="/register" style={{ color: 'inherit' }}>Join RideTogether</Link></li>
              <li><Link to="/driver-dashboard" style={{ color: 'inherit' }}>Driver Hub</Link></li>
              <li><Link to="/admin" style={{ color: 'inherit' }}>Admin Portal</Link></li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: '#ffffff', fontSize: '1rem', marginBottom: '1.2rem' }}>Safety & Trust</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: '#cbd5e1' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Shield size={14} color="#10b981" />
                <span>Verified Profiles</span>
              </li>
              <li><span>Zero Overbooking Guarantee</span></li>
              <li><span>Direct Driver Approval</span></li>
              <li><span>24/7 Support Hotline</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div>
            © {new Date().getFullYear()} RideTogether Inc. All rights reserved. Built for modern carpooling.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span>Made with</span>
            <Heart size={14} color="#ef4444" fill="#ef4444" />
            <span>for sustainable travel</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
