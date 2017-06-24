var request = require('request');
var config = require('config');

'use strict';
module.exports = function(devid, online) {
    var url = 'http://localhost:' + config.get('port.http');
    url += '/v1/devices/' + devid.toString();

    return request.put(url, {online: online}, function (err, res){
        if (res.statusCode === 200) {
            console.log(devid + ' set online to ' + online);
        }
    })
};