var config = require('config');
var encrypt = require('./encrypt/' + config.get('encrypt'));

'use strict';
module.exports = function(sequelize, DataTypes) {
  function hashPasswordHook(device, options, done) {
    if (!device.changed('password')) {
      done();
    }
    encrypt.hash(device.get('password'), function (err, hash) {
      if (err) {
        done(err);
      }
      device.set('password', hash);
      done();
    });
  }
  
  var Device = sequelize.define('Device', {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    devid: {
      type: DataTypes.CHAR(12),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isUnique: function (value, next) {
          Device.find({
            where: {devid: value}
          }).done(function (error, device){
            if (error) {
              return next(error);
            }
            if (device) {
              console.log("Device ID is already in used!");
              return next("Device ID is already in used!")
            }
            next()
          })
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    ower: {
      type: DataTypes.STRING,
      allowNull: false
    },
    online: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    expiration: DataTypes.DATE
  }, {
    classMethods: {
      associate: function(models) {
      },
      findByDevId: function (devid) {
        return this.find({where: {devid: devid}});
      }
    },
    hooks: {
      beforeCreate: hashPasswordHook,
      beforeUpdate: hashPasswordHook
    },
    instanceMethods: {
      comparePassword: function (password, done) {
        return encrypt.validate(password, this.password, function (err, res){
          return done(err, res);
        });
      }
    }
  });
  
  return Device;
};