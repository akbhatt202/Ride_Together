const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getAdminAnalytics,
  getAdminRides,
  getAdminBookings,
  updateRideStatusAdmin
} = require('../controllers/adminController');
const { getAllUsers } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/dashboard', getAdminDashboard);
router.get('/analytics', getAdminAnalytics);
router.get('/users', getAllUsers);
router.get('/rides', getAdminRides);
router.get('/bookings', getAdminBookings);
router.patch('/rides/:id/status', updateRideStatusAdmin);

module.exports = router;
