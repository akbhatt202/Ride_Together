import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import Alert from '../components/Alert';
import RideMap from '../components/RideMap';
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
  Navigation
} from 'lucide-react';

export default function CreateRidePage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    source: 'Mumbai',
    destination: 'Pune',
    departureDate: '',
    departureTime: '08:00 AM',
    farePerSeat: 350,
    totalSeats: 3,
    make: 'Maruti Suzuki',
    model: 'Dzire VXi',
    licensePlate: 'MH-12-RN-4050',
    color: 'Magma Grey',
    description: 'Travel via Mumbai-Pune Expressway with comfortable seats and Fastag.'
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.source || !formData.destination || !formData.departureDate || !formData.departureTime) {
      setError('Please fill in all required route and timing fields');
      return;
    }

    if (Number(formData.farePerSeat) < 0) {
      setError('Fare per seat cannot be negative');
      return;
    }

    if (Number(formData.totalSeats) < 1) {
      setError('You must offer at least 1 seat');
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
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            <Sparkles size={16} />
            <span>Driver Ride Publishing</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>Publish a Shared Ride</h1>
          <p style={{ color: '#64748b' }}>Enter your travel itinerary and vehicle specs to offer empty seats to verified passengers</p>
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
                <label className="form-label">Leaving From (Source City) *</label>
                <input
                  type="text"
                  name="source"
                  className="form-input"
                  placeholder="e.g. Mumbai"
                  value={formData.source}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Going To (Destination City) *</label>
                <input
                  type="text"
                  name="destination"
                  className="form-input"
                  placeholder="e.g. Pune"
                  value={formData.destination}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {formData.source && formData.destination && (
              <div style={{ marginTop: '1rem', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: '#64748b', marginBottom: '0.5rem', fontWeight: 600 }}>
                  <Navigation size={14} color="var(--accent)" />
                  <span>Route Preview (Live Highway Corridors)</span>
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

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Departure Date *</label>
                <input
                  type="date"
                  name="departureDate"
                  className="form-input"
                  value={formData.departureDate}
                  onChange={handleChange}
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
                  placeholder="350"
                  value={formData.farePerSeat}
                  onChange={handleChange}
                  min="0"
                  step="10"
                  required
                />
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Fair Indian inter-city rate: ₹300 to ₹700 per seat</span>
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
                  <option value={1}>1 Seat</option>
                  <option value={2}>2 Seats</option>
                  <option value={3}>3 Seats</option>
                  <option value={4}>4 Seats</option>
                  <option value={5}>5 Seats</option>
                  <option value={6}>6 Seats</option>
                </select>
                <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Keep middle seat free for maximum passenger comfort</span>
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
                <label className="form-label">Car Make</label>
                <input
                  type="text"
                  name="make"
                  className="form-input"
                  placeholder="e.g. Toyota"
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
                  placeholder="e.g. Camry Hybrid"
                  value={formData.model}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Color</label>
                <input
                  type="text"
                  name="color"
                  className="form-input"
                  placeholder="e.g. Midnight Blue"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">License Plate (Optional)</label>
                <input
                  type="text"
                  name="licensePlate"
                  className="form-input"
                  placeholder="e.g. NY-77-XYZ"
                  value={formData.licensePlate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Trip Description & Guidelines */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="var(--accent)" />
              <span>Trip Notes & Preferences</span>
            </h3>

            <div className="form-group">
              <label className="form-label">Additional Information for Passengers</label>
              <textarea
                name="description"
                rows="3"
                className="form-textarea"
                placeholder="Mention pickup landmark, luggage space, pet friendly policy, stops along the highway, etc."
                value={formData.description}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button
              type="button"
              onClick={() => navigate('/driver-dashboard')}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? 'Publishing Ride...' : 'Publish Ride Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
