'use strict';

var models = require('../models');

module.exports = {
  up: function (queryInterface, Sequelize, done) {
    models.User.create({
      name: 'admin',
      password: 'admin',
      expiration: '2027-01-01',
      uuid: '84e824cb-bfae-4d95-a76d-51103c556057',
      phone: '12345678901',
      isAdmin: true,
      alias: 'keta'
    }).then(function () {
      done();
    })
  },

  down: function (queryInterface, Sequelize, done) {
    done();
  }
};
