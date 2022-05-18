'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class devicealarm extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  devicealarm.init({
    imei: DataTypes.STRING,
    merchant_id: DataTypes.INTEGER,
    device_id: DataTypes.INTEGER,
    status: DataTypes.INTEGER,
    type: DataTypes.INTEGER,
    data: DataTypes.STRING,
    date_taken: DataTypes.DATEONLY,
    time_taken: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'devicealarm',
  });
  return devicealarm;
};