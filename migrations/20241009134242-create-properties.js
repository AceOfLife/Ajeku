// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.createTable('Properties', {
//       id: {
//         allowNull: false,
//         autoIncrement: true,
//         primaryKey: true,
//         type: Sequelize.INTEGER,
//       },
//       name: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       location: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       price: {
//         type: Sequelize.DECIMAL,
//         allowNull: false,
//       },
//       size: {
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       agent_id: {
//         type: Sequelize.INTEGER,
//         references: {
//           model: 'Agents', // Ensure this matches the correct table name for agents
//           key: 'id',
//         },
//         onUpdate: 'CASCADE',
//         onDelete: 'SET NULL',
//       },
//       type: { // Property Type field
//         type: Sequelize.ENUM('Rooms', 'Workspace'),
//         allowNull: false,
//       },
//       amenities: { // Property Amenities field
//         type: Sequelize.ENUM('Furnished', 'Unfurnished'),
//         allowNull: false,
//       },
//       area: { // Property Area field
//         type: Sequelize.STRING,
//         allowNull: false,
//       },
//       createdAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//       },
//       updatedAt: {
//         allowNull: false,
//         type: Sequelize.DATE,
//       },
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.dropTable('Properties');
//   },
// };




// More fields added based on the address error

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Properties', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      size: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      price: {
        type: Sequelize.FLOAT, // Changed to FLOAT to match the model
        allowNull: false,
      },
      agent_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users', // Ensure this references the correct table for agents
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      type: { 
        type: Sequelize.ENUM('Rooms', 'Workspace'),
        allowNull: false,
      },
      amenities: { 
        type: Sequelize.ENUM('Furnished', 'Unfurnished'),
        allowNull: false,
      },
      location: { // Changed from 'area' to 'location' as in the model
        type: Sequelize.STRING,
        allowNull: false,
      },
      area: { 
        type: Sequelize.STRING,
        allowNull: false,
      },
      number_of_baths: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      number_of_rooms: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      description: { 
        type: Sequelize.TEXT,
        allowNull: true,
      },
      address: { // Added 'address' column as it's required in the model
        type: Sequelize.STRING,
        allowNull: false,
      },
      sqft: { 
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0, // Default value as per the model
      },
      payment_plan: { 
        type: Sequelize.STRING,
        allowNull: true,
      },
      year_built: { 
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      amount_per_sqft: { 
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      special_features: { 
        type: Sequelize.JSONB, // JSONB for storing array of special features
        allowNull: true,
      },
      last_checked: { 
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW, // Default to the current timestamp
      },
      listing_updated: { 
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW, // Default to the current timestamp
      },
      listed_by: { 
        type: Sequelize.STRING,
        allowNull: true,
      },
      kitchen: { 
        type: Sequelize.STRING,
        allowNull: true,
      },
      heating: { 
        type: Sequelize.STRING,
        allowNull: true,
      },
      cooling: { 
        type: Sequelize.STRING,
        allowNull: true,
      },
      appliances: { 
        type: Sequelize.JSONB, // JSONB for storing array of appliances
        allowNull: true,
      },
      features: { 
        type: Sequelize.JSONB, // JSONB for storing array of features
        allowNull: true,
      },
      interior_area: { 
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      parking: { 
        type: Sequelize.STRING,
        allowNull: true,
      },
      lot: { 
        type: Sequelize.STRING,
        allowNull: true,
      },
      type_and_style: { 
        type: Sequelize.STRING,
        allowNull: true,
      },
      material: { 
        type: Sequelize.STRING,
        allowNull: true,
      },
      annual_tax_amount: { 
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      date_on_market: { 
        type: Sequelize.DATE,
        allowNull: true,
      },
      ownership: { 
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Properties');
  },
};
