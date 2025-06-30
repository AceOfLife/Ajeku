module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserDocuments', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: Sequelize.INTEGER,
        references: { model: 'Users', key: 'id' },
        allowNull: false
      },
      documentType: {
        type: Sequelize.ENUM('DRIVER_LICENSE', 'PASSPORT', 'NATIONAL_ID'),
        allowNull: false
      },
      frontUrl: {
        type: Sequelize.STRING,
        allowNull: false
      },
      backUrl: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.ENUM('PENDING', 'APPROVED', 'REJECTED'),
        defaultValue: 'PENDING'
      },
      adminNotes: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('UserDocuments');
  }
};