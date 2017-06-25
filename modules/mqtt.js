var Database = require('../persistence/mongo');
var db = new Database();
var authCheck = require('../auth/devbasic');
var setOnline = require("./utils/setOnline");

function foundClientName(clients, devid) {
  var k;
  var found = false;
  for (k in clients) {
    var _client = clients[k];

    if (_client.devid === devid) {
      found = true;
      break;
    }
  }
  return found;
}

module.exports = function (app) {
  'use strict';
  return function (client) {
    var userInfo = {};
    var self = this;

    if (!self.clients) {
      self.clients = {};
    }

    client.on('connect', function (packet) {
      client.id = packet.clientId;
      client.subscriptions = [];
      if (packet.username === undefined || packet.password === undefined) {
        return client.connack({
          returnCode: 4
        });
      }

      var reqUserInfo = {
        name: packet.username,
        password: packet.password.toString()
      };

      var errorCB = function () {
        return client.connack({
          returnCode: 4
        });
      };

      var successCB = function (device) {
        if (!foundClientName(self.clients, device.devid)) {
          setOnline(device.devid, true);
        }
        client.devid = device.devid;
        self.clients[packet.clientId] = client;
        userInfo = device;

        client.connack({
          returnCode: 0
        });
      };

      authCheck(reqUserInfo, errorCB, successCB, errorCB);
    });

    client.on('subscribe', function (packet) {
      var granted = [];
      var i;
      for (i = 0; i < packet.subscriptions.length; i++) {
        var qos = packet.subscriptions[i].qos;
        var topic = packet.subscriptions[i].topic;
        var reg = new RegExp(topic.replace('+', '[^\/]+').replace('#', '.+') + '$');

        granted.push(qos);
        client.subscriptions.push(reg);
      }

      client.suback({messageId: packet.messageId, granted: granted});

      db.subscribe({name: userInfo.devid, token: userInfo.uid}, function (result) {
        return client.publish({
          topic: userInfo.devid.toString(),
          payload: JSON.stringify(result)
        });
      });
    });
    client.on('publish', function (packet) {
      var k;
      var i;
      var payload = {
        name: userInfo.devid,
        token: userInfo.uid,
        data: packet.payload.toString()
      };
      db.insert(payload);

      for (k in self.clients) {
        var _client = self.clients[k];

        for (i = 0; i < _client.subscriptions.length; i++) {
          var subscription = _client.subscriptions[i];

          if (subscription.test(packet.topic)) {
            _client.publish({
              topic: packet.topic,
              payload: packet.payload.toString()
            });
            break;
          }
        }
      }
    });

    client.on('pingreq', function (packet) {
      return client.pingresp();
    });
    client.on('disconnect', function () {
      return client.stream.end();
    });
    client.on('error', function (error) {
      return client.stream.end();
    });
    client.on('close', function (err) {
      delete self.clients[client.id];
      if (!foundClientName(self.clients, userInfo.devid)) {
        setOnline(userInfo.devid, false);
      }
    });
    return client.on('unsubscribe', function (packet) {
      return client.unsuback({
        messageId: packet.messageId
      });
    });
  };
};
