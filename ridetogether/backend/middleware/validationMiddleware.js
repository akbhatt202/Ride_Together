// Validation utility functions
const validateRegisterInput = (req, res, next) => {
  const { name, email, password, phone, role } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({
      success: false,
      message: 'Please provide all required fields: name, email, password, phone'
    });
  }

  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address'
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long'
    });
  }

  if (role && !['driver', 'passenger', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: 'Role must be one of: driver, passenger, admin'
    });
  }

  next();
};

const validateLoginInput = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide both email and password'
    });
  }

  next();
};

const validateRideInput = (req, res, next) => {
  const { source, destination, departureDate, departureTime, farePerSeat, totalSeats } = req.body;

  if (!source || !destination || !departureDate || !departureTime || farePerSeat === undefined || !totalSeats) {
    return res.status(400).json({
      success: false,
      message: 'Missing required ride fields: source, destination, departureDate, departureTime, farePerSeat, totalSeats'
    });
  }

  if (Number(farePerSeat) < 0) {
    return res.status(400).json({
      success: false,
      message: 'Fare per seat cannot be negative'
    });
  }

  if (Number(totalSeats) < 1) {
    return res.status(400).json({
      success: false,
      message: 'Total seats must be at least 1'
    });
  }

  next();
};

const validateBookingInput = (req, res, next) => {
  const { rideId, seatsBooked } = req.body;

  if (!rideId) {
    return res.status(400).json({
      success: false,
      message: 'Ride ID is required to book a seat'
    });
  }

  if (!seatsBooked || Number(seatsBooked) < 1) {
    return res.status(400).json({
      success: false,
      message: 'Must book at least 1 seat'
    });
  }

  next();
};

module.exports = {
  validateRegisterInput,
  validateLoginInput,
  validateRideInput,
  validateBookingInput
};
