const mongoose = require('mongoose');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

// @desc    Admin Dashboard Metrics (using MongoDB aggregation)
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getAdminDashboard = async (req, res, next) => {
  try {
    // 1. User role counts aggregation
    const userRoleCounts = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    let totalUsers = 0;
    let totalDrivers = 0;
    let totalPassengers = 0;
    let totalAdmins = 0;

    userRoleCounts.forEach((item) => {
      totalUsers += item.count;
      if (item._id === 'driver') totalDrivers = item.count;
      if (item._id === 'passenger') totalPassengers = item.count;
      if (item._id === 'admin') totalAdmins = item.count;
    });

    // 2. Rides summary
    const rideStatusCounts = await Ride.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalRides = rideStatusCounts.reduce((acc, curr) => acc + curr.count, 0);

    // 3. Bookings summary & Revenue Aggregation
    const bookingStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          revenue: {
            $sum: {
              $cond: [{ $eq: ['$status', 'accepted'] }, '$totalFare', 0]
            }
          }
        }
      }
    ]);

    const totalBookings = bookingStats.reduce((acc, curr) => acc + curr.count, 0);
    const acceptedStat = bookingStats.find((s) => s._id === 'accepted');
    const totalRevenue = acceptedStat ? acceptedStat.revenue : 0;

    // 4. Popular Routes Aggregation (Top 5)
    const popularRoutes = await Booking.aggregate([
      { $match: { status: 'accepted' } },
      {
        $lookup: {
          from: 'rides',
          localField: 'ride',
          foreignField: '_id',
          as: 'rideInfo'
        }
      },
      { $unwind: '$rideInfo' },
      {
        $group: {
          _id: {
            source: '$rideInfo.source',
            destination: '$rideInfo.destination'
          },
          bookingsCount: { $sum: 1 },
          totalSeatsBooked: { $sum: '$seatsBooked' },
          totalRevenue: { $sum: '$totalFare' }
        }
      },
      {
        $project: {
          _id: 0,
          source: '$_id.source',
          destination: '$_id.destination',
          bookingsCount: 1,
          totalSeatsBooked: 1,
          totalRevenue: 1
        }
      },
      { $sort: { bookingsCount: -1, totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // 5. Recent Activity
    const recentBookings = await Booking.find()
      .populate('passenger', 'name email')
      .populate('ride', 'source destination departureDate departureTime')
      .sort({ createdAt: -1 })
      .limit(6);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDrivers,
        totalPassengers,
        totalAdmins,
        totalRides,
        totalBookings,
        totalRevenue,
        rideStatusBreakdown: rideStatusCounts,
        bookingStatusBreakdown: bookingStats,
        popularRoutes,
        recentBookings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Analytics: detailed aggregation for routes, monthly revenue, driver earnings
// @route   GET /api/admin/analytics
// @access  Private/Admin
const getAdminAnalytics = async (req, res, next) => {
  try {
    // 1. Monthly revenue trend aggregation
    const monthlyRevenue = await Booking.aggregate([
      { $match: { status: 'accepted' } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m', date: '$createdAt' }
          },
          revenue: { $sum: '$totalFare' },
          bookingsCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: '$_id',
          revenue: 1,
          bookingsCount: 1,
          _id: 0
        }
      }
    ]);

    // 2. All popular routes aggregation
    const popularRoutes = await Booking.aggregate([
      {
        $lookup: {
          from: 'rides',
          localField: 'ride',
          foreignField: '_id',
          as: 'rideDetails'
        }
      },
      { $unwind: '$rideDetails' },
      {
        $group: {
          _id: {
            source: '$rideDetails.source',
            destination: '$rideDetails.destination'
          },
          totalBookings: { $sum: 1 },
          acceptedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, '$totalFare', 0] }
          }
        }
      },
      {
        $project: {
          _id: 0,
          source: '$_id.source',
          destination: '$_id.destination',
          totalBookings: 1,
          acceptedBookings: 1,
          totalRevenue: 1
        }
      },
      { $sort: { totalBookings: -1 } },
      { $limit: 10 }
    ]);

    // 3. Booking Status Distribution
    const bookingStatusStats = await Booking.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          status: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // 4. Top Performing Drivers Aggregation
    const topDrivers = await Booking.aggregate([
      { $match: { status: 'accepted' } },
      {
        $lookup: {
          from: 'rides',
          localField: 'ride',
          foreignField: '_id',
          as: 'ride'
        }
      },
      { $unwind: '$ride' },
      {
        $lookup: {
          from: 'users',
          localField: 'ride.driver',
          foreignField: '_id',
          as: 'driver'
        }
      },
      { $unwind: '$driver' },
      {
        $group: {
          _id: '$driver._id',
          driverName: { $first: '$driver.name' },
          driverEmail: { $first: '$driver.email' },
          totalAcceptedBookings: { $sum: 1 },
          totalEarnings: { $sum: '$totalFare' }
        }
      },
      { $sort: { totalEarnings: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        monthlyRevenue,
        popularRoutes,
        bookingStatusStats,
        topDrivers
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered rides for admin
// @route   GET /api/admin/rides
// @access  Private/Admin
const getAdminRides = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Ride.countDocuments(query);
    const rides = await Ride.find(query)
      .populate('driver', 'name email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      rides
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for admin
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAdminBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('passenger', 'name email phone')
      .populate({
        path: 'ride',
        populate: { path: 'driver', select: 'name email phone' }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change ride status as admin
// @route   PATCH /api/admin/rides/:id/status
// @access  Private/Admin
const updateRideStatusAdmin = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, completed, or cancelled'
      });
    }

    const ride = await Ride.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('driver', 'name email phone');

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `Ride status updated to ${status}`,
      ride
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Driver Earnings Aggregation (used by driver dashboard)
// @route   GET /api/rides/driver/stats
// @access  Private (Driver only)
const getDriverStats = async (req, res, next) => {
  try {
    const driverId = new mongoose.Types.ObjectId(req.user._id);

    // 1. Total earnings from accepted bookings belonging to this driver
    const earningsResult = await Booking.aggregate([
      { $match: { status: 'accepted' } },
      {
        $lookup: {
          from: 'rides',
          localField: 'ride',
          foreignField: '_id',
          as: 'rideData'
        }
      },
      { $unwind: '$rideData' },
      { $match: { 'rideData.driver': driverId } },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: '$totalFare' },
          totalAcceptedBookings: { $sum: 1 },
          totalSeatsSold: { $sum: '$seatsBooked' }
        }
      }
    ]);

    const stats = earningsResult[0] || {
      totalEarnings: 0,
      totalAcceptedBookings: 0,
      totalSeatsSold: 0
    };

    // 2. Total rides published & status
    const totalRidesPublished = await Ride.countDocuments({ driver: driverId });
    const activeRidesCount = await Ride.countDocuments({ driver: driverId, status: 'active' });

    // 3. Pending requests for this driver
    const pendingRequests = await Booking.aggregate([
      { $match: { status: 'pending' } },
      {
        $lookup: {
          from: 'rides',
          localField: 'ride',
          foreignField: '_id',
          as: 'rideData'
        }
      },
      { $unwind: '$rideData' },
      { $match: { 'rideData.driver': driverId } },
      { $count: 'pendingCount' }
    ]);

    const pendingCount = pendingRequests[0] ? pendingRequests[0].pendingCount : 0;

    // 4. Monthly earnings aggregation for this driver
    const monthlyEarnings = await Booking.aggregate([
      { $match: { status: 'accepted' } },
      {
        $lookup: {
          from: 'rides',
          localField: 'ride',
          foreignField: '_id',
          as: 'rideData'
        }
      },
      { $unwind: '$rideData' },
      { $match: { 'rideData.driver': driverId } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          monthlyEarnings: { $sum: '$totalFare' },
          bookingsCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          month: '$_id',
          monthlyEarnings: 1,
          bookingsCount: 1,
          _id: 0
        }
      }
    ]);

    // 5. Popular destinations for this driver
    const popularDestinations = await Ride.aggregate([
      { $match: { driver: driverId } },
      {
        $group: {
          _id: '$destination',
          rideCount: { $sum: 1 }
        }
      },
      { $sort: { rideCount: -1 } },
      { $limit: 5 },
      {
        $project: {
          destination: '$_id',
          rideCount: 1,
          _id: 0
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalRidesPublished,
        activeRidesCount,
        totalAcceptedBookings: stats.totalAcceptedBookings,
        totalEarnings: stats.totalEarnings,
        totalSeatsSold: stats.totalSeatsSold,
        pendingBookingRequests: pendingCount,
        monthlyEarnings,
        popularDestinations
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getAdminAnalytics,
  getAdminRides,
  getAdminBookings,
  updateRideStatusAdmin,
  getDriverStats
};
