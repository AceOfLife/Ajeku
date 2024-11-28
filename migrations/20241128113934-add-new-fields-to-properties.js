'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Properties', 'sqft', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });
    await queryInterface.addColumn('Properties', 'payment_plan', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'year_built', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'amount_per_sqft', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'special_features', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'last_checked', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'listing_updated', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'listed_by', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'kitchen', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'heating', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'cooling', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'appliances', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'features', {
      type: Sequelize.JSONB,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'interior_area', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'parking', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'lot', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'type_and_style', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'material', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'annual_tax_amount', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'date_on_market', {
      type: Sequelize.DATE,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'ownership', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove all the columns added in the 'up' migration
    await queryInterface.removeColumn('Properties', 'sqft');
    await queryInterface.removeColumn('Properties', 'payment_plan');
    await queryInterface.removeColumn('Properties', 'year_built');
    await queryInterface.removeColumn('Properties', 'amount_per_sqft');
    await queryInterface.removeColumn('Properties', 'special_features');
    await queryInterface.removeColumn('Properties', 'last_checked');
    await queryInterface.removeColumn('Properties', 'listing_updated');
    await queryInterface.removeColumn('Properties', 'listed_by');
    await queryInterface.removeColumn('Properties', 'kitchen');
    await queryInterface.removeColumn('Properties', 'heating');
    await queryInterface.removeColumn('Properties', 'cooling');
    await queryInterface.removeColumn('Properties', 'appliances');
    await queryInterface.removeColumn('Properties', 'features');
    await queryInterface.removeColumn('Properties', 'interior_area');
    await queryInterface.removeColumn('Properties', 'parking');
    await queryInterface.removeColumn('Properties', 'lot');
    await queryInterface.removeColumn('Properties', 'type_and_style');
    await queryInterface.removeColumn('Properties', 'material');
    await queryInterface.removeColumn('Properties', 'annual_tax_amount');
    await queryInterface.removeColumn('Properties', 'date_on_market');
    await queryInterface.removeColumn('Properties', 'ownership');
  }
};
