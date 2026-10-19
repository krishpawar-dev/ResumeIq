#!/usr/bin/env node

const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env or root .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const http = require('http');
const app = require('../app');
const connectDB = require('../config/db');

const PORT = normalizePort(process.env.PORT || '5000');
app.set('port', PORT);

const server = http.createServer(app);

// Connect to MongoDB then start HTTP server
(async () => {
  try {
    await connectDB();
  } catch (err) {
    console.error('Database initialization failed:', err.message);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }

  server.listen(PORT, () => {
    console.log(`[ResumeIQ Backend] Server running on http://localhost:${PORT}`);
    console.log(`[ResumeIQ Backend] Environment: ${process.env.NODE_ENV || 'development'}`);
  });
})();

server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') throw error;
  const bind = typeof PORT === 'string' ? 'Pipe ' + PORT : 'Port ' + PORT;
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`);
      process.exit(1);
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`);
      process.exit(1);
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log(`[ResumeIQ Backend] Listening on ${bind}`);
}
