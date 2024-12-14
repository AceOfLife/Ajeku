require('dotenv').config();  // Ensure you are using environment variables if needed
const { Sequelize } = require('sequelize');
const config = require('./config/config.json');  // Load your config.json file

// Choose the correct environment, development or production
const environment = process.env.NODE_ENV || 'development'; // Use 'development' if not defined in the environment
const dbConfig = config[environment];  // Select the config based on the environment

const sequelize = new Sequelize(
  dbConfig.database,   // Database name
  dbConfig.username,   // Username
  dbConfig.password,   // Password
  {
    host: dbConfig.host,   // Host of the new database
    dialect: dbConfig.dialect,  // e.g., 'postgres'
    port: dbConfig.port,    // Port for the database
    dialectOptions: dbConfig.dialectOptions || {}  // For production SSL options if defined
  }
);

sequelize.authenticate()
  .then(() => {
    console.log('Connection to the database has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });
