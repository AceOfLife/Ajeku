module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add new values to the existing ENUM
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Properties_type" ADD VALUE IF NOT EXISTS 'Commercial'`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Properties_type" ADD VALUE IF NOT EXISTS 'Residential'`
    );
  },

  down: async (queryInterface, Sequelize) => {
    // Optionally, if you want to remove the values (this is tricky and not recommended for production)
    // You would have to drop the column and recreate it with the original ENUM values
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Properties_type" DROP VALUE 'Commercial'`
    );
    await queryInterface.sequelize.query(
      `ALTER TYPE "enum_Properties_type" DROP VALUE 'Residential'`
    );
  }
};
