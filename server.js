// // Error Handling

// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
// const path = require('path');
// const favicon = require('serve-favicon'); // Import serve-favicon
// const adminRoutes = require('./routes/admin'); 
// const clientRoutes = require('./routes/clientRoutes');
// const authRoutes = require('./routes/authRoutes'); // Import auth routes if needed
// const { sequelize } = require('./models'); // Import Sequelize connection
// const paymentRoutes = require("./routes/paymentRoutes");
// const transactionRoutes = require('./routes/transactionRoutes');
// const bankOfHeavenRoutes = require('./routes/bankOfHeavenRoutes');
// const messageRoutes = require('./routes/messageRoutes');
// const notificationRoutes = require('./routes/notificationRoutes');
// const cookieParser = require('cookie-parser');

// const app = express();
// app.use(cors()); // Enable CORS for cross-origin requests
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Database connection check (important for debugging)
// sequelize.authenticate()
//   .then(() => {
//     console.log('Database connection established');
//   })
//   .catch((err) => {
//     console.error('Unable to connect to the database:', err);
//   });

// // Serve favicon from the root directory
// app.use(favicon(path.join(__dirname, 'favicon.png'))); // Adjust path if needed
// app.use(express.static(path.join(__dirname))); 

// // Payment route
// app.use("/api", paymentRoutes);

// // Transaction route
// app.use('/transactions', transactionRoutes);

// // Bank of Heaven route
// app.use('/api/bank-of-heaven', bankOfHeavenRoutes);

// // Message Routes
// app.use('/api/messages', messageRoutes); 

// // Notification Routes
// app.use('/api/notifications', notificationRoutes);

// app.get('/favicon.png', (req, res) => {
//   res.sendFile(path.join(__dirname, 'favicon.png')); // Serve favicon.png directly from root
// });

// // Serve static files from the "uploads" folder
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // Middleware
// app.use(bodyParser.json()); // Parse incoming JSON requests


// // Health check route
// app.get('/', (req, res) => {
//   res.send('Admin backend is running');
// });

// // Client Routes
// app.use('/clients', clientRoutes);

// // Auth Routes
// app.use('/auth', authRoutes); // Assuming auth routes exist

// // Admin Routes
// app.use('/admin', adminRoutes); // Admin route for /admin/signup

// // User Routes
// app.use('/api/documents', require('./routes/documentRoutes'));

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).send('Something went wrong!');
// });

// // Export the Express app for Vercel to use as a serverless function
// module.exports = app;

// 18/07/2025

// Error Handling
const express = require('express');
const http = require('http'); // NEW: Required for Socket.io
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const favicon = require('serve-favicon');
const socketio = require('socket.io'); // NEW: Socket.io import
const adminRoutes = require('./routes/admin');
const clientRoutes = require('./routes/clientRoutes');
const authRoutes = require('./routes/authRoutes');
const { sequelize } = require('./models');
const paymentRoutes = require("./routes/paymentRoutes");
const transactionRoutes = require('./routes/transactionRoutes');
const bankOfHeavenRoutes = require('./routes/bankOfHeavenRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app); // NEW: Create HTTP server
console.log('=== ACTIVE ROUTE HANDLERS ===');
app._router.stack.forEach(layer => {
  if (layer.route) {
    console.log(`PATH: ${layer.route.path}`, `METHODS: ${Object.keys(layer.route.methods)}`, `FILE: ${layer.route.stack[0].handle.name}`);
  } else if (layer.name === 'router') {
    layer.handle.stack.forEach(sublayer => {
      const path = (layer.regexp.source !== '^\\/?$') 
        ? layer.regexp.source.replace('^\\', '').replace('\\/?(?=\\/|$)', '') + sublayer.route.path 
        : sublayer.route.path;
      console.log(`PATH: ${path}`, `METHODS: ${Object.keys(sublayer.route.methods)}`, `FILE: ${sublayer.route.stack[0].handle.name}`);
    });
  }
});
const io = socketio(server, { // NEW: Socket.io setup
  cors: {
    origin: "*", // Adjust in production
    methods: ["GET", "POST"]
  }
});

// Make io accessible in routes
app.set('socketio', io); // NEW: Share io instance

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`New client connected: ${socket.id}`);
  
  // Join user-specific room
  socket.on('join_user_room', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined their notification room`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(bodyParser.json());

// Database connection
sequelize.authenticate()
  .then(() => console.log('Database connection established'))
  .catch(err => console.error('Database connection error:', err));

// Static files
app.use(favicon(path.join(__dirname, 'favicon.png')));
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api", paymentRoutes);
app.use('/transactions', transactionRoutes);
app.use('/api/bank-of-heaven', bankOfHeavenRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/clients', clientRoutes);
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/api/documents', require('./routes/documentRoutes'));

// Health check
app.get('/', (req, res) => res.send('Server is running'));
app.get('/favicon.png', (req, res) => res.sendFile(path.join(__dirname, 'favicon.png')));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => { // CHANGED: server.listen instead of app.listen
  console.log(`Server running with Socket.io on port ${PORT}`);
});

module.exports = app;