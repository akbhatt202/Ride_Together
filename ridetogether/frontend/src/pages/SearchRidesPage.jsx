import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import RideCard from '../components/RideCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import RideMap from '../components/RideMap';
import PlaceAutocompleteInput from '../components/PlaceAutocompleteInput';
import { getGoogleMapsDirectionsUrl } from '../utils/googleMapsLoader';
import { POPULAR_INDIAN_CITIES } from '../utils/indianCities';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  SlidersHorizontal,
  DollarSign,
  ArrowUpDown,
  CarFront,
  RotateCcw,
  Sparkles,
  Compass,
  Navigation,
  ExternalLink
} from 'lucide-react';

export default function SearchRidesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showRoutePreview, setShowRoutePreview] = useState(false);

  // Filters state initialized from URL searchParams
  const [source, setSource] = useState(searchParams.get('source') || '');
  const [destination, setDestination] = useState(searchParams.get('destination') || '');
  const [date, setDate] = useState(searchParams.get('date') || '');
  const [seats, setSeats] = useState(searchParams.get('seats') || '1');
  const [minFare, setMinFare] = useState(searchParams.get('minFare') || '');
  const [maxFare, setMaxFare] = useState(searchParams.get('maxFare') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'date_asc');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  // Data state
  const [rides, setRides] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Quick route filters
  const popularQuickFilters = [
    { label: 'All Rides', source: '', destination: '' },
    { label: 'Delhi → Rishikesh', source: 'Delhi', destination: 'Rishikesh' },
    { label: 'Mumbai → Pune', source: 'Mumbai', destination: 'Pune' },
    { label: 'Delhi → Jaipur', source: 'Delhi', destination: 'Jaipur' },
    { label: 'Bengaluru → Mysuru', source: 'Bengaluru', destination: 'Mysuru' },
    { label: 'Ahmedabad → Surat', source: 'Ahmedabad', destination: 'Surat' }
  ];

  // Sync state whenever searchParams in URL change (e.g. from LandingPage or back button)
  useEffect(() => {
    const urlSource = searchParams.get('source') || '';
    const urlDest = searchParams.get('destination') || '';
    const urlDate = searchParams.get('date') || '';
    const urlSeats = searchParams.get('seats') || '1';
    const urlMin = searchParams.get('minFare') || '';
    const urlMax = searchParams.get('maxFare') || '';
    const urlSort = searchParams.get('sort') || 'date_asc';
    const urlPage = parseInt(searchParams.get('page'), 10) || 1;

    setSource(urlSource);
    setDestination(urlDest);
    setDate(urlDate);
    setSeats(urlSeats);
    setMinFare(urlMin);
    setMaxFare(urlMax);
    setSort(urlSort);
    setPage(urlPage);

    // Fetch matching rides
    fetchRidesFromQuery({
      source: urlSource,
      destination: urlDest,
      date: urlDate,
      seats: urlSeats,
      minFare: urlMin,
      maxFare: urlMax,
      sort: urlSort,
      page: urlPage
    });
  }, [searchParams]);

  // Fetch rides from backend
  const fetchRidesFromQuery = async (queryObj) => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (queryObj.source && queryObj.source.trim()) params.append('source', queryObj.source.trim());
      if (queryObj.destination && queryObj.destination.trim()) params.append('destination', queryObj.destination.trim());
      if (queryObj.date) params.append('date', queryObj.date);
      if (queryObj.seats) params.append('seats', queryObj.seats);
      if (queryObj.minFare) params.append('minFare', queryObj.minFare);
      if (queryObj.maxFare) params.append('maxFare', queryObj.maxFare);
      if (queryObj.sort) params.append('sort', queryObj.sort);
      params.append('page', queryObj.page || 1);
      params.append('limit', 6);

      const res = await api.rides.getAll(params.toString());
      if (res.success) {
        setRides(res.rides || []);
        setTotalPages(res.pages || 1);
        setTotalCount(res.total || 0);
      }
    } catch (err) {
      setError(err.message || 'Failed to search rides');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (source.trim()) params.append('source', source.trim());
    if (destination.trim()) params.append('destination', destination.trim());
    if (date) params.append('date', date);
    if (seats) params.append('seats', seats);
    if (minFare) params.append('minFare', minFare);
    if (maxFare) params.append('maxFare', maxFare);
    if (sort) params.append('sort', sort);
    params.append('page', 1);

    setSearchParams(params);
  };

  const handleQuickFilterClick = (filter) => {
    const params = new URLSearchParams();
    if (filter.source) params.append('source', filter.source);
    if (filter.destination) params.append('destination', filter.destination);
    params.append('sort', sort);
    params.append('page', 1);
    setSearchParams(params);
  };

  const handlePageChange = (newPage) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage);
    setSearchParams(params);
  };

  const handleSortChange = (newSort) => {
    setSort(newSort);
    const params = new URLSearchParams(searchParams);
    params.set('sort', newSort);
    params.set('page', 1);
    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSource('');
    setDestination('');
    setDate('');
    setSeats('1');
    setMinFare('');
    setMaxFare('');
    setSort('date_asc');
    setSearchParams(new URLSearchParams({ page: 1, sort: 'date_asc' }));
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* City Autocomplete Datalist */}
        <datalist id="search-cities">
          {POPULAR_INDIAN_CITIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>

        {/* Header Search Section */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: 700, fontSize: '0.82rem', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
            <Compass size={14} />
            <span>Search Indian Highway Corridors</span>
          </div>
          <h1 style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>Find Your Shared Ride</h1>
          <p style={{ color: '#64748b' }}>Search available carpool journeys and reserve seats instantly with verified drivers</p>
        </div>

        {/* Quick Route Filter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.75rem' }}>
          {popularQuickFilters.map((qf, idx) => {
            const isActive =
              (!qf.source && !source) ||
              (qf.source.toLowerCase() === source.toLowerCase() && qf.destination.toLowerCase() === destination.toLowerCase());
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickFilterClick(qf)}
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.82rem' }}
              >
                <span>{qf.label}</span>
              </button>
            );
          })}
        </div>

        {error && <Alert type="error" message={error} onClose={() => setError('')} />}

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }} id="search-grid-layout">
          {/* Filters Sidebar */}
          <aside className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
                <SlidersHorizontal size={18} color="var(--accent)" />
                <span>Filters</span>
              </div>
              <button
                type="button"
                onClick={handleResetFilters}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            <form onSubmit={handleSearchSubmit}>
              <div className="form-group">
                <label className="form-label">Leaving From (Source)</label>
                <PlaceAutocompleteInput
                  value={source}
                  onChange={setSource}
                  placeholder="e.g. Delhi, Uttarakhand, Mumbai"
                  icon={<MapPin size={16} color="#10b981" />}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Going To (Destination)</label>
                <PlaceAutocompleteInput
                  value={destination}
                  onChange={setDestination}
                  placeholder="e.g. Rishikesh, Maharashtra, Pune"
                  icon={<MapPin size={16} color="#ef4444" />}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Departure Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Seats Needed</label>
                <select
                  className="form-select"
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                >
                  <option value="1">1 Passenger Seat</option>
                  <option value="2">2 Passenger Seats</option>
                  <option value="3">3 Passenger Seats</option>
                  <option value="4">4 Passenger Seats</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fare Range (₹ INR)</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Min ₹"
                    value={minFare}
                    onChange={(e) => setMinFare(e.target.value)}
                    min="0"
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Max ₹"
                    value={maxFare}
                    onChange={(e) => setMaxFare(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }}>
                <Search size={16} />
                <span>Apply Filters</span>
              </button>
            </form>
          </aside>

          {/* Results Main Section */}
          <main>
            {/* Sort and Count Toolbar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', backgroundColor: '#ffffff', padding: '0.85rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.92rem', color: '#64748b' }}>
                Showing <strong>{rides.length}</strong> of <strong>{totalCount}</strong> available rides
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Sort by:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.35rem 1.75rem 0.35rem 0.75rem', fontSize: '0.85rem' }}
                  value={sort}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  <option value="date_asc">Departure Date (Earliest)</option>
                  <option value="date_desc">Departure Date (Latest)</option>
                  <option value="fare_asc">Price (Lowest to Highest)</option>
                  <option value="fare_desc">Price (Highest to Lowest)</option>
                </select>
              </div>
            </div>

            {source && destination && (
              <div style={{ marginBottom: '1.25rem', padding: '0.85rem 1.25rem', backgroundColor: '#eff6ff', borderRadius: 'var(--radius-md)', border: '1px solid #bfdbfe', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.6rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#1e40af', fontWeight: 600, fontSize: '0.9rem' }}>
                  <MapPin size={16} color="#ea4335" />
                  <span>Highway Corridor: <strong>{source}</strong> → <strong>{destination}</strong></span>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={() => setShowRoutePreview(!showRoutePreview)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.8rem', backgroundColor: '#ffffff', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <Navigation size={13} color="#2563eb" />
                    <span>{showRoutePreview ? 'Hide Route Map' : 'Preview Route Map'}</span>
                  </button>
                  <a
                    href={getGoogleMapsDirectionsUrl(source, destination)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-sm"
                    style={{ fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <ExternalLink size={13} />
                    <span>Google Maps Directions</span>
                  </a>
                </div>
              </div>
            )}

            {showRoutePreview && source && destination && (
              <div style={{ marginBottom: '1.5rem', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-md)', border: '1px solid var(--border)' }}>
                <RideMap source={source} destination={destination} height="360px" />
              </div>
            )}

            {loading ? (
              <LoadingSpinner text="Searching active highway rides..." />
            ) : rides.length === 0 ? (
              <div className="card" style={{ padding: '3.5rem 1.5rem', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto', color: '#64748b' }}>
                  <CarFront size={32} />
                </div>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>No Rides Found for this Search</h3>
                <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem auto' }}>
                  Try relaxing your search filters, or view all available inter-city rides.
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="btn btn-outline"
                >
                  <RotateCcw size={15} />
                  <span>Show All Rides</span>
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                  {rides.map((ride) => (
                    <RideCard key={ride._id} ride={ride} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
