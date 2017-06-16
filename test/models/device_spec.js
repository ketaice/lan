'use strict';

var Bluebird = require('bluebird');
var expect = require('chai').expect;

describe('Device Model', function () {
    var models = null;
    beforeEach(function () {
        models = require('../../models');

        return Bluebird.all([
			models.Device.destroy({truncate: true})
		]);
    });

    it('should create device successful', function (done) {
        models.Device.create({
            devid: '201700100001',
            password: '12345678',
            expiration: '2027-01-01',
            ower: 'admin'
        }).then(function () {
            models.Device.findOne({where: {devid: '201700100001'}}).then(function(device){
                if (device.devid === '201700100001') {
                    done();
                }
            })
        })
    });
});