const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

dotenv.config();

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ridetogether';
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`);
    await mongoose.connect(mongoUri);

    console.log('[Seed] Clearing existing collections...');
    await User.deleteMany();
    await Ride.deleteMany();
    await Booking.deleteMany();

    console.log('[Seed] Seeding Users...');
    // Note: User model pre-save hook will hash passwords automatically!
    const users = await User.create([
      {
        name: 'Admin RideTogether',
        email: 'admin@ridetogether.com',
        password: 'admin123',
        phone: '+1 (555) 000-0001',
        role: 'admin',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      {
        name: 'John Martinez (Driver)',
        email: 'driver.john@example.com',
        password: 'driver123',
        phone: '+1 (555) 123-4567',
        role: 'driver',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        name: 'Sarah Connor (Driver)',
        email: 'driver.sarah@example.com',
        password: 'driver123',
        phone: '+1 (555) 234-5678',
        role: 'driver',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      },
      {
        name: 'David Kim (Driver)',
        email: 'driver.david@example.com',
        password: 'driver123',
        phone: '+1 (555) 345-6789',
        role: 'driver',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },
      {
        name: 'Alice Cooper (Passenger)',
        email: 'passenger.alice@example.com',
        password: 'passenger123',
        phone: '+1 (555) 987-6543',
        role: 'passenger',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
      },
      {
        name: 'Bob Marley (Passenger)',
        email: 'passenger.bob@example.com',
        password: 'passenger123',
        phone: '+1 (555) 876-5432',
        role: 'passenger',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      {
        name: 'Charlie Brown (Passenger)',
        email: 'passenger.charlie@example.com',
        password: 'passenger123',
        phone: '+1 (555) 765-4321',
        role: 'passenger',
        profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150'
      }
    ]);

    const admin = users[0];
    const driverJohn = users[1];
    const driverSarah = users[2];
    const driverDavid = users[3];
    const passAlice = users[4];
    const passBob = users[5];
    const passCharlie = users[6];

    console.log('[Seed] Seeding Rides...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);

    const rides = await Ride.create([
      {
        driver: driverJohn._id,
        source: 'New York',
        destination: 'Boston',
        departureDate: tomorrow,
        departureTime: '08:30 AM',
        farePerSeat: 35,
        totalSeats: 4,
        availableSeats: 3, // 1 seat booked by Alice
        vehicleDetails: {
          make: 'Toyota',
          model: 'Camry Hybrid 2022',
          licensePlate: 'NY-RIDE-77',
          color: 'Midnight Blue'
        },
        description: 'Leaving from Midtown Manhattan. Comfortable ride, plenty of trunk space for bags. AC & Spotify playlist ready!',
        status: 'active'
      },
      {
        driver: driverJohn._id,
        source: 'Boston',
        destination: 'New York',
        departureDate: dayAfter,
        departureTime: '05:00 PM',
        farePerSeat: 35,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: {
          make: 'Toyota',
          model: 'Camry Hybrid 2022',
          licensePlate: 'NY-RIDE-77',
          color: 'Midnight Blue'
        },
        description: 'Return trip to New York. Drop off anywhere near Central Park or Times Square.',
        status: 'active'
      },
      {
        driver: driverSarah._id,
        source: 'San Francisco',
        destination: 'Los Angeles',
        departureDate: tomorrow,
        departureTime: '07:00 AM',
        farePerSeat: 45,
        totalSeats: 3,
        availableSeats: 2, // 1 booked by Bob
        vehicleDetails: {
          make: 'Honda',
          model: 'Civic EX 2023',
          licensePlate: 'CA-SAF-101',
          color: 'Pearl White'
        },
        description: 'Cruising down I-5 South. Quick coffee break near Kettleman City. Non-smoking vehicle.',
        status: 'active'
      },
      {
        driver: driverSarah._id,
        source: 'Los Angeles',
        destination: 'San Diego',
        departureDate: dayAfter,
        departureTime: '10:00 AM',
        farePerSeat: 20,
        totalSeats: 4,
        availableSeats: 3,
        vehicleDetails: {
          make: 'Honda',
          model: 'Civic EX 2023',
          licensePlate: 'CA-SAF-101',
          color: 'Pearl White'
        },
        description: 'Scenic drive down Pacific Coast Highway / I-5. Good vibes only.',
        status: 'active'
      },
      {
        driver: driverDavid._id,
        source: 'Seattle',
        destination: 'Portland',
        departureDate: nextWeek,
        departureTime: '09:00 AM',
        farePerSeat: 28,
        totalSeats: 4,
        availableSeats: 2, // 2 booked by Charlie
        vehicleDetails: {
          make: 'Tesla',
          model: 'Model 3 Long Range',
          licensePlate: 'WA-EV-999',
          color: 'Solid Black'
        },
        description: 'Zero emissions road trip! Fast chargers mapped out, quiet cabin with panoramic glass roof.',
        status: 'active'
      },
      {
        driver: driverDavid._id,
        source: 'Austin',
        destination: 'Dallas',
        departureDate: nextWeek,
        departureTime: '02:00 PM',
        farePerSeat: 30,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: {
          make: 'Tesla',
          model: 'Model 3 Long Range',
          licensePlate: 'WA-EV-999',
          color: 'Solid Black'
        },
        description: 'Direct drive up I-35 North. Wi-Fi hotspot available inside.',
        status: 'active'
      },
      // Completed Past Ride for historical aggregation
      {
        driver: driverJohn._id,
        source: 'Philadelphia',
        destination: 'Washington DC',
        departureDate: pastDate,
        departureTime: '11:00 AM',
        farePerSeat: 25,
        totalSeats: 4,
        availableSeats: 2,
        vehicleDetails: {
          make: 'Toyota',
          model: 'Camry Hybrid 2022',
          licensePlate: 'NY-RIDE-77',
          color: 'Midnight Blue'
        },
        description: 'Historical trip successfully completed.',
        status: 'completed'
      }
    ]);

    console.log('[Seed] Seeding Bookings...');
    await Booking.create([
      // Alice booked 1 seat on NY -> Boston (Accepted)
      {
        passenger: passAlice._id,
        ride: rides[0]._id,
        seatsBooked: 1,
        totalFare: 35,
        status: 'accepted'
      },
      // Bob requested 1 seat on SF -> LA (Accepted)
      {
        passenger: passBob._id,
        ride: rides[2]._id,
        seatsBooked: 1,
        totalFare: 45,
        status: 'accepted'
      },
      // Charlie booked 2 seats on Seattle -> Portland (Accepted)
      {
        passenger: passCharlie._id,
        ride: rides[4]._id,
        seatsBooked: 2,
        totalFare: 56,
        status: 'accepted'
      },
      // Alice requested 1 seat on LA -> San Diego (Pending for Sarah)
      {
        passenger: passAlice._id,
        ride: rides[3]._id,
        seatsBooked: 1,
        totalFare: 20,
        status: 'pending'
      },
      // Bob requested 1 seat on Austin -> Dallas (Pending for David)
      {
        passenger: passBob._id,
        ride: rides[5]._id,
        seatsBooked: 1,
        totalFare: 30,
        status: 'pending'
      },
      // Historical accepted booking for John (Philly -> DC)
      {
        passenger: passCharlie._id,
        ride: rides[6]._id,
        seatsBooked: 2,
        totalFare: 50,
        status: 'accepted',
        createdAt: pastDate
      }
    ]);

    console.log('--------------------------------------------------');
    console.log('Database seeded successfully!');
    console.log('Default credentials for testing:');
    console.log('  Admin:     admin@ridetogether.com / admin123');
    console.log('  Driver:    driver.john@example.com / driver123');
    console.log('  Driver:    driver.sarah@example.com / driver123');
    console.log('  Driver:    driver.david@example.com / driver123');
    console.log('  Passenger: passenger.alice@example.com / passenger123');
    console.log('  Passenger: passenger.bob@example.com / passenger123');
    console.log('  Passenger: passenger.charlie@example.com / passenger123');
    console.log('--------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
