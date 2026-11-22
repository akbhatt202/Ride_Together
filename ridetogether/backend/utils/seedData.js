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

    console.log('[Seed] Seeding Indian Users...');
    const users = await User.create([
      {
        name: 'Vikram Malhotra (Admin)',
        email: 'admin@ridetogether.com',
        password: 'admin123',
        phone: '+91 98000 00001',
        role: 'admin',
        profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      },
      {
        name: 'Rajesh Sharma',
        email: 'driver.rajesh@example.com',
        password: 'driver123',
        phone: '+91 98234 56789',
        role: 'driver',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
      },
      {
        name: 'Priya Patel',
        email: 'driver.priya@example.com',
        password: 'driver123',
        phone: '+91 98765 43210',
        role: 'driver',
        profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
      },
      {
        name: 'Arjun Reddy',
        email: 'driver.arjun@example.com',
        password: 'driver123',
        phone: '+91 99887 76655',
        role: 'driver',
        profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
      },
      {
        name: 'Neha Gupta',
        email: 'passenger.neha@example.com',
        password: 'passenger123',
        phone: '+91 91234 56780',
        role: 'passenger',
        profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
      },
      {
        name: 'Rohit Verma',
        email: 'passenger.rohit@example.com',
        password: 'passenger123',
        phone: '+91 98712 34567',
        role: 'passenger',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
      },
      {
        name: 'Ananya Iyer',
        email: 'passenger.ananya@example.com',
        password: 'passenger123',
        phone: '+91 94455 66778',
        role: 'passenger',
        profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150'
      }
    ]);

    const admin = users[0];
    const driverRajesh = users[1];
    const driverPriya = users[2];
    const driverArjun = users[3];
    const passNeha = users[4];
    const passRohit = users[5];
    const passAnanya = users[6];

    console.log('[Seed] Seeding Indian Corridors & Rides...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    const rides = await Ride.create([
      // 1. Mumbai -> Pune (Mumbai-Pune Expressway)
      {
        driver: driverRajesh._id,
        source: 'Mumbai',
        destination: 'Pune',
        departureDate: tomorrow,
        departureTime: '07:30 AM',
        farePerSeat: 350,
        totalSeats: 4,
        availableSeats: 3, // 1 seat booked by Neha
        vehicleDetails: {
          make: 'Maruti Suzuki',
          model: 'Dzire VXi 2023',
          licensePlate: 'MH-12-RN-4050',
          color: 'Magma Grey'
        },
        description: 'Leaving from Dadar TT Circle via Chembur and Vashi Toll Naka. Taking Mumbai-Pune Expressway, drop off at Wakad / Hinjawadi Bridge. Fastag enabled, AC, clean car.',
        status: 'active'
      },
      // 2. Pune -> Mumbai (Return Trip)
      {
        driver: driverRajesh._id,
        source: 'Pune',
        destination: 'Mumbai',
        departureDate: dayAfter,
        departureTime: '06:00 PM',
        farePerSeat: 350,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: {
          make: 'Maruti Suzuki',
          model: 'Dzire VXi 2023',
          licensePlate: 'MH-12-RN-4050',
          color: 'Magma Grey'
        },
        description: 'Return evening trip to Mumbai. Pickup from Hinjawadi Phase 1, drop off at Chembur or Sion. Smooth driving with live GPS route tracking.',
        status: 'active'
      },
      // 3. Delhi -> Jaipur (NH 48 / Delhi-Jaipur Expressway)
      {
        driver: driverPriya._id,
        source: 'Delhi',
        destination: 'Jaipur',
        departureDate: tomorrow,
        departureTime: '06:00 AM',
        farePerSeat: 500,
        totalSeats: 3,
        availableSeats: 2, // 1 booked by Rohit
        vehicleDetails: {
          make: 'Tata',
          model: 'Nexon EV Empowered',
          licensePlate: 'DL-01-CZ-8821',
          color: 'Pristine White'
        },
        description: 'Early morning start from IFFCO Chowk Gurgaon. Eco-friendly electric ride with fast chargers pre-mapped. Quick stop at Mannat Dhaba for tea. Non-smoking.',
        status: 'active'
      },
      // 4. Bengaluru -> Mysuru (Bengaluru-Mysuru Expressway)
      {
        driver: driverArjun._id,
        source: 'Bengaluru',
        destination: 'Mysuru',
        departureDate: dayAfter,
        departureTime: '08:00 AM',
        farePerSeat: 300,
        totalSeats: 4,
        availableSeats: 2, // 2 booked by Ananya
        vehicleDetails: {
          make: 'Hyundai',
          model: 'Creta SX 2023',
          licensePlate: 'KA-05-MJ-9911',
          color: 'Phantom Black'
        },
        description: 'Cruising on the 10-lane expressway. Pickup from Silk Board / Kengeri Metro Station. Drop off at Mysore Palace or Suburban Bus Stand. Plenty of boot space.',
        status: 'active'
      },
      // 5. Ahmedabad -> Surat (National Expressway 1 / NH 48)
      {
        driver: driverPriya._id,
        source: 'Ahmedabad',
        destination: 'Surat',
        departureDate: nextWeek,
        departureTime: '09:30 AM',
        farePerSeat: 450,
        totalSeats: 3,
        availableSeats: 3,
        vehicleDetails: {
          make: 'Tata',
          model: 'Nexon EV Empowered',
          licensePlate: 'GJ-01-XY-3420',
          color: 'Pristine White'
        },
        description: 'Direct drive on Vadodara-Ahmedabad Expressway down to Surat Varachha / Ring Road. Fast and comfortable ride.',
        status: 'active'
      },
      // 6. Hyderabad -> Vijayawada (NH 65)
      {
        driver: driverArjun._id,
        source: 'Hyderabad',
        destination: 'Vijayawada',
        departureDate: nextWeek,
        departureTime: '05:30 AM',
        farePerSeat: 550,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: {
          make: 'Hyundai',
          model: 'Creta SX 2023',
          licensePlate: 'TS-09-AB-1234',
          color: 'Phantom Black'
        },
        description: 'Starting from LB Nagar circle. Smooth 4-lane national highway drive. Tea break near Suryapet.',
        status: 'active'
      },
      // 7. Completed Past Ride: Chandigarh -> Delhi (GT Road NH 44)
      {
        driver: driverRajesh._id,
        source: 'Chandigarh',
        destination: 'Delhi',
        departureDate: pastDate,
        departureTime: '10:00 AM',
        farePerSeat: 400,
        totalSeats: 4,
        availableSeats: 2,
        vehicleDetails: {
          make: 'Maruti Suzuki',
          model: 'Dzire VXi 2023',
          licensePlate: 'CH-01-TB-7766',
          color: 'Magma Grey'
        },
        description: 'Completed historic journey along GT Road via Ambala and Karnal.',
        status: 'completed'
      }
    ]);

    console.log('[Seed] Seeding Bookings...');
    await Booking.create([
      // Neha booked 1 seat on Mumbai -> Pune (Accepted)
      {
        passenger: passNeha._id,
        ride: rides[0]._id,
        seatsBooked: 1,
        totalFare: 350,
        status: 'accepted'
      },
      // Rohit booked 1 seat on Delhi -> Jaipur (Accepted)
      {
        passenger: passRohit._id,
        ride: rides[2]._id,
        seatsBooked: 1,
        totalFare: 500,
        status: 'accepted'
      },
      // Ananya booked 2 seats on Bengaluru -> Mysuru (Accepted)
      {
        passenger: passAnanya._id,
        ride: rides[3]._id,
        seatsBooked: 2,
        totalFare: 600,
        status: 'accepted'
      },
      // Neha requested 1 seat on Pune -> Mumbai (Pending for Rajesh)
      {
        passenger: passNeha._id,
        ride: rides[1]._id,
        seatsBooked: 1,
        totalFare: 350,
        status: 'pending'
      },
      // Historical accepted booking for Rajesh (Chandigarh -> Delhi)
      {
        passenger: passRohit._id,
        ride: rides[6]._id,
        seatsBooked: 2,
        totalFare: 800,
        status: 'accepted',
        createdAt: pastDate
      }
    ]);

    console.log('--------------------------------------------------');
    console.log('Indian cities and routes seeded successfully!');
    console.log('Default credentials for testing:');
    console.log('  Admin:     admin@ridetogether.com / admin123');
    console.log('  Driver:    driver.rajesh@example.com / driver123');
    console.log('  Driver:    driver.priya@example.com / driver123');
    console.log('  Driver:    driver.arjun@example.com / driver123');
    console.log('  Passenger: passenger.neha@example.com / passenger123');
    console.log('  Passenger: passenger.rohit@example.com / passenger123');
    console.log('  Passenger: passenger.ananya@example.com / passenger123');
    console.log('--------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
};

seedData();
