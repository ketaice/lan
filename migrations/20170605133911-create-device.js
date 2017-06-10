'use strict';
module.exports = {
  up: function(queryInterface, Sequelize) {
    return queryInterface.createTable('Devices', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      devid: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      ower: {
        type: Sequelize.STRING
      },
      online: {
        type: Sequelize.BOOLEAN
      },
      expiration: {
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
  down: function(queryInterface, Sequelize) {
    return queryInterface.dropTable('Devices');
  }
};