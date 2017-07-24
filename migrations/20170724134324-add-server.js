'use strict';

var models = require('../models');

module.exports = {
  up: function (queryInterface, Sequelize, done) {
    models.serverList.create({
      name: 'netviom1',
      http: '127.0.0.1:8899',
      mqtt: '127.0.0.1:1883',
      mqttWS: '127.0.0.1:8898',
      srs: '127.0.0.1:1935'
    }).then(function () {
      done();
    })
  },

  down: function (queryInterface, Sequelize, done) {
    done();
  }
};
