// 'use strict';

// module.exports = {
//   up: async (queryInterface, Sequelize) => {
//     await queryInterface.addColumn('Properties', 'type', {
//       type: Sequelize.ENUM('Rooms', 'Workspace'),
//       allowNull: false,
//       defaultValue: 'Rooms', // Default value to avoid null errors
//     });
//     await queryInterface.addColumn('Properties', 'amenities', {
//       type: Sequelize.ENUM('Furnished', 'Unfurnished'),
//       allowNull: false,
//       defaultValue: 'Furnished', // Default value to avoid null errors
//     });
//     await queryInterface.addColumn('Properties', 'area', {
//       type: Sequelize.STRING,
//       allowNull: false,
//       defaultValue: 'Unknown', // Default value to avoid null errors
//     });
//   },

//   down: async (queryInterface, Sequelize) => {
//     await queryInterface.removeColumn('Properties', 'type');
//     await queryInterface.removeColumn('Properties', 'amenities');
//     await queryInterface.removeColumn('Properties', 'area');
//   },
// };

// Check for missing fields

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Properties');
    
    // Check if 'type' column exists before adding
    if (!tableDescription.type) {
      await queryInterface.addColumn('Properties', 'type', {
        type: Sequelize.ENUM('Rooms', 'Workspace'),
        allowNull: false,
        defaultValue: 'Rooms', // Default value to avoid null errors
      });
    } else {
      console.log('Column "type" already exists in the "Properties" table.');
    }

    // Check if 'amenities' column exists before adding
    if (!tableDescription.amenities) {
      await queryInterface.addColumn('Properties', 'amenities', {
        type: Sequelize.ENUM('Furnished', 'Unfurnished'),
        allowNull: false,
        defaultValue: 'Furnished', // Default value to avoid null errors
      });
    } else {
      console.log('Column "amenities" already exists in the "Properties" table.');
    }

    // Check if 'area' column exists before adding
    if (!tableDescription.area) {
      await queryInterface.addColumn('Properties', 'area', {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'Unknown', // Default value to avoid null errors
      });
    } else {
      console.log('Column "area" already exists in the "Properties" table.');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDescription = await queryInterface.describeTable('Properties');
    
    // Check if 'type' column exists before removing
    if (tableDescription.type) {
      await queryInterface.removeColumn('Properties', 'type');
    } else {
      console.log('Column "type" does not exist in the "Properties" table.');
    }

    // Check if 'amenities' column exists before removing
    if (tableDescription.amenities) {
      await queryInterface.removeColumn('Properties', 'amenities');
    } else {
      console.log('Column "amenities" does not exist in the "Properties" table.');
    }

    // Check if 'area' column exists before removing
    if (tableDescription.area) {
      await queryInterface.removeColumn('Properties', 'area');
    } else {
      console.log('Column "area" does not exist in the "Properties" table.');
    }
  },
};

