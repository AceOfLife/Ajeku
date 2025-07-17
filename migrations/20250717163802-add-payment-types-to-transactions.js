'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`
      CREATE TYPE "enum_Transactions_payment_type" AS ENUM (
        'fractional',
        'fractionalInstallment',
        'installment',
        'rental'
      );
    `);

    await queryInterface.addColumn('Transactions', 'payment_type', {
      type: '"enum_Transactions_payment_type"',
      allowNull: false,
      defaultValue: 'fractional'
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('Transactions', 'payment_type');
    await queryInterface.sequelize.query(`
      DROP TYPE "enum_Transactions_payment_type";
    `);
  }
};