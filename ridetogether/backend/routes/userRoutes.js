const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  becomeDriver,
  getAllUsers,
  deleteUser
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.post('/become-driver', protect, becomeDriver);

router.route('/')
  .get(protect, authorize('admin'), getAllUsers);

router.route('/:id')
  .delete(protect, authorize('admin'), deleteUser);

module.exports = router;
