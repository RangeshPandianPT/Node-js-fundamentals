/**
 * Section 10: Real-Time Communication with WebSockets / Socket.io
 * ----------------------------------------------------------------
 * This module demonstrates how to implement real-time, bi-directional, event-based
 * communication between web clients and a Node.js server using Express and Socket.io.
 */

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const os = require('os');

const app = express();
// Socket.io requires an HTTP server instance to wrap around Express
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3001;

// Serve static client files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Keep track of active connection count and chat history
let activeConnections = 0;
const messageHistory = [];

// Handle client connection event
io.on('connection', (socket) => {
  activeConnections++;
  console.log(`[Socket.io] Client connected: ${socket.id} | Active: ${activeConnections}`);

  // Send welcome message and existing message history to the newly connected client
  socket.emit('welcome', {
    message: 'Welcome to the Real-Time Node.js Live Hub!',
    id: socket.id,
    history: messageHistory.slice(-20) // send last 20 messages
  });

  // Broadcast to all clients that connection count updated
  io.emit('connections-update', { count: activeConnections });

  // Handle incoming chat messages from clients
  socket.on('chat-message', (data) => {
    const msgPayload = {
      id: socket.id,
      username: data.username || 'Anonymous Node Dev',
      text: data.text,
      timestamp: new Date().toLocaleTimeString()
    };
    
    messageHistory.push(msgPayload);
    // Broadcast message to ALL connected clients (including sender)
    io.emit('chat-message', msgPayload);
  });

  // Handle client disconnection
  socket.on('disconnect', () => {
    activeConnections = Math.max(0, activeConnections - 1);
    console.log(`[Socket.io] Client disconnected: ${socket.id} | Active: ${activeConnections}`);
    io.emit('connections-update', { count: activeConnections });
  });
});

// Periodic broadcast of live server health statistics every 2 seconds
setInterval(() => {
  const memoryUsage = process.memoryUsage();
  const statsPayload = {
    uptime: Math.floor(process.uptime()),
    rss: (memoryUsage.rss / 1024 / 1024).toFixed(2), // Resident Set Size in MB
    heapUsed: (memoryUsage.heapUsed / 1024 / 1024).toFixed(2), // Heap used in MB
    cpuLoad: os.loadavg()[0].toFixed(2),
    timestamp: new Date().toLocaleTimeString()
  };
  io.emit('server-stats', statsPayload);
}, 2000);

// Start server
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`\n🚀 Real-time WebSocket Server running at http://localhost:${PORT}`);
    console.log(`👉 Open your browser to view the live dashboard & chat!`);
  });
}

module.exports = { app, server, io };
