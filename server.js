// Error Handling

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const favicon = require('serve-favicon'); // Import serve-favicon
const adminRoutes = require('./routes/admin'); 
const clientRoutes = require('./routes/clientRoutes');
const authRoutes = require('./routes/authRoutes'); // Import auth routes if needed
const { sequelize } = require('./models'); // Import Sequelize connection
const paymentRoutes = require("./routes/paymentRoutes");
const transactionRoutes = require('./routes/transactionRoutes');
const bankOfHeavenRoutes = require('./routes/bankOfHeavenRoutes');
const messageRoutes = require('./routes/messageRoutes');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database connection check (important for debugging)
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// Serve favicon from the root directory
app.use(favicon(path.join(__dirname, 'favicon.png'))); // Adjust path if needed
app.use(express.static(path.join(__dirname))); 

// Payment route
app.use("/api", paymentRoutes);

// Transaction route
app.use('/transactions', transactionRoutes);

// Bank of Heaven route
app.use('/api/bank-of-heaven', bankOfHeavenRoutes);

// Message Routes
app.use('/api/messages', messageRoutes); 

app.get('/favicon.png', (req, res) => {
  res.sendFile(path.join(__dirname, 'favicon.png')); // Serve favicon.png directly from root
});

// Serve static files from the "uploads" folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware
app.use(bodyParser.json()); // Parse incoming JSON requests


// Health check route
app.get('/', (req, res) => {
  res.send('Admin backend is running');
});

// Client Routes
app.use('/clients', clientRoutes);

// Auth Routes
app.use('/auth', authRoutes); // Assuming auth routes exist

// Admin Routes
app.use('/admin', adminRoutes); // Admin route for /admin/signup

// User Routes
app.use('/api/documents', require('./routes/documentRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// Export the Express app for Vercel to use as a serverless function
module.exports = app;
