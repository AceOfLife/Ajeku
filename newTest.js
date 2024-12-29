// Load environment variables from the .env file
require('dotenv').config();

// Log DATABASE_URL to check if it's being loaded correctly
// console.log('DATABASE_URL:', process.env.DATABASE_URL);

const { Sequelize } = require('sequelize');

// Initialize Sequelize with the DATABASE_URL from environment variables
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true, // Ensure SSL is used
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  },
});

sequelize.authenticate()
  .then(() => {
    console.log('Database connection successful');
  })
  .catch((error) => {
    console.error('Error connecting to the database:', error);
  });
