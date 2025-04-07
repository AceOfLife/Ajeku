"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Step 1: Add new ARRAY columns
    await queryInterface.addColumn("Properties", "special_features_temp", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });

    await queryInterface.addColumn("Properties", "appliances_temp", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });

    await queryInterface.addColumn("Properties", "features_temp", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });

    await queryInterface.addColumn("Properties", "parking_temp", {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });

    // Step 2: Migrate JSONB data to ARRAY (convert JSONB to ARRAY)
    await queryInterface.sequelize.query(`
      UPDATE "Properties"
      SET "special_features_temp" = ARRAY(
        SELECT jsonb_array_elements_text("special_features")
      )
      WHERE "special_features" IS NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE "Properties"
      SET "appliances_temp" = ARRAY(
        SELECT jsonb_array_elements_text("appliances")
      )
      WHERE "appliances" IS NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE "Properties"
      SET "features_temp" = ARRAY(
        SELECT jsonb_array_elements_text("features")
      )
      WHERE "features" IS NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      UPDATE "Properties"
      SET "parking_temp" = ARRAY(
        SELECT jsonb_array_elements_text("parking")
      )
      WHERE "parking" IS NOT NULL;
    `);

    // Step 3: Drop old JSONB columns
    await queryInterface.removeColumn("Properties", "special_features");
    await queryInterface.removeColumn("Properties", "appliances");
    await queryInterface.removeColumn("Properties", "features");
    await queryInterface.removeColumn("Properties", "parking");

    // Step 4: Rename the new columns to original names
    await queryInterface.renameColumn("Properties", "special_features_temp", "special_features");
    await queryInterface.renameColumn("Properties", "appliances_temp", "appliances");
    await queryInterface.renameColumn("Properties", "features_temp", "features");
    await queryInterface.renameColumn("Properties", "parking_temp", "parking");
  },

  async down(queryInterface, Sequelize) {
    // Revert the changes (if needed)
    await queryInterface.addColumn("Properties", "special_features", {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.addColumn("Properties", "appliances", {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.addColumn("Properties", "features", {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.addColumn("Properties", "parking", {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    // Restore old data from ARRAY to JSONB
    await queryInterface.sequelize.query(`
      UPDATE "Properties"
      SET "special_features" = to_jsonb("special_features");
    `);

    await queryInterface.sequelize.query(`
      UPDATE "Properties"
      SET "appliances" = to_jsonb("appliances");
    `);

    await queryInterface.sequelize.query(`
      UPDATE "Properties"
      SET "features" = to_jsonb("features");
    `);

    await queryInterface.sequelize.query(`
      UPDATE "Properties"
      SET "parking" = to_jsonb("parking");
    `);

    // Drop the ARRAY columns
    await queryInterface.removeColumn("Properties", "special_features");
    await queryInterface.removeColumn("Properties", "appliances");
    await queryInterface.removeColumn("Properties", "features");
    await queryInterface.removeColumn("Properties", "parking");
  },
};
