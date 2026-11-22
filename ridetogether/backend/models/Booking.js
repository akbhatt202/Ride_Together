const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Booking must belong to a passenger']
    },
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Ride',
      required: [true, 'Booking must refer to a ride']
    },
    seatsBooked: {
      type: Number,
      required: [true, 'Please specify the number of seats to book'],
      min: [1, 'Must book at least 1 seat']
    },
    totalFare: {
      type: Number,
      required: [true, 'Total fare is required'],
      min: [0, 'Total fare cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'accepted', 'rejected', 'cancelled'],
        message: '{VALUE} is not a valid booking status'
      },
      default: 'pending',
      index: true
    },
    // Uber / Rapido Live Trip Lifecycle Fields
    tripStatus: {
      type: String,
      enum: ['requested', 'accepted', 'arrived', 'in_progress', 'completed', 'cancelled'],
      default: 'requested',
      index: true
    },
    otp: {
      type: String,
      default: function () {
        return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit safety PIN
      }
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    review: {
      type: String,
      default: ''
    },
    paymentMethod: {
      type: String,
      enum: ['upi', 'cash', 'card', 'wallet'],
      default: 'upi'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Indexes for passenger bookings and ride request queries
bookingSchema.index({ ride: 1, status: 1 });
bookingSchema.index({ passenger: 1, createdAt: -1 });
bookingSchema.index({ ride: 1, passenger: 1, status: 1 });

module.exports = mongoose.model('Booking', bookingSchema);
