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

    console.log('[Seed] Seeding Comprehensive Indian Corridors & Rides across All States...');
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const threeDays = new Date(now.getTime() + 72 * 60 * 60 * 1000);
    const fourDays = new Date(now.getTime() + 96 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    const rides = await Ride.create([
      // 1. Mumbai -> Pune (Maharashtra)
      {
        driver: driverRajesh._id,
        source: 'Mumbai',
        destination: 'Pune',
        departureDate: tomorrow,
        departureTime: '07:30 AM',
        farePerSeat: 350,
        totalSeats: 4,
        availableSeats: 3,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire VXi 2023', licensePlate: 'MH-12-RN-4050', color: 'Magma Grey' },
        description: 'Leaving from Dadar TT Circle via Chembur and Vashi Toll Naka. Taking Mumbai-Pune Expressway, drop off at Wakad / Hinjawadi. Clean AC car, Fastag enabled.',
        status: 'active'
      },
      // 2. Pune -> Mumbai (Maharashtra)
      {
        driver: driverRajesh._id,
        source: 'Pune',
        destination: 'Mumbai',
        departureDate: dayAfter,
        departureTime: '06:00 PM',
        farePerSeat: 350,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire VXi 2023', licensePlate: 'MH-12-RN-4050', color: 'Magma Grey' },
        description: 'Return evening trip to Mumbai. Pickup from Hinjawadi Phase 1, drop off at Chembur or Sion. Smooth driving with live GPS route tracking.',
        status: 'active'
      },
      // 3. Delhi -> Rishikesh (Uttarakhand Pilgrimage Corridor)
      {
        driver: driverPriya._id,
        source: 'Delhi',
        destination: 'Rishikesh',
        departureDate: tomorrow,
        departureTime: '06:00 AM',
        farePerSeat: 450,
        totalSeats: 4,
        availableSeats: 3,
        vehicleDetails: { make: 'Tata', model: 'Nexon EV Empowered', licensePlate: 'DL-01-CZ-8821', color: 'Pristine White' },
        description: 'Expressway direct to Yoga Capital Rishikesh via Delhi-Meerut Expressway and Haridwar bypass. Pickup at Akshardham Metro, drop off at Tapovan.',
        status: 'active'
      },
      // 4. Rishikesh -> Delhi (Uttarakhand Return)
      {
        driver: driverPriya._id,
        source: 'Rishikesh',
        destination: 'Delhi',
        departureDate: dayAfter,
        departureTime: '04:00 PM',
        farePerSeat: 450,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Tata', model: 'Nexon EV Empowered', licensePlate: 'DL-01-CZ-8821', color: 'Pristine White' },
        description: 'Scenic return journey from Tapovan taxi stand to New Delhi / CP. Smooth expressway ride.',
        status: 'active'
      },
      // 5. Delhi -> Haridwar (Uttarakhand)
      {
        driver: driverRajesh._id,
        source: 'Delhi',
        destination: 'Haridwar',
        departureDate: threeDays,
        departureTime: '06:30 AM',
        farePerSeat: 400,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire VXi', licensePlate: 'DL-03-AQ-9012', color: 'Silky Silver' },
        description: 'Morning departure from Anand Vihar ISBT to Har Ki Pauri Haridwar via Delhi-Meerut Expressway.',
        status: 'active'
      },
      // 6. Delhi -> Dehradun (Uttarakhand Capital)
      {
        driver: driverRajesh._id,
        source: 'Delhi',
        destination: 'Dehradun',
        departureDate: tomorrow,
        departureTime: '07:00 AM',
        farePerSeat: 500,
        totalSeats: 4,
        availableSeats: 3,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Ertiga ZXi', licensePlate: 'UK-07-TA-3344', color: 'Pearl White' },
        description: 'Comfortable family car heading to Dehradun Clock Tower / Rajpur Road via Mohand Ghats.',
        status: 'active'
      },
      // 7. Delhi -> Jaipur (Rajasthan)
      {
        driver: driverPriya._id,
        source: 'Delhi',
        destination: 'Jaipur',
        departureDate: tomorrow,
        departureTime: '06:00 AM',
        farePerSeat: 500,
        totalSeats: 3,
        availableSeats: 2,
        vehicleDetails: { make: 'Tata', model: 'Nexon EV Empowered', licensePlate: 'DL-01-CZ-8821', color: 'Pristine White' },
        description: 'Early morning start from IFFCO Chowk Gurgaon on Delhi-Jaipur Expressway. Quick stop at Behror for tea.',
        status: 'active'
      },
      // 8. Jaipur -> Delhi (Rajasthan Return)
      {
        driver: driverPriya._id,
        source: 'Jaipur',
        destination: 'Delhi',
        departureDate: dayAfter,
        departureTime: '05:30 PM',
        farePerSeat: 500,
        totalSeats: 3,
        availableSeats: 3,
        vehicleDetails: { make: 'Tata', model: 'Nexon EV Empowered', licensePlate: 'DL-01-CZ-8821', color: 'Pristine White' },
        description: 'Sindhi Camp Jaipur to Dhaula Kuan Delhi. Fastag enabled, relaxed driving.',
        status: 'active'
      },
      // 9. Bengaluru -> Mysuru (Karnataka)
      {
        driver: driverArjun._id,
        source: 'Bengaluru',
        destination: 'Mysuru',
        departureDate: tomorrow,
        departureTime: '08:00 AM',
        farePerSeat: 300,
        totalSeats: 4,
        availableSeats: 2,
        vehicleDetails: { make: 'Hyundai', model: 'Creta SX 2023', licensePlate: 'KA-05-MJ-9911', color: 'Phantom Black' },
        description: 'Cruising on the 10-lane expressway. Pickup from Silk Board / Kengeri Metro Station. Drop off at Mysore Palace.',
        status: 'active'
      },
      // 10. Mysuru -> Bengaluru (Karnataka Return)
      {
        driver: driverArjun._id,
        source: 'Mysuru',
        destination: 'Bengaluru',
        departureDate: dayAfter,
        departureTime: '06:00 PM',
        farePerSeat: 300,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Hyundai', model: 'Creta SX 2023', licensePlate: 'KA-05-MJ-9911', color: 'Phantom Black' },
        description: 'Return trip along Bengaluru-Mysuru Expressway. Quick 2 hour travel.',
        status: 'active'
      },
      // 11. Ahmedabad -> Surat (Gujarat)
      {
        driver: driverPriya._id,
        source: 'Ahmedabad',
        destination: 'Surat',
        departureDate: tomorrow,
        departureTime: '09:30 AM',
        farePerSeat: 450,
        totalSeats: 3,
        availableSeats: 3,
        vehicleDetails: { make: 'Tata', model: 'Nexon EV', licensePlate: 'GJ-01-XY-3420', color: 'Pristine White' },
        description: 'Direct drive on National Expressway 1 to Vadodara and Surat Ring Road.',
        status: 'active'
      },
      // 12. Surat -> Ahmedabad (Gujarat Return)
      {
        driver: driverPriya._id,
        source: 'Surat',
        destination: 'Ahmedabad',
        departureDate: dayAfter,
        departureTime: '04:00 PM',
        farePerSeat: 450,
        totalSeats: 3,
        availableSeats: 3,
        vehicleDetails: { make: 'Tata', model: 'Nexon EV', licensePlate: 'GJ-01-XY-3420', color: 'Pristine White' },
        description: 'Surat Kamrej to Ahmedabad CTM. Non-smoking, chilled AC.',
        status: 'active'
      },
      // 13. Delhi -> Chandigarh (Punjab / Haryana)
      {
        driver: driverRajesh._id,
        source: 'Delhi',
        destination: 'Chandigarh',
        departureDate: tomorrow,
        departureTime: '07:00 AM',
        farePerSeat: 400,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire VXi', licensePlate: 'DL-01-AB-4092', color: 'Arctic White' },
        description: 'Scenic GT Road drive via Panipat and Ambala with a quick breakfast stop at Murthal Sukhdev Dhaba.',
        status: 'active'
      },
      // 14. Chandigarh -> Delhi (Punjab / Haryana Return)
      {
        driver: driverRajesh._id,
        source: 'Chandigarh',
        destination: 'Delhi',
        departureDate: dayAfter,
        departureTime: '05:00 PM',
        farePerSeat: 400,
        totalSeats: 4,
        availableSeats: 3,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire VXi', licensePlate: 'DL-01-AB-4092', color: 'Arctic White' },
        description: 'Tribune Chowk Chandigarh to Kashmere Gate Delhi. Fastag enabled.',
        status: 'active'
      },
      // 15. Delhi -> Agra (Uttar Pradesh - Yamuna Expressway)
      {
        driver: driverRajesh._id,
        source: 'Delhi',
        destination: 'Agra',
        departureDate: threeDays,
        departureTime: '08:00 AM',
        farePerSeat: 380,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Ciaz Alpha', licensePlate: 'UP-16-BZ-5500', color: 'Metallic Grey' },
        description: 'Smooth ride on Yamuna Expressway. Leaving from Pari Chowk Greater Noida to Taj Mahal / Water Works Agra.',
        status: 'active'
      },
      // 16. Agra -> Lucknow (Uttar Pradesh - Agra-Lucknow Expressway)
      {
        driver: driverRajesh._id,
        source: 'Agra',
        destination: 'Lucknow',
        departureDate: fourDays,
        departureTime: '09:00 AM',
        farePerSeat: 550,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Ciaz Alpha', licensePlate: 'UP-16-BZ-5500', color: 'Metallic Grey' },
        description: 'Fastest 6-lane Greenfield expressway drive in India. Drop off at Hazratganj / Charbagh.',
        status: 'active'
      },
      // 17. Lucknow -> Varanasi (Uttar Pradesh - Purvanchal Expressway)
      {
        driver: driverRajesh._id,
        source: 'Lucknow',
        destination: 'Varanasi',
        departureDate: nextWeek,
        departureTime: '07:30 AM',
        farePerSeat: 480,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Ciaz Alpha', licensePlate: 'UP-32-DN-1122', color: 'Silver' },
        description: 'Spiritual corridor from Lucknow to Kashi Vishwanath Varanasi via Sultanpur and Jaunpur.',
        status: 'active'
      },
      // 18. Mumbai -> Goa (Maharashtra to Goa Coastal Express)
      {
        driver: driverArjun._id,
        source: 'Mumbai',
        destination: 'Goa',
        departureDate: tomorrow,
        departureTime: '05:00 AM',
        farePerSeat: 950,
        totalSeats: 4,
        availableSeats: 3,
        vehicleDetails: { make: 'Mahindra', model: 'XUV700 AX7', licensePlate: 'MH-02-FE-8899', color: 'Midnight Black' },
        description: 'Road trip to North Goa (Calangute/Panaji) via Panvel, Chiplun and Kankavli on NH66. Spacious 7-seater SUV.',
        status: 'active'
      },
      // 19. Mumbai -> Nashik (Maharashtra)
      {
        driver: driverArjun._id,
        source: 'Mumbai',
        destination: 'Nashik',
        departureDate: tomorrow,
        departureTime: '08:30 AM',
        farePerSeat: 380,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Mahindra', model: 'XUV700 AX7', licensePlate: 'MH-02-FE-8899', color: 'Midnight Black' },
        description: 'Thane to Nashik via Kasara Ghat on Samruddhi Mahamarg link. Great road and scenery.',
        status: 'active'
      },
      // 20. Pune -> Shirdi (Maharashtra Pilgrimage)
      {
        driver: driverRajesh._id,
        source: 'Pune',
        destination: 'Shirdi',
        departureDate: tomorrow,
        departureTime: '06:00 AM',
        farePerSeat: 420,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire', licensePlate: 'MH-12-RN-4050', color: 'Magma Grey' },
        description: 'Direct darshan trip to Sai Baba Temple Shirdi via Ahmednagar highway.',
        status: 'active'
      },
      // 21. Delhi -> Manali (Himachal Pradesh)
      {
        driver: driverPriya._id,
        source: 'Delhi',
        destination: 'Manali',
        departureDate: dayAfter,
        departureTime: '08:00 PM',
        farePerSeat: 950,
        totalSeats: 3,
        availableSeats: 2,
        vehicleDetails: { make: 'Toyota', model: 'Innova Crysta 2.4Z', licensePlate: 'DL-01-HP-7007', color: 'Garnet Red' },
        description: 'Overnight mountain journey to Manali Mall Road via Kiratpur-Nerchowk 4-lane tunnel highway.',
        status: 'active'
      },
      // 22. Delhi -> Shimla (Himachal Pradesh)
      {
        driver: driverPriya._id,
        source: 'Delhi',
        destination: 'Shimla',
        departureDate: threeDays,
        departureTime: '06:00 AM',
        farePerSeat: 650,
        totalSeats: 3,
        availableSeats: 3,
        vehicleDetails: { make: 'Toyota', model: 'Innova Crysta 2.4Z', licensePlate: 'DL-01-HP-7007', color: 'Garnet Red' },
        description: 'Comfortable hill drive from Delhi to Shimla Ridge / Old Bus Stand via Himalayan Expressway.',
        status: 'active'
      },
      // 23. Chennai -> Bengaluru (Tamil Nadu / Karnataka)
      {
        driver: driverArjun._id,
        source: 'Chennai',
        destination: 'Bengaluru',
        departureDate: tomorrow,
        departureTime: '06:30 AM',
        farePerSeat: 550,
        totalSeats: 4,
        availableSeats: 3,
        vehicleDetails: { make: 'Hyundai', model: 'Creta SX 2023', licensePlate: 'TN-01-AK-4455', color: 'Titan Grey' },
        description: 'Koyambedu Chennai to Electronic City Bengaluru via Sriperumbudur, Vellore and Hosur.',
        status: 'active'
      },
      // 24. Hyderabad -> Vijayawada (Telangana / Andhra Pradesh)
      {
        driver: driverArjun._id,
        source: 'Hyderabad',
        destination: 'Vijayawada',
        departureDate: tomorrow,
        departureTime: '05:30 AM',
        farePerSeat: 550,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Hyundai', model: 'Creta SX 2023', licensePlate: 'TS-09-AB-1234', color: 'Phantom Black' },
        description: 'Starting from LB Nagar circle on NH65. Smooth 4-lane highway drive with tea break near Suryapet.',
        status: 'active'
      },
      // 25. Hyderabad -> Bengaluru (Telangana / Karnataka)
      {
        driver: driverArjun._id,
        source: 'Hyderabad',
        destination: 'Bengaluru',
        departureDate: dayAfter,
        departureTime: '06:00 AM',
        farePerSeat: 750,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Hyundai', model: 'Creta SX 2023', licensePlate: 'TS-09-AB-1234', color: 'Phantom Black' },
        description: 'Gachibowli Hyderabad to Hebbal / Airport Road Bengaluru via Kurnool and Anantapur on NH44.',
        status: 'active'
      },
      // 26. Kolkata -> Siliguri (West Bengal)
      {
        driver: driverPriya._id,
        source: 'Kolkata',
        destination: 'Siliguri',
        departureDate: threeDays,
        departureTime: '07:00 PM',
        farePerSeat: 850,
        totalSeats: 3,
        availableSeats: 3,
        vehicleDetails: { make: 'Tata', model: 'Harrier Dark Edition', licensePlate: 'WB-02-AQ-9900', color: 'Atlas Black' },
        description: 'Gateway to Darjeeling & Sikkim. Overnight ride from Salt Lake to Siliguri Junction via Dalkhola bypass.',
        status: 'active'
      },
      // 27. Kochi -> Thiruvananthapuram (Kerala)
      {
        driver: driverArjun._id,
        source: 'Kochi',
        destination: 'Thiruvananthapuram',
        departureDate: tomorrow,
        departureTime: '07:00 AM',
        farePerSeat: 400,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Honda', model: 'City ZX', licensePlate: 'KL-07-CD-3322', color: 'Golden Brown' },
        description: 'Scenic Kerala coastal drive from Edappally to Trivandrum Central via Alappuzha & Kollam bypass.',
        status: 'active'
      },
      // 28. Indore -> Bhopal (Madhya Pradesh)
      {
        driver: driverRajesh._id,
        source: 'Indore',
        destination: 'Bhopal',
        departureDate: tomorrow,
        departureTime: '08:00 AM',
        farePerSeat: 300,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Brezza ZXi', licensePlate: 'MP-09-ZX-7890', color: 'Brave Khaki' },
        description: 'Indore Vijay Nagar to Bhopal MP Nagar via 4-lane State Highway 18 through Dewas and Sehore.',
        status: 'active'
      },
      // 29. Patna -> Gaya (Bihar)
      {
        driver: driverRajesh._id,
        source: 'Patna',
        destination: 'Gaya',
        departureDate: dayAfter,
        departureTime: '08:30 AM',
        farePerSeat: 250,
        totalSeats: 4,
        availableSeats: 4,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire', licensePlate: 'BR-01-KL-5544', color: 'White' },
        description: 'Patna Junction to Bodh Gaya pilgrimage site via Jehanabad on NH83.',
        status: 'active'
      },
      // 30. Bhubaneswar -> Puri (Odisha)
      {
        driver: driverPriya._id,
        source: 'Bhubaneswar',
        destination: 'Puri',
        departureDate: tomorrow,
        departureTime: '09:00 AM',
        farePerSeat: 200,
        totalSeats: 3,
        availableSeats: 3,
        vehicleDetails: { make: 'Tata', model: 'Punch Creative', licensePlate: 'OD-02-PQ-1212', color: 'Calypso Red' },
        description: 'Direct drive to Jagannath Temple & Golden Beach Puri along the Marine Drive Highway.',
        status: 'active'
      },
      // 31. Jaipur -> Udaipur (Rajasthan)
      {
        driver: driverPriya._id,
        source: 'Jaipur',
        destination: 'Udaipur',
        departureDate: tomorrow,
        departureTime: '07:00 AM',
        farePerSeat: 550,
        totalSeats: 3,
        availableSeats: 3,
        vehicleDetails: { make: 'Tata', model: 'Nexon EV', licensePlate: 'RJ-14-TY-6789', color: 'Daytona Grey' },
        description: 'Pink City to City of Lakes via Kishangarh, Ajmer bypass, and Bhilwara on NH48.',
        status: 'active'
      },
      // 32. Completed Past Ride: Chandigarh -> Delhi
      {
        driver: driverRajesh._id,
        source: 'Chandigarh',
        destination: 'Delhi',
        departureDate: pastDate,
        departureTime: '10:00 AM',
        farePerSeat: 400,
        totalSeats: 4,
        availableSeats: 2,
        vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire VXi 2023', licensePlate: 'CH-01-TB-7766', color: 'Magma Grey' },
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
