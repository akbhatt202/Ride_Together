import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Alert from '../components/Alert';
import RideMap from '../components/RideMap';
import PlaceAutocompleteInput from '../components/PlaceAutocompleteInput';
import {
  POPULAR_INDIAN_CITIES,
  getCityCoordinates,
  calculateDistanceKm
} from '../utils/indianCities';
import {
  Car,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  FileText,
  Sparkles,
  ShieldCheck,
  Navigation,
  Compass,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { getGoogleMapsDirectionsUrl } from '../utils/googleMapsLoader';

export default function CreateRidePage() {
  const navigate = useNavigate();

  // Tomorrow's date formatted as YYYY-MM-DD
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    source: 'Delhi',
    destination: 'Rishikesh',
    departureDate: tomorrowStr,
    departureTime: '07:30 AM',
    farePerSeat: 450,
    totalSeats: 3,
    make: 'Maruti Suzuki',
    model: 'Dzire VXi',
    licensePlate: 'DL-01-AB-1234',
    color: 'Arctic White',
    description: 'Travel via Delhi-Meerut Expressway and Roorkee. Fastag equipped with AC and spacious boot space.'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Quick route presets for drivers
  const routeTemplates = [
    { source: 'Delhi', destination: 'Rishikesh', fare: 450, make: 'Maruti Suzuki', model: 'Dzire', desc: 'Via Delhi-Meerut Expressway & Roorkee.' },
    { source: 'Mumbai', destination: 'Pune', fare: 350, make: 'Hyundai', model: 'i20', desc: 'Via Mumbai-Pune Expressway with Fastag.' },
    { source: 'Delhi', destination: 'Jaipur', fare: 500, make: 'Honda', model: 'City', desc: 'Via Delhi-Jaipur Expressway, pickup at Dhaula Kuan.' },
    { source: 'Bengaluru', destination: 'Mysuru', fare: 300, make: 'Tata', model: 'Nexon', desc: 'Via 10-lane Bengaluru-Mysuru Expressway.' },
    { source: 'Ahmedabad', destination: 'Surat', fare: 450, make: 'Maruti Suzuki', model: 'Brezza', desc: 'Via National Expressway 1 with AC.' }
  ];

  const handleApplyTemplate = (tpl) => {
    setFormData((prev) => ({
      ...prev,
      source: tpl.source,
      destination: tpl.destination,
      farePerSeat: tpl.fare,
      make: tpl.make,
      model: tpl.model,
      description: tpl.desc
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  // Calculate estimated distance
  const startCoords = getCityCoordinates(formData.source);
  const endCoords = getCityCoordinates(formData.destination);
  const estimatedKm = calculateDistanceKm(startCoords.lat, startCoords.lng, endCoords.lat, endCoords.lng);
  const suggestedMinFare = Math.max(100, Math.round(estimatedKm * 1.5));
  const suggestedMaxFare = Math.max(200, Math.round(estimatedKm * 2.8));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.source || !formData.destination || !formData.departureDate || !formData.departureTime) {
      setError('Please fill in all required route and departure fields');
      return;
    }

    if (Number(formData.farePerSeat) < 0) {
      setError('Fare per seat cannot be negative');
      return;
    }

    if (Number(formData.totalSeats) < 1) {
      setError('You must offer at least 1 passenger seat');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const ridePayload = {
        source: formData.source.trim(),
        destination: formData.destination.trim(),
        departureDate: formData.departureDate,
        departureTime: formData.departureTime.trim(),
        farePerSeat: Number(formData.farePerSeat),
        totalSeats: Number(formData.totalSeats),
        vehicleDetails: {
          make: formData.make.trim(),
          model: formData.model.trim(),
          licensePlate: formData.licensePlate.trim(),
          color: formData.color.trim()
        },
        description: formData.description.trim()
      };

      const res = await api.rides.create(ridePayload);
      if (res.success && res.ride) {
        navigate(`/rides/${res.ride._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to publish ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '3rem 1rem' }}>
      <div className="container" style={{ maxWidth: '840px' }}>
        {/* City Autocomplete Datalist */}
        <datalist id="cities-list">
          {POPULAR_INDIAN_CITIES.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            <Sparkles size={16} />
            <span>Driver Ride Publishing</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Publish an Inter-City Ride</h1>
          <p style={{ color: '#64748b' }}>Share fuel expenses and travel securely with verified passengers along Indian corridors</p>
        </div>

        {/* Quick Route Preset Pills */}
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem', marginBottom: '1.75rem' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Compass size={14} color="var(--accent)" />
            <span>1-Click Popular Indian Corridor Presets:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {routeTemplates.map((tpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyTemplate(tpl)}
                className="btn btn-outline btn-sm"
                style={{
                  backgroundColor: formData.source === tpl.source && formData.destination === tpl.destination ? 'var(--accent-soft)' : '#ffffff',
                  borderColor: formData.source === tpl.source && formData.destination === tpl.destination ? 'var(--accent)' : 'var(--border)',
                  fontSize: '0.8rem'
                }}
              >
                <span>{tpl.source} → {tpl.destination}</span>
                <span style={{ fontWeight: 700, color: 'var(--accent)' }}>₹{tpl.fare}</span>
              </button>
            ))}
          </div>
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <form onSubmit={handleSubmit}>
          {/* Card 1: Route & Timing */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MapPin size={20} color="var(--accent)" />
              <span>Route & Departure Details</span>
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Leaving From (Source City / Point) *</label>
                <PlaceAutocompleteInput
                  value={formData.source}
                  onChange={(val) => setFormData((prev) => ({ ...prev, source: val }))}
                  placeholder="e.g. Delhi, Uttarakhand, Mumbai"
                  icon={<MapPin size={16} color="#10b981" />}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Going To (Destination City / Drop-off) *</label>
                <PlaceAutocompleteInput
                  value={formData.destination}
                  onChange={(val) => setFormData((prev) => ({ ...prev, destination: val }))}
                  placeholder="e.g. Rishikesh, Maharashtra, Pune"
                  icon={<MapPin size={16} color="#ef4444" />}
                  required
                />
              </div>
            </div>

            {/* Live Route Map Preview */}
            {formData.source && formData.destination && (
              <div style={{ marginTop: '1rem', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
                    <Navigation size={14} color="var(--accent)" />
                    <span>Google Maps Route Preview (~{estimatedKm} km)</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>
                      Suggested fare: ₹{suggestedMinFare} – ₹{suggestedMaxFare}
                    </span>
                    <a
                      href={getGoogleMapsDirectionsUrl(formData.source, formData.destination)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '0.75rem', color: '#0284c7', display: 'flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none', fontWeight: 600 }}
                      title="Open full driving route in Google Maps"
                    >
                      <ExternalLink size={12} />
                      <span>Google Maps</span>
                    </a>
                  </div>
                </div>
                <RideMap
                  source={formData.source}
                  destination={formData.destination}
                  driverName="You (Driver)"
                  vehicleModel={`${formData.make} ${formData.model}`}
                  height="260px"
                  interactiveTracking={false}
                />
              </div>
            )}

            <div className="form-row" style={{ marginTop: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Departure Date *</label>
                <input
                  type="date"
                  name="departureDate"
                  className="form-input"
                  value={formData.departureDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Departure Time *</label>
                <input
                  type="text"
                  name="departureTime"
                  className="form-input"
                  placeholder="e.g. 07:30 AM"
                  value={formData.departureTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Card 2: Pricing & Seats */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={20} color="var(--accent)" />
              <span>Fare & Available Seats</span>
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Fare Per Seat (₹ INR) *</label>
                <input
                  type="number"
                  name="farePerSeat"
                  className="form-input"
                  placeholder="450"
                  value={formData.farePerSeat}
                  onChange={handleChange}
                  min="0"
                  step="10"
                  required
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Standard rate: ₹{suggestedMinFare} to ₹{suggestedMaxFare} per seat for this distance
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Total Seats Available *</label>
                <select
                  name="totalSeats"
                  className="form-select"
                  value={formData.totalSeats}
                  onChange={handleChange}
                  required
                >
                  <option value={1}>1 Passenger Seat</option>
                  <option value={2}>2 Passenger Seats</option>
                  <option value={3}>3 Passenger Seats (Recommended)</option>
                  <option value={4}>4 Passenger Seats</option>
                  <option value={5}>5 Passenger Seats</option>
                  <option value={6}>6 Passenger Seats</option>
                </select>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                  Keep middle seat free for maximum passenger comfort
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Vehicle Specs */}
          <div className="card" style={{ marginBottom: '1.75rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Car size={20} color="var(--accent)" />
              <span>Vehicle Details</span>
            </h3>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vehicle Brand / Make</label>
                <input
                  type="text"
                  name="make"
                  className="form-input"
                  placeholder="e.g. Maruti Suzuki, Tata, Hyundai"
                  value={formData.make}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Car Model</label>
                <input
                  type="text"
                  name="model"
                  className="form-input"
                  placeholder="e.g. Dzire, Nexon, Creta"
                  value={formData.model}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Vehicle Registration Number</label>
                <input
                  type="text"
                  name="licensePlate"
                  className="form-input"
                  placeholder="e.g. DL-01-AB-1234, MH-12-RN-4050"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Car Color</label>
                <input
                  type="text"
                  name="color"
                  className="form-input"
                  placeholder="e.g. White, Grey, Silver"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label className="form-label">Trip Notes / Luggage / Pickup Points</label>
              <textarea
                name="description"
                className="form-textarea"
                rows="3"
                placeholder="Share your exact pickup stop (e.g. Metro station, toll gate), luggage rules, and stops along the expressway..."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/driver-dashboard')}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              <Car size={18} />
              <span>{loading ? 'Publishing Ride...' : 'Publish Ride Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
