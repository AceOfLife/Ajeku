module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Adding the missing fields to the Properties table
    await queryInterface.addColumn('Properties', 'listed_by', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'special_features', {
      type: Sequelize.JSONB,
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

    await queryInterface.addColumn('Properties', 'material', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'annual_tax_amount', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'date_on_market', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'ownership', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Properties', 'heating', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });
    
    await queryInterface.addColumn('Properties', 'cooling', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'kitchen', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'type_and_style', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'parking', {
      type: Sequelize.JSONB,
      allowNull: true,
    });

    await queryInterface.addColumn('Properties', 'lot', {
      type: Sequelize.ARRAY(Sequelize.STRING),
      allowNull: true,
    });

  },

  down: async (queryInterface, Sequelize) => {
    // Removing the newly added columns in case we need to rollback
    await queryInterface.removeColumn('Properties', 'listed_by');
    await queryInterface.removeColumn('Properties', 'special_features');
    await queryInterface.removeColumn('Properties', 'appliances');
    await queryInterface.removeColumn('Properties', 'features');
    await queryInterface.removeColumn('Properties', 'interior_area');
    await queryInterface.removeColumn('Properties', 'material');
    await queryInterface.removeColumn('Properties', 'annual_tax_amount');
    await queryInterface.removeColumn('Properties', 'date_on_market');
    await queryInterface.removeColumn('Properties', 'ownership');
    await queryInterface.removeColumn('Properties', 'heating');
    await queryInterface.removeColumn('Properties', 'cooling');
    await queryInterface.removeColumn('Properties', 'kitchen');
    await queryInterface.removeColumn('Properties', 'type_and_style');
    await queryInterface.removeColumn('Properties', 'parking');
    await queryInterface.removeColumn('Properties', 'lot');
  }
};
