module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Step 1: Create a new column with ARRAY type
      await queryInterface.addColumn('Properties', 'material_temp', {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: true
      }, { transaction });

      // Step 2: Convert old data (comma-separated strings) into arrays
      await queryInterface.sequelize.query(
        `UPDATE "Properties" SET "material_temp" = string_to_array("material", ',') WHERE "material" IS NOT NULL;`,
        { transaction }
      );

      // Step 3: Remove the old column
      await queryInterface.removeColumn('Properties', 'material', { transaction });

      // Step 4: Rename the new column to "material"
      await queryInterface.renameColumn('Properties', 'material_temp', 'material', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Step 1: Create old column again with STRING type
      await queryInterface.addColumn('Properties', 'material_temp', {
        type: Sequelize.STRING,
        allowNull: true
      }, { transaction });

      // Step 2: Convert ARRAY back to comma-separated string
      await queryInterface.sequelize.query(
        `UPDATE "Properties" SET "material_temp" = array_to_string("material", ',') WHERE "material" IS NOT NULL;`,
        { transaction }
      );

      // Step 3: Remove the new ARRAY column
      await queryInterface.removeColumn('Properties', 'material', { transaction });

      // Step 4: Rename back to "material"
      await queryInterface.renameColumn('Properties', 'material_temp', 'material', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
