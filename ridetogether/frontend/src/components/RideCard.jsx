import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users, Car, ShieldCheck } from 'lucide-react';

export default function RideCard({ ride }) {
  if (!ride) return null;

  const formattedDate = new Date(ride.departureDate).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  const driverInitial = ride.driver?.name ? ride.driver.name.charAt(0).toUpperCase() : 'D';
  const vehicleName = ride.vehicleDetails
    ? `${ride.vehicleDetails.make || ''} ${ride.vehicleDetails.model || ''}`.trim()
    : 'Standard Vehicle';

  return (
    <div className="ride-card">
      <div className="ride-card-header">
        <div className="ride-route">
          <div className="route-stop">
            <span className="route-city">{ride.source}</span>
            <span className="route-time">{ride.departureTime}</span>
          </div>

          <div className="route-arrow">
            <ArrowRight size={20} />
          </div>

          <div className="route-stop">
            <span className="route-city">{ride.destination}</span>
            <span className="route-time">Arrival City</span>
          </div>
        </div>

        <div className="ride-price-section">
          <div className="ride-price">₹{ride.farePerSeat}</div>
          <div className="ride-price-label">per seat</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem', color: '#64748b' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Calendar size={15} color="#10b981" />
          <span>{formattedDate}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={15} color="#10b981" />
          <span style={{ fontWeight: 600, color: ride.availableSeats > 0 ? '#10b981' : '#ef4444' }}>
            {ride.availableSeats} of {ride.totalSeats} seats left
          </span>
        </div>

        {vehicleName && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Car size={15} color="#64748b" />
            <span>{vehicleName}</span>
          </div>
        )}
      </div>

      <div className="ride-card-footer">
        <div className="driver-info-badge">
          {ride.driver?.profileImage ? (
            <img src={ride.driver.profileImage} alt={ride.driver.name} className="avatar-img" />
          ) : (
            <div className="avatar-img">{driverInitial}</div>
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span className="driver-name">{ride.driver?.name || 'RideTogether Driver'}</span>
              <ShieldCheck size={14} color="#10b981" title="Verified Driver" />
            </div>
            <span className="driver-vehicle">{vehicleName}</span>
          </div>
        </div>

        <Link to={`/rides/${ride._id}`} className="btn btn-outline btn-sm">
          View & Book
        </Link>
      </div>
    </div>
  );
}
