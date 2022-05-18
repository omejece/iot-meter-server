'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('meters', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      customerid: {
        type: Sequelize.INTEGER,
        references: {
          model: 'customers', // name of Target model
          key: 'id', // key in Target model that we're referencing
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false
      },
      meteruid: {
        type: Sequelize.STRING
      },
      billingtype: {
        type: Sequelize.INTEGER
      },
      metertype: {
        type: Sequelize.INTEGER
      },
      softwareversion: {
        type: Sequelize.STRING,
        defaultValue: " "
      },
      simcardiccd: {
        type: Sequelize.STRING,
        defaultValue: " "
      },
      frequency: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      totalpowerfactor: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      powerfactora: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      powerfactorb: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      powerfactorc: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      voltagea: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      voltageb: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      voltagec: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      currenta: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      currentb: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      currentc: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      totalactivepower: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      activepowera: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      activepowerb: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      activepowerc: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      totalreactivepower: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      reactivepowera: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      reactivepowerb: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      reactivepowerc: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      cummulativetotalenergy: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      cummulativetopenergy: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      cummulativepeakenergy: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      cummulativeflatenergy: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      cummulativebottomenergy: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      peakload: {
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      source: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      control: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      disabled: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      output: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      ipaddress: {
        type: Sequelize.STRING
      },
      port: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      ssid: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      password: {
        type: Sequelize.STRING,
        defaultValue: ""
      },
      iscontrol: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isnewsetting: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      isdisabled: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      costperkw: {
        type: Sequelize.DOUBLE(20,4)
      },
      availableunit:{
        type: Sequelize.DOUBLE(20,4),
        defaultValue: 0
      },
      lastactive: {
        type: Sequelize.DATE
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
    await queryInterface.dropTable('meters');
  }
};