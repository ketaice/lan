var mqtt = require('mqtt');
var request = require('request');
var should = require('should');
var supertest = require('supertest');
var env = require("../../app.js");

describe('MQTT Services Test', function () {
  var app, server, mqttServer;
  app = env.configure();

  beforeEach(function () {
    mqttServer = mqtt.MqttServer(app.mqtt).listen(1883, function () {
    });
  });

  afterEach(function () {
    mqttServer.close();
  });

  describe('connect test', function () {
    it('should able connect to mqtt server', function (done) {
      var client = mqtt.connect('http://127.0.0.1', {
        username: '201700100001',
        password: '12345678'
      });

      client.on('connect', function (packet) {
        if (packet.returnCode === 0) {
          client.end();
          done();
        }
      });
    });

    //it('should unable connect to mqtt server when lost password', function (done) {
    //  var client = mqtt.connect('http://127.0.0.1', {
    //    username: '201700100001'
    //  });
    //
    //  client.on('error', function () {
    //    client.end();
    //    done();
    //  });
    //});
    //
    //it('should unable connect to mqtt server when username & password error', function (done) {
    //  var client = mqtt.connect('http://127.0.0.1', {
    //    username: '201700100001',
    //    password: 'password'
    //  });
    //
    //  client.on('error', function () {
    //    client.end();
    //    done();
    //  });
    //});
  });

  it('should able to sub/pub message', function (done) {
    var client = mqtt.connect('http://127.0.0.1', {
      username: '201700100001',
      password: '12345678'
    });

    client.on('connect', function () {
      client.subscribe('device/1');
      var payload = '{"temperature": 3"}';
      client.publish('device/1', payload);
      client.on('message', function (topic, message) {
        if ((message.toString()) === payload) {
          client.end();
          done();
        }
      });
    });
  });
});
