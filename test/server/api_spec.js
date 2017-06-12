var helper = require('../spec_helper');
var request = require('request');
var website = "http://localhost:8899/";
var assert = require('chai').assert;
var should = require('should');
var supertest = require('supertest');
var env = require("../../app.js");

describe('API services Test', function() {
    var app, server;
    app = env.configure();

    before(function () {
        var models = require('../../models');
        models.Device.create({
            devid: '201700100002',
            password: '12345678',
            expiration: '2027-01-01',
            ower: 'keta'
        });

        server = app.listen(8899, function () {
        })
    });

    after(function () {
        server.close();
    });

    var agent = supertest.agent(app);

    it("should able load the decribe page", function (done) {
        agent
            .get('/v1/')
            .expect(200, done);
    });

    it("should get the device list", function (done) {
        agent
            .get('/v1/devices')
            .expect(200, done);
    })
});