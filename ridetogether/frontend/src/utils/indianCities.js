/**
 * Database of major Indian cities, coordinates and highway corridors
 */

export const INDIAN_CITIES = {
  mumbai: { name: 'Mumbai', lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  pune: { name: 'Pune', lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  delhi: { name: 'Delhi', lat: 28.6139, lng: 77.2090, state: 'Delhi NCR' },
  'new delhi': { name: 'New Delhi', lat: 28.6139, lng: 77.2090, state: 'Delhi NCR' },
  gurgaon: { name: 'Gurgaon', lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  gurugram: { name: 'Gurugram', lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  noida: { name: 'Noida', lat: 28.5355, lng: 77.3910, state: 'Uttar Pradesh' },
  jaipur: { name: 'Jaipur', lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  agra: { name: 'Agra', lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh' },
  chandigarh: { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, state: 'Punjab / Haryana' },
  bengaluru: { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  bangalore: { name: 'Bangalore', lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  mysuru: { name: 'Mysuru', lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  mysore: { name: 'Mysore', lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  chennai: { name: 'Chennai', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  hyderabad: { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  vijayawada: { name: 'Vijayawada', lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh' },
  ahmedabad: { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  surat: { name: 'Surat', lat: 21.1702, lng: 72.8311, state: 'Gujarat' },
  vadodara: { name: 'Vadodara', lat: 22.3072, lng: 73.1812, state: 'Gujarat' },
  kolkata: { name: 'Kolkata', lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  durgapur: { name: 'Durgapur', lat: 23.5204, lng: 87.3119, state: 'West Bengal' },
  siliguri: { name: 'Siliguri', lat: 26.7271, lng: 88.3953, state: 'West Bengal' },
  lucknow: { name: 'Lucknow', lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  kanpur: { name: 'Kanpur', lat: 26.4499, lng: 80.3319, state: 'Uttar Pradesh' },
  indore: { name: 'Indore', lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
  bhopal: { name: 'Bhopal', lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh' },
  goa: { name: 'Goa', lat: 15.4909, lng: 73.8278, state: 'Goa' },
  panaji: { name: 'Panaji', lat: 15.4909, lng: 73.8278, state: 'Goa' },
  kochi: { name: 'Kochi', lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  coimbatore: { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu' }
};

// Popular corridors with real milestone landmarks for live tracking HUD
export const CORRIDOR_MILESTONES = {
  'mumbai-pune': [
    'Dadar TT Circle (Starting Point)',
    'Chembur Diamond Garden',
    'Vashi Toll Naka / Navi Mumbai',
    'Kalamboli Expressway Entry',
    'Khalapur Toll Plaza',
    'Bhatan Tunnel (Scenic Ghats)',
    'Lonavala Exit / Food Court',
    'Kamshet Paragliding Point',
    'Somatane Toll Plaza',
    'Wakad / Hinjawadi Bridge (Arrival)'
  ],
  'pune-mumbai': [
    'Hinjawadi Phase 1 (Starting Point)',
    'Wakad Flyover',
    'Talegaon Dabhade Exit',
    'Lonavala Valley Viewpoint',
    'Khandala Ghats',
    'Khopoli Expressway Section',
    'Vashi Creek Bridge',
    'Sion Circle Mumbai (Arrival)'
  ],
  'delhi-jaipur': [
    'Dhaula Kuan Delhi',
    'IFFCO Chowk Gurgaon (Starting Point)',
    'Manesar IMT Toll',
    'Dharuhera Flyover',
    'Neemrana Heritage Fort View',
    'Behror Midway Plaza',
    'Kotputli Bypass',
    'Shahpura Toll Plaza',
    'Amer Fort Foothills',
    'Sindhi Camp Jaipur (Arrival)'
  ],
  'bengaluru-mysuru': [
    'Silk Board / Kengeri (Starting Point)',
    'Bidadi Thatte Idli Hub',
    'Ramanagara (Silk City)',
    'Channapatna Toy City Bypass',
    'Maddur Tiffins Point',
    'Mandya Sugar City',
    'Srirangapatna Heritage Bridge',
    'Mysuru Palace / Suburban Bus Stand (Arrival)'
  ]
};

/**
 * Get coordinates for a given city string
 */
export function getCityCoordinates(cityName) {
  if (!cityName) return { lat: 20.5937, lng: 78.9629, name: 'India' }; // Default center of India
  const normalized = cityName.toLowerCase().trim().replace(/,\s*.*$/, ''); // strip ", state"

  for (const [key, val] of Object.entries(INDIAN_CITIES)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return val;
    }
  }

  // Fallback nearby random offset if not in main list
  return {
    lat: 19.0760 + (Math.random() * 2 - 1),
    lng: 72.8777 + (Math.random() * 2 - 1),
    name: cityName
  };
}

/**
 * Calculate distance in km between two lat/lng coordinates (Haversine Formula)
 */
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Generate smooth interpolated highway waypoints between source and destination
 */
export function generateRouteWaypoints(start, end, steps = 30) {
  const waypoints = [];
  const distance = calculateDistanceKm(start.lat, start.lng, end.lat, end.lng);

  // Slight realistic curvature to mimic national highway route
  const midLat = (start.lat + end.lat) / 2;
  const midLng = (start.lng + end.lng) / 2;
  const curveOffset = (start.lat - end.lat) * 0.08;

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Quadratic bezier curve interpolation for realistic highway bends
    const lat = (1 - t) * (1 - t) * start.lat + 2 * (1 - t) * t * (midLat + curveOffset) + t * t * end.lat;
    const lng = (1 - t) * (1 - t) * start.lng + 2 * (1 - t) * t * (midLng - curveOffset) + t * t * end.lng;
    waypoints.push({ lat, lng });
  }

  return { waypoints, distance };
}

/**
 * Get milestones for route tracking
 */
export function getRouteMilestones(source, destination) {
  const key1 = `${source.toLowerCase().trim()}-${destination.toLowerCase().trim()}`;
  const key2 = `${destination.toLowerCase().trim()}-${source.toLowerCase().trim()}`;

  if (CORRIDOR_MILESTONES[key1]) return CORRIDOR_MILESTONES[key1];
  if (CORRIDOR_MILESTONES[key2]) return [...CORRIDOR_MILESTONES[key2]].reverse();

  // Generic milestones
  return [
    `Leaving ${source} City Limits`,
    `Toll Plaza Entry • National Highway`,
    `Midway Fuel & Refreshment Stop`,
    `Approaching Highway Interchange`,
    `Entering ${destination} City Limits`
  ];
}
