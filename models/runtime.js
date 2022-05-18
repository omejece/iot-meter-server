'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class runtime extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  runtime.init({
    block_id: DataTypes.INTEGER,
    merchant_id: DataTypes.INTEGER,
    imei: DataTypes.STRING,
    duration: DataTypes.DOUBLE,
    last_elapsed_time: DataTypes.DOUBLE,
    date_taken: DataTypes.DATEONLY,
    time_taken: DataTypes.TIME
  }, {
    sequelize,
    modelName: 'runtime',
  });
  return runtime;
};