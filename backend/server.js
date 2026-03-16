const express   = require('express');
const http      = require('http');
const WebSocket = require('ws');
const cors      = require('cors');
const jwt       = require('jsonwebtoken');
const connect   = require('./db/connect');

const authRoutes   = require('./routes/auth');
const pickupRoutes = require('./routes/pickups');
const driverRoutes = require('./routes/driver');
const adminRoutes  = require('./routes/admin');

// ─── Connect to MongoDB before starting the HTTP server ──────────────────────
connect();

const app    = express();
const server = http.createServer(app);
const wss    = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// ─── WebSocket — real-time driver location broadcast ─────────────────────────
const clients = new Map(); // Map<userId, WebSocket>

wss.on('connection', (ws, req) => {
  const token = new URL(req.url, 'http://localhost').searchParams.get('token');
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'recyclelink_secret');
    clients.set(decoded.id, ws);

    ws.on('message', (msg) => {
      try {
        const data = JSON.parse(msg);
        if (data.type === 'LOCATION_UPDATE') {
          // Broadcast new driver position to every connected client (admins listen here)
          clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(
                JSON.stringify({ type: 'DRIVER_LOCATION', driverId: decoded.id, ...data })
              );
            }
          });
        }
      } catch (_) { /* ignore malformed frames */ }
    });

    ws.on('close', () => clients.delete(decoded.id));
  } catch (_) {
    ws.close(); // reject unauthenticated WS connections
  }
});

// ─── REST routes ──────────────────────────────────────────────────────────────
app.use('/api',          authRoutes);
app.use('/api/pickups',  pickupRoutes);
app.use('/api/driver',   driverRoutes);
app.use('/api/admin',    adminRoutes);

// ─── Global error handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`RecycleLink API running on port ${PORT}`));

module.exports = { app, wss, clients };
