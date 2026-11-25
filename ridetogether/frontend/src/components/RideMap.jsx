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
  getGoogleMapsApiKey,
  setGoogleMapsApiKey,
  loadGoogleMapsScript,
  getGoogleMapsDirectionsUrl
} from '../utils/googleMapsLoader';
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
  ExternalLink,
  Key,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Check,
  X
} from 'lucide-react';

const MAP_TILES = {
  streets: {
    name: 'Google Roadmap',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap, CartoDB, Google Maps Style'
  },
  satellite: {
    name: 'Google Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics'
  },
  dark: {
    name: 'Night Navigation',
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
  const leafletMapRef = useRef(null);
  const googleMapRef = useRef(null);
  const carMarkerRef = useRef(null);
  const googleCarMarkerRef = useRef(null);
  const polylineRef = useRef(null);
  const trafficLayerRef = useRef(null);

  // Map state
  const [activeEngine, setActiveEngine] = useState('leaflet'); // 'google' or 'leaflet'
  const [mapTheme, setMapTheme] = useState('streets');
  const [showTraffic, setShowTraffic] = useState(true);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(getGoogleMapsApiKey());
  const [apiStatus, setApiStatus] = useState('');

  // Live simulation telemetry
  const [isTracking, setIsTracking] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [liveSpeed, setLiveSpeed] = useState(82);
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
  const [routeWaypoints, setRouteWaypoints] = useState([]);
  const [routeDistance, setRouteDistance] = useState(0);
  const milestones = getRouteMilestones(source, destination);

  // Compute baseline geodesic route
  useEffect(() => {
    const { waypoints, distance } = generateRouteWaypoints(startCoords, endCoords, 42);
    setRouteWaypoints(waypoints);
    setRouteDistance(distance);
    setTotalDistance(distance);
    setDistanceRemaining(distance);
    setEstimatedMinutes(Math.max(15, Math.round((distance / 65) * 60)));
    setCurrentMilestone(milestones[0] || `Departed from ${source}`);
    setCurrentStepIndex(0);
    setIsTracking(false);
  }, [source, destination]);

  // Attempt Google Maps API initialization if key is present
  useEffect(() => {
    const key = getGoogleMapsApiKey();
    if (key) {
      loadGoogleMapsScript(key)
        .then((googleMaps) => {
          setActiveEngine('google');
          setApiStatus('connected');
          initGoogleMap(googleMaps);
        })
        .catch((err) => {
          console.warn('Google Maps load issue, using high-res vector fallback:', err.message);
          setActiveEngine('leaflet');
          setApiStatus(err.message === 'AUTH_FAILURE' ? 'auth_error' : 'offline');
          initLeafletMap();
        });
    } else {
      setActiveEngine('leaflet');
      initLeafletMap();
    }
  }, [source, destination, mapTheme]);

  // Initialize Official Google Maps JavaScript API
  const initGoogleMap = (googleMaps) => {
    if (!mapContainerRef.current) return;

    // Clear existing Leaflet map if present
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const mapTypeMapping = {
      streets: googleMaps.MapTypeId.ROADMAP,
      satellite: googleMaps.MapTypeId.HYBRID,
      dark: googleMaps.MapTypeId.ROADMAP
    };

    const gMap = new googleMaps.Map(mapContainerRef.current, {
      center: { lat: (startCoords.lat + endCoords.lat) / 2, lng: (startCoords.lng + endCoords.lng) / 2 },
      zoom: 9,
      mapTypeId: mapTypeMapping[mapTheme] || googleMaps.MapTypeId.ROADMAP,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: true,
      fullscreenControl: true
    });
    googleMapRef.current = gMap;

    // Traffic Layer
    const traffic = new googleMaps.TrafficLayer();
    if (showTraffic) traffic.setMap(gMap);
    trafficLayerRef.current = traffic;

    // Real Google Directions Service query
    const directionsService = new googleMaps.DirectionsService();
    const directionsRenderer = new googleMaps.DirectionsRenderer({
      map: gMap,
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#059669',
        strokeWeight: 6,
        strokeOpacity: 0.9
      }
    });

    directionsService.route(
      {
        origin: { lat: startCoords.lat, lng: startCoords.lng },
        destination: { lat: endCoords.lat, lng: endCoords.lng },
        travelMode: googleMaps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === googleMaps.DirectionsStatus.OK && result) {
          directionsRenderer.setDirections(result);
          const leg = result.routes[0]?.legs[0];
          if (leg) {
            setTotalDistance(Math.round(leg.distance.value / 1000));
            setDistanceRemaining(Math.round(leg.distance.value / 1000));
            setEstimatedMinutes(Math.round(leg.duration.value / 60));

            // Extract Google route path coordinates for vehicle animation
            const pathCoords = leg.steps.flatMap((step) =>
              step.path.map((p) => ({ lat: p.lat(), lng: p.lng() }))
            );
            if (pathCoords.length > 5) {
              setRouteWaypoints(pathCoords);
            }
          }
        }
      }
    );

    // Custom Google Markers
    new googleMaps.Marker({
      position: { lat: startCoords.lat, lng: startCoords.lng },
      map: gMap,
      title: `Pickup: ${source}`,
      icon: {
        path: googleMaps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      }
    });

    new googleMaps.Marker({
      position: { lat: endCoords.lat, lng: endCoords.lng },
      map: gMap,
      title: `Drop-off: ${destination}`,
      icon: {
        path: googleMaps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#ef4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      }
    });

    // Custom Google Car Marker
    const carMarker = new googleMaps.Marker({
      position: { lat: startCoords.lat, lng: startCoords.lng },
      map: gMap,
      title: `${driverName} (${vehicleModel})`,
      icon: {
        path: 'M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z',
        scale: 1.2,
        fillColor: '#10b981',
        fillOpacity: 1,
        strokeColor: '#0f172a',
        strokeWeight: 1.5,
        anchor: new googleMaps.Point(12, 12)
      }
    });
    googleCarMarkerRef.current = carMarker;
  };

  // Initialize Leaflet Google-styled Vector Map (Zero Downtime Fallback)
  const initLeafletMap = () => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
      scrollWheelZoom: false
    });
    leafletMapRef.current = map;

    const currentTile = MAP_TILES[mapTheme] || MAP_TILES.streets;
    L.tileLayer(currentTile.url, {
      attribution: currentTile.attribution,
      maxZoom: 18
    }).addTo(map);

    // Google-style Pin A
    const sourceIcon = L.divIcon({
      className: 'google-pin-a',
      html: `
        <div style="background:#10b981; color:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(16,185,129,0.5); border:3px solid #fff; font-weight:800; font-size:13px; font-family:sans-serif;">
          A
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    // Google-style Pin B
    const destIcon = L.divIcon({
      className: 'google-pin-b',
      html: `
        <div style="background:#ef4444; color:#fff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 4px 14px rgba(239,68,68,0.5); border:3px solid #fff; font-weight:800; font-size:13px; font-family:sans-serif;">
          B
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    L.marker([startCoords.lat, startCoords.lng], { icon: sourceIcon })
      .bindPopup(`<strong>Pickup (A):</strong> ${source}`)
      .addTo(map);

    L.marker([endCoords.lat, endCoords.lng], { icon: destIcon })
      .bindPopup(`<strong>Drop-off (B):</strong> ${destination}`)
      .addTo(map);

    const latLngs = (routeWaypoints.length > 0 ? routeWaypoints : generateRouteWaypoints(startCoords, endCoords, 42).waypoints).map(
      (pt) => [pt.lat, pt.lng]
    );

    const polyline = L.polyline(latLngs, {
      color: mapTheme === 'dark' ? '#34d399' : '#059669',
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);
    polylineRef.current = polyline;

    // Animated Rotating Car Marker
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

    try {
      map.fitBounds(polyline.getBounds(), { padding: [45, 45], maxZoom: 14 });
    } catch (e) {
      map.setView([startCoords.lat, startCoords.lng], 9);
    }
  };

  // Live Vehicle Tracking Animation Loop with Rotation & Telemetry
  useEffect(() => {
    let interval;
    const waypointsToUse = routeWaypoints.length > 0 ? routeWaypoints : [];

    if (isTracking && waypointsToUse.length > 0) {
      interval = setInterval(() => {
        setCurrentStepIndex((prevIndex) => {
          if (prevIndex >= waypointsToUse.length - 1) {
            setIsTracking(false);
            setCurrentMilestone(`Arrived at ${destination}! Trip Completed.`);
            setDistanceRemaining(0);
            setEstimatedMinutes(0);
            return prevIndex;
          }

          const prevPoint = waypointsToUse[prevIndex];
          const nextIndex = prevIndex + 1;
          const currentPoint = waypointsToUse[nextIndex];

          // Calculate vehicle heading/bearing angle in degrees
          const dLng = (currentPoint.lng - prevPoint.lng) * (Math.PI / 180);
          const lat1 = prevPoint.lat * (Math.PI / 180);
          const lat2 = currentPoint.lat * (Math.PI / 180);
          const y = Math.sin(dLng) * Math.cos(lat2);
          const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
          const bearing = Math.round((Math.atan2(y, x) * (180 / Math.PI) + 360) % 360);

          // Update Leaflet car position & rotation
          if (carMarkerRef.current) {
            carMarkerRef.current.setLatLng([currentPoint.lat, currentPoint.lng]);
            const markerEl = carMarkerRef.current.getElement();
            if (markerEl) {
              const svgEl = markerEl.querySelector('svg');
              if (svgEl) {
                svgEl.style.transform = `rotate(${bearing}deg)`;
                svgEl.style.transition = 'transform 0.3s ease';
              }
            }
          }

          // Update Google Maps car position
          if (googleCarMarkerRef.current && window.google && window.google.maps) {
            googleCarMarkerRef.current.setPosition(new window.google.maps.LatLng(currentPoint.lat, currentPoint.lng));
          }

          // Auto-center map on car
          if (autoCenter) {
            if (leafletMapRef.current) {
              leafletMapRef.current.panTo([currentPoint.lat, currentPoint.lng], { animate: true, duration: 0.4 });
            } else if (googleMapRef.current) {
              googleMapRef.current.panTo({ lat: currentPoint.lat, lng: currentPoint.lng });
            }
          }

          // Calculate remaining metrics
          const progressRatio = nextIndex / (waypointsToUse.length - 1);
          const remainingKm = Math.max(0, Math.round(totalDistance * (1 - progressRatio)));
          setDistanceRemaining(remainingKm);
          setEstimatedMinutes(Math.max(1, Math.round((remainingKm / 72) * 60)));

          // Realistic Indian highway speed fluctuation (75-92 km/h)
          const randomSpeed = Math.floor(75 + Math.random() * 17);
          setLiveSpeed(randomSpeed);

          // Milestone alert
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
  }, [isTracking, routeWaypoints, totalDistance, milestones, speedMultiplier, autoCenter, destination]);

  // Reset tracking
  const handleResetTracking = () => {
    setIsTracking(false);
    setCurrentStepIndex(0);
    setDistanceRemaining(totalDistance);
    setEstimatedMinutes(Math.round((totalDistance / 65) * 60));
    setCurrentMilestone(milestones[0]);

    if (routeWaypoints.length > 0) {
      if (carMarkerRef.current) carMarkerRef.current.setLatLng([routeWaypoints[0].lat, routeWaypoints[0].lng]);
      if (googleCarMarkerRef.current && window.google && window.google.maps) {
        googleCarMarkerRef.current.setPosition(new window.google.maps.LatLng(routeWaypoints[0].lat, routeWaypoints[0].lng));
      }
    }

    handleCenterRoute();
  };

  // Fit bounds to entire route
  const handleCenterRoute = () => {
    if (leafletMapRef.current && polylineRef.current) {
      try {
        leafletMapRef.current.fitBounds(polylineRef.current.getBounds(), { padding: [45, 45] });
      } catch (e) {}
    } else if (googleMapRef.current && window.google && window.google.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend({ lat: startCoords.lat, lng: startCoords.lng });
      bounds.extend({ lat: endCoords.lat, lng: endCoords.lng });
      googleMapRef.current.fitBounds(bounds);
    }
  };

  // Save Google Maps API Key
  const handleSaveApiKey = () => {
    setGoogleMapsApiKey(apiKeyInput);
    setShowKeyModal(false);
    window.location.reload();
  };

  const googleDirectionsUrl = getGoogleMapsDirectionsUrl(source, destination);

  const progressPercentage =
    routeWaypoints.length > 1
      ? Math.round((currentStepIndex / (routeWaypoints.length - 1)) * 100)
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
      {/* Live Tracking HUD Header (Uber & Rapido Style with Google Maps Engine) */}
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
                  backgroundColor: activeEngine === 'google' ? 'rgba(59, 130, 246, 0.25)' : 'rgba(16, 185, 129, 0.25)',
                  color: activeEngine === 'google' ? '#60a5fa' : '#34d399',
                  fontSize: '0.7rem'
                }}
              >
                {activeEngine === 'google' ? 'GOOGLE MAPS API' : 'GOOGLE STYLED VECTOR'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
              {driverName} • {vehicleModel}
            </div>
          </div>
        </div>

        {/* Live HUD Telemetry (Speed, Distance, ETA) & External Google Maps Link */}
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

          {/* Open in Official Google Maps Button */}
          <a
            href={googleDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
            style={{
              padding: '0.25rem 0.6rem',
              fontSize: '0.75rem',
              color: '#ffffff',
              borderColor: '#38bdf8',
              backgroundColor: 'rgba(56, 189, 248, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
            title="Open turn-by-turn driving route in Google Maps App"
          >
            <ExternalLink size={12} />
            <span>Google Maps</span>
          </a>

          {/* Map Layer Switcher */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginLeft: '0.2rem' }}>
            <button
              type="button"
              className={`btn btn-sm ${mapTheme === 'streets' ? 'btn-primary' : 'btn-outline'}`}
              style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem' }}
              onClick={() => setMapTheme('streets')}
            >
              Road
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
              Night
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
          <span><strong>Highway Milestone:</strong> {currentMilestone}</span>
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
            National Highway Route Milestones
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {milestones.map((m, idx) => {
              const currentIdx = Math.min(
                milestones.length - 1,
                Math.floor((currentStepIndex / (routeWaypoints.length - 1)) * milestones.length)
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

      {/* Map Canvas (Google Maps or Google-Styled Vector) */}
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

            {/* Google Maps API Key Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.2rem',
                fontSize: '0.78rem',
                fontWeight: 600
              }}
            >
              <Key size={12} />
              <span>Google API Key</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>Speed:</span>
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

      {/* Google Maps API Key Configuration Modal */}
      {showKeyModal && (
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
          <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={18} color="#3b82f6" />
                <h3 style={{ fontSize: '1.2rem', margin: 0 }}>Google Maps API Key</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Paste your Google Cloud Maps JavaScript API Key below to activate real-time Google Directions, live traffic congestion layers, and Street View.
            </p>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label">Google Maps JavaScript API Key</label>
              <input
                type="text"
                placeholder="AIzaSy..."
                className="form-input"
                style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.2rem', display: 'block' }}>
                Stored locally in your browser. Leave empty to use high-resolution Google-styled vector maps.
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => {
                  setApiKeyInput('');
                  setGoogleMapsApiKey('');
                  setShowKeyModal(false);
                  window.location.reload();
                }}
                className="btn btn-outline btn-sm"
              >
                Clear Key
              </button>
              <button
                type="button"
                onClick={handleSaveApiKey}
                className="btn btn-primary btn-sm"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS Animations */}
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
