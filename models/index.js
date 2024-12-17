// // 'use strict';

// // const fs = require('fs');
// // const path = require('path');
// // const Sequelize = require('sequelize');
// // const basename = path.basename(__filename);
// // const env = process.env.NODE_ENV || 'development';
// // const config = require('../config/config.json')[env]; // Adjust the path as needed
// // const db = {};

// // // Check if DATABASE_URL exists, else use config.json for local development
// // let sequelize;
// // if (process.env.DATABASE_URL) {
// //   sequelize = new Sequelize(process.env.DATABASE_URL, {
// //     dialect: 'postgres',
// //     protocol: 'postgres',
// //     dialectOptions: {
// //       ssl: {
// //         require: true, // This will ensure SSL is used
// //         rejectUnauthorized: false, // Allows self-signed certificates
// //       },
// //     },
// //   });
// // } else {
// //   sequelize = new Sequelize(config.database, config.username, config.password, config);
// // }

// // // Import your models
// // fs.readdirSync(__dirname)
// //   .filter(file => {
// //     return (
// //       file.indexOf('.') !== 0 && 
// //       file !== basename && 
// //       file.slice(-3) === '.js'
// //     );
// //   })
// //   .forEach(file => {
// //     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
// //     db[model.name] = model;
// //   });

// // // Set up associations
// // Object.keys(db).forEach(modelName => {
// //   if (db[modelName].associate) {
// //     db[modelName].associate(db);
// //   }
// // });

// // // Add sequelize instance to the db object
// // db.sequelize = sequelize;
// // db.Sequelize = Sequelize;

// // module.exports = db;


// 'use strict';

// const pg = require('pg');
// const fs = require('fs');
// const path = require('path');
// const Sequelize = require('sequelize');
// const basename = path.basename(__filename);
// const env = process.env.NODE_ENV || 'development';
// const config = require('../config/config.json')[env]; // Adjust the path as needed
// const db = {};

// // Check if DATABASE_URL exists, else use config.json for local development
// let sequelize;
// if (process.env.DATABASE_URL) {
//   sequelize = new Sequelize(process.env.DATABASE_URL, {
//     dialect: 'postgres',
//     dialectModule: pg,
//     protocol: 'postgres',
//     dialectOptions: {
//       ssl: {
//         require: true, // This ensures SSL is used
//         rejectUnauthorized: false, // Allows self-signed certificates
//       },
//     },
//     logging: console.log, // Enable this line to get SQL queries in the console/logs for debugging
//     pool: {
//       max: 5,
//       min: 0,
//       acquire: 30000,  // Increase the connection timeout to 30 seconds
//       idle: 10000,
//     },
//     retry: {
//       max: 3, // Retry 3 times in case of failure
//     },
//   });
// } else {
//   sequelize = new Sequelize(config.database, config.username, config.password, config);
// }

// // Import your models
// fs.readdirSync(__dirname)
//   .filter(file => {
//     return (
//       file.indexOf('.') !== 0 && 
//       file !== basename && 
//       file.slice(-3) === '.js'
//     );
//   })
//   .forEach(file => {
//     const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
//     db[model.name] = model;
//   });

// // Set up associations
// Object.keys(db).forEach(modelName => {
//   if (db[modelName].associate) {
//     db[modelName].associate(db);
//   }
// });

// // Add sequelize instance to the db object
// db.sequelize = sequelize;
// db.Sequelize = Sequelize;

// module.exports = db;


// Index for logging Database URL

'use strict';

const pg = require('pg');
const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env]; // Adjust the path as needed
const db = {};

// Check if DATABASE_URL exists, else use config.json for local development
let sequelize;
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectModule: pg,
    protocol: 'postgres',
    dialectOptions: {
      ssl: {
        require: true, // This ensures SSL is used
        rejectUnauthorized: true, // Allows self-signed certificates
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
  
  // Log the DATABASE_URL for debugging (remove before production)
  console.log('Database URL:', process.env.DATABASE_URL);

  // Test the database connection
  sequelize.authenticate()
    .then(() => {
      console.log('Database connection successful');
    })
    .catch((error) => {
      console.error('Error connecting to the database:', error);
    });

} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

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
