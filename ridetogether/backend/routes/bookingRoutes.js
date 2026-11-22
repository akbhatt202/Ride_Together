const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getDriverRequests,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  startTrip,
  completeTrip,
  rateTrip
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateBookingInput } = require('../middleware/validationMiddleware');

router.route('/')
  .post(protect, authorize('passenger'), validateBookingInput, createBooking);

router.get('/my-bookings', protect, getMyBookings);
router.get('/driver-requests', protect, authorize('driver'), getDriverRequests);

router.patch('/:id/accept', protect, authorize('driver'), acceptBooking);
router.patch('/:id/reject', protect, authorize('driver'), rejectBooking);
router.patch('/:id/cancel', protect, cancelBooking);

// Uber / Rapido Trip Lifecycle Endpoints
router.patch('/:id/start', protect, startTrip);
router.patch('/:id/complete', protect, completeTrip);
router.patch('/:id/rate', protect, rateTrip);

module.exports = router;
