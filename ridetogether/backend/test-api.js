const http = require('http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

// Require app without listening so we control port in test
const app = require('./server');

const TEST_PORT = 5005;
const BASE_URL = `http://127.0.0.1:${TEST_PORT}`;

// Helper function to make HTTP requests
function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const headers = {
      'Content-Type': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const payload = body ? JSON.stringify(body) : null;
    if (payload) {
      headers['Content-Length'] = Buffer.byteLength(payload);
    }

    const req = http.request(
      url,
      {
        method,
        headers
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = data ? JSON.parse(data) : {};
            resolve({ status: res.statusCode, body: parsed });
          } catch (err) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );

    req.on('error', (err) => reject(err));

    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

async function runTests() {
  console.log('==================================================');
  console.log('   STARTING RIDETOGETHER BACKEND INTEGRATION TESTS');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} ${details ? '--> ' + details : ''}`);
      failed++;
    }
  }

  const server = app.listen(TEST_PORT, () => {
    console.log(`Test server running on port ${TEST_PORT}\n`);
  });

  try {
    // 1. Health check
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.body.status === 'healthy', '1. Server Health Check Endpoint');

    // 2. Invalid Login Test
    const invalidLogin = await request('POST', '/api/auth/login', {
      email: 'driver.john@example.com',
      password: 'wrongpassword'
    });
    assert(invalidLogin.status === 401 && invalidLogin.body.success === false, '2. Invalid Password Login Rejection (401)');

    // 3. Valid Login Tests for all 3 roles
    const adminLogin = await request('POST', '/api/auth/login', {
      email: 'admin@ridetogether.com',
      password: 'admin123'
    });
    assert(adminLogin.status === 200 && adminLogin.body.token, '3a. Admin Login & JWT Generation');
    const adminToken = adminLogin.body.token;

    const driverLogin = await request('POST', '/api/auth/login', {
      email: 'driver.john@example.com',
      password: 'driver123'
    });
    assert(driverLogin.status === 200 && driverLogin.body.user.role === 'driver', '3b. Driver Login & Role Validation');
    const driverToken = driverLogin.body.token;
    const driverId = driverLogin.body.user.id;

    const passengerLogin = await request('POST', '/api/auth/login', {
      email: 'passenger.alice@example.com',
      password: 'passenger123'
    });
    assert(passengerLogin.status === 200 && passengerLogin.body.user.role === 'passenger', '3c. Passenger Login & Role Validation');
    const passengerToken = passengerLogin.body.token;

    // 4. Duplicate Registration Rejection
    const dupReg = await request('POST', '/api/auth/register', {
      name: 'Duplicate John',
      email: 'driver.john@example.com',
      password: 'newpassword123',
      phone: '+1 (555) 999-9999',
      role: 'driver'
    });
    assert(dupReg.status === 400 && dupReg.body.success === false, '4. Duplicate Email Registration Rejection (400)');

    // 5. Successful New User Registration
    const newPassenger = await request('POST', '/api/auth/register', {
      name: 'Test Passenger 99',
      email: `testpassenger${Date.now()}@example.com`,
      password: 'securepassword123',
      phone: '+1 (555) 111-2233',
      role: 'passenger'
    });
    assert(newPassenger.status === 201 && newPassenger.body.token, '5. New User Registration & Auto-login JWT (201)');
    const testPassengerToken = newPassenger.body.token;

    // 6. Protected Route Without Token
    const unauthReq = await request('GET', '/api/users/profile');
    assert(unauthReq.status === 401, '6. Route Protection: Reject request without Bearer token (401)');

    // 7. Role Authorization: Passenger trying to publish a ride
    const forbiddenRideCreate = await request('POST', '/api/rides', {
      source: 'Houston',
      destination: 'Austin',
      departureDate: new Date().toISOString(),
      departureTime: '10:00 AM',
      farePerSeat: 25,
      totalSeats: 3
    }, passengerToken);
    assert(forbiddenRideCreate.status === 403, '7. Role Authorization: Passenger blocked from publishing ride (403)');

    // 8. Driver publishes a new ride
    const createRideRes = await request('POST', '/api/rides', {
      source: 'Denver',
      destination: 'Boulder',
      departureDate: new Date(Date.now() + 86400000).toISOString(),
      departureTime: '09:00 AM',
      farePerSeat: 15,
      totalSeats: 3,
      vehicleDetails: { make: 'Subaru', model: 'Outback', licensePlate: 'CO-ROCKY', color: 'Silver' },
      description: 'Heading to Boulder for hiking!'
    }, driverToken);
    assert(createRideRes.status === 201 && createRideRes.body.ride._id, '8. Driver publishes ride successfully (201)');
    const newRideId = createRideRes.body.ride._id;

    // 9. Public Ride Search & Filtering
    const searchRes = await request('GET', '/api/rides?source=Denver&destination=Boulder');
    assert(searchRes.status === 200 && searchRes.body.rides.length >= 1, '9. Public Ride Search with source & destination filters');

    // 10. Driver attempts to book their own ride (Blocked)
    const selfBooking = await request('POST', '/api/bookings', {
      rideId: newRideId,
      seatsBooked: 1
    }, driverToken);
    // Since driverToken is 'driver', role check blocks first or driver logic blocks
    assert(selfBooking.status === 403 || selfBooking.status === 400, '10. Prevent driver from booking seats');

    // 11. Booking with insufficient seats (Attempting 10 seats when total is 3)
    const overbookedReq = await request('POST', '/api/bookings', {
      rideId: newRideId,
      seatsBooked: 10
    }, passengerToken);
    assert(overbookedReq.status === 400, '11. Insufficient Seat Booking Prevention (400)');

    // 12. Passenger submits valid booking request (Pending status)
    const validBooking = await request('POST', '/api/bookings', {
      rideId: newRideId,
      seatsBooked: 2
    }, passengerToken);
    assert(validBooking.status === 201 && validBooking.body.booking.status === 'pending', '12. Booking Request Created with Pending Status (201)');
    const bookingId = validBooking.body.booking._id;

    // 13. Duplicate booking attempt for same ride by same passenger
    const dupBooking = await request('POST', '/api/bookings', {
      rideId: newRideId,
      seatsBooked: 1
    }, passengerToken);
    assert(dupBooking.status === 400, '13. Duplicate Pending/Active Booking Prevention (400)');

    // 14. Driver views booking requests
    const driverRequests = await request('GET', '/api/bookings/driver-requests', null, driverToken);
    assert(driverRequests.status === 200 && driverRequests.body.requests.length >= 1, '14. Driver retrieves incoming booking requests');

    // 15. Driver accepts booking (Atomic seat reduction)
    const acceptRes = await request('PATCH', `/api/bookings/${bookingId}/accept`, {}, driverToken);
    assert(acceptRes.status === 200 && acceptRes.body.booking.status === 'accepted', '15a. Driver accepts booking request');

    // Verify ride seats reduced from 3 to 1
    const checkRideAfterAccept = await request('GET', `/api/rides/${newRideId}`);
    assert(checkRideAfterAccept.body.ride.availableSeats === 1, '15b. Atomic Seat Decrement: availableSeats correctly reduced from 3 to 1');

    // 16. Another passenger tries to book 2 seats (only 1 available now!)
    const raceRes = await request('POST', '/api/bookings', {
      rideId: newRideId,
      seatsBooked: 2
    }, testPassengerToken);
    assert(raceRes.status === 400, '16. Overbooking/Concurrency Check: Cannot book more seats than available');

    // 17. Passenger cancels accepted booking -> Seats restored
    const cancelRes = await request('PATCH', `/api/bookings/${bookingId}/cancel`, {}, passengerToken);
    assert(cancelRes.status === 200 && cancelRes.body.booking.status === 'cancelled', '17a. Passenger cancels accepted booking');

    const checkRideAfterCancel = await request('GET', `/api/rides/${newRideId}`);
    assert(checkRideAfterCancel.body.ride.availableSeats === 3, '17b. Atomic Seat Restoration: availableSeats restored back to 3');

    // 18. Driver stats & earnings aggregation
    const driverStats = await request('GET', '/api/rides/driver/stats', null, driverToken);
    assert(driverStats.status === 200 && driverStats.body.data.totalRidesPublished >= 1, '18. Driver Stats & Earnings Aggregation Pipeline');

    // 19. Admin Dashboard Aggregation
    const adminDash = await request('GET', '/api/admin/dashboard', null, adminToken);
    assert(
      adminDash.status === 200 &&
      adminDash.body.data.totalUsers > 0 &&
      adminDash.body.data.totalRides > 0 &&
      adminDash.body.data.totalRevenue >= 0,
      '19. Admin Dashboard MongoDB Aggregation (Users, Rides, Bookings, Revenue)'
    );

    // 20. Admin Analytics Aggregation (Popular Routes & Statuses)
    const adminAnalytics = await request('GET', '/api/admin/analytics', null, adminToken);
    assert(
      adminAnalytics.status === 200 &&
      Array.isArray(adminAnalytics.body.analytics.popularRoutes) &&
      Array.isArray(adminAnalytics.body.analytics.monthlyRevenue),
      '20. Admin Analytics Aggregation (Popular Routes & Monthly Trends)'
    );

  } catch (err) {
    console.error('Test execution error:', err);
    failed++;
  } finally {
    server.close();
    await mongoose.connection.close();
    console.log('\n==================================================');
    console.log(`TEST SUMMARY: ${passed} PASSED | ${failed} FAILED`);
    console.log('==================================================');
    process.exit(failed > 0 ? 1 : 0);
  }
}

runTests();
