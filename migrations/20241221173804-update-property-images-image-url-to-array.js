'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add a temporary column with the correct type
    await queryInterface.addColumn('PropertyImages', 'new_image_url', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: false,
      defaultValue: [],
    });

    // Copy data from the old `image_url` column to the new column
    await queryInterface.sequelize.query(
      `UPDATE "PropertyImages" SET "new_image_url" = ARRAY["image_url"]::text[]`
    );

    // Remove the old column
    await queryInterface.removeColumn('PropertyImages', 'image_url');

    // Rename the new column to the original name
    await queryInterface.renameColumn('PropertyImages', 'new_image_url', 'image_url');
  },

  down: async (queryInterface, Sequelize) => {
    // Add the old column back (reverting changes)
    await queryInterface.addColumn('PropertyImages', 'new_image_url', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Copy data back from the array to the string
    await queryInterface.sequelize.query(
      `UPDATE "PropertyImages" SET "new_image_url" = "image_url"[1]`
    );

    // Remove the array column
    await queryInterface.removeColumn('PropertyImages', 'image_url');

    // Rename the column back to the original name
    await queryInterface.renameColumn('PropertyImages', 'new_image_url', 'image_url');
  }
};
