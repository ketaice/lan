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
            ower: 'admin'
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

    it("should get the devices list", function (done) {
        agent
            .get('/v1/devices')
            .auth('admin', 'admin')
            .expect(200, done);
    });

    it("should get the single device", function (done) {
        agent
            .get('/v1/devices/201700100002')
            .expect(200, done);
    });

    it("should unable to get the device", function (done) {
        agent
            .get('/v1/devices/201700100009')
            .expect(403, done);
    });

    it("should able to add a new device", function (done) {
        agent
            .post('/v1/devices')
            .send({devid: '201700100003', password: '12345678', ower: 'admin'})
            .end(function (err, res) {
                done();
            });
    });

    it("should able to set device online", function (done) {
        agent
            .put('/v1/devices/201700100001')
            .send({online: true})
            .end(function (err, res){
                res.statusCode.should.be.equal(200);
                done();
            });
    });

    it("should get device online msg", function (done) {
        agent
            .get('/v1/devices/201700100002')
            .end(function(err, res){
                res.statusCode.should.be.equal(200);
                //assert(res.body.online, true);
                done();
            });
    });

    it("should able to set device offline", function (done) {
        agent
            .put('/v1/devices/201700100001')
            .send({online: false})
            .end(function (err, res){
                res.statusCode.should.be.equal(200);
                done();
            });
    });
});