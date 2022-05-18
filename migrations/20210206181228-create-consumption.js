'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('consumptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      imei: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      merchant_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      data: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.INTEGER
      },
      date_taken: {
        type: Sequelize.DATEONLY
      },
      time_taken: {
        type: Sequelize.TIME
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('consumptions');
  }
};