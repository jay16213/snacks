'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  User.init({
    slackID: { type: DataTypes.STRING, allowNull: false },
    name: { type: DataTypes.STRING, defaultValue: "Unknown" },
    isAdmin: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    balance: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 }
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};
