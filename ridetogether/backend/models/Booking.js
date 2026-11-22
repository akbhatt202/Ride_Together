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
