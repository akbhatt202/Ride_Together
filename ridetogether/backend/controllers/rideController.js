const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

// @desc    Create a new ride
// @route   POST /api/rides
// @access  Private (Driver only)
const createRide = async (req, res, next) => {
  try {
    const {
      source,
      destination,
      departureDate,
      departureTime,
      farePerSeat,
      totalSeats,
      vehicleDetails,
      description
    } = req.body;

    const parsedDepartureDate = new Date(departureDate);
    if (isNaN(parsedDepartureDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid departure date provided'
      });
    }

    const ride = await Ride.create({
      driver: req.user._id,
      source: source.trim(),
      destination: destination.trim(),
      departureDate: parsedDepartureDate,
      departureTime: departureTime.trim(),
      farePerSeat: Number(farePerSeat),
      totalSeats: Number(totalSeats),
      availableSeats: Number(totalSeats),
      vehicleDetails: vehicleDetails || {},
      description: description ? description.trim() : '',
      status: 'active'
    });

    const populatedRide = await Ride.findById(ride._id).populate(
      'driver',
      'name email phone profileImage'
    );

    res.status(201).json({
      success: true,
      message: 'Ride published successfully',
      ride: populatedRide
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search and filter rides
// @route   GET /api/rides
// @access  Public
const getAllRides = async (req, res, next) => {
  try {
    const {
      source,
      destination,
      date,
      minFare,
      maxFare,
      seats,
      sort,
      page = 1,
      limit = 9
    } = req.query;

    const query = { status: 'active' };

    // Source search (case-insensitive substring)
    if (source && source.trim()) {
      query.source = { $regex: source.trim(), $options: 'i' };
    }

    // Destination search (case-insensitive substring)
    if (destination && destination.trim()) {
      query.destination = { $regex: destination.trim(), $options: 'i' };
    }

    // Date filtering (matches whole day)
    if (date) {
      const searchDate = new Date(date);
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate);
        startOfDay.setUTCHours(0, 0, 0, 0);

        const endOfDay = new Date(searchDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        query.departureDate = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    // Fare filtering
    if (minFare !== undefined || maxFare !== undefined) {
      query.farePerSeat = {};
      if (minFare !== undefined && !isNaN(Number(minFare))) {
        query.farePerSeat.$gte = Number(minFare);
      }
      if (maxFare !== undefined && !isNaN(Number(maxFare))) {
        query.farePerSeat.$lte = Number(maxFare);
      }
    }

    // Available seats filter
    const requiredSeats = seats ? parseInt(seats, 10) : 1;
    query.availableSeats = { $gte: isNaN(requiredSeats) ? 1 : requiredSeats };

    // Sorting
    let sortOptions = { departureDate: 1, departureTime: 1 };
    if (sort === 'fare_asc') {
      sortOptions = { farePerSeat: 1 };
    } else if (sort === 'fare_desc') {
      sortOptions = { farePerSeat: -1 };
    } else if (sort === 'date_asc') {
      sortOptions = { departureDate: 1 };
    } else if (sort === 'date_desc') {
      sortOptions = { departureDate: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 9;
    const skip = (pageNum - 1) * limitNum;

    const total = await Ride.countDocuments(query);
    const rides = await Ride.find(query)
      .populate('driver', 'name email phone profileImage')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: rides.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum) || 1,
      rides
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ride by ID
// @route   GET /api/rides/:id
// @access  Public
const getRideById = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id).populate(
      'driver',
      'name email phone profileImage createdAt'
    );

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    res.status(200).json({
      success: true,
      ride
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rides created by logged-in driver
// @route   GET /api/rides/my-rides
// @access  Private (Driver only)
const getMyRides = async (req, res, next) => {
  try {
    const rides = await Ride.find({ driver: req.user._id })
      .sort({ createdAt: -1 });

    // Enhance each ride with total booking counts
    const rideIds = rides.map((r) => r._id);
    const bookings = await Booking.find({ ride: { $in: rideIds } });

    const ridesWithStats = rides.map((ride) => {
      const rideBookings = bookings.filter(
        (b) => b.ride.toString() === ride._id.toString()
      );
      const pendingCount = rideBookings.filter((b) => b.status === 'pending').length;
      const acceptedCount = rideBookings.filter((b) => b.status === 'accepted').length;

      return {
        ...ride.toObject(),
        pendingBookingsCount: pendingCount,
        acceptedBookingsCount: acceptedCount,
        totalBookingsCount: rideBookings.length
      };
    });

    res.status(200).json({
      success: true,
      count: ridesWithStats.length,
      rides: ridesWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ride details
// @route   PUT /api/rides/:id
// @access  Private (Driver or Admin)
const updateRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Only ride owner or admin can update
    if (
      ride.driver.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to edit this ride'
      });
    }

    // Do not allow major alterations if there are already accepted bookings
    const acceptedBookings = await Booking.countDocuments({
      ride: ride._id,
      status: 'accepted'
    });

    if (acceptedBookings > 0 && req.body.totalSeats && req.body.totalSeats < ride.totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'Cannot reduce total seats when bookings have already been accepted'
      });
    }

    const {
      source,
      destination,
      departureDate,
      departureTime,
      farePerSeat,
      totalSeats,
      vehicleDetails,
      description,
      status
    } = req.body;

    if (source) ride.source = source.trim();
    if (destination) ride.destination = destination.trim();
    if (departureDate) ride.departureDate = new Date(departureDate);
    if (departureTime) ride.departureTime = departureTime.trim();
    if (farePerSeat !== undefined) ride.farePerSeat = Number(farePerSeat);
    if (vehicleDetails) ride.vehicleDetails = vehicleDetails;
    if (description !== undefined) ride.description = description.trim();
    if (status && ['active', 'completed', 'cancelled'].includes(status)) {
      ride.status = status;
    }

    // If total seats changed, recalculate availableSeats accordingly
    if (totalSeats !== undefined && Number(totalSeats) !== ride.totalSeats) {
      const seatsDifference = Number(totalSeats) - ride.totalSeats;
      ride.totalSeats = Number(totalSeats);
      ride.availableSeats = Math.max(0, ride.availableSeats + seatsDifference);
    }

    const updatedRide = await ride.save();

    res.status(200).json({
      success: true,
      message: 'Ride updated successfully',
      ride: updatedRide
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or cancel ride
// @route   DELETE /api/rides/:id
// @access  Private (Driver or Admin)
const deleteRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // Check ownership
    if (
      ride.driver.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to cancel this ride'
      });
    }

    // Set ride status to cancelled
    ride.status = 'cancelled';
    await ride.save();

    // Mark pending and accepted bookings as cancelled
    await Booking.updateMany(
      { ride: ride._id, status: { $in: ['pending', 'accepted'] } },
      { $set: { status: 'cancelled' } }
    );

    res.status(200).json({
      success: true,
      message: 'Ride cancelled successfully and all pending/accepted bookings notified'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRide,
  getAllRides,
  getRideById,
  getMyRides,
  updateRide,
  deleteRide
};
