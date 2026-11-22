import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  getCityCoordinates,
  calculateDistanceKm,
  generateRouteWaypoints,
  getRouteMilestones
} from '../utils/indianCities';
import {
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Clock,
  MapPin,
  Car,
  Radio,
  Layers,
  ChevronDown,
  ChevronUp,
  Maximize2,
  CheckCircle2
} from 'lucide-react';

const MAP_TILES = {
  streets: {
    name: 'Roadmap',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap, CartoDB'
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics'
  },
  dark: {
    name: 'Night Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap, CartoDB'
  }
};

export default function RideMap({
  source = 'Delhi',
  destination = 'Rishikesh',
  driverName = 'Rajesh Sharma',
  vehicleModel = 'Maruti Dzire',
  height = '430px',
  interactiveTracking = true
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const carMarkerRef = useRef(null);
  const polylineRef = useRef(null);

  // Live simulation states
  const [mapTheme, setMapTheme] = useState('streets');
  const [isTracking, setIsTracking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [liveSpeed, setLiveSpeed] = useState(78);
  const [distanceRemaining, setDistanceRemaining] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  const [currentMilestone, setCurrentMilestone] = useState('');
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [autoCenter, setAutoCenter] = useState(true);
  const [showMilestonesTimeline, setShowMilestonesTimeline] = useState(false);

  // Route calculation
  const startCoords = getCityCoordinates(source);
  const endCoords = getCityCoordinates(destination);
  const { waypoints, distance } = generateRouteWaypoints(startCoords, endCoords, 40);
  const milestones = getRouteMilestones(source, destination);

  useEffect(() => {
    setTotalDistance(distance);
    setDistanceRemaining(distance);
    setEstimatedMinutes(Math.max(15, Math.round((distance / 65) * 60))); // ~65 km/h avg highway speed
    setCurrentMilestone(milestones[0] || `Departed from ${source}`);
    setCurrentStepIndex(0);
    setIsTracking(false);
  }, [source, destination, distance]);

  // Initialize or update Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    });
    mapInstanceRef.current = map;

    // Add Tile Layer
    const currentTile = MAP_TILES[mapTheme] || MAP_TILES.streets;
    const tileLayer = L.tileLayer(currentTile.url, {
      attribution: currentTile.attribution,
      maxZoom: 18
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // Custom Icon for Source (Green Pickup Pin)
    const sourceIcon = L.divIcon({
      className: 'custom-map-pin start',
      html: `
        <div style="background:#10b981; color:#ffffff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(16,185,129,0.5); border:3px solid #ffffff; font-weight:800; font-size:13px; font-family:sans-serif;">
          A
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // Custom Icon for Destination (Red Dropoff Pin)
    const destIcon = L.divIcon({
      className: 'custom-map-pin end',
      html: `
        <div style="background:#ef4444; color:#ffffff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(239,68,68,0.5); border:3px solid #ffffff; font-weight:800; font-size:13px; font-family:sans-serif;">
          B
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // Add Pickup & Dropoff Markers
    L.marker([startCoords.lat, startCoords.lng], { icon: sourceIcon })
      .bindPopup(`<strong>Pickup:</strong> ${source}<br/><span style="color:#64748b; font-size:12px;">Start Point</span>`)
      .addTo(map);

    L.marker([endCoords.lat, endCoords.lng], { icon: destIcon })
      .bindPopup(`<strong>Drop-off:</strong> ${destination}<br/><span style="color:#64748b; font-size:12px;">Destination Point</span>`)
      .addTo(map);

    // Highway Route Polyline
    const latLngs = waypoints.map((pt) => [pt.lat, pt.lng]);
    const routePolyline = L.polyline(latLngs, {
      color: mapTheme === 'dark' ? '#34d399' : '#059669',
      weight: 5,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    polylineRef.current = routePolyline;

    // Custom Uber/Rapido Animated Car Marker
    const carIcon = L.divIcon({
      className: 'uber-live-car-marker',
      html: `
        <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
          <div style="position:absolute; width:40px; height:40px; border-radius:50%; background:rgba(16,185,129,0.3); animation:pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;"></div>
          <div style="width:32px; height:32px; border-radius:50%; background:#0f172a; border:2.5px solid #10b981; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 12px rgba(0,0,0,0.4); z-index:10;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#34d399" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
              <circle cx="7.5" cy="14.5" r="1.5"/>
              <circle cx="16.5" cy="14.5" r="1.5"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    const carMarker = L.marker([startCoords.lat, startCoords.lng], {
      icon: carIcon,
      zIndexOffset: 1000
    }).addTo(map);

    carMarkerRef.current = carMarker;

    // Fit map bounds with padding
    try {
      map.fitBounds(routePolyline.getBounds(), {
        padding: [45, 45],
        maxZoom: 14
      });
    } catch (e) {
      map.setView([startCoords.lat, startCoords.lng], 9);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [source, destination, mapTheme]);

  // Live Vehicle Tracking Animation Loop (Uber / Rapido Style)
  useEffect(() => {
    let interval;

    if (isTracking && waypoints.length > 0) {
      interval = setInterval(() => {
        setCurrentStepIndex((prevIndex) => {
          if (prevIndex >= waypoints.length - 1) {
            setIsTracking(false);
            setCurrentMilestone(`Arrived at ${destination}! Trip Completed.`);
            setDistanceRemaining(0);
            setEstimatedMinutes(0);
            return prevIndex;
          }

          const nextIndex = prevIndex + 1;
          const currentPoint = waypoints[nextIndex];

          // Move the live car marker
          if (carMarkerRef.current) {
            carMarkerRef.current.setLatLng([currentPoint.lat, currentPoint.lng]);
          }

          // Auto-center map on car if enabled
          if (autoCenter && mapInstanceRef.current) {
            mapInstanceRef.current.panTo([currentPoint.lat, currentPoint.lng], {
              animate: true,
              duration: 0.4
            });
          }

          // Calculate remaining metrics
          const progressRatio = nextIndex / (waypoints.length - 1);
          const remainingKm = Math.max(0, Math.round(distance * (1 - progressRatio)));
          setDistanceRemaining(remainingKm);
          setEstimatedMinutes(Math.max(1, Math.round((remainingKm / 70) * 60)));

          // Fluctuating realistic Indian highway speed (72-92 km/h)
          const randomSpeed = Math.floor(72 + Math.random() * 18);
          setLiveSpeed(randomSpeed);

          // Update milestone text based on progress
          const milestoneIndex = Math.min(
            milestones.length - 1,
            Math.floor(progressRatio * milestones.length)
          );
          setCurrentMilestone(milestones[milestoneIndex]);

          return nextIndex;
        });
      }, 700 / speedMultiplier);
    }

    return () => clearInterval(interval);
  }, [isTracking, waypoints, distance, milestones, speedMultiplier, autoCenter, destination]);

  // Reset live tracking simulation
  const handleResetTracking = () => {
    setIsTracking(false);
    setCurrentStepIndex(0);
    setDistanceRemaining(distance);
    setEstimatedMinutes(Math.round((distance / 65) * 60));
    setCurrentMilestone(milestones[0]);

    if (carMarkerRef.current && waypoints.length > 0) {
      carMarkerRef.current.setLatLng([waypoints[0].lat, waypoints[0].lng]);
    }

    if (mapInstanceRef.current && polylineRef.current) {
      try {
        mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), {
          padding: [45, 45]
        });
      } catch (e) {}
    }
  };

  const handleCenterRoute = () => {
    if (mapInstanceRef.current && polylineRef.current) {
      try {
        mapInstanceRef.current.fitBounds(polylineRef.current.getBounds(), {
          padding: [45, 45]
        });
      } catch (e) {}
    }
  };

  const progressPercentage =
    waypoints.length > 1
      ? Math.round((currentStepIndex / (waypoints.length - 1)) * 100)
      : 0;

  return (
    <div
      className="ride-map-wrapper"
      style={{
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        border: '1px solid var(--border)',
        backgroundColor: '#ffffff',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '1.5rem'
      }}
    >
      {/* Live Tracking HUD Header (Uber & Rapido Style) */}
      <div
        style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '1rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: isTracking ? '#10b981' : '#f59e0b',
              boxShadow: isTracking ? '0 0 10px #10b981' : 'none'
            }}
          />
          <div>
            <div style={{ fontSize: '0.92rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Live GPS Ride Tracking</span>
              <span
                className="badge"
                style={{
                  backgroundColor: isTracking ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.1)',
                  color: isTracking ? '#34d399' : '#cbd5e1',
                  fontSize: '0.7rem'
                }}
              >
                {isTracking ? 'GPS SIMULATING' : 'READY TO TRACK'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {driverName} • {vehicleModel}
            </div>
          </div>
        </div>

        {/* Live HUD Telemetry (Speed, Distance, ETA) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Gauge size={16} color="#34d399" />
            <span><strong>{isTracking ? liveSpeed : 0}</strong> km/h</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <MapPin size={16} color="#38bdf8" />
            <span><strong>{distanceRemaining}</strong> km left</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={16} color="#fbbf24" />
            <span>ETA: <strong>{estimatedMinutes}</strong> min</span>
          </div>

          {/* Map Layer Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.5rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${mapTheme === 'streets' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              onClick={() => setMapTheme('streets')}
            >
              Street
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mapTheme === 'satellite' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              onClick={() => setMapTheme('satellite')}
            >
              Satellite
            </button>
            <button
              type="button"
              className={`btn btn-sm ${mapTheme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              onClick={() => setMapTheme('dark')}
            >
              Dark
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar & Current Milestone Alert */}
      <div
        style={{
          backgroundColor: '#1e293b',
          padding: '0.6rem 1.25rem',
          color: '#e2e8f0',
          fontSize: '0.82rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid rgba(255,255,255,0.08)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          <Radio size={14} color="#34d399" style={{ flex: 'none', animation: isTracking ? 'spin 3s linear infinite' : 'none' }} />
          <span><strong>Current Milestone:</strong> {currentMilestone}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 'none' }}>
          <button
            type="button"
            onClick={() => setShowMilestonesTimeline(!showMilestonesTimeline)}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.2rem'
            }}
          >
            <span>{showMilestonesTimeline ? 'Hide Waypoints' : 'View Highway Route'}</span>
            {showMilestonesTimeline ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
          <span style={{ fontWeight: 700, color: '#34d399' }}>
            {progressPercentage}% Completed
          </span>
        </div>
      </div>

      {/* Progress Line */}
      <div style={{ width: '100%', height: '3px', backgroundColor: '#334155' }}>
        <div
          style={{
            width: `${progressPercentage}%`,
            height: '100%',
            backgroundColor: '#10b981',
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      {/* Collapsible Highway Milestones Timeline */}
      {showMilestonesTimeline && (
        <div
          style={{
            backgroundColor: '#0f172a',
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #334155',
            color: '#cbd5e1',
            maxHeight: '180px',
            overflowY: 'auto'
          }}
        >
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            National Highway Checkpoints & Corridors
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {milestones.map((m, idx) => {
              const currentIdx = Math.min(
                milestones.length - 1,
                Math.floor((currentStepIndex / (waypoints.length - 1)) * milestones.length)
              );
              const isPassed = idx <= currentIdx;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: isPassed ? '#10b981' : '#64748b'
                    }}
                  />
                  <span style={{ color: isPassed ? '#ffffff' : '#94a3b8', fontWeight: isPassed ? 600 : 400 }}>
                    {idx + 1}. {m}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaflet Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: '100%',
          height: height,
          backgroundColor: '#e5e7eb',
          zIndex: 1
        }}
      />

      {/* Map Control Toolbar */}
      {interactiveTracking && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {!isTracking ? (
              <button
                type="button"
                onClick={() => setIsTracking(true)}
                className="btn btn-primary btn-sm"
              >
                <Play size={14} />
                <span>Start Live Tracking</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsTracking(false)}
                className="btn btn-outline btn-sm"
              >
                <Pause size={14} />
                <span>Pause Tracking</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleResetTracking}
              className="btn btn-outline btn-sm"
              title="Reset live tracking"
            >
              <RotateCcw size={14} />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={handleCenterRoute}
              className="btn btn-outline btn-sm"
              title="Fit entire highway route"
            >
              <Maximize2 size={14} />
              <span>Fit Route</span>
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.82rem', color: '#64748b' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={autoCenter}
                onChange={(e) => setAutoCenter(e.target.checked)}
              />
              <span>Auto-Follow Vehicle</span>
            </label>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>Simulation Speed:</span>
              <button
                type="button"
                className={`btn btn-sm ${speedMultiplier === 1 ? 'btn-navy' : 'btn-outline'}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => setSpeedMultiplier(1)}
              >
                1x
              </button>
              <button
                type="button"
                className={`btn btn-sm ${speedMultiplier === 3 ? 'btn-navy' : 'btn-outline'}`}
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                onClick={() => setSpeedMultiplier(3)}
              >
                3x Fast
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leaflet CSS Animation Injection */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.6); opacity: 0.9; }
          100% { transform: scale(1.6); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          font-family: inherit;
        }
      `}</style>
    </div>
  );
}
