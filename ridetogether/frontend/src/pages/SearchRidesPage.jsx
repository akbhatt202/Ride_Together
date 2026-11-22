import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import RideCard from '../components/RideCard';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import Alert from '../components/Alert';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  SlidersHorizontal,
  DollarSign,
  ArrowUpDown,
  CarFront,
  RotateCcw
} from 'lucide-react';

export default function SearchRidesPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
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

  // Fetch rides whenever query filters change
  const fetchRides = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (source.trim()) params.append('source', source.trim());
      if (destination.trim()) params.append('destination', destination.trim());
      if (date) params.append('date', date);
      if (seats) params.append('seats', seats);
      if (minFare) params.append('minFare', minFare);
      if (maxFare) params.append('maxFare', maxFare);
      if (sort) params.append('sort', sort);
      params.append('page', page);
      params.append('limit', 6);

      setSearchParams(params, { replace: true });

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

  useEffect(() => {
    fetchRides();
  }, [page, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchRides();
  };

  const handleResetFilters = () => {
    setSource('');
    setDestination('');
    setDate('');
    setSeats('1');
    setMinFare('');
    setMaxFare('');
    setSort('date_asc');
    setPage(1);
    setSearchParams({}, { replace: true });
    // Re-fetch default list
    setTimeout(() => {
      api.rides.getAll('page=1&limit=6').then((res) => {
        if (res.success) {
          setRides(res.rides || []);
          setTotalPages(res.pages || 1);
          setTotalCount(res.total || 0);
        }
      });
    }, 50);
  };

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Header Search Section */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>Find Your Ride</h1>
          <p style={{ color: '#64748b' }}>Search available carpool journeys and reserve seats instantly</p>
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
                <label className="form-label">Leaving From</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Departure city (e.g. Mumbai)"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Going To</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Destination city (e.g. Pune)"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
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
                  <option value="1">1 Seat</option>
                  <option value="2">2 Seats</option>
                  <option value="3">3 Seats</option>
                  <option value="4">4+ Seats</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Fare Range (₹ INR)</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Min"
                    value={minFare}
                    onChange={(e) => setMinFare(e.target.value)}
                    min="0"
                  />
                  <span style={{ color: '#94a3b8' }}>–</span>
                  <input
                    type="number"
                    className="form-input"
                    placeholder="Max"
                    value={maxFare}
                    onChange={(e) => setMaxFare(e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                <Search size={16} />
                <span>Apply Filters</span>
              </button>
            </form>
          </aside>

          {/* Results Main Area */}
          <main>
            {/* Top Toolbar: Results count & Sort */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ fontSize: '0.95rem', color: '#64748b' }}>
                Showing <strong style={{ color: 'var(--primary)' }}>{rides.length}</strong> of{' '}
                <strong style={{ color: 'var(--primary)' }}>{totalCount}</strong> rides available
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ArrowUpDown size={15} color="#64748b" />
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Sort by:</span>
                <select
                  className="form-select"
                  style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.85rem' }}
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                >
                  <option value="date_asc">Earliest Date</option>
                  <option value="date_desc">Latest Date</option>
                  <option value="fare_asc">Lowest Price</option>
                  <option value="fare_desc">Highest Price</option>
                </select>
              </div>
            </div>

            {loading ? (
              <LoadingSpinner text="Searching for available rides..." />
            ) : rides.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', color: '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem auto' }}>
                  <CarFront size={28} />
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No rides found</h3>
                <p style={{ color: '#64748b', maxWidth: '420px', margin: '0 auto 1.5rem auto', fontSize: '0.92rem' }}>
                  We couldn't find any published rides matching your current criteria. Try widening your date range or clearing filters.
                </p>
                <button onClick={handleResetFilters} className="btn btn-outline btn-sm">
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div>
                {rides.map((ride) => (
                  <RideCard key={ride._id} ride={ride} />
                ))}

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={(p) => setPage(p)}
                />
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
