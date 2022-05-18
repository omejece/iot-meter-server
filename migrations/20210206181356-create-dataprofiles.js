'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('dataprofiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      merchant_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'customers', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      imei: {
        type: Sequelize.INTEGER,
        references: {
          model: 'meters', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      meteruid: {
        type: Sequelize.STRING
      },
      source: {
        type: Sequelize.INTEGER
      },
      data: {
        type: Sequelize.STRING
      },
      day_taken: {
        type: Sequelize.INTEGER
      },
      year_taken: {
        type: Sequelize.INTEGER
      },
      month_taken: {
        type: Sequelize.INTEGER
      },
      date_taken: {
        type: Sequelize.DATEONLY
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
    await queryInterface.dropTable('dataprofiles');
  }
};