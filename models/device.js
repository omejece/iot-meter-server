'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class device extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      device.belongsTo(models.block,{foreignKey:'block_id'});
    }
  };
  device.init({
    block_id: DataTypes.INTEGER,
    merchant_id: DataTypes.INTEGER,
    imei: DataTypes.STRING,
    device_type: DataTypes.INTEGER,
    device_link_imei: DataTypes.STRING,
    data: DataTypes.STRING,
    settings: DataTypes.STRING,
    flags: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'device',
  });
  return device;
};