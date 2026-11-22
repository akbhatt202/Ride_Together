# RideTogether – Smart, Sustainable Carpooling Platform

[![Node.js](https://img.shields.io/badge/Node.js-v24+-68a063.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21+-000000.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.0+-47A248.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF.svg)](https://vitejs.dev/)

**RideTogether** is a production-grade, full-stack carpooling and ride-sharing web application built with **Node.js, Express.js, MongoDB (Mongoose), and React.js**. Inspired by BlaBlaCar, RideTogether connects drivers who have empty car seats with passengers traveling along the same route. It features strict role-based access control, atomic race-condition-free seat reservation, multi-stage MongoDB aggregation pipelines, and a modern responsive user interface.

---

## Table of Contents
1. [Architecture & Technology Stack](#1-architecture--technology-stack)
2. [User Roles & Security](#2-user-roles--security)
3. [Database Design & Schemas](#3-database-design--schemas)
4. [Concurrency & Atomic Booking Workflow](#4-concurrency--atomic-booking-workflow)
5. [MongoDB Aggregation Pipelines](#5-mongodb-aggregation-pipelines)
6. [REST API Documentation](#6-rest-api-documentation)
7. [Postman Testing Guide & JSON Payloads](#7-postman-testing-guide--json-payloads)
8. [Setup & Execution Instructions](#8-setup--execution-instructions)
9. [Pre-configured Demo Accounts](#9-pre-configured-demo-accounts)
10. [Automated Test Suite Summary](#10-automated-test-suite-summary)

---

## 1. Architecture & Technology Stack

The project adheres strictly to **MVC (Model-View-Controller)** pattern on the backend and modular component hierarchy with Context API on the frontend.

```
ridetogether/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # User registration, JWT login, profile me
│   │   ├── userController.js     # User profile update, admin user CRUD
│   │   ├── rideController.js     # Ride creation, search, filtering, driver rides
│   │   ├── bookingController.js  # Atomic seat booking, accept/reject, cancel
│   │   └── adminController.js    # MongoDB aggregation metrics & analytics
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT token verification & RBAC authorization
│   │   ├── errorMiddleware.js    # Centralized 404 & global error handler
│   │   └── validationMiddleware.js # Input validation middleware
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt password hashing
│   │   ├── Ride.js               # Ride schema with compound search indexes
│   │   └── Booking.js            # Booking schema with status & references
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── userRoutes.js         # /api/users/*
│   │   ├── rideRoutes.js         # /api/rides/*
│   │   ├── bookingRoutes.js      # /api/bookings/*
│   │   └── adminRoutes.js        # /api/admin/*
│   ├── utils/
│   │   └── seedData.js           # Database seeder with realistic test data
│   ├── .env.example              # Environment variables template
│   ├── .env                      # Local environment configuration
│   ├── test-api.js               # Automated backend test suite (24 tests)
│   ├── server.js                 # Express server & static production serving
│   └── package.json              # Backend dependencies & scripts
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx        # Responsive navigation with role links
│   │   │   ├── Footer.jsx        # Platform footer & sustainability badge
│   │   │   ├── ProtectedRoute.jsx # Role-based route authorization guard
│   │   │   ├── RideCard.jsx      # BlaBlaCar-style ride card component
│   │   │   ├── StatsCard.jsx     # Dashboard metric card
│   │   │   ├── Pagination.jsx    # Accessible pagination bar
│   │   │   ├── Alert.jsx         # Status and notification alerts
│   │   │   └── LoadingSpinner.jsx # Smooth loading indicator
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx   # Hero search, How It Works, Benefits
│   │   │   ├── RegisterPage.jsx  # Driver / Passenger registration
│   │   │   ├── LoginPage.jsx     # Login with 1-click evaluator demo pills
│   │   │   ├── SearchRidesPage.jsx # Ride search with filters & pagination
│   │   │   ├── RideDetailsPage.jsx # Route itinerary, driver card, booking form
│   │   │   ├── DriverDashboard.jsx # Driver earnings, stats, published rides
│   │   │   ├── PassengerDashboard.jsx # Upcoming trips, booking history
│   │   │   ├── CreateRidePage.jsx # Vehicle & ride publishing form
│   │   │   ├── BookingManagementPage.jsx # Review & accept/reject requests
│   │   │   ├── AdminDashboard.jsx # Aggregation analytics & governance
│   │   │   └── ProfilePage.jsx   # Profile management & password updates
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global authentication state provider
│   │   ├── services/
│   │   │   └── api.js            # Unified Fetch API service with JWT headers
│   │   ├── hooks/
│   │   │   └── useAuth.js        # AuthContext consumer hook
│   │   ├── layouts/
│   │   │   └── MainLayout.jsx    # Base page layout wrapper
│   │   ├── App.jsx               # Application routes & layout
│   │   ├── main.jsx              # Application entrypoint
│   │   └── index.css             # Navy, white & green CSS design system
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

### Technologies Used
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, jsonwebtoken (JWT), bcryptjs, dotenv, cors, morgan.
- **Frontend:** React.js, React Router DOM v6, Fetch API, Context API, CSS3, Lucide React icons.
- **Design System:** Professional palette with Dark Navy (`#0f172a`, `#1e293b`), Clean White (`#ffffff`), and Vibrant Green accents (`#10b981`, `#059669`).

---

## 2. User Roles & Security

RideTogether implements strict server-side **Role-Based Access Control (RBAC)**. The backend verifies permissions dynamically and never trusts client-supplied roles:

| Role | Key Capabilities |
| :--- | :--- |
| **Driver** | Publish rides, manage vehicle specs, view incoming passenger requests, accept or reject requests, cancel published rides, view driver earnings and monthly revenue aggregations. Blocked from booking rides as a passenger. |
| **Passenger** | Search available rides with multi-parameter filtering, request seats, view booking status (pending/accepted/rejected/cancelled), cancel bookings (with automatic seat restoration). Blocked from publishing rides. |
| **Admin** | Access protected `/api/admin/*` endpoints and `/admin` UI, view full platform metrics, view popular route analytics, monitor driver performance, manage registered users, manage platform rides. |

### Security Measures:
- **Password Hashing:** Passwords are encrypted before persisting using `bcryptjs` (salt rounds: 10) in Mongoose pre-save middleware. Passwords are never returned in queries (`select: false`).
- **JWT Authentication:** Cryptographically signed tokens with expiration; attached in `Authorization: Bearer <token>` header.
- **Input Validation:** Request sanitization and validation middleware rejecting invalid email syntax, passwords under 6 characters, negative fares, and non-existent IDs.
- **Centralized Error Handling:** Standardized JSON error responses with proper HTTP status codes (400, 401, 403, 404, 500).

---

## 3. Database Design & Schemas

### 1. User Collection (`User`)
- `name` (String, required, trimmed, max 100)
- `email` (String, required, unique, lowercase, trimmed)
- `password` (String, required, min 6, hashed, `select: false`)
- `phone` (String, required, trimmed)
- `role` (String, enum: `['driver', 'passenger', 'admin']`, default: `'passenger'`)
- `profileImage` (String, optional)
- `createdAt` (Date, default: Date.now)

### 2. Ride Collection (`Ride`)
- `driver` (ObjectId, ref: `User`, required, indexed)
- `source` (String, required, trimmed, indexed)
- `destination` (String, required, trimmed, indexed)
- `departureDate` (Date, required, indexed)
- `departureTime` (String, required)
- `farePerSeat` (Number, required, min: 0)
- `totalSeats` (Number, required, min: 1)
- `availableSeats` (Number, required, min: 0)
- `vehicleDetails` (Object: `make`, `model`, `licensePlate`, `color`)
- `description` (String, optional)
- `status` (String, enum: `['active', 'completed', 'cancelled']`, default: `'active'`, indexed)
- `createdAt` (Date, default: Date.now)

**Compound Indexes:**
- `{ source: 1, destination: 1, departureDate: 1, status: 1 }` – High performance ride search.
- `{ status: 1, availableSeats: 1, departureDate: 1 }` – Filter available active seats.
- `{ driver: 1, createdAt: -1 }` – Driver dashboard ride history.

### 3. Booking Collection (`Booking`)
- `passenger` (ObjectId, ref: `User`, required, indexed)
- `ride` (ObjectId, ref: `Ride`, required, indexed)
- `seatsBooked` (Number, required, min: 1)
- `totalFare` (Number, required, min: 0)
- `status` (String, enum: `['pending', 'accepted', 'rejected', 'cancelled']`, default: `'pending'`, indexed)
- `createdAt` (Date, default: Date.now)

**Compound Indexes:**
- `{ ride: 1, passenger: 1, status: 1 }` – Prevents duplicate booking requests.
- `{ passenger: 1, createdAt: -1 }` – Passenger trip history.

---

## 4. Concurrency & Atomic Booking Workflow

To prevent overbooking, duplicate requests, and race conditions when multiple passengers book simultaneously:

```
Passenger Requests Seats
          │
          ▼
Validate Active Status & Seat Count
          │
          ▼
Check for Existing Pending/Accepted Booking
          │
          ▼
Create Booking (Status: "pending")
Seats remain reserved on request
          │
          ▼
Driver Reviews Request in Driver Hub
   ┌──────┴──────┐
   ▼             ▼
[Reject]     [Accept]
   │             │
   │             ▼
   │      ATOMIC CONDITIONAL UPDATE:
   │      Ride.findOneAndUpdate({
   │        _id: booking.ride,
   │        status: 'active',
   │        availableSeats: { $gte: booking.seatsBooked }
   │      }, {
   │        $inc: { availableSeats: -booking.seatsBooked }
   │      })
   │             │
   │      ┌──────┴──────┐
   │      ▼             ▼
   │   Success        Failed (Seats Taken Concurrently)
   │   Status:        Return 400 Insufficient Seats
   │   "accepted"
   │
   ▼
[Passenger Cancels Booking]
   │
   ▼
If was "accepted":
ATOMIC RESTORATION:
Ride.findByIdAndUpdate(rideId, { $inc: { availableSeats: seatsBooked } })
Status: "cancelled"
```

---

## 5. MongoDB Aggregation Pipelines

All platform metrics are computed on the database engine using MongoDB aggregation pipelines rather than manual JavaScript calculations:

### 1. Driver Earnings Aggregation (`GET /api/rides/driver/stats`)
```javascript
const earningsResult = await Booking.aggregate([
  { $match: { status: 'accepted' } },
  {
    $lookup: {
      from: 'rides',
      localField: 'ride',
      foreignField: '_id',
      as: 'rideData'
    }
  },
  { $unwind: '$rideData' },
  { $match: { 'rideData.driver': driverId } },
  {
    $group: {
      _id: null,
      totalEarnings: { $sum: '$totalFare' },
      totalAcceptedBookings: { $sum: 1 },
      totalSeatsSold: { $sum: '$seatsBooked' }
    }
  }
]);
```

### 2. Popular Routes Aggregation (`GET /api/admin/dashboard` & `/api/admin/analytics`)
```javascript
const popularRoutes = await Booking.aggregate([
  { $match: { status: 'accepted' } },
  {
    $lookup: {
      from: 'rides',
      localField: 'ride',
      foreignField: '_id',
      as: 'rideInfo'
    }
  },
  { $unwind: '$rideInfo' },
  {
    $group: {
      _id: {
        source: '$rideInfo.source',
        destination: '$rideInfo.destination'
      },
      bookingsCount: { $sum: 1 },
      totalSeatsBooked: { $sum: '$seatsBooked' },
      totalRevenue: { $sum: '$totalFare' }
    }
  },
  {
    $project: {
      _id: 0,
      source: '$_id.source',
      destination: '$_id.destination',
      bookingsCount: 1,
      totalSeatsBooked: 1,
      totalRevenue: 1
    }
  },
  { $sort: { bookingsCount: -1, totalRevenue: -1 } },
  { $limit: 10 }
]);
```

### 3. Monthly Revenue Trend Aggregation
```javascript
const monthlyRevenue = await Booking.aggregate([
  { $match: { status: 'accepted' } },
  {
    $group: {
      _id: {
        $dateToString: { format: '%Y-%m', date: '$createdAt' }
      },
      revenue: { $sum: '$totalFare' },
      bookingsCount: { $sum: 1 }
    }
  },
  { $sort: { _id: 1 } },
  {
    $project: {
      month: '$_id',
      revenue: 1,
      bookingsCount: 1,
      _id: 0
    }
  }
]);
```

### 4. Booking Status Distribution Aggregation
```javascript
const bookingStatusStats = await Booking.aggregate([
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 }
    }
  },
  {
    $project: {
      status: '$_id',
      count: 1,
      _id: 0
    }
  }
]);
```

---

## 6. REST API Documentation

### Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new Driver or Passenger |
| `POST` | `/api/auth/login` | Public | Login with email and password; returns JWT token |
| `GET` | `/api/auth/me` | Private | Get authenticated user info |

### User Profile & Management (`/api/users`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/users/profile` | Private | Retrieve logged-in user profile |
| `PUT` | `/api/users/profile` | Private | Update user name, phone, image, or password |
| `GET` | `/api/users` | Admin | List all registered users (supports pagination & role filter) |
| `DELETE` | `/api/users/:id` | Admin | Delete user and cascade delete their rides/bookings |

### Rides (`/api/rides`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/rides` | Driver | Publish a new shared ride |
| `GET` | `/api/rides` | Public | Search rides with source, destination, date, fare, seats, and pagination |
| `GET` | `/api/rides/:id` | Public | Get comprehensive details of a single ride |
| `GET` | `/api/rides/my-rides` | Driver | Get rides published by authenticated driver |
| `GET` | `/api/rides/driver/stats` | Driver | Aggregated driver earnings, popular destinations, monthly stats |
| `PUT` | `/api/rides/:id` | Driver/Admin | Update ride parameters |
| `DELETE` | `/api/rides/:id` | Driver/Admin | Cancel ride and cancel all associated bookings |

### Bookings (`/api/bookings`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings` | Passenger | Request seats on an active ride (status: pending) |
| `GET` | `/api/bookings/my-bookings` | Private | Get all bookings made by the passenger |
| `GET` | `/api/bookings/driver-requests` | Driver | Get incoming booking requests across all driver rides |
| `PATCH` | `/api/bookings/:id/accept` | Driver | Accept pending request & atomically deduct available seats |
| `PATCH` | `/api/bookings/:id/reject` | Driver | Reject pending booking request |
| `PATCH` | `/api/bookings/:id/cancel` | Private | Cancel booking (atomically restores seats if accepted) |

### Admin Analytics & Governance (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/dashboard` | Admin | High-level metrics (users, rides, bookings, total revenue) |
| `GET` | `/api/admin/analytics` | Admin | Aggregated monthly trends, popular routes, driver earnings |
| `GET` | `/api/admin/rides` | Admin | List all rides across the platform |
| `GET` | `/api/admin/bookings` | Admin | List all bookings across the platform |
| `PATCH` | `/api/admin/rides/:id/status` | Admin | Toggle ride status (`active`, `completed`, `cancelled`) |

---

## 7. Postman Testing Guide & JSON Payloads

Set up an environment in Postman with `baseUrl` = `http://localhost:5000/api` and `token` variable.

### 1. User Registration
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/register`
- **Body (JSON):**
```json
{
  "name": "Marcus Vance",
  "email": "marcus.vance@example.com",
  "password": "securepassword123",
  "phone": "+1 (555) 321-4321",
  "role": "driver"
}
```
- **Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "674061a9b2...",
    "name": "Marcus Vance",
    "email": "marcus.vance@example.com",
    "phone": "+1 (555) 321-4321",
    "role": "driver"
  }
}
```

### 2. User Login
- **Method:** `POST`
- **URL:** `{{baseUrl}}/auth/login`
- **Body (JSON):**
```json
{
  "email": "driver.john@example.com",
  "password": "driver123"
}
```
- **Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "674061a9b2...",
    "name": "John Martinez (Driver)",
    "email": "driver.john@example.com",
    "role": "driver"
  }
}
```

### 3. Driver Publishes a Ride
- **Method:** `POST`
- **URL:** `{{baseUrl}}/rides`
- **Headers:** `Authorization: Bearer {{token}}`
- **Body (JSON):**
```json
{
  "source": "San Francisco",
  "destination": "San Jose",
  "departureDate": "2026-11-25T08:00:00.000Z",
  "departureTime": "08:30 AM",
  "farePerSeat": 20,
  "totalSeats": 3,
  "vehicleDetails": {
    "make": "Toyota",
    "model": "Camry Hybrid",
    "licensePlate": "CA-77-RIDE",
    "color": "Silver"
  },
  "description": "Commute down US-101 South. AC, quiet ride, non-smoking."
}
```
- **Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Ride published successfully",
  "ride": {
    "_id": "674062f8...",
    "source": "San Francisco",
    "destination": "San Jose",
    "farePerSeat": 20,
    "totalSeats": 3,
    "availableSeats": 3,
    "status": "active"
  }
}
```

### 4. Passenger Requests Seats
- **Method:** `POST`
- **URL:** `{{baseUrl}}/bookings`
- **Headers:** `Authorization: Bearer {{passengerToken}}`
- **Body (JSON):**
```json
{
  "rideId": "674062f8...",
  "seatsBooked": 2
}
```
- **Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "Booking request sent successfully to the driver. Awaiting driver acceptance.",
  "booking": {
    "_id": "67406341...",
    "seatsBooked": 2,
    "totalFare": 40,
    "status": "pending"
  }
}
```

### 5. Driver Accepts Request (Atomic Seat Decrement)
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/bookings/67406341.../accept`
- **Headers:** `Authorization: Bearer {{driverToken}}`
- **Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking request accepted successfully",
  "booking": {
    "_id": "67406341...",
    "status": "accepted"
  },
  "remainingSeats": 1
}
```

### 6. Passenger Cancels Booking (Atomic Seat Restoration)
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/bookings/67406341.../cancel`
- **Headers:** `Authorization: Bearer {{passengerToken}}`
- **Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Booking cancelled successfully. Any reserved seats have been restored.",
  "booking": {
    "_id": "67406341...",
    "status": "cancelled"
  }
}
```

---

## 8. Setup & Execution Instructions

### Prerequisites
- **Node.js:** v18.0.0 or higher (Tested on Node v24.18.0)
- **MongoDB:** v6.0+ (Local MongoDB service or MongoDB Atlas)

### Step 1: Clone Repository and Navigate to Folder
```bash
cd ridetogether
```

### Step 2: Configure Environment Variables
Inside `ridetogether/backend/`, create or verify `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ridetogether
JWT_SECRET=supersecretjwtkey_ridetogether_secure_2026
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Step 3: Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

### Step 4: Seed Database with Demo Data
Populates realistic users, published rides, and bookings:
```bash
cd backend
npm run seed
```

### Step 5: Run Automated Integration Test Suite
```bash
cd backend
npm run test:api
```
All 24 test assertions will execute against your local database.

### Step 6: Start Application

**Option A — Unified Full Stack (Production Build):**
```bash
# 1. Build frontend
cd frontend
npm run build

# 2. Start backend server (serves both API & React client)
cd ../backend
npm start
```
Open **`http://localhost:5000`** in your browser.

**Option B — Independent Development Servers:**
```bash
# Terminal 1: Backend API (Port 5000)
cd backend
npm start

# Terminal 2: React Vite Client (Port 3000)
cd frontend
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 9. Pre-configured Demo Accounts

Use these pre-seeded accounts or use the **1-Click Demo Login** buttons on the Login page:

| Role | Email Address | Password | Profile Description |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@ridetogether.com` | `admin123` | System Administrator with full control & analytics |
| **Driver** | `driver.john@example.com` | `driver123` | John Martinez (Toyota Camry Hybrid) |
| **Driver** | `driver.sarah@example.com` | `driver123` | Sarah Connor (Honda Civic EX) |
| **Driver** | `driver.david@example.com` | `driver123` | David Kim (Tesla Model 3 Long Range) |
| **Passenger** | `passenger.alice@example.com` | `passenger123` | Alice Cooper |
| **Passenger** | `passenger.bob@example.com` | `passenger123` | Bob Marley |
| **Passenger** | `passenger.charlie@example.com` | `passenger123` | Charlie Brown |

---

## 10. Automated Test Suite Summary

The included test script (`ridetogether/backend/test-api.js`) automatically tests and validates:
1. `GET /api/health` — API availability check.
2. `POST /api/auth/login` — Invalid credentials rejected with 401.
3. `POST /api/auth/login` — Admin, Driver, and Passenger JWT generation.
4. `POST /api/auth/register` — Duplicate email registration prevention (400).
5. `POST /api/auth/register` — Valid user registration with bcrypt password hashing.
6. `GET /api/users/profile` — Route protection (401 without Bearer token).
7. `POST /api/rides` — Role authorization (403 when passenger tries to post ride).
8. `POST /api/rides` — Driver successfully creates and publishes a ride (201).
9. `GET /api/rides` — Public ride search with city and date filtering.
10. `POST /api/bookings` — Prevent driver from booking their own ride.
11. `POST /api/bookings` — Prevent booking when seats requested > available seats (400).
12. `POST /api/bookings` — Passenger booking request created with pending status.
13. `POST /api/bookings` — Prevent duplicate pending booking requests for the same ride.
14. `GET /api/bookings/driver-requests` — Driver retrieves incoming requests.
15. `PATCH /api/bookings/:id/accept` — Driver accepts booking; atomic seat decrement (3 → 1).
16. `POST /api/bookings` — Concurrency prevention: reject booking attempt exceeding remaining seats.
17. `PATCH /api/bookings/:id/cancel` — Passenger cancels booking; atomic seat restoration (1 → 3).
18. `GET /api/rides/driver/stats` — Driver aggregation earnings pipeline.
19. `GET /api/admin/dashboard` — Platform overview aggregation (users, rides, revenue).
20. `GET /api/admin/analytics` — Route popularity and monthly revenue trends.

**Result:** `24 PASSED | 0 FAILED`
