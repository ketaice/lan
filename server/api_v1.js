var Rest = require('connect-rest');
var models = require('../models/');

var apiOptions = {
    context: "/v1",
    domain: require('domain').create(),
};

apiOptions.domain.on('error', function(err){
    console.log('API domain error.\n', err.stack);
});

var rest = Rest.create(apiOptions);

rest.get('/', function(req, context, cb){
    'use strict';
    return cb(null, {msg: 'Select a device, eg. /devices/:id'});
});

rest.get('/devices', function(req, context, cb){
    'use strict';
    // if (!req.isAuthenticated()){
    //     var error = new Error('Unauthenticated!');
    //     error.statusCode = 401;
    //     return cb(error);
    // }

    models.Device.findAll()
    .then(function(devices){
        if (!devices) {
            var error = new Error('Device list is empty!');
            error.statusCode = 403;
            return cb(error);
        }

        var devList = [];

        devices.forEach(function(device) {
            devList.push({
                devid: device.devid,
                online: device.online,
                ower: device.ower
            });
        }, this);

        return cb(null, {devices: devList});
    })
    .catch(function (err){
        console.log(`findAll err:` + err);
        var error = new Error('Database err!');
        error.statusCode = 500;
        return cb(error);
    });
})

rest.get('/devices/:id', function(req, context, cb){
    'use strict';
    // if (!req.isAuthenticated()){
    //     var error = new Error('Unauthenticated!');
    //     error.statusCode = 401;
    //     return cb(error);
    // }

    models.Device.findOne({where: {devid: req.params.id}})
    .then(function(device){
        if (!device) {
            var error = new Error('No such device');
            error.statusCode = 403;
            return cb(error);
        }

        return cb(null, {devices: {
            devid: device.devid,
            online: device.online,
            ower: device.ower
        }});
    });
});

rest.post('/devices', function(req, context, cb){
    'use strict';
    // if (!req.isAuthenticated()){
    //     var error = new Error('Unauthenticated!');
    //     error.statusCode = 401;
    //     return cb(error);
    // }

    var devInfo = {
        devid: req.body.devid,
        password: req.body.password,
        ower: req.body.ower
    };

    models.Device.build(devInfo)
        .validate()
        .then(function (err) {
            if (err) {
                var error = new Error('Something wrong!');
                error.statusCode = 403;
                return cb(error);
            }
            models.Device.create(devInfo).then(function (device, err){
                if (err) {
                    var error = new Error('Create device fail!');
                    error.statusCode = 403;
                    return cb(error);
                }
                
                return cb(null, {
                    devid: device.devid,
                    ower: device.ower
                });
            })
        })
});

rest.put('/devices/:id', function(req, context, cb){
    'use strict';

    models.Device.findOne({where: {devid: req.params.id}})
    .then(function(device){
        if (!device) {
            var error = new Error('No such device');
            error.statusCode = 404;
            return cb(error);
        }
        
        var devInfo = {
            devid: device.devid,
            password: req.body.password,
            ower: req.body.ower
        };
        if (req.body.password !== 'undefined') {
            devInfo.password = req.body.password;
        }
        if (req.body.ower !== 'undefined') {
            devInfo.ower = req.body.ower;
        }
        if (req.body.online !== 'undefined') {
            devInfo.online = req.body.online;
        }
        models.Device.update(devInfo, {where: {devid: req.params.id}})
        .then(function (device, err){
            if (err) {
                var error = new Error('Create device fail!');
                error.statusCode = 403;
                return cb(error);
            }
                
            return cb(null, {
                devid: device.devid
            });
        });
    });
});

module.exports = function(app){
    app.use(rest.processRequest());
};