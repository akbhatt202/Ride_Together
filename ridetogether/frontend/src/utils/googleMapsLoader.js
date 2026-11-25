/**
 * Google Maps API Dynamic Loader & Geolocation Utilities
 */

let googleMapsPromise = null;

// Read API key from localStorage or Vite environment variable
export function getGoogleMapsApiKey() {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('GOOGLE_MAPS_API_KEY') ||
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY ||
    ''
  );
}

// Save user-provided Google Maps API key
export function setGoogleMapsApiKey(key) {
  if (typeof window === 'undefined') return;
  if (key && key.trim()) {
    localStorage.setItem('GOOGLE_MAPS_API_KEY', key.trim());
  } else {
    localStorage.removeItem('GOOGLE_MAPS_API_KEY');
  }
  // Reset cached promise so next load uses new key
  googleMapsPromise = null;
}

// Dynamically load Google Maps JavaScript API
export function loadGoogleMapsScript(apiKey = '') {
  const keyToUse = apiKey || getGoogleMapsApiKey();

  // If already loaded on window
  if (typeof window !== 'undefined' && window.google && window.google.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (!keyToUse) {
    return Promise.reject(new Error('NO_API_KEY'));
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    // Detect authentication failures from Google
    window.gm_authFailure = () => {
      console.warn('Google Maps API Authentication Failed. Please verify your API Key and billing.');
      reject(new Error('AUTH_FAILURE'));
    };

    const callbackName = '__googleMapsInitCallback_' + Math.floor(Math.random() * 100000);
    window[callbackName] = () => {
      delete window[callbackName];
      if (window.google && window.google.maps) {
        resolve(window.google.maps);
      } else {
        reject(new Error('LOAD_FAILED'));
      }
    };

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      keyToUse
    )}&libraries=places,geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      delete window[callbackName];
      reject(new Error('NETWORK_ERROR'));
    };

    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

// Generate direct Google Maps directions URL for mobile or desktop
export function getGoogleMapsDirectionsUrl(origin, destination) {
  const o = encodeURIComponent(origin || 'Delhi');
  const d = encodeURIComponent(destination || 'Rishikesh');
  return `https://www.google.com/maps/dir/?api=1&origin=${o}&destination=${d}&travelmode=driving`;
}

// Generate direct Google Maps place search URL
export function getGoogleMapsPlaceUrl(placeName) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(placeName || 'India')}`;
}
