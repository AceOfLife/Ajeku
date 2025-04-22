'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Convert empty strings to NULL
    await queryInterface.sequelize.query(`
      UPDATE "Properties"
      SET "duration" = NULL
      WHERE TRIM("duration") = '';
    `);

    // Step 2: Change the column type
    await queryInterface.sequelize.query(`
      ALTER TABLE "Properties"
      ALTER COLUMN "duration" TYPE INTEGER USING "duration"::INTEGER;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Properties"
      ALTER COLUMN "duration" TYPE VARCHAR(255);
    `);
  }
};
