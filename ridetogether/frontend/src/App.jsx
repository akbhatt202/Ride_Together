import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import SearchRidesPage from './pages/SearchRidesPage';
import RideDetailsPage from './pages/RideDetailsPage';
import DriverDashboard from './pages/DriverDashboard';
import PassengerDashboard from './pages/PassengerDashboard';
import CreateRidePage from './pages/CreateRidePage';
import BookingManagementPage from './pages/BookingManagementPage';
import AdminDashboard from './pages/AdminDashboard';
import ProfilePage from './pages/ProfilePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<LandingPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="rides" element={<SearchRidesPage />} />
            <Route path="rides/:id" element={<RideDetailsPage />} />

            {/* Authenticated User Routes */}
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="bookings"
              element={
                <ProtectedRoute>
                  <BookingManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Driver Only Routes */}
            <Route
              path="create-ride"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <CreateRidePage />
                </ProtectedRoute>
              }
            />

            <Route
              path="driver-dashboard"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />

            {/* Passenger Only Routes */}
            <Route
              path="passenger-dashboard"
              element={
                <ProtectedRoute allowedRoles={['passenger']}>
                  <PassengerDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Only Routes */}
            <Route
              path="admin"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
