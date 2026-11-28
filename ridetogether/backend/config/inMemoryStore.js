const bcrypt = require('bcryptjs');

// Pre-generated bcrypt hashes for demo passwords:
// 'admin123' -> $2a$10$w8T.e20k2H0v1M1V3c1.7.3hE2kZ8u7wB2y1J7b5D6v9E1a2c3d4e (or live hashed at startup)
const hashPasswordSync = (password) => {
  return bcrypt.hashSync(password, 10);
};

const ADMIN_ID = '65f000000000000000000001';
const DRIVER_RAJESH_ID = '65f000000000000000000002';
const DRIVER_PRIYA_ID = '65f000000000000000000003';
const DRIVER_ARJUN_ID = '65f000000000000000000004';
const PASS_NEHA_ID = '65f000000000000000000005';
const PASS_ROHIT_ID = '65f000000000000000000006';
const PASS_ANANYA_ID = '65f000000000000000000007';

let users = [];
let rides = [];
let bookings = [];

// Helper to generate a 24-character hex ID
let idCounter = 100;
const generateId = () => {
  idCounter++;
  return '65f000000000000000' + idCounter.toString(16).padStart(6, '0');
};

function attachDocMethods(doc, collection) {
  if (!doc) return null;
  const clone = { ...doc };
  clone.id = clone._id;
  clone.toString = function () {
    return String(this._id);
  };
  clone.save = async function () {
    const idx = collection.findIndex((d) => String(d._id) === String(clone._id));
    if (idx !== -1) {
      collection[idx] = { ...clone, updatedAt: new Date() };
    }
    return attachDocMethods(clone, collection);
  };
  return clone;
}

function attachUserMethods(user) {
  if (!user) return null;
  const clone = attachDocMethods(user, users);
  clone.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
  };
  return clone;
}

function initializeStore() {
  const adminHash = hashPasswordSync('admin123');
  const driverHash = hashPasswordSync('driver123');
  const passHash = hashPasswordSync('passenger123');

  users = [
    {
      _id: ADMIN_ID,
      id: ADMIN_ID,
      name: 'Vikram Malhotra (Admin)',
      email: 'admin@ridetogether.com',
      password: adminHash,
      phone: '+91 98000 00001',
      role: 'admin',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      createdAt: new Date()
    },
    {
      _id: DRIVER_RAJESH_ID,
      id: DRIVER_RAJESH_ID,
      name: 'Rajesh Sharma',
      email: 'driver.rajesh@example.com',
      password: driverHash,
      phone: '+91 98234 56789',
      role: 'driver',
      profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      createdAt: new Date()
    },
    {
      _id: DRIVER_PRIYA_ID,
      id: DRIVER_PRIYA_ID,
      name: 'Priya Patel',
      email: 'driver.priya@example.com',
      password: driverHash,
      phone: '+91 98765 43210',
      role: 'driver',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      createdAt: new Date()
    },
    {
      _id: DRIVER_ARJUN_ID,
      id: DRIVER_ARJUN_ID,
      name: 'Arjun Reddy',
      email: 'driver.arjun@example.com',
      password: driverHash,
      phone: '+91 99887 76655',
      role: 'driver',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      createdAt: new Date()
    },
    {
      _id: PASS_NEHA_ID,
      id: PASS_NEHA_ID,
      name: 'Neha Gupta',
      email: 'passenger.neha@example.com',
      password: passHash,
      phone: '+91 91234 56780',
      role: 'passenger',
      profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      createdAt: new Date()
    },
    {
      _id: PASS_ROHIT_ID,
      id: PASS_ROHIT_ID,
      name: 'Rohit Verma',
      email: 'passenger.rohit@example.com',
      password: passHash,
      phone: '+91 98712 34567',
      role: 'passenger',
      profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      createdAt: new Date()
    },
    {
      _id: PASS_ANANYA_ID,
      id: PASS_ANANYA_ID,
      name: 'Ananya Iyer',
      email: 'passenger.ananya@example.com',
      password: passHash,
      phone: '+91 94455 66778',
      role: 'passenger',
      profileImage: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
      createdAt: new Date()
    }
  ];

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const threeDays = new Date(now.getTime() + 72 * 60 * 60 * 1000);
  const fourDays = new Date(now.getTime() + 96 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const pastDate = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

  const rawRides = [
    // 1. Mumbai -> Pune
    {
      _id: '65f000000000000000000010',
      driver: DRIVER_RAJESH_ID,
      source: 'Mumbai',
      destination: 'Pune',
      departureDate: tomorrow,
      departureTime: '07:30 AM',
      farePerSeat: 350,
      totalSeats: 4,
      availableSeats: 3,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire VXi 2023', licensePlate: 'MH-12-RN-4050', color: 'Magma Grey' },
      description: 'Leaving from Dadar TT Circle via Chembur and Vashi Toll Naka. Taking Mumbai-Pune Expressway, drop off at Wakad / Hinjawadi. Clean AC car, Fastag enabled.',
      status: 'active',
      createdAt: now
    },
    // 2. Pune -> Mumbai
    {
      _id: '65f000000000000000000011',
      driver: DRIVER_RAJESH_ID,
      source: 'Pune',
      destination: 'Mumbai',
      departureDate: dayAfter,
      departureTime: '06:00 PM',
      farePerSeat: 350,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire VXi 2023', licensePlate: 'MH-12-RN-4050', color: 'Magma Grey' },
      description: 'Return evening trip to Mumbai. Pickup from Hinjawadi Phase 1, drop off at Chembur or Sion. Smooth driving with live GPS route tracking.',
      status: 'active',
      createdAt: now
    },
    // 3. Delhi -> Rishikesh
    {
      _id: '65f000000000000000000012',
      driver: DRIVER_PRIYA_ID,
      source: 'Delhi',
      destination: 'Rishikesh',
      departureDate: tomorrow,
      departureTime: '06:00 AM',
      farePerSeat: 450,
      totalSeats: 4,
      availableSeats: 3,
      vehicleDetails: { make: 'Tata', model: 'Nexon EV Empowered', licensePlate: 'DL-01-CZ-8821', color: 'Pristine White' },
      description: 'Expressway direct to Yoga Capital Rishikesh via Delhi-Meerut Expressway and Haridwar bypass. Pickup at Akshardham Metro, drop off at Tapovan.',
      status: 'active',
      createdAt: now
    },
    // 4. Rishikesh -> Delhi
    {
      _id: '65f000000000000000000013',
      driver: DRIVER_PRIYA_ID,
      source: 'Rishikesh',
      destination: 'Delhi',
      departureDate: dayAfter,
      departureTime: '04:00 PM',
      farePerSeat: 450,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Tata', model: 'Nexon EV Empowered', licensePlate: 'DL-01-CZ-8821', color: 'Pristine White' },
      description: 'Scenic return journey from Tapovan taxi stand to New Delhi / CP. Smooth expressway ride.',
      status: 'active',
      createdAt: now
    },
    // 5. Delhi -> Haridwar
    {
      _id: '65f000000000000000000014',
      driver: DRIVER_RAJESH_ID,
      source: 'Delhi',
      destination: 'Haridwar',
      departureDate: threeDays,
      departureTime: '06:30 AM',
      farePerSeat: 400,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire VXi', licensePlate: 'DL-03-AQ-9012', color: 'Silky Silver' },
      description: 'Morning departure from Anand Vihar ISBT to Har Ki Pauri Haridwar via Delhi-Meerut Expressway.',
      status: 'active',
      createdAt: now
    },
    // 6. Delhi -> Dehradun
    {
      _id: '65f000000000000000000015',
      driver: DRIVER_RAJESH_ID,
      source: 'Delhi',
      destination: 'Dehradun',
      departureDate: tomorrow,
      departureTime: '07:00 AM',
      farePerSeat: 500,
      totalSeats: 4,
      availableSeats: 3,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Ertiga ZXi', licensePlate: 'UK-07-TA-3344', color: 'Pearl White' },
      description: 'Comfortable family car heading to Dehradun Clock Tower / Rajpur Road via Mohand Ghats.',
      status: 'active',
      createdAt: now
    },
    // 7. Delhi -> Jaipur
    {
      _id: '65f000000000000000000016',
      driver: DRIVER_PRIYA_ID,
      source: 'Delhi',
      destination: 'Jaipur',
      departureDate: tomorrow,
      departureTime: '06:00 AM',
      farePerSeat: 500,
      totalSeats: 3,
      availableSeats: 2,
      vehicleDetails: { make: 'Tata', model: 'Nexon EV Empowered', licensePlate: 'DL-01-CZ-8821', color: 'Pristine White' },
      description: 'Early morning start from IFFCO Chowk Gurgaon on Delhi-Jaipur Expressway. Quick stop at Behror for tea.',
      status: 'active',
      createdAt: now
    },
    // 8. Jaipur -> Delhi
    {
      _id: '65f000000000000000000017',
      driver: DRIVER_PRIYA_ID,
      source: 'Jaipur',
      destination: 'Delhi',
      departureDate: dayAfter,
      departureTime: '05:30 PM',
      farePerSeat: 500,
      totalSeats: 3,
      availableSeats: 3,
      vehicleDetails: { make: 'Tata', model: 'Nexon EV Empowered', licensePlate: 'DL-01-CZ-8821', color: 'Pristine White' },
      description: 'Sindhi Camp Jaipur to Dhaula Kuan Delhi. Fastag enabled, relaxed driving.',
      status: 'active',
      createdAt: now
    },
    // 9. Bengaluru -> Mysuru
    {
      _id: '65f000000000000000000018',
      driver: DRIVER_ARJUN_ID,
      source: 'Bengaluru',
      destination: 'Mysuru',
      departureDate: tomorrow,
      departureTime: '08:00 AM',
      farePerSeat: 300,
      totalSeats: 4,
      availableSeats: 2,
      vehicleDetails: { make: 'Hyundai', model: 'Creta SX 2023', licensePlate: 'KA-05-MJ-9911', color: 'Phantom Black' },
      description: 'Cruising on the 10-lane expressway. Pickup from Silk Board / Kengeri Metro Station. Drop off at Mysore Palace.',
      status: 'active',
      createdAt: now
    },
    // 10. Mysuru -> Bengaluru
    {
      _id: '65f000000000000000000019',
      driver: DRIVER_ARJUN_ID,
      source: 'Mysuru',
      destination: 'Bengaluru',
      departureDate: dayAfter,
      departureTime: '06:00 PM',
      farePerSeat: 300,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Hyundai', model: 'Creta SX 2023', licensePlate: 'KA-05-MJ-9911', color: 'Phantom Black' },
      description: 'Return trip along Bengaluru-Mysuru Expressway. Quick 2 hour travel.',
      status: 'active',
      createdAt: now
    },
    // 11. Ahmedabad -> Surat
    {
      _id: '65f00000000000000000001a',
      driver: DRIVER_PRIYA_ID,
      source: 'Ahmedabad',
      destination: 'Surat',
      departureDate: tomorrow,
      departureTime: '09:30 AM',
      farePerSeat: 450,
      totalSeats: 3,
      availableSeats: 3,
      vehicleDetails: { make: 'Tata', model: 'Nexon EV', licensePlate: 'GJ-01-XY-3420', color: 'Pristine White' },
      description: 'Direct drive on National Expressway 1 to Vadodara and Surat Ring Road.',
      status: 'active',
      createdAt: now
    },
    // 12. Surat -> Ahmedabad
    {
      _id: '65f00000000000000000001b',
      driver: DRIVER_PRIYA_ID,
      source: 'Surat',
      destination: 'Ahmedabad',
      departureDate: dayAfter,
      departureTime: '04:00 PM',
      farePerSeat: 450,
      totalSeats: 3,
      availableSeats: 3,
      vehicleDetails: { make: 'Tata', model: 'Nexon EV', licensePlate: 'GJ-01-XY-3420', color: 'Pristine White' },
      description: 'Surat Kamrej to Ahmedabad CTM. Non-smoking, chilled AC.',
      status: 'active',
      createdAt: now
    },
    // 13. Delhi -> Chandigarh
    {
      _id: '65f00000000000000000001c',
      driver: DRIVER_RAJESH_ID,
      source: 'Delhi',
      destination: 'Chandigarh',
      departureDate: tomorrow,
      departureTime: '07:00 AM',
      farePerSeat: 400,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire VXi', licensePlate: 'DL-01-AB-4092', color: 'Arctic White' },
      description: 'Scenic GT Road drive via Panipat and Ambala with a quick breakfast stop at Murthal Sukhdev Dhaba.',
      status: 'active',
      createdAt: now
    },
    // 14. Chandigarh -> Delhi
    {
      _id: '65f00000000000000000001d',
      driver: DRIVER_RAJESH_ID,
      source: 'Chandigarh',
      destination: 'Delhi',
      departureDate: dayAfter,
      departureTime: '05:00 PM',
      farePerSeat: 400,
      totalSeats: 4,
      availableSeats: 3,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire VXi', licensePlate: 'DL-01-AB-4092', color: 'Arctic White' },
      description: 'Tribune Chowk Chandigarh to Kashmere Gate Delhi. Fastag enabled.',
      status: 'active',
      createdAt: now
    },
    // 15. Delhi -> Agra
    {
      _id: '65f00000000000000000001e',
      driver: DRIVER_RAJESH_ID,
      source: 'Delhi',
      destination: 'Agra',
      departureDate: threeDays,
      departureTime: '08:00 AM',
      farePerSeat: 380,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Ciaz Alpha', licensePlate: 'UP-16-BZ-5500', color: 'Metallic Grey' },
      description: 'Smooth ride on Yamuna Expressway. Leaving from Pari Chowk Greater Noida to Taj Mahal / Water Works Agra.',
      status: 'active',
      createdAt: now
    },
    // 16. Agra -> Lucknow
    {
      _id: '65f00000000000000000001f',
      driver: DRIVER_RAJESH_ID,
      source: 'Agra',
      destination: 'Lucknow',
      departureDate: fourDays,
      departureTime: '09:00 AM',
      farePerSeat: 550,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Ciaz Alpha', licensePlate: 'UP-16-BZ-5500', color: 'Metallic Grey' },
      description: 'Fastest 6-lane Greenfield expressway drive in India. Drop off at Hazratganj / Charbagh.',
      status: 'active',
      createdAt: now
    },
    // 17. Lucknow -> Varanasi
    {
      _id: '65f000000000000000000020',
      driver: DRIVER_RAJESH_ID,
      source: 'Lucknow',
      destination: 'Varanasi',
      departureDate: nextWeek,
      departureTime: '07:30 AM',
      farePerSeat: 480,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Ciaz Alpha', licensePlate: 'UP-32-DN-1122', color: 'Silver' },
      description: 'Spiritual corridor from Lucknow to Kashi Vishwanath Varanasi via Sultanpur and Jaunpur.',
      status: 'active',
      createdAt: now
    },
    // 18. Mumbai -> Goa
    {
      _id: '65f000000000000000000021',
      driver: DRIVER_ARJUN_ID,
      source: 'Mumbai',
      destination: 'Goa',
      departureDate: tomorrow,
      departureTime: '05:00 AM',
      farePerSeat: 950,
      totalSeats: 4,
      availableSeats: 3,
      vehicleDetails: { make: 'Mahindra', model: 'XUV700 AX7', licensePlate: 'MH-02-FE-8899', color: 'Midnight Black' },
      description: 'Road trip to North Goa (Calangute/Panaji) via Panvel, Chiplun and Kankavli on NH66. Spacious 7-seater SUV.',
      status: 'active',
      createdAt: now
    },
    // 19. Mumbai -> Nashik
    {
      _id: '65f000000000000000000022',
      driver: DRIVER_ARJUN_ID,
      source: 'Mumbai',
      destination: 'Nashik',
      departureDate: tomorrow,
      departureTime: '08:30 AM',
      farePerSeat: 380,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Mahindra', model: 'XUV700 AX7', licensePlate: 'MH-02-FE-8899', color: 'Midnight Black' },
      description: 'Thane to Nashik via Kasara Ghat on Samruddhi Mahamarg link. Great road and scenery.',
      status: 'active',
      createdAt: now
    },
    // 20. Pune -> Shirdi
    {
      _id: '65f000000000000000000023',
      driver: DRIVER_RAJESH_ID,
      source: 'Pune',
      destination: 'Shirdi',
      departureDate: tomorrow,
      departureTime: '06:00 AM',
      farePerSeat: 420,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire', licensePlate: 'MH-12-RN-4050', color: 'Magma Grey' },
      description: 'Direct darshan trip to Sai Baba Temple Shirdi via Ahmednagar highway.',
      status: 'active',
      createdAt: now
    },
    // 21. Delhi -> Manali
    {
      _id: '65f000000000000000000024',
      driver: DRIVER_PRIYA_ID,
      source: 'Delhi',
      destination: 'Manali',
      departureDate: dayAfter,
      departureTime: '08:00 PM',
      farePerSeat: 950,
      totalSeats: 3,
      availableSeats: 2,
      vehicleDetails: { make: 'Toyota', model: 'Innova Crysta 2.4Z', licensePlate: 'DL-01-HP-7007', color: 'Garnet Red' },
      description: 'Overnight mountain journey to Manali Mall Road via Kiratpur-Nerchowk 4-lane tunnel highway.',
      status: 'active',
      createdAt: now
    },
    // 22. Delhi -> Shimla
    {
      _id: '65f000000000000000000025',
      driver: DRIVER_PRIYA_ID,
      source: 'Delhi',
      destination: 'Shimla',
      departureDate: threeDays,
      departureTime: '06:00 AM',
      farePerSeat: 650,
      totalSeats: 3,
      availableSeats: 3,
      vehicleDetails: { make: 'Toyota', model: 'Innova Crysta 2.4Z', licensePlate: 'DL-01-HP-7007', color: 'Garnet Red' },
      description: 'Comfortable hill drive from Delhi to Shimla Ridge / Old Bus Stand via Himalayan Expressway.',
      status: 'active',
      createdAt: now
    },
    // 23. Chennai -> Bengaluru
    {
      _id: '65f000000000000000000026',
      driver: DRIVER_ARJUN_ID,
      source: 'Chennai',
      destination: 'Bengaluru',
      departureDate: tomorrow,
      departureTime: '06:30 AM',
      farePerSeat: 550,
      totalSeats: 4,
      availableSeats: 3,
      vehicleDetails: { make: 'Hyundai', model: 'Creta SX 2023', licensePlate: 'TN-01-AK-4455', color: 'Titan Grey' },
      description: 'Koyambedu Chennai to Electronic City Bengaluru via Sriperumbudur, Vellore and Hosur.',
      status: 'active',
      createdAt: now
    },
    // 24. Hyderabad -> Vijayawada
    {
      _id: '65f000000000000000000027',
      driver: DRIVER_ARJUN_ID,
      source: 'Hyderabad',
      destination: 'Vijayawada',
      departureDate: tomorrow,
      departureTime: '05:30 AM',
      farePerSeat: 550,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Hyundai', model: 'Creta SX 2023', licensePlate: 'TS-09-AB-1234', color: 'Phantom Black' },
      description: 'Starting from LB Nagar circle on NH65. Smooth 4-lane highway drive with tea break near Suryapet.',
      status: 'active',
      createdAt: now
    },
    // 25. Hyderabad -> Bengaluru
    {
      _id: '65f000000000000000000028',
      driver: DRIVER_ARJUN_ID,
      source: 'Hyderabad',
      destination: 'Bengaluru',
      departureDate: dayAfter,
      departureTime: '06:00 AM',
      farePerSeat: 750,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Hyundai', model: 'Creta SX 2023', licensePlate: 'TS-09-AB-1234', color: 'Phantom Black' },
      description: 'Gachibowli Hyderabad to Hebbal / Airport Road Bengaluru via Kurnool and Anantapur on NH44.',
      status: 'active',
      createdAt: now
    },
    // 26. Kolkata -> Siliguri
    {
      _id: '65f000000000000000000029',
      driver: DRIVER_PRIYA_ID,
      source: 'Kolkata',
      destination: 'Siliguri',
      departureDate: threeDays,
      departureTime: '07:00 PM',
      farePerSeat: 850,
      totalSeats: 3,
      availableSeats: 3,
      vehicleDetails: { make: 'Tata', model: 'Harrier Dark Edition', licensePlate: 'WB-02-AQ-9900', color: 'Atlas Black' },
      description: 'Gateway to Darjeeling & Sikkim. Overnight ride from Salt Lake to Siliguri Junction via Dalkhola bypass.',
      status: 'active',
      createdAt: now
    },
    // 27. Kochi -> Thiruvananthapuram
    {
      _id: '65f00000000000000000002a',
      driver: DRIVER_ARJUN_ID,
      source: 'Kochi',
      destination: 'Thiruvananthapuram',
      departureDate: tomorrow,
      departureTime: '07:00 AM',
      farePerSeat: 400,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Honda', model: 'City ZX', licensePlate: 'KL-07-CD-3322', color: 'Golden Brown' },
      description: 'Scenic Kerala coastal drive from Edappally to Trivandrum Central via Alappuzha & Kollam bypass.',
      status: 'active',
      createdAt: now
    },
    // 28. Indore -> Bhopal
    {
      _id: '65f00000000000000000002b',
      driver: DRIVER_RAJESH_ID,
      source: 'Indore',
      destination: 'Bhopal',
      departureDate: tomorrow,
      departureTime: '08:00 AM',
      farePerSeat: 300,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Brezza ZXi', licensePlate: 'MP-09-ZX-7890', color: 'Brave Khaki' },
      description: 'Indore Vijay Nagar to Bhopal MP Nagar via 4-lane State Highway 18 through Dewas and Sehore.',
      status: 'active',
      createdAt: now
    },
    // 29. Patna -> Gaya
    {
      _id: '65f00000000000000000002c',
      driver: DRIVER_RAJESH_ID,
      source: 'Patna',
      destination: 'Gaya',
      departureDate: dayAfter,
      departureTime: '08:30 AM',
      farePerSeat: 250,
      totalSeats: 4,
      availableSeats: 4,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire', licensePlate: 'BR-01-KL-5544', color: 'White' },
      description: 'Patna Junction to Bodh Gaya pilgrimage site via Jehanabad on NH83.',
      status: 'active',
      createdAt: now
    },
    // 30. Bhubaneswar -> Puri
    {
      _id: '65f00000000000000000002d',
      driver: DRIVER_PRIYA_ID,
      source: 'Bhubaneswar',
      destination: 'Puri',
      departureDate: tomorrow,
      departureTime: '09:00 AM',
      farePerSeat: 200,
      totalSeats: 3,
      availableSeats: 3,
      vehicleDetails: { make: 'Tata', model: 'Punch Creative', licensePlate: 'OD-02-PQ-1212', color: 'Calypso Red' },
      description: 'Direct drive to Jagannath Temple & Golden Beach Puri along the Marine Drive Highway.',
      status: 'active',
      createdAt: now
    },
    // 31. Jaipur -> Udaipur
    {
      _id: '65f00000000000000000002e',
      driver: DRIVER_PRIYA_ID,
      source: 'Jaipur',
      destination: 'Udaipur',
      departureDate: tomorrow,
      departureTime: '07:00 AM',
      farePerSeat: 550,
      totalSeats: 3,
      availableSeats: 3,
      vehicleDetails: { make: 'Tata', model: 'Nexon EV', licensePlate: 'RJ-14-TY-6789', color: 'Daytona Grey' },
      description: 'Pink City to City of Lakes via Kishangarh, Ajmer bypass, and Bhilwara on NH48.',
      status: 'active',
      createdAt: now
    },
    // 32. Completed Past Ride: Chandigarh -> Delhi
    {
      _id: '65f00000000000000000002f',
      driver: DRIVER_RAJESH_ID,
      source: 'Chandigarh',
      destination: 'Delhi',
      departureDate: pastDate,
      departureTime: '10:00 AM',
      farePerSeat: 400,
      totalSeats: 4,
      availableSeats: 2,
      vehicleDetails: { make: 'Maruti Suzuki', model: 'Dzire VXi 2023', licensePlate: 'CH-01-TB-7766', color: 'Magma Grey' },
      description: 'Completed historic journey along GT Road via Ambala and Karnal.',
      status: 'completed',
      createdAt: pastDate
    }
  ];

  rides = rawRides.map((r) => ({ ...r, id: r._id }));

  bookings = [
    {
      _id: '65f000000000000000000050',
      id: '65f000000000000000000050',
      passenger: PASS_NEHA_ID,
      ride: '65f000000000000000000010',
      seatsBooked: 1,
      totalFare: 350,
      status: 'accepted',
      tripStatus: 'accepted',
      otp: '4821',
      createdAt: now
    },
    {
      _id: '65f000000000000000000051',
      id: '65f000000000000000000051',
      passenger: PASS_ROHIT_ID,
      ride: '65f000000000000000000012',
      seatsBooked: 1,
      totalFare: 450,
      status: 'accepted',
      tripStatus: 'accepted',
      otp: '7392',
      createdAt: now
    },
    {
      _id: '65f000000000000000000052',
      id: '65f000000000000000000052',
      passenger: PASS_ANANYA_ID,
      ride: '65f000000000000000000018',
      seatsBooked: 2,
      totalFare: 600,
      status: 'accepted',
      tripStatus: 'accepted',
      otp: '1945',
      createdAt: now
    },
    {
      _id: '65f000000000000000000053',
      id: '65f000000000000000000053',
      passenger: PASS_NEHA_ID,
      ride: '65f000000000000000000011',
      seatsBooked: 1,
      totalFare: 350,
      status: 'pending',
      tripStatus: 'requested',
      otp: '8820',
      createdAt: now
    }
  ];

  console.log(`[InMemoryStore] Initialized: ${users.length} users, ${rides.length} rides, ${bookings.length} bookings.`);
}

initializeStore();

// Query matcher helper
function matchDoc(doc, query) {
  if (!query || Object.keys(query).length === 0) return true;

  for (const [key, cond] of Object.entries(query)) {
    if (key === '$or' && Array.isArray(cond)) {
      const anyMatch = cond.some((subQ) => matchDoc(doc, subQ));
      if (!anyMatch) return false;
      continue;
    }

    const docVal = doc[key];

    if (cond && typeof cond === 'object' && cond.constructor === Object) {
      if ('$regex' in cond) {
        const re = new RegExp(cond.$regex, cond.$options || 'i');
        if (!re.test(String(docVal || ''))) return false;
      }
      if ('$in' in cond && Array.isArray(cond.$in)) {
        const matchesIn = cond.$in.some((v) => String(v) === String(docVal));
        if (!matchesIn) return false;
      }
      if ('$gte' in cond) {
        const condVal = cond.$gte instanceof Date ? cond.$gte.getTime() : cond.$gte;
        const val = docVal instanceof Date ? docVal.getTime() : docVal;
        if (val < condVal) return false;
      }
      if ('$lte' in cond) {
        const condVal = cond.$lte instanceof Date ? cond.$lte.getTime() : cond.$lte;
        const val = docVal instanceof Date ? docVal.getTime() : docVal;
        if (val > condVal) return false;
      }
      if ('$gt' in cond) {
        const condVal = cond.$gt instanceof Date ? cond.$gt.getTime() : cond.$gt;
        const val = docVal instanceof Date ? docVal.getTime() : docVal;
        if (val <= condVal) return false;
      }
      if ('$lt' in cond) {
        const condVal = cond.$lt instanceof Date ? cond.$lt.getTime() : cond.$lt;
        const val = docVal instanceof Date ? docVal.getTime() : docVal;
        if (val >= condVal) return false;
      }
    } else {
      if (String(docVal) !== String(cond)) {
        return false;
      }
    }
  }
  return true;
}

// Populate helper
function populateItem(item, path, select) {
  if (!item) return item;
  const clone = { ...item };

  if (path === 'driver' || (typeof path === 'object' && path.path === 'driver')) {
    const driverId = clone.driver && clone.driver._id ? clone.driver._id : clone.driver;
    const found = users.find((u) => String(u._id) === String(driverId));
    if (found) {
      clone.driver = {
        _id: found._id,
        id: found._id,
        name: found.name,
        email: found.email,
        phone: found.phone,
        profileImage: found.profileImage
      };
    }
  } else if (path === 'passenger' || (typeof path === 'object' && path.path === 'passenger')) {
    const passId = clone.passenger && clone.passenger._id ? clone.passenger._id : clone.passenger;
    const found = users.find((u) => String(u._id) === String(passId));
    if (found) {
      clone.passenger = {
        _id: found._id,
        id: found._id,
        name: found.name,
        email: found.email,
        phone: found.phone,
        profileImage: found.profileImage
      };
    }
  } else if (path === 'ride' || (typeof path === 'object' && path.path === 'ride')) {
    const rideId = clone.ride && clone.ride._id ? clone.ride._id : clone.ride;
    const found = rides.find((r) => String(r._id) === String(rideId));
    if (found) {
      let populatedRide = { ...found };
      if (typeof path === 'object' && path.populate && path.populate.path === 'driver') {
        populatedRide = populateItem(populatedRide, 'driver', path.populate.select);
      }
      clone.ride = populatedRide;
    }
  }

  return clone;
}

// QueryChain builder
class QueryChain {
  constructor(items, isSingle = false) {
    this._items = [...items];
    this._isSingle = isSingle;
    this._populates = [];
    this._sortCriteria = null;
    this._skipCount = 0;
    this._limitCount = null;
    this._selectFields = null;
  }

  populate(path, select) {
    this._populates.push({ path, select });
    return this;
  }

  sort(criteria) {
    this._sortCriteria = criteria;
    return this;
  }

  skip(n) {
    this._skipCount = Number(n) || 0;
    return this;
  }

  limit(n) {
    this._limitCount = Number(n);
    return this;
  }

  select(fields) {
    this._selectFields = fields;
    return this;
  }

  lean() {
    return this;
  }

  _execute() {
    let results = this._items.map((it) => ({ ...it }));

    // Apply sorting
    if (this._sortCriteria) {
      if (typeof this._sortCriteria === 'string') {
        const field = this._sortCriteria.startsWith('-') ? this._sortCriteria.slice(1) : this._sortCriteria;
        const dir = this._sortCriteria.startsWith('-') ? -1 : 1;
        results.sort((a, b) => {
          if (a[field] < b[field]) return -1 * dir;
          if (a[field] > b[field]) return 1 * dir;
          return 0;
        });
      } else if (typeof this._sortCriteria === 'object') {
        for (const [field, dir] of Object.entries(this._sortCriteria)) {
          results.sort((a, b) => {
            if (a[field] < b[field]) return -1 * dir;
            if (a[field] > b[field]) return 1 * dir;
            return 0;
          });
        }
      }
    }

    // Apply skip & limit
    if (this._skipCount > 0) {
      results = results.slice(this._skipCount);
    }
    if (this._limitCount !== null && this._limitCount !== undefined) {
      results = results.slice(0, this._limitCount);
    }

    // Apply populates
    for (const pop of this._populates) {
      results = results.map((item) => populateItem(item, pop.path, pop.select));
    }

    // Apply select field filters (like -password or +password)
    if (this._selectFields) {
      const selectStr = String(this._selectFields);
      if (selectStr.includes('-password')) {
        results.forEach((it) => delete it.password);
      }
    } else {
      // By default for user queries without explicit select('+password'), omit password from JSON
      if (this._items.length > 0 && 'email' in this._items[0] && 'password' in this._items[0]) {
        results.forEach((it) => {
          // Keep password property non-enumerable or attach user methods
        });
      }
    }

    // Attach user or doc methods
    results = results.map((it) => {
      if ('email' in it && 'password' in it) {
        return attachUserMethods(it);
      }
      if ('farePerSeat' in it) {
        return attachDocMethods(it, rides);
      }
      if ('seatsBooked' in it) {
        return attachDocMethods(it, bookings);
      }
      return it;
    });

    if (this._isSingle) {
      return results.length > 0 ? results[0] : null;
    }
    return results;
  }

  // Make it thenable so `await QueryChain` resolves seamlessly
  then(resolve, reject) {
    try {
      const res = this._execute();
      resolve(res);
    } catch (err) {
      reject(err);
    }
  }

  exec() {
    return Promise.resolve(this._execute());
  }
}

function runAggregate(modelName, pipeline = []) {
  if (modelName === 'User') {
    const roles = {};
    users.forEach((u) => {
      roles[u.role] = (roles[u.role] || 0) + 1;
    });
    return Promise.resolve(
      Object.entries(roles).map(([role, count]) => ({ _id: role, count }))
    );
  }

  if (modelName === 'Ride') {
    const matchStage = pipeline.find((s) => s.$match);
    if (matchStage && matchStage.$match && matchStage.$match.driver) {
      const driverId = String(matchStage.$match.driver);
      const driverRides = rides.filter((r) => String(r.driver && r.driver._id ? r.driver._id : r.driver) === driverId);
      const dests = {};
      driverRides.forEach((r) => {
        if (!dests[r.destination]) {
          dests[r.destination] = { count: 0, seats: 0, fareSum: 0 };
        }
        dests[r.destination].count++;
        dests[r.destination].seats += r.availableSeats || 0;
        dests[r.destination].fareSum += r.farePerSeat || 0;
      });
      return Promise.resolve(
        Object.entries(dests).map(([destination, data]) => ({
          _id: destination,
          ridesCount: data.count,
          totalSeatsAvailable: data.seats,
          averageFare: data.count > 0 ? Math.round(data.fareSum / data.count) : 0
        }))
      );
    }

    const statuses = {};
    rides.forEach((r) => {
      statuses[r.status] = (statuses[r.status] || 0) + 1;
    });
    return Promise.resolve(
      Object.entries(statuses).map(([status, count]) => ({ _id: status, count }))
    );
  }

  if (modelName === 'Booking') {
    const hasMatch = pipeline.find((s) => s.$match);
    const hasLookup = pipeline.find((s) => s.$lookup);
    const hasGroup = pipeline.find((s) => s.$group);

    const driverMatch = pipeline.find((s) => s.$match && s.$match['rideData.driver']);
    if (driverMatch) {
      const driverId = String(driverMatch.$match['rideData.driver']);
      const driverRideIds = rides
        .filter((r) => String(r.driver && r.driver._id ? r.driver._id : r.driver) === driverId)
        .map((r) => String(r._id));

      const driverBookings = bookings.filter((b) => driverRideIds.includes(String(b.ride && b.ride._id ? b.ride._id : b.ride)));

      if (hasMatch && hasMatch.$match.status === 'pending' && pipeline.find((s) => s.$count)) {
        const pending = driverBookings.filter((b) => b.status === 'pending');
        return Promise.resolve([{ pendingCount: pending.length }]);
      }

      if (hasGroup && hasGroup.$group && hasGroup.$group._id && hasGroup.$group._id.$dateToString) {
        const accepted = driverBookings.filter((b) => b.status === 'accepted');
        const months = {};
        accepted.forEach((b) => {
          const d = b.createdAt ? new Date(b.createdAt) : new Date();
          const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!months[mKey]) months[mKey] = { monthlyEarnings: 0, bookingsCount: 0 };
          months[mKey].monthlyEarnings += b.totalFare || 0;
          months[mKey].bookingsCount++;
        });
        const res = Object.entries(months).map(([month, data]) => ({
          month,
          monthlyEarnings: data.monthlyEarnings,
          bookingsCount: data.bookingsCount
        }));
        return Promise.resolve(res);
      }

      const accepted = driverBookings.filter((b) => b.status === 'accepted');
      const totalEarnings = accepted.reduce((acc, b) => acc + (b.totalFare || 0), 0);
      const totalSeatsSold = accepted.reduce((acc, b) => acc + (b.seatsBooked || 0), 0);
      return Promise.resolve([
        {
          totalEarnings,
          totalAcceptedBookings: accepted.length,
          totalSeatsSold
        }
      ]);
    }

    if (hasLookup && hasGroup && hasGroup.$group && hasGroup.$group._id && hasGroup.$group._id.source) {
      const accepted = bookings.filter((b) => b.status === 'accepted');
      const routes = {};
      accepted.forEach((b) => {
        const rideId = String(b.ride && b.ride._id ? b.ride._id : b.ride);
        const r = rides.find((ride) => String(ride._id) === rideId);
        if (r) {
          const key = `${r.source} -> ${r.destination}`;
          if (!routes[key]) {
            routes[key] = {
              source: r.source,
              destination: r.destination,
              bookingsCount: 0,
              totalSeatsBooked: 0,
              totalRevenue: 0
            };
          }
          routes[key].bookingsCount++;
          routes[key].totalSeatsBooked += b.seatsBooked || 1;
          routes[key].totalRevenue += b.totalFare || 0;
        }
      });
      const sorted = Object.values(routes).sort((a, b) => b.bookingsCount - a.bookingsCount || b.totalRevenue - a.totalRevenue);
      return Promise.resolve(sorted.slice(0, 5));
    }

    if (hasGroup && hasGroup.$group && hasGroup.$group._id && hasGroup.$group._id.$dateToString) {
      const accepted = bookings.filter((b) => b.status === 'accepted');
      const months = {};
      accepted.forEach((b) => {
        const d = b.createdAt ? new Date(b.createdAt) : new Date();
        const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        if (!months[mKey]) months[mKey] = { revenue: 0, count: 0 };
        months[mKey].revenue += b.totalFare || 0;
        months[mKey].count++;
      });
      return Promise.resolve(
        Object.entries(months).map(([month, data]) => ({
          month,
          revenue: data.revenue,
          count: data.count
        }))
      );
    }

    // Default booking status summary
    const statuses = {};
    bookings.forEach((b) => {
      if (!statuses[b.status]) {
        statuses[b.status] = { count: 0, revenue: 0 };
      }
      statuses[b.status].count++;
      if (b.status === 'accepted') {
        statuses[b.status].revenue += b.totalFare || 0;
      }
    });
    return Promise.resolve(
      Object.entries(statuses).map(([status, data]) => ({
        _id: status,
        count: data.count,
        revenue: data.revenue
      }))
    );
  }

  return Promise.resolve([]);
}

// User Mock Model
const UserModel = {
  find(query = {}) {
    const matched = users.filter((u) => matchDoc(u, query));
    return new QueryChain(matched, false);
  },
  findOne(query = {}) {
    const matched = users.filter((u) => matchDoc(u, query));
    return new QueryChain(matched, true);
  },
  findById(id) {
    const found = users.find((u) => String(u._id) === String(id) || String(u.id) === String(id));
    return new QueryChain(found ? [found] : [], true);
  },
  async create(doc) {
    const newDoc = {
      _id: generateId(),
      ...doc,
      email: (doc.email || '').toLowerCase().trim(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    newDoc.id = newDoc._id;
    if (newDoc.password && !newDoc.password.startsWith('$2')) {
      newDoc.password = await bcrypt.hash(newDoc.password, 10);
    }
    users.push(newDoc);
    return attachUserMethods(newDoc);
  },
  countDocuments(query = {}) {
    const matched = users.filter((u) => matchDoc(u, query));
    return Promise.resolve(matched.length);
  },
  findByIdAndUpdate(id, updates, options = {}) {
    const idx = users.findIndex((u) => String(u._id) === String(id) || String(u.id) === String(id));
    if (idx === -1) return Promise.resolve(null);
    users[idx] = { ...users[idx], ...updates, updatedAt: new Date() };
    return Promise.resolve(attachUserMethods(users[idx]));
  },
  aggregate(pipeline = []) {
    return runAggregate('User', pipeline);
  }
};

// Ride Mock Model
const RideModel = {
  find(query = {}) {
    const matched = rides.filter((r) => matchDoc(r, query));
    return new QueryChain(matched, false);
  },
  findOne(query = {}) {
    const matched = rides.filter((r) => matchDoc(r, query));
    return new QueryChain(matched, true);
  },
  findById(id) {
    const found = rides.find((r) => String(r._id) === String(id) || String(r.id) === String(id));
    return new QueryChain(found ? [found] : [], true);
  },
  async create(doc) {
    const newDoc = {
      _id: generateId(),
      ...doc,
      status: doc.status || 'active',
      availableSeats: Number(doc.availableSeats !== undefined ? doc.availableSeats : doc.totalSeats),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    newDoc.id = newDoc._id;
    rides.unshift(newDoc);
    return attachDocMethods(newDoc, rides);
  },
  countDocuments(query = {}) {
    const matched = rides.filter((r) => matchDoc(r, query));
    return Promise.resolve(matched.length);
  },
  findByIdAndUpdate(id, updates, options = {}) {
    const idx = rides.findIndex((r) => String(r._id) === String(id) || String(r.id) === String(id));
    if (idx === -1) return Promise.resolve(null);

    let ride = { ...rides[idx] };
    if (updates.$inc) {
      for (const [field, incVal] of Object.entries(updates.$inc)) {
        ride[field] = (ride[field] || 0) + incVal;
      }
    }
    if (updates.$set) {
      for (const [field, setVal] of Object.entries(updates.$set)) {
        ride[field] = setVal;
      }
    }
    for (const [k, v] of Object.entries(updates)) {
      if (k !== '$inc' && k !== '$set') {
        ride[k] = v;
      }
    }
    ride.updatedAt = new Date();
    rides[idx] = ride;
    return Promise.resolve(attachDocMethods(rides[idx], rides));
  },
  findOneAndUpdate(query, update, options = {}) {
    const idx = rides.findIndex((r) => matchDoc(r, query));
    if (idx === -1) return Promise.resolve(null);

    let ride = { ...rides[idx] };
    if (update.$inc) {
      for (const [field, incVal] of Object.entries(update.$inc)) {
        ride[field] = (ride[field] || 0) + incVal;
      }
    }
    if (update.$set) {
      for (const [field, setVal] of Object.entries(update.$set)) {
        ride[field] = setVal;
      }
    }
    for (const [k, v] of Object.entries(update)) {
      if (k !== '$inc' && k !== '$set') {
        ride[k] = v;
      }
    }
    ride.updatedAt = new Date();
    rides[idx] = ride;
    return Promise.resolve(attachDocMethods(rides[idx], rides));
  },
  updateMany(query, update) {
    let count = 0;
    rides.forEach((r) => {
      if (matchDoc(r, query)) {
        count++;
        if (update.$set) Object.assign(r, update.$set);
        else Object.assign(r, update);
        r.updatedAt = new Date();
      }
    });
    return Promise.resolve({ matchedCount: count, modifiedCount: count });
  },
  findByIdAndDelete(id) {
    const idx = rides.findIndex((r) => String(r._id) === String(id) || String(r.id) === String(id));
    if (idx === -1) return Promise.resolve(null);
    const deleted = rides.splice(idx, 1)[0];
    return Promise.resolve(deleted);
  },
  aggregate(pipeline = []) {
    return runAggregate('Ride', pipeline);
  }
};

// Booking Mock Model
const BookingModel = {
  find(query = {}) {
    const matched = bookings.filter((b) => matchDoc(b, query));
    return new QueryChain(matched, false);
  },
  findOne(query = {}) {
    const matched = bookings.filter((b) => matchDoc(b, query));
    return new QueryChain(matched, true);
  },
  findById(id) {
    const found = bookings.find((b) => String(b._id) === String(id) || String(b.id) === String(id));
    return new QueryChain(found ? [found] : [], true);
  },
  async create(doc) {
    const newDoc = {
      _id: generateId(),
      ...doc,
      status: doc.status || 'pending',
      tripStatus: doc.tripStatus || 'requested',
      otp: doc.otp || Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    newDoc.id = newDoc._id;
    bookings.unshift(newDoc);
    return attachDocMethods(newDoc, bookings);
  },
  countDocuments(query = {}) {
    const matched = bookings.filter((b) => matchDoc(b, query));
    return Promise.resolve(matched.length);
  },
  findByIdAndUpdate(id, updates, options = {}) {
    const idx = bookings.findIndex((b) => String(b._id) === String(id) || String(b.id) === String(id));
    if (idx === -1) return Promise.resolve(null);
    bookings[idx] = { ...bookings[idx], ...updates, updatedAt: new Date() };
    return Promise.resolve(attachDocMethods(bookings[idx], bookings));
  },
  updateMany(query, update) {
    let count = 0;
    bookings.forEach((b) => {
      if (matchDoc(b, query)) {
        count++;
        if (update.$set) Object.assign(b, update.$set);
        else Object.assign(b, update);
        b.updatedAt = new Date();
      }
    });
    return Promise.resolve({ matchedCount: count, modifiedCount: count });
  },
  aggregate(pipeline = []) {
    return runAggregate('Booking', pipeline);
  }
};

module.exports = {
  User: UserModel,
  Ride: RideModel,
  Booking: BookingModel,
  getUsers: () => users,
  getRides: () => rides,
  getBookings: () => bookings,
  reset: initializeStore
};
