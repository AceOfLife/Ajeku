'use strict';

const pg = require('pg');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env]; // Adjust the path as needed
const db = {};

// Debugging: log environment and database URL
console.log("Environment: ", env);
console.log("DATABASE_URL: ", process.env.DATABASE_URL);

// Check if DATABASE_URL exists, else use config.json for local development
let sequelize;
if (process.env.DATABASE_URL) {
  console.log("Using DATABASE_URL for connection...");

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true, // This ensures SSL is used
        rejectUnauthorized: false, // Allows self-signed certificates
        sslmode: 'require',
      },
    },
    logging: console.log, // Enable this line to get SQL queries in the console/logs for debugging
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,  // Increase the connection timeout to 30 seconds
      idle: 10000,
    },
    retry: {
      max: 3, // Retry 3 times in case of failure
    },
  });

} else {
  console.log("Using local config for database connection...");
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

// Test the connection to the database and log any errors
sequelize.authenticate()
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.error("Error connecting to the database:", error);
  });

// Import your models
fs.readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 && 
      file !== basename && 
      file.slice(-3) === '.js'
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Set up associations

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Add sequelize instance to the db object
db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
