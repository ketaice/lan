var express = require('express');
var router = express.Router();
var passport = require('passport');
var models = require('../models/');
var authCheck = require('../auth/basic');

router.get('/', function (req, res) {
  'use strict';
  res.render('index', {
    title: 'Welcome to Lan'
  });
});

router.get('/login', function (req, res) {
  'use strict';
  if (!req.isAuthenticated()) {
    res.render('login/index', {title: 'Lan Login'});
  } else {
    res.render('login/success', {
      title: 'Already login ' + req.user.name,
      uid: req.user.uid,
      userName: req.user.name,
      phone: req.user.phone,
      alias: req.user.alias
    });
  }
});

router.post('/login', function (req, res) {
  'use strict';

  var userInfo = {
    name: req.body.name,
    password: req.body.password
  };
  var errorCB = function () {
    req.session.messages = 'not such user';
    return res.redirect('/login');
  };

  var successCB = function (user) {
    passport.authenticate('local')(req, res, function () {
      req.logIn(user, function (err) {
        req.session.messages = 'Login successfully';
        return res.render('login/success', {
          title: 'Welcome ' + user.name,
          uid: user.uid,
          userName: user.name,
          phone: user.phone,
          alias: user.alias
        });
      });
    });
  };

  var failureCB = function () {
    return res.sendStatus(404);
  };

  authCheck(userInfo, errorCB, successCB, failureCB);
});

router.get('/logout', function (req, res) {
  'use strict';
  if (req.isAuthenticated()) {
    req.logout();
    req.session.messages = 'Log out successfully';
  }
  res.redirect('/');
});

router.get(/^\/users\/(.+)$/, function (req, res) {
  'use strict';
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  models.User.findOne({where: {name: req.params[0]}}).then(function (user) {
    if (!user) {
      return res.sendStatus(403);
    }

    return res.render('user/index', {
      title: user.name + '\'s Profile',
      user: user
    });
  });
});

router.post('/register', function (req, res) {
  'use strict';
  var userInfo = {
    name: req.body.name,
    password: req.body.password,
    phone: req.body.phone,
    alias: req.body.alias
  };

  models.User.build(userInfo)
    .validate()
    .then(function (err) {
      if (err) {
        return res.render('user/register', {user: userInfo, title: 'Something Error', errors: err.errors});
      }
      models.User.create(userInfo).then(function (user, err) {
        if (err) {
          return res.redirect('/');
        }

        models.Message.create({
          name: user.name,
          userId: user.id,
          uuid: user.uid,
          status: 'create'
        }).then(function (message, err) {
          passport.authenticate('local')(req, res, function () {
            res.render('success', {
              title: 'Create Success,' + user.name,
              account: user,
              uid: user.uid
            });
          });
        });
      });
    });
});

router.get('/register', function (req, res) {
  'use strict';
  res.render('user/register', {title: 'Lan Account Manager', errors: ''});
});

router.get('/devices', function (req, res) {
  'use strict';
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  //console.log("login user:" + req.user.name);
  models.Device.findAll({ where: { owner: req.user.name } })
    .then(function (devices) {
      var devList = [];

      if (!devices) {
        return res.render('device/index',
          {
            title: 'Device list is Empty!',
            devices: devList
          });
      }

      devices.forEach(function (device) {
        devList.push({
          devid: device.devid,
          online: device.online,
          owner: device.owner
        });
      }, this);

      return res.render('device/index',
        {
          title: 'Device list',
          devices: devList
        });
    })
    .catch(function (err) {
      console.log(`findAll err:` + err);
      return res.render('device/index',
        {
          title: 'Get Device list is errot!',
          devices: devList
        });
    });
});

router.get('/devices/:id', function (req, res) {
  'use strict';
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  models.Device.findOne({ where: { devid: req.params.id } })
    .then(function (device) {
      if (!device) {
        return res.sendStatus(403);
      }

      return res.render('device/detail', {
        title: device.devid,
        device: {
          devid: device.devid,
          online: device.online,
          owner: device.owner
        }
      });
    });
});

router.post('/devices', function (req, res) {
  'use strict';
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }

  var devInfo = {
    devid: req.body.devid,
    password: req.body.password,
    owner: req.body.owner
  };
  
  models.Device.build(devInfo)
    .validate()
    .then(function (err) {
      if (err) {
        return res.render('device/create', { devices: devInfo, title: 'Something Error', errors: err.errors });
      }
      models.Device.create(devInfo).then(function (device, err) {
        if (err) {
          return res.render('/');
        }
        return res.render('success', {
          title: 'Create Success,' + device.devid,
          account: device,
          uid: device.uid
        });
      });
    });
});

router.get('/devices/create', function (req, res) {
  'use strict';
  res.render('device/create', {title: 'Create Devices', errors: ''});
});

module.exports = router;
