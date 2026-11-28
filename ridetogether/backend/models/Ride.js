const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Ride must belong to a driver']
    },
    source: {
      type: String,
      required: [true, 'Please provide a departure source / city'],
      trim: true,
      index: true
    },
    destination: {
      type: String,
      required: [true, 'Please provide a destination / city'],
      trim: true,
      index: true
    },
    departureDate: {
      type: Date,
      required: [true, 'Please provide departure date'],
      index: true
    },
    departureTime: {
      type: String,
      required: [true, 'Please provide departure time (e.g. 09:30 AM)'],
      trim: true
    },
    farePerSeat: {
      type: Number,
      required: [true, 'Please set fare per seat'],
      min: [0, 'Fare cannot be negative']
    },
    totalSeats: {
      type: Number,
      required: [true, 'Please provide total available seats'],
      min: [1, 'Ride must have at least 1 total seat']
    },
    availableSeats: {
      type: Number,
      required: [true, 'Please provide available seats'],
      min: [0, 'Available seats cannot be negative']
    },
    vehicleDetails: {
      make: { type: String, default: '' },
      model: { type: String, default: '' },
      licensePlate: { type: String, default: '' },
      color: { type: String, default: '' }
    },
    description: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ['active', 'completed', 'cancelled'],
        message: '{VALUE} is not a valid ride status'
      },
      default: 'active',
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

// Compound indexes for optimal ride search queries
rideSchema.index({ source: 1, destination: 1, departureDate: 1, status: 1 });
rideSchema.index({ status: 1, availableSeats: 1, departureDate: 1 });
rideSchema.index({ driver: 1, createdAt: -1 });

const MongooseRide = mongoose.model('Ride', rideSchema);
const inMemoryStore = require('../config/inMemoryStore');

const RideProxy = new Proxy(MongooseRide, {
  get(target, prop) {
    if (mongoose.connection.readyState === 1) {
      return target[prop];
    }
    if (inMemoryStore && inMemoryStore.Ride && typeof inMemoryStore.Ride[prop] !== 'undefined') {
      return inMemoryStore.Ride[prop];
    }
    return target[prop];
  }
});

module.exports = RideProxy;
