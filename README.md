# RecycleLink – MVP (MongoDB Edition)

**On-Demand Resource Recovery Platform | Q3 2026**

RecycleLink is an "Uber for recycling." It connects residents looking to dispose of recyclable materials (like E-Waste, Plastic, Metal) with drivers who conduct pickups. Residents earn reward points (Eco-Points or payouts) based on the actual weight of the material diverted from landfills, addressing EPR (Extended Producer Responsibility) compliance, fleet tracking, and gamification of recycling.

---

## Architecture & Features

### Core Stack
- **Frontend**: React + Vite (High-performance single-page application)
- **Backend**: Node.js + Express (API server handling business logic)
- **Database**: MongoDB & Mongoose (Non-relational storage)
- **Authentication**: JWT (JSON Web Token) secures API routes with role-based authorization.
- **Realtime Tracking**: WebSockets broadcast driver locations to the admin dashboard.
- **Maps**: Google Maps API provides location pinning and real-time fleet map for admins.
- **QR Verification**: Unique QR code generated on pickup creation, scanned as proof-of-pickup.

### Role Breakdown
- **Resident**: Schedule pickups, view history & rewards, generate QR code for verification.
- **Driver**: View assigned route, navigate to residents, scan QR code & enter actual weight.
- **Admin**: Monitor fleet (real-time WebSocket maps), dispatch drivers, view aggregations & SWM compliance.

---

## Quick Start (Local Development)

**1. Start MongoDB locally** (requires MongoDB 6+ installed)
```bash
mongod --dbpath /data/db
# No schema migration needed — Mongoose creates collections automatically
```

**2. Backend**
```bash
cd backend
npm install
# Ensure you copy .env.example to .env and set MONGO_URI and JWT_SECRET
npm run seed  # Generates required mock users
npm run dev
# API running at http://localhost:3001
```

**3. Frontend** (Requires `VITE_GOOGLE_MAPS_API_KEY` in `frontend/.env`)
```bash
cd frontend
npm install
npm run dev
# App running at http://localhost:5173
```

---

## Demo Accounts (Login via Demo Buttons)

- Admin: `admin@recyclelink.com` | `admin123`
- Driver: `driver@recyclelink.com` | `driver123`
- Resident: `resident@recyclelink.com` | `resident123`

*(Quick-Demo buttons are also available on the Auth screen directly!)*

---

## Project Structure

```
recyclelink/
├── README.md
├── package.json
├── .gitignore
├── backend/
│   ├── server.js              ← Express + WebSocket + MongoDB connect
│   ├── package.json           ← express, mongoose, jsonwebtoken, ws
│   ├── db/
│   │   └── connect.js         ← Mongoose database connection
│   ├── models/                ← Mongoose schemas (User, Driver, PickupRequest, Reward, Route)
│   ├── middleware/            ← Custom JWT and Auth guards
│   └── routes/                ← API routes (auth, pickups, driver, admin)
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx
        ├── index.css
        ├── App.jsx
        ├── components/        ← MapView, QRScanner, Layouts
        ├── context/           ← AuthContext for global state
        ├── pages/             ← AdminDashboard, DriverDashboard, ResidentDashboard, Auth
        └── services/          ← Axios instance, WebSockets
```

---

## API Reference Overview

- **Auth**: `POST /api/register`, `POST /api/login`
- **Resident Pickups**: `POST /api/pickups`, `GET /api/pickups/user`
- **Driver**: `GET /api/driver/routes`, `POST /api/driver/verify` (QR scanning logic and actual weight mapping)
- **Admin**: `GET /api/admin/fleet`, `GET /api/admin/analytics`, `POST /api/admin/assign`
- **WebSockets**: WSS running alongside the node app, passing `LOCATION_UPDATE` from drivers to `DRIVER_LOCATION` events for admins.

---

## Reward Point Rates

| Category | Points / kg | Payment (₹ / kg) |
|----------|-------------|------------------|
| E-Waste  | 50          | 5.00             |
| Metal    | 30          | 3.00             |
| Plastic  | 15          | 1.50             |
| Glass    | 10          | 1.00             |
| Paper    |  8          | 0.80             |
| Organic  |  5          | 0.50             |
