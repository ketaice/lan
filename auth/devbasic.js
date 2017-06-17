var model = require('../models');

module.exports = function (devInfo, noUserCB, successCB, errorCB) {
  'use strict';
  model.Device.findOne({where: {devid: devInfo.name}}).then(function (device) {
    if (!device) {
      return noUserCB();
    }
    device.comparePassword(devInfo.password, function (err, result) {
      if (result) {
        return successCB(device);
      } else {
        return errorCB();
      }
    });
  });
};