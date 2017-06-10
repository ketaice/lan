var rest = require('connect-rest');
var models = require('../models/');

var apiOptions = {
    context: "v1",
    domain: require('domain').create(),
};

apiOptions.domain.on('error', function(err){
    console.log('API domain error.\n', err.stack);
});

rest.get('/', function(req, context, cb){
    'use strict';
    return cb(null, {msg: 'Select a device, eg. /device/:id'});
});

rest.get('/devices', function(req, context, cb){
    'use strict';
    if (!req.isAuthenticated()){
        return cb(401, { error: 'Unauthenticated!' });
    }

    models.Device.findAll()
    .then(function(devices){
        if (!devices) {
            return cb(403, {error: 'Device list is empty!'});
        }

        var devList;

        devices.forEach(function(device) {
            console.log(`${device.id}: ${device.devid}`);
            devList += device;
        }, this);

        return cb(null, {devices: devList});
    })
    .catch(function (err){
        console.log(`findAll err:` + err);
        return cb(500, {error: 'Database err!'});
    });
})

rest.get('/device/:id', function(req, context, cb){
    'use strict';
    if (!req.isAuthenticated()){
        return cb(401, { error: 'Unauthenticated!' });
    }

    models.Device.findOne({where: {devid: req.params.id}})
    .then(function(device){
        if (!device) {
            return cb(403, {error: 'No such device'});
        }

        return cb(null, {device: device});
    });
});

rest.post('/device', function(req, context, cb){
    'use strict';
    if (!req.isAuthenticated()){
        return cb(401, { error: 'Unauthenticated!' });
    }

    var devInfo = {
        devid: req.body.devid,
        password: req.body.password,
        ower: req.body.ower
    };

    models.Device.build(devInfo)
        .validate()
        .then(function (err) {
            if (err) {
                return cb(403, {err: 'Something wrong!'});
            }
            models.Device.create(devInfo).then(function (device, err){
                if (err) {
                    return cb(403, {err: 'Create device fail!'});
                }
                
                return cb(null, {
                    devid: device.devid,
                    ower: device.ower
                });
            })
        })
});

module.exports = function(app){
    app.use(rest.rester(apiOptions));
};