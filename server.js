const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/authRoutes'); // Import the auth routes

const app = express();

// Middleware
app.use(bodyParser.json()); // Parse incoming JSON requests
app.use(cors()); // Enable CORS for cross-origin requests

// Health check route
app.get('/', (req, res) => {
  res.send('Admin backend is running');
});

// Auth Routes
app.use('/', authRoutes); // Add the login route

// Admin Routes
app.use('/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Start the server
const PORT = process.env.PORT || 3020;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
