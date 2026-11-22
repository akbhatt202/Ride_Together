const API_BASE = '/api';

/**
 * Common request wrapper with Bearer token authentication and error handling
 */
async function request(endpoint, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.message || `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Auth Endpoints
  auth: {
    register: (userData) =>
      request('/auth/register', { method: 'POST', body: userData }),
    login: (credentials) =>
      request('/auth/login', { method: 'POST', body: credentials }),
    getMe: () =>
      request('/auth/me', { method: 'GET' })
  },

  // User Endpoints
  users: {
    getProfile: () =>
      request('/users/profile', { method: 'GET' }),
    updateProfile: (profileData) =>
      request('/users/profile', { method: 'PUT', body: profileData }),
    getAllUsers: (params = '') =>
      request(`/users?${params}`, { method: 'GET' }),
    deleteUser: (userId) =>
      request(`/users/${userId}`, { method: 'DELETE' })
  },

  // Ride Endpoints
  rides: {
    getAll: (params = '') =>
      request(`/rides?${params}`, { method: 'GET' }),
    getById: (id) =>
      request(`/rides/${id}`, { method: 'GET' }),
    create: (rideData) =>
      request('/rides', { method: 'POST', body: rideData }),
    getMyRides: () =>
      request('/rides/my-rides', { method: 'GET' }),
    getDriverStats: () =>
      request('/rides/driver/stats', { method: 'GET' }),
    update: (id, rideData) =>
      request(`/rides/${id}`, { method: 'PUT', body: rideData }),
    delete: (id) =>
      request(`/rides/${id}`, { method: 'DELETE' })
  },

  // Booking Endpoints
  bookings: {
    create: (bookingData) =>
      request('/bookings', { method: 'POST', body: bookingData }),
    getMyBookings: () =>
      request('/bookings/my-bookings', { method: 'GET' }),
    getDriverRequests: () =>
      request('/bookings/driver-requests', { method: 'GET' }),
    accept: (id) =>
      request(`/bookings/${id}/accept`, { method: 'PATCH' }),
    reject: (id) =>
      request(`/bookings/${id}/reject`, { method: 'PATCH' }),
    cancel: (id) =>
      request(`/bookings/${id}/cancel`, { method: 'PATCH' })
  },

  // Admin Endpoints
  admin: {
    getDashboard: () =>
      request('/admin/dashboard', { method: 'GET' }),
    getAnalytics: () =>
      request('/admin/analytics', { method: 'GET' }),
    getRides: (params = '') =>
      request(`/admin/rides?${params}`, { method: 'GET' }),
    getBookings: (params = '') =>
      request(`/admin/bookings?${params}`, { method: 'GET' }),
    updateRideStatus: (id, status) =>
      request(`/admin/rides/${id}/status`, { method: 'PATCH', body: { status } })
  }
};
