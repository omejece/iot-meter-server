'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class dataprofile extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  };
  dataprofile.init({
    imei: DataTypes.STRING,
    merchant_id: DataTypes.INTEGER,
    data: DataTypes.STRING,
    status: DataTypes.INTEGER,
    date_taken: DataTypes.DATEONLY,
    time_taken: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'dataprofile',
  });
  return dataprofile;
};