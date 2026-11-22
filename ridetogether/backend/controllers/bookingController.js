const Booking = require('../models/Booking');
const Ride = require('../models/Ride');

// @desc    Request to book seat(s) on a ride
// @route   POST /api/bookings
// @access  Private (Passenger only)
const createBooking = async (req, res, next) => {
  try {
    const { rideId, seatsBooked } = req.body;
    const requestedSeats = parseInt(seatsBooked, 10);

    if (isNaN(requestedSeats) || requestedSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Seats booked must be a positive integer'
      });
    }

    // 1. Verify Ride exists
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: 'Ride not found'
      });
    }

    // 2. Ensure ride is active
    if (ride.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: `Cannot book seats: this ride is ${ride.status}`
      });
    }

    // 3. Driver cannot book their own ride
    if (ride.driver.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Drivers cannot book seats on their own published ride'
      });
    }

    // 4. Prevent duplicate pending or accepted bookings
    const existingBooking = await Booking.findOne({
      passenger: req.user._id,
      ride: ride._id,
      status: { $in: ['pending', 'accepted'] }
    });

    if (existingBooking) {
      return res.status(400).json({
        success: false,
        message: `You already have an active/pending booking request for this ride (Status: ${existingBooking.status})`
      });
    }

    // 5. Check seat availability
    if (ride.availableSeats < requestedSeats) {
      return res.status(400).json({
        success: false,
        message: `Insufficient seats available. Requested: ${requestedSeats}, Available: ${ride.availableSeats}`
      });
    }

    // 6. Calculate total fare
    const totalFare = requestedSeats * ride.farePerSeat;

    // 7. Create booking in pending status
    const booking = await Booking.create({
      passenger: req.user._id,
      ride: ride._id,
      seatsBooked: requestedSeats,
      totalFare,
      status: 'pending'
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('ride', 'source destination departureDate departureTime farePerSeat vehicleDetails')
      .populate('passenger', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Booking request sent successfully to the driver. Awaiting driver acceptance.',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings for logged-in passenger
// @route   GET /api/bookings/my-bookings
// @access  Private (Passenger / User)
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate({
        path: 'ride',
        populate: {
          path: 'driver',
          select: 'name email phone profileImage'
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all booking requests for driver's rides
// @route   GET /api/bookings/driver-requests
// @access  Private (Driver only)
const getDriverRequests = async (req, res, next) => {
  try {
    // 1. Find all rides owned by driver
    const driverRides = await Ride.find({ driver: req.user._id }).select('_id');
    const rideIds = driverRides.map((r) => r._id);

    // 2. Find all bookings for these rides
    const requests = await Booking.find({ ride: { $in: rideIds } })
      .populate('passenger', 'name email phone profileImage')
      .populate('ride', 'source destination departureDate departureTime farePerSeat availableSeats totalSeats status')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Driver accepts a booking request (atomic seat decrement)
// @route   PATCH /api/bookings/:id/accept
// @access  Private (Driver only)
const acceptBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('ride');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    // Verify driver owns the ride
    if (booking.ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only manage booking requests for your own rides'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot accept booking with status '${booking.status}'`
      });
    }

    // ATOMIC SEAT DEDUCTION & RACE CONDITION PREVENTION
    // We update the Ride conditionally: must be active and have enough available seats
    const updatedRide = await Ride.findOneAndUpdate(
      {
        _id: booking.ride._id,
        status: 'active',
        availableSeats: { $gte: booking.seatsBooked }
      },
      {
        $inc: { availableSeats: -booking.seatsBooked }
      },
      { new: true }
    );

    if (!updatedRide) {
      return res.status(400).json({
        success: false,
        message: 'Cannot accept booking: insufficient available seats remain or ride is not active'
      });
    }

    booking.status = 'accepted';
    await booking.save();

    const populatedBooking = await Booking.findById(booking._id)
      .populate('passenger', 'name email phone')
      .populate('ride');

    res.status(200).json({
      success: true,
      message: 'Booking request accepted successfully',
      booking: populatedBooking,
      remainingSeats: updatedRide.availableSeats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Driver rejects a booking request
// @route   PATCH /api/bookings/:id/reject
// @access  Private (Driver only)
const rejectBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('ride');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking request not found'
      });
    }

    // Verify driver owns the ride
    if (booking.ride.driver.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only manage booking requests for your own rides'
      });
    }

    if (booking.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot reject booking with status '${booking.status}'`
      });
    }

    booking.status = 'rejected';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Booking request rejected',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Passenger, Driver, or Admin cancels a booking (restores seats if previously accepted)
// @route   PATCH /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('ride');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    const isPassengerOwner = booking.passenger.toString() === req.user._id.toString();
    const isRideDriver = booking.ride && booking.ride.driver.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    // Ensure authorized: booking owner, ride's driver, or admin
    if (!isPassengerOwner && !isRideDriver && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this booking'
      });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking is already cancelled'
      });
    }

    if (booking.status === 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel a booking that was already rejected'
      });
    }

    const wasAccepted = booking.status === 'accepted';
    booking.status = 'cancelled';
    await booking.save();

    // If booking was accepted, restore seats atomically
    if (wasAccepted && booking.ride) {
      await Ride.findByIdAndUpdate(booking.ride._id, {
        $inc: { availableSeats: booking.seatsBooked }
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('ride')
      .populate('passenger', 'name email phone');

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully. Any reserved seats have been restored.',
      booking: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start trip by verifying 4-digit OTP (Uber / Rapido style)
// @route   PATCH /api/bookings/:id/start
// @access  Private (Driver or Passenger)
const startTrip = async (req, res, next) => {
  try {
    const { otp } = req.body;
    const booking = await Booking.findById(req.params.id).populate('ride');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Verify OTP if provided by driver
    if (otp && booking.otp && booking.otp !== otp.toString().trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid OTP! Please enter the correct 4-digit passenger PIN'
      });
    }

    booking.tripStatus = 'in_progress';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Trip started successfully! Have a safe journey.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete trip & record payment (Uber / Rapido style)
// @route   PATCH /api/bookings/:id/complete
// @access  Private
const completeTrip = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('ride');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.tripStatus = 'completed';
    booking.paymentStatus = 'completed';
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Trip completed! Collect ₹fare from passenger or verify UPI.',
      booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Rate driver / passenger (1-5 stars & review)
// @route   PATCH /api/bookings/:id/rate
// @access  Private
const rateTrip = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const starRating = parseInt(rating, 10);
    if (isNaN(starRating) || starRating < 1 || starRating > 5) {
      return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5 stars' });
    }

    booking.rating = starRating;
    if (review) booking.review = review.trim();
    await booking.save();

    res.status(200).json({
      success: true,
      message: 'Thank you for your feedback!',
      booking
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getDriverRequests,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  startTrip,
  completeTrip,
  rateTrip
};
