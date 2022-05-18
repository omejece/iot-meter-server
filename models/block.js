'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class block extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of DataTypes lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
       block.hasMany(models.device,{foreignKey:'block_id'});
    }
  };
  block.init({
      reference: DataTypes.STRING,
      merchant_id: DataTypes.INTEGER,
      data: DataTypes.STRING,
  }, 
  {
    sequelize,
    modelName: 'block',
  });
  return block;
};