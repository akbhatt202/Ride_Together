const express = require('express');
const router = express.Router();
const {
  createRide,
  getAllRides,
  getRideById,
  getMyRides,
  updateRide,
  deleteRide
} = require('../controllers/rideController');
const { getDriverStats } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRideInput } = require('../middleware/validationMiddleware');

router.route('/')
  .post(protect, authorize('driver'), validateRideInput, createRide)
  .get(getAllRides);

router.get('/my-rides', protect, authorize('driver'), getMyRides);
router.get('/driver/stats', protect, authorize('driver'), getDriverStats);

router.route('/:id')
  .get(getRideById)
  .put(protect, authorize('driver', 'admin'), updateRide)
  .delete(protect, authorize('driver', 'admin'), deleteRide);

module.exports = router;
