import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Building2,
  Landmark,
  Plane,
  Train,
  Navigation,
  Compass,
  X,
  Sparkles
} from 'lucide-react';
import { searchIndianPlaces } from '../utils/indianCities';
import { fetchGooglePlacesPredictions } from '../utils/googleMapsLoader';

const POPULAR_RECOMMENDATIONS = [
  { name: 'Delhi', secondaryText: 'Delhi NCR, India', badge: 'Popular Hub', category: 'city' },
  { name: 'Rishikesh', secondaryText: 'Uttarakhand, India', badge: 'Express Corridor', category: 'city' },
  { name: 'Mumbai', secondaryText: 'Maharashtra, India', badge: 'Popular Hub', category: 'city' },
  { name: 'Pune', secondaryText: 'Maharashtra, India', badge: 'Express Corridor', category: 'city' },
  { name: 'Bengaluru', secondaryText: 'Karnataka, India', badge: 'Popular Hub', category: 'city' },
  { name: 'Jaipur', secondaryText: 'Rajasthan, India', badge: 'Express Corridor', category: 'city' },
  { name: 'Chandigarh', secondaryText: 'Punjab / Haryana, India', badge: 'Popular Hub', category: 'city' },
  { name: 'Ahmedabad', secondaryText: 'Gujarat, India', badge: 'Express Corridor', category: 'city' }
];

export default function PlaceAutocompleteInput({
  value = '',
  onChange,
  onSelect,
  placeholder = 'Search city, state, or place...',
  icon = null,
  required = false,
  name = 'place',
  id = undefined,
  style = {}
}) {
  const [inputValue, setInputValue] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);

  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync external value changes
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  // Click outside listener to dismiss dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search for places, states, cities, hubs
  useEffect(() => {
    if (!inputValue || inputValue.trim().length === 0) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Query Indian States/Cities database
        const localMatches = searchIndianPlaces(inputValue, 8);

        // Query Google Places Autocomplete in parallel (if client-side API key is active)
        const googleMatches = await fetchGooglePlacesPredictions(inputValue);

        // Merge results: Google predictions first, followed by deduplicated local matches
        const seen = new Set();
        const combined = [];

        for (const item of [...googleMatches, ...localMatches]) {
          const key = item.name.toLowerCase().trim();
          if (!seen.has(key)) {
            seen.add(key);
            combined.push(item);
          }
        }

        setSuggestions(combined.slice(0, 8));
        setSelectedIndex(-1);
      } catch (err) {
        console.warn('Place search error:', err.message);
      } finally {
        setIsLoading(false);
      }
    }, 120);

    return () => clearTimeout(timer);
  }, [inputValue]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (onChange) onChange(val);
    setIsOpen(true);
  };

  const handleSelectPlace = (place) => {
    const selectedName = place.name;
    setInputValue(selectedName);
    if (onChange) onChange(selectedName);
    if (onSelect) onSelect(place);
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setInputValue('');
    if (onChange) onChange('');
    setSuggestions([]);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleKeyDown = (e) => {
    const items = suggestions.length > 0 ? suggestions : (inputValue.trim().length === 0 ? POPULAR_RECOMMENDATIONS : []);
    if (!isOpen || items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < items.length) {
        e.preventDefault();
        handleSelectPlace(items[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Render Category Icon
  const renderCategoryIcon = (category) => {
    switch (category) {
      case 'state':
        return <Landmark size={15} color="#8b5cf6" />;
      case 'airport':
        return <Plane size={15} color="#3b82f6" />;
      case 'station':
        return <Train size={15} color="#f59e0b" />;
      case 'expressway':
        return <Compass size={15} color="#10b981" />;
      case 'google':
        return <MapPin size={15} color="#ea4335" />;
      default:
        return <Building2 size={15} color="#059669" />;
    }
  };

  // Render Category Badge
  const renderBadge = (item) => {
    const bgColors = {
      State: '#f5f3ff',
      Airport: '#eff6ff',
      'Transit Hub': '#fffbeb',
      Expressway: '#ecfdf5',
      'Google Place': '#fef2f2',
      City: '#f0fdf4',
      'Popular Hub': '#f1f5f9',
      'Express Corridor': '#ecfdf5'
    };
    const textColors = {
      State: '#7c3aed',
      Airport: '#2563eb',
      'Transit Hub': '#d97706',
      Expressway: '#059669',
      'Google Place': '#dc2626',
      City: '#16a34a',
      'Popular Hub': '#475569',
      'Express Corridor': '#059669'
    };

    const label = item.badge || (item.category === 'state' ? 'State' : 'City');
    return (
      <span
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          padding: '0.15rem 0.45rem',
          borderRadius: '12px',
          backgroundColor: bgColors[label] || '#f1f5f9',
          color: textColors[label] || '#475569',
          letterSpacing: '0.2px',
          whiteSpace: 'nowrap'
        }}
      >
        {label}
      </span>
    );
  };

  const showSuggestions = isOpen && suggestions.length > 0;
  const showPopular = isOpen && inputValue.trim().length === 0;

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        ...style
      }}
    >
      {/* Leading Icon */}
      {icon && (
        <div
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
            zIndex: 2
          }}
        >
          {icon}
        </div>
      )}

      {/* Main Input Field */}
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        required={required}
        placeholder={placeholder}
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        style={{
          width: '100%',
          padding: icon ? '0.75rem 2.2rem 0.75rem 2.5rem' : '0.75rem 2.2rem 0.75rem 1rem',
          border: '1.5px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.95rem',
          outline: 'none',
          backgroundColor: '#ffffff',
          color: 'var(--primary)',
          transition: 'border-color 0.2s, box-shadow 0.2s'
        }}
      />

      {/* Clear Button */}
      {inputValue && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear input"
          style={{
            position: 'absolute',
            right: '10px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
        >
          <X size={15} />
        </button>
      )}

      {/* Predictive Autocomplete Dropdown */}
      {(showSuggestions || showPopular) && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 12px 32px rgba(15, 23, 42, 0.16), 0 2px 6px rgba(0,0,0,0.06)',
            border: '1px solid #e2e8f0',
            maxHeight: '340px',
            overflowY: 'auto',
            zIndex: 1000,
            animation: 'fadeIn 0.15s ease'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#64748b',
              backgroundColor: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Sparkles size={12} color="#10b981" />
              <span>{showPopular ? 'Popular Express Hubs & States' : 'Recommended Locations'}</span>
            </span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              {isLoading ? 'Searching...' : 'Google Maps + Fastag Directory'}
            </span>
          </div>

          {/* List of items */}
          <div style={{ padding: '0.35rem 0' }}>
            {(showSuggestions ? suggestions : POPULAR_RECOMMENDATIONS).map((item, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={idx}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectPlace(item);
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: '0.65rem 0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: isSelected ? '#f1f5f9' : 'transparent',
                    borderLeft: isSelected ? '3px solid var(--accent)' : '3px solid transparent',
                    transition: 'background-color 0.1s'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {renderCategoryIcon(item.category)}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div
                        style={{
                          fontWeight: 700,
                          fontSize: '0.92rem',
                          color: 'var(--primary)',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      >
                        {item.name}
                      </div>
                      <div
                        style={{
                          fontSize: '0.78rem',
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          textOverflow: 'ellipsis',
                          overflow: 'hidden'
                        }}
                      >
                        {item.secondaryText}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginLeft: '0.5rem', flexShrink: 0 }}>
                    {renderBadge(item)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
