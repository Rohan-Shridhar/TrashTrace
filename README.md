# TrashTrace

> Smart waste package tracking using QR codes and geolocation.

**Attach a QR code to your waste package. Track where it was scanned and verify whether it reached its intended destination.**

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

---

## Overview

TrashTrace is a full-stack web application that lets anyone create a traceable waste shipment, generate a QR code to attach to the physical package, and verify whether that package reached its intended destination (e.g. a recycling centre) based on GPS scan data.

It is built for transparency — the system explicitly states that tracking is QR-scan-based, not physical movement tracking.

---

## Architecture

```
TrashTrace/
├── frontend/               React + Vite SPA
│   ├── src/
│   │   ├── pages/          CreateShipment, TrackShipment, ScanQR, OwnerDashboard
│   │   ├── components/     QRCodeDisplay
│   │   └── utils/          geolocation.js, owner.js
│   └── vite.config.js      API proxy for local dev
│
├── backend/                Node.js + Express API
│   ├── api/index.js        Express app entry point (also Vercel serverless function)
│   ├── config/db.js        Mongoose connection (serverless-safe, cached)
│   ├── models/             Trash.js, Scan.js, Notification.js
│   ├── routes/             trashRoutes.js, notificationRoutes.js
│   ├── utils/              geocoder.js, distance.js (Haversine)
│   └── tests/              distance.test.js (Jest)
│
├── vercel.json             Deployment configuration
├── package.json            Root scripts (concurrently)
└── .env.example            Environment variable template
```

---

## Features

| Feature | Description |
|---|---|
| 📦 Create Shipment | Register a waste package with type, destination, and GPS source location |
| 🔖 QR Code Generation | Generate a scannable QR code per package; download or print |
| 📍 Scan & Track | Couriers scan the package; GPS coordinates are logged |
| ✅ Delivery Verification | If scanned within the configurable radius of the destination, marked DELIVERED |
| 📊 Owner Dashboard | Device-based dashboard showing all your packages and notifications |
| 🔔 Notifications | In-app notification log when a package is scanned or delivered |
| 🗺️ Geocoding | Destination address is geocoded via OpenStreetMap Nominatim |

---

## Local Setup

### Prerequisites
- **Node.js** ≥ 18 (for native `fetch` support in backend)
- **MongoDB Atlas** account (or a local MongoDB instance)

### 1. Clone & Install

```bash
git clone https://github.com/your-username/trashtrace.git
cd trashtrace
npm install        # installs concurrently at root
npm run install:all  # installs frontend and backend deps
```

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Edit .env with your MONGO_URI
```

**Root `.env`** (used by backend):
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/trashtrace
PORT=3000
PUBLIC_URL=http://localhost:5173
DELIVERY_RADIUS_METERS=500
```

**Frontend `.env`** (optional, in `frontend/`):
```env
VITE_DELIVERY_RADIUS_LABEL=500 metres
```

> ⚠️ **Never commit `.env` files.** The `.gitignore` already excludes them.

### 3. Run Locally

```bash
npm run dev
```

This starts:
- Backend Express server on `http://localhost:3000`
- Vite React frontend on `http://localhost:5173`

The Vite proxy forwards `/api/*` requests to the backend automatically.

### 4. Run Tests

```bash
cd backend && npm test
```

---

## MongoDB Setup

1. Create a free cluster on [MongoDB Atlas](https://cloud.mongodb.com/).
2. Create a database named `trashtrace`.
3. Copy the connection string to `MONGO_URI` in your `.env`.
4. **For Vercel deployment**, allow all IPs (`0.0.0.0/0`) in your Atlas Network Access settings, or use Vercel's static IPs.

---

## Environment Variables

### Backend (Root `.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URI` | ✅ Yes | — | MongoDB connection string |
| `PORT` | No | `3000` | Backend port (local dev only) |
| `PUBLIC_URL` | Recommended | request origin | Base URL for QR code tracking links |
| `DELIVERY_RADIUS_METERS` | No | `500` | Radius in metres to determine delivery |
| `ALLOWED_ORIGINS` | No | localhost | Comma-separated allowed CORS origins |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `VITE_DELIVERY_RADIUS_LABEL` | No | `500 metres` | Display label on the landing page |

> All `VITE_` variables are included in the browser bundle. Never put secrets there.

---

## Vercel Deployment

### 1. Push to GitHub

### 2. Import project on [vercel.com](https://vercel.com)

### 3. Set Environment Variables in Vercel Dashboard:
- `MONGO_URI`
- `PUBLIC_URL` → your Vercel deployment URL (e.g. `https://trashtrace.vercel.app`)
- `ALLOWED_ORIGINS` → your Vercel URL

### 4. Deploy

Vercel will:
- Build `frontend/` using `@vercel/static-build` → serves the React SPA
- Deploy `backend/api/index.js` as a Node.js serverless function
- Route `/api/*` requests to the backend
- Serve all other routes from the React build (SPA fallback for client-side routing)

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/trash` | Create a new trash shipment |
| `GET` | `/api/trash/owner/:token` | Get all packages for an owner |
| `GET` | `/api/trash/:trackingId` | Get tracking info (public) |
| `GET` | `/api/trash/:trackingId/history` | Get complete scan history |
| `POST` | `/api/trash/:trackingId/scan` | Record a courier scan |
| `GET` | `/api/notifications/:token` | Get notifications for owner |
| `PUT` | `/api/notifications/:token/read` | Mark all notifications as read |

### POST `/api/trash` Body
```json
{
  "trashType": "Plastic",
  "destination": "Bengaluru City Recycling Center",
  "sourceLatitude": 12.9716,
  "sourceLongitude": 77.5946,
  "description": "Optional details",
  "ownerToken": "owner_abc123..."
}
```

### POST `/api/trash/:trackingId/scan` Body
```json
{ "latitude": 12.9800, "longitude": 77.5900 }
```

---

## How QR Tracking Works

1. **Create**: A unique 8-character hex tracking ID is generated (e.g. `A1B2C3D4`).
2. **QR Code**: A QR code is generated encoding the URL `<PUBLIC_URL>/track/<trackingId>`.
3. **Physical Attachment**: The QR code is printed/downloaded and attached to the waste package.
4. **Courier Scan**: Anyone with a camera can scan the QR → lands on the tracking page → clicks "Record Location Scan" → their GPS coordinates are sent to the backend.
5. **Distance Check**: The backend calculates the [Haversine distance](https://en.wikipedia.org/wiki/Haversine_formula) between the scan location and the geocoded destination.
6. **Status Update**:
   - Within `DELIVERY_RADIUS_METERS` → status: `DELIVERED`
   - Outside → status: `IN_TRANSIT`, scan recorded
7. **Notifications**: If the package has an `ownerToken`, a notification is created.

> ⚠️ **Important Limitation**: TrashTrace tracks where the *QR code was scanned*, not physical package location. A scan near the destination strongly suggests the package arrived, but does not guarantee it.

---

## Browser Geolocation Limitations

- GPS accuracy on desktop/WiFi is often poor (±100–1000 m).
- GPS accuracy on mobile with a clear sky is typically ±5–20 m.
- Users can deny location permission — the system gracefully handles this.
- The `DELIVERY_RADIUS_METERS` threshold should account for GPS inaccuracy (default 500 m is intentionally generous).
- Geolocation is only available over HTTPS in production.

---

## Security Considerations

- `MONGO_URI` is a server-side secret and is never sent to the browser.
- The public tracking endpoint (`GET /api/trash/:id`) explicitly strips the `ownerToken` from responses.
- API rate limiting: 100 requests / 15 min globally; 10 scan requests / minute.
- HTTP security headers via `helmet`.
- CORS restricted to `ALLOWED_ORIGINS` in production.
- Input validation: coordinates validated to valid ranges, strings length-capped.
- Stack traces are suppressed in production error responses.
- Ownership is currently device-based (`localStorage` token) — not cryptographically authenticated. For higher security, add proper authentication in a future version.