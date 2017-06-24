var request = require('request');
var config = require('config');

'use strict';
module.exports = function(devid, key) {
    var url = 'http://localhost:' + config.get('port.http');
    url += '/v1/devices/' + devid.toString();

    return request.put(url, {online: key}, 
    function (error, response){
        if (!error && response.statusCode === 200) {
            console.log(devid + ' set online to ' + key);
        }
    })
};