'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class consumption extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
    }
  };
  consumption.init({
    imei: DataTypes.STRING,
    merchant_id: DataTypes.INTEGER,
    source: DataTypes.INTEGER,
    data: DataTypes.STRING,
    day_taken: DataTypes.INTEGER,
    year_taken: DataTypes.INTEGER,
    month_taken: DataTypes.INTEGER,
    date_taken: DataTypes.DATEONLY
  }, {
    sequelize,
    modelName: 'consumption',
  });
  return consumption;
};