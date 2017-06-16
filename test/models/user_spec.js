'use strict';

var Bluebird = require('bluebird');
var expect = require('chai').expect;

describe('User Model', function () {
  var models = null;
	beforeEach(function () {
		models = require('../../models');

		return Bluebird.all([
			models.User.destroy({truncate: true})
		]);
	});

	it('should create user successful', function (done) {
		models.User.create({
			name: 'admin',
			password: 'admin',
			expiration: '2027-01-01',
			uuid: '84e824cb-bfae-4d95-a76d-51103c556057',
			phone: '12345678901',
			alias: 'keta'
		}).then(function () {
      models.User.findOne({where: {name: 'admin'}}).then(function(user){
        if(user.name === 'admin') {
          done();
        }
      })
		})
	});
});
