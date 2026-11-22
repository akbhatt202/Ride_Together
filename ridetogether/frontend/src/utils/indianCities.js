/**
 * Database of major Indian cities, coordinates, highway corridors, and milestones
 */

export const INDIAN_CITIES = {
  // Northern Region & Delhi NCR
  delhi: { name: 'Delhi', lat: 28.6139, lng: 77.2090, state: 'Delhi NCR' },
  'new delhi': { name: 'New Delhi', lat: 28.6139, lng: 77.2090, state: 'Delhi NCR' },
  gurgaon: { name: 'Gurgaon', lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  gurugram: { name: 'Gurugram', lat: 28.4595, lng: 77.0266, state: 'Haryana' },
  noida: { name: 'Noida', lat: 28.5355, lng: 77.3910, state: 'Uttar Pradesh' },
  'greater noida': { name: 'Greater Noida', lat: 28.4744, lng: 77.5040, state: 'Uttar Pradesh' },
  ghaziabad: { name: 'Ghaziabad', lat: 28.6692, lng: 77.4538, state: 'Uttar Pradesh' },
  faridabad: { name: 'Faridabad', lat: 28.4089, lng: 77.3178, state: 'Haryana' },
  rishikesh: { name: 'Rishikesh', lat: 30.0869, lng: 78.2676, state: 'Uttarakhand' },
  haridwar: { name: 'Haridwar', lat: 29.9457, lng: 78.1642, state: 'Uttarakhand' },
  dehradun: { name: 'Dehradun', lat: 30.3165, lng: 78.0322, state: 'Uttarakhand' },
  roorkee: { name: 'Roorkee', lat: 29.8543, lng: 77.8880, state: 'Uttarakhand' },
  mussoorie: { name: 'Mussoorie', lat: 30.4598, lng: 78.0644, state: 'Uttarakhand' },
  nainital: { name: 'Nainital', lat: 29.3919, lng: 79.4542, state: 'Uttarakhand' },
  shimla: { name: 'Shimla', lat: 31.1048, lng: 77.1734, state: 'Himachal Pradesh' },
  manali: { name: 'Manali', lat: 32.2432, lng: 77.1892, state: 'Himachal Pradesh' },
  kullu: { name: 'Kullu', lat: 31.9579, lng: 77.1095, state: 'Himachal Pradesh' },
  dharamshala: { name: 'Dharamshala', lat: 32.2190, lng: 76.3234, state: 'Himachal Pradesh' },
  chandigarh: { name: 'Chandigarh', lat: 30.7333, lng: 76.7794, state: 'Punjab / Haryana' },
  mohali: { name: 'Mohali', lat: 30.7046, lng: 76.7179, state: 'Punjab' },
  panchkula: { name: 'Panchkula', lat: 30.6942, lng: 76.8606, state: 'Haryana' },
  amritsar: { name: 'Amritsar', lat: 31.6340, lng: 74.8723, state: 'Punjab' },
  jalandhar: { name: 'Jalandhar', lat: 31.3260, lng: 75.5762, state: 'Punjab' },
  ludhiana: { name: 'Ludhiana', lat: 30.9010, lng: 75.8573, state: 'Punjab' },
  patiala: { name: 'Patiala', lat: 30.3398, lng: 76.3869, state: 'Punjab' },
  agra: { name: 'Agra', lat: 27.1767, lng: 78.0081, state: 'Uttar Pradesh' },
  mathura: { name: 'Mathura', lat: 27.4924, lng: 77.6737, state: 'Uttar Pradesh' },
  vrindavan: { name: 'Vrindavan', lat: 27.5807, lng: 77.7006, state: 'Uttar Pradesh' },
  meerut: { name: 'Meerut', lat: 28.9845, lng: 77.7064, state: 'Uttar Pradesh' },
  aligarh: { name: 'Aligarh', lat: 27.8974, lng: 78.0880, state: 'Uttar Pradesh' },
  bareilly: { name: 'Bareilly', lat: 28.3670, lng: 79.4304, state: 'Uttar Pradesh' },
  moradabad: { name: 'Moradabad', lat: 28.8351, lng: 78.7768, state: 'Uttar Pradesh' },
  lucknow: { name: 'Lucknow', lat: 26.8467, lng: 80.9462, state: 'Uttar Pradesh' },
  kanpur: { name: 'Kanpur', lat: 26.4499, lng: 80.3319, state: 'Uttar Pradesh' },
  ayodhya: { name: 'Ayodhya', lat: 26.7922, lng: 82.1998, state: 'Uttar Pradesh' },
  prayagraj: { name: 'Prayagraj', lat: 25.4358, lng: 81.8463, state: 'Uttar Pradesh' },
  allahabad: { name: 'Allahabad', lat: 25.4358, lng: 81.8463, state: 'Uttar Pradesh' },
  varanasi: { name: 'Varanasi', lat: 25.3176, lng: 82.9739, state: 'Uttar Pradesh' },
  gorakhpur: { name: 'Gorakhpur', lat: 26.7606, lng: 83.3732, state: 'Uttar Pradesh' },

  // Western & Central India
  mumbai: { name: 'Mumbai', lat: 19.0760, lng: 72.8777, state: 'Maharashtra' },
  'navi mumbai': { name: 'Navi Mumbai', lat: 19.0330, lng: 73.0297, state: 'Maharashtra' },
  thane: { name: 'Thane', lat: 19.2183, lng: 72.9781, state: 'Maharashtra' },
  pune: { name: 'Pune', lat: 18.5204, lng: 73.8567, state: 'Maharashtra' },
  nashik: { name: 'Nashik', lat: 19.9975, lng: 73.7898, state: 'Maharashtra' },
  shirdi: { name: 'Shirdi', lat: 19.7667, lng: 74.4764, state: 'Maharashtra' },
  aurangabad: { name: 'Aurangabad', lat: 19.8762, lng: 75.3433, state: 'Maharashtra' },
  'chhatrapati sambhajinagar': { name: 'Chhatrapati Sambhajinagar', lat: 19.8762, lng: 75.3433, state: 'Maharashtra' },
  kolhapur: { name: 'Kolhapur', lat: 16.7050, lng: 74.2433, state: 'Maharashtra' },
  solapur: { name: 'Solapur', lat: 17.6599, lng: 75.9064, state: 'Maharashtra' },
  nagpur: { name: 'Nagpur', lat: 21.1458, lng: 79.0882, state: 'Maharashtra' },
  amravati: { name: 'Amravati', lat: 20.9374, lng: 77.7796, state: 'Maharashtra' },
  goa: { name: 'Goa', lat: 15.2993, lng: 74.1240, state: 'Goa' },
  panaji: { name: 'Panaji', lat: 15.4909, lng: 73.8278, state: 'Goa' },
  margao: { name: 'Margao', lat: 15.2736, lng: 73.9582, state: 'Goa' },
  ahmedabad: { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, state: 'Gujarat' },
  gandhinagar: { name: 'Gandhinagar', lat: 23.2156, lng: 72.6369, state: 'Gujarat' },
  surat: { name: 'Surat', lat: 21.1702, lng: 72.8311, state: 'Gujarat' },
  vadodara: { name: 'Vadodara', lat: 22.3072, lng: 73.1812, state: 'Gujarat' },
  baroda: { name: 'Baroda', lat: 22.3072, lng: 73.1812, state: 'Gujarat' },
  rajkot: { name: 'Rajkot', lat: 22.3039, lng: 70.8022, state: 'Gujarat' },
  bhavnagar: { name: 'Bhavnagar', lat: 21.7645, lng: 72.1519, state: 'Gujarat' },
  jamnagar: { name: 'Jamnagar', lat: 22.4707, lng: 70.0577, state: 'Gujarat' },
  jaipur: { name: 'Jaipur', lat: 26.9124, lng: 75.7873, state: 'Rajasthan' },
  udaipur: { name: 'Udaipur', lat: 24.5854, lng: 73.7125, state: 'Rajasthan' },
  jodhpur: { name: 'Jodhpur', lat: 26.2389, lng: 73.0243, state: 'Rajasthan' },
  kota: { name: 'Kota', lat: 25.2138, lng: 75.8648, state: 'Rajasthan' },
  ajmer: { name: 'Ajmer', lat: 26.4499, lng: 74.6399, state: 'Rajasthan' },
  bikaner: { name: 'Bikaner', lat: 28.0229, lng: 73.3119, state: 'Rajasthan' },
  pushkar: { name: 'Pushkar', lat: 26.4897, lng: 74.5511, state: 'Rajasthan' },
  indore: { name: 'Indore', lat: 22.7196, lng: 75.8577, state: 'Madhya Pradesh' },
  bhopal: { name: 'Bhopal', lat: 23.2599, lng: 77.4126, state: 'Madhya Pradesh' },
  ujjain: { name: 'Ujjain', lat: 23.1765, lng: 75.7885, state: 'Madhya Pradesh' },
  gwalior: { name: 'Gwalior', lat: 26.2183, lng: 78.1828, state: 'Madhya Pradesh' },
  jabalpur: { name: 'Jabalpur', lat: 23.1815, lng: 79.9864, state: 'Madhya Pradesh' },
  raipur: { name: 'Raipur', lat: 21.2514, lng: 81.6296, state: 'Chhattisgarh' },

  // Southern Region
  bengaluru: { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  bangalore: { name: 'Bangalore', lat: 12.9716, lng: 77.5946, state: 'Karnataka' },
  mysuru: { name: 'Mysuru', lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  mysore: { name: 'Mysore', lat: 12.2958, lng: 76.6394, state: 'Karnataka' },
  mangaluru: { name: 'Mangaluru', lat: 12.9141, lng: 74.8560, state: 'Karnataka' },
  mangalore: { name: 'Mangalore', lat: 12.9141, lng: 74.8560, state: 'Karnataka' },
  hubballi: { name: 'Hubballi', lat: 15.3647, lng: 75.1240, state: 'Karnataka' },
  hubli: { name: 'Hubli', lat: 15.3647, lng: 75.1240, state: 'Karnataka' },
  belagavi: { name: 'Belagavi', lat: 15.8497, lng: 74.4977, state: 'Karnataka' },
  belgaum: { name: 'Belgaum', lat: 15.8497, lng: 74.4977, state: 'Karnataka' },
  chennai: { name: 'Chennai', lat: 13.0827, lng: 80.2707, state: 'Tamil Nadu' },
  coimbatore: { name: 'Coimbatore', lat: 11.0168, lng: 76.9558, state: 'Tamil Nadu' },
  madurai: { name: 'Madurai', lat: 9.9252, lng: 78.1198, state: 'Tamil Nadu' },
  trichy: { name: 'Trichy', lat: 10.7905, lng: 78.7047, state: 'Tamil Nadu' },
  salem: { name: 'Salem', lat: 11.6643, lng: 78.1460, state: 'Tamil Nadu' },
  pondicherry: { name: 'Pondicherry', lat: 11.9416, lng: 79.8083, state: 'Puducherry' },
  puducherry: { name: 'Puducherry', lat: 11.9416, lng: 79.8083, state: 'Puducherry' },
  hyderabad: { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, state: 'Telangana' },
  secunderabad: { name: 'Secunderabad', lat: 17.4399, lng: 78.4983, state: 'Telangana' },
  warangal: { name: 'Warangal', lat: 17.9689, lng: 79.5941, state: 'Telangana' },
  vijayawada: { name: 'Vijayawada', lat: 16.5062, lng: 80.6480, state: 'Andhra Pradesh' },
  visakhapatnam: { name: 'Visakhapatnam', lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh' },
  vizag: { name: 'Vizag', lat: 17.6868, lng: 83.2185, state: 'Andhra Pradesh' },
  tirupati: { name: 'Tirupati', lat: 13.6288, lng: 79.4192, state: 'Andhra Pradesh' },
  kochi: { name: 'Kochi', lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  cochin: { name: 'Cochin', lat: 9.9312, lng: 76.2673, state: 'Kerala' },
  thiruvananthapuram: { name: 'Thiruvananthapuram', lat: 8.5241, lng: 76.9366, state: 'Kerala' },
  trivandrum: { name: 'Trivandrum', lat: 8.5241, lng: 76.9366, state: 'Kerala' },
  kozhikode: { name: 'Kozhikode', lat: 11.2588, lng: 75.7804, state: 'Kerala' },
  calicut: { name: 'Calicut', lat: 11.2588, lng: 75.7804, state: 'Kerala' },

  // Eastern & North-Eastern India
  kolkata: { name: 'Kolkata', lat: 22.5726, lng: 88.3639, state: 'West Bengal' },
  howrah: { name: 'Howrah', lat: 22.5958, lng: 88.2636, state: 'West Bengal' },
  durgapur: { name: 'Durgapur', lat: 23.5204, lng: 87.3119, state: 'West Bengal' },
  asansol: { name: 'Asansol', lat: 23.6739, lng: 86.9524, state: 'West Bengal' },
  siliguri: { name: 'Siliguri', lat: 26.7271, lng: 88.3953, state: 'West Bengal' },
  darjeeling: { name: 'Darjeeling', lat: 27.0410, lng: 88.2663, state: 'West Bengal' },
  patna: { name: 'Patna', lat: 25.5941, lng: 85.1376, state: 'Bihar' },
  gaya: { name: 'Gaya', lat: 24.7914, lng: 85.0002, state: 'Bihar' },
  ranchi: { name: 'Ranchi', lat: 23.3441, lng: 85.3096, state: 'Jharkhand' },
  jamshedpur: { name: 'Jamshedpur', lat: 22.8046, lng: 86.2029, state: 'Jharkhand' },
  bhubaneswar: { name: 'Bhubaneswar', lat: 20.2961, lng: 85.8245, state: 'Odisha' },
  cuttack: { name: 'Cuttack', lat: 20.4625, lng: 85.8828, state: 'Odisha' },
  puri: { name: 'Puri', lat: 19.8135, lng: 85.8312, state: 'Odisha' },
  guwahati: { name: 'Guwahati', lat: 26.1445, lng: 91.7362, state: 'Assam' },
  shillong: { name: 'Shillong', lat: 25.5788, lng: 91.8933, state: 'Meghalaya' }
};

// Curated list for autocomplete dropdowns & suggestions
export const POPULAR_INDIAN_CITIES = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Pune',
  'Rishikesh',
  'Jaipur',
  'Ahmedabad',
  'Surat',
  'Chandigarh',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Agra',
  'Dehradun',
  'Haridwar',
  'Mysuru',
  'Nashik',
  'Goa',
  'Indore',
  'Lucknow',
  'Udaipur'
];

// Popular Highway Corridors & Real-World Landmarks for Live GPS HUD
export const CORRIDOR_MILESTONES = {
  'delhi-rishikesh': [
    'Akshardham Temple (Delhi Starting Point)',
    'Delhi-Meerut Expressway Toll Plaza',
    'Modinagar Northern Bypass',
    'Khatauli Cheetal Grand Highway Point',
    'Muzaffarnagar Toll & Ring Road',
    'Roorkee IIT Main Gate Flyover',
    'Haridwar Har Ki Pauri Bypass',
    'Raiwala Forest Section',
    'Rishikesh AIIMS Junction',
    'Tapovan / Lakshman Jhula Circle (Arrival)'
  ],
  'rishikesh-delhi': [
    'Tapovan Taxi Stand (Rishikesh Departure)',
    'Haridwar Bypass Ghats Section',
    'Roorkee Canal Expressway',
    'Muzaffarnagar Highway Rest Stop',
    'Meerut South Expressway Entry',
    'Dasna Toll Plaza',
    'Ghazipur Border / Anand Vihar',
    'Connaught Place / Central Delhi (Arrival)'
  ],
  'mumbai-pune': [
    'Dadar TT Circle (Starting Point)',
    'Chembur Diamond Garden',
    'Vashi Toll Naka / Navi Mumbai',
    'Kalamboli Expressway Entry Gate',
    'Khalapur Toll Plaza & Food Court',
    'Bhatan Tunnel (Scenic Ghats Section)',
    'Lonavala Exit / Tiger Point Cut',
    'Kamshet Paragliding Expressway Segment',
    'Somatane Toll Plaza',
    'Wakad / Hinjawadi Phase 1 (Arrival)'
  ],
  'pune-mumbai': [
    'Hinjawadi Phase 1 IT Park (Departure)',
    'Wakad Flyover & Expressway Entry',
    'Talegaon Dabhade Exit',
    'Lonavala Valley Viewpoint & Food Mall',
    'Khandala Ghats Section',
    'Khopoli Expressway Ramp',
    'Vashi Creek Bridge',
    'Sion Circle / South Mumbai (Arrival)'
  ],
  'delhi-jaipur': [
    'Dhaula Kuan / IGI Airport T3 Road',
    'Gurgaon Cyber Hub & IFFCO Chowk',
    'Kherki Daula Toll Plaza',
    'Manesar Industrial Corridor',
    'Dharuhera Highway Stop',
    'Neemrana Japanese Zone & Fort View',
    'Behror Highway Mid-way Oasis',
    'Kotputli Toll Flyover',
    'Shahpura Expressway Cut',
    'Amer Fort Foothills / Sindhi Camp (Arrival)'
  ],
  'jaipur-delhi': [
    'Sindhi Camp Central (Departure)',
    'Amer Road / Kukas Institutional Hub',
    'Shahpura Highway Plaza',
    'Behror RTDC Rest Stop',
    'Neemrana Section',
    'Rewari-Bhiwadi Cut',
    'Manesar IMT Section',
    'Gurugram Cyber City',
    'Dhaula Kuan / Central Delhi (Arrival)'
  ],
  'bengaluru-mysuru': [
    'Kengeri Satellite Town (Departure)',
    'Bidadi Thatte Idli Express Exit',
    'Ramanagara Silk City (Sholay Rocks View)',
    'Channapatna Wooden Toy Hub',
    'Maddur Tiffins Rest Stop',
    'Mandya Sugar Factory Corridor',
    'Srirangapatna Heritage River Bridge',
    'Mysuru Columbia Asia Circle (Arrival)'
  ],
  'mysuru-bengaluru': [
    'Mysore Palace North Gate (Departure)',
    'Srirangapatna Kaveri River Cross',
    'Mandya Express Flyover',
    'Channapatna Bypass',
    'Ramanagara Scenic Cut',
    'Bidadi Industrial Area',
    'Kengeri Metro Junction (Arrival)'
  ],
  'ahmedabad-surat': [
    'CTM Express Highway Entry (Departure)',
    'Nadiad Toll Plaza',
    'Anand Amul Milk City Cut',
    'Vadodara Golden Chokdi Flyover',
    'Bharuch Narmada Cable Bridge (Iconic)',
    'Ankleshwar GIDC Expressway Section',
    'Kosamba Highway Stop',
    'Kamrej Toll Plaza / Surat Ring Road (Arrival)'
  ],
  'surat-ahmedabad': [
    'Varachha / Kamrej (Departure)',
    'Ankleshwar Industrial Corridor',
    'Bharuch Narmada Bridge',
    'Vadodara Express Flyover',
    'Anand Bypass',
    'Nadiad Food Plaza',
    'Ahmedabad CTM Express Terminal (Arrival)'
  ],
  'delhi-agra': [
    'Sarita Vihar / Kalindi Kunj Border',
    'Greater Noida Pari Chowk Expressway Entry',
    'Jewar International Airport Interchange',
    'Tappal Highway Rest Plaza',
    'Mathura Vrindavan Cut',
    'Agra Water Works / Taj Expressway Exit (Arrival)'
  ],
  'chandigarh-delhi': [
    'Tribune Chowk / Zirakpur Flyover (Departure)',
    'Ambala Cantt Grand Trunk Flyover',
    'Kurukshetra Pipli Cut',
    'Karnal Oasis Highway Food Mall',
    'Panipat Elevated Expressway Toll',
    'Murthal Amrik Sukhdev Dhaba Hub',
    'Singhu Border / Mukarba Chowk (Arrival)'
  ]
};

/**
 * Intelligent City Geocoding & Coordinate Resolver
 */
export function getCityCoordinates(cityName) {
  if (!cityName) return { lat: 28.6139, lng: 77.2090, name: 'Delhi NCR' };

  // Clean and normalize input string
  const clean = cityName
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ');

  // Direct match
  if (INDIAN_CITIES[clean]) {
    return INDIAN_CITIES[clean];
  }

  // Substring or token match in predefined database
  for (const [key, val] of Object.entries(INDIAN_CITIES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return val;
    }
  }

  // Token matching for multi-word entries (e.g. "Rishikesh Uttarakhand" -> "rishikesh")
  const tokens = clean.split(' ');
  for (const token of tokens) {
    if (token.length >= 3 && INDIAN_CITIES[token]) {
      return INDIAN_CITIES[token];
    }
  }

  // Smart regional fallback: if unknown but near Northern / Western regions
  // Calculate deterministic pseudo-hash so same unknown city consistently gets same pin
  let hash = 0;
  for (let i = 0; i < clean.length; i++) {
    hash = (hash << 5) - hash + clean.charCodeAt(i);
    hash |= 0;
  }
  const latOffset = ((Math.abs(hash) % 100) / 100) * 1.5 - 0.75;
  const lngOffset = ((Math.abs(hash >> 3) % 100) / 100) * 1.5 - 0.75;

  return {
    lat: 28.6139 + latOffset, // Near Delhi NCR/North India by default
    lng: 77.2090 + lngOffset,
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
  return Math.max(15, Math.round(R * c));
}

/**
 * Generate smooth interpolated highway waypoints between source and destination
 */
export function generateRouteWaypoints(start, end, steps = 36) {
  const waypoints = [];
  const distance = calculateDistanceKm(start.lat, start.lng, end.lat, end.lng);

  // Realistic curvature to mimic national highway route
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
 * Get milestones for route tracking HUD
 */
export function getRouteMilestones(source, destination) {
  const s = (source || '').toLowerCase().trim();
  const d = (destination || '').toLowerCase().trim();

  // Look for direct corridor or reverse corridor
  for (const [key, list] of Object.entries(CORRIDOR_MILESTONES)) {
    const [c1, c2] = key.split('-');
    if ((s.includes(c1) && d.includes(c2)) || (c1.includes(s) && c2.includes(d))) {
      return list;
    }
    if ((s.includes(c2) && d.includes(c1)) || (c2.includes(s) && c1.includes(d))) {
      return [...list].reverse();
    }
  }

  // Realistic generic highway milestones
  return [
    `Departing from ${source} City Limits`,
    `Toll Plaza Entry & Fastag Lane`,
    `National Highway Inter-State Corridor`,
    `Mid-way Highway Food Oasis & Rest Stop`,
    `Bypass Road & Ring Road Junction`,
    `State Border Crossing Section`,
    `Outer Expressway Flyover`,
    `Approaching ${destination} City Limits`,
    `Arrived at ${destination} Drop-off Point`
  ];
}
