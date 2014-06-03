'use strict';

var path = require('path');

var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
  root: rootPath,
  port: process.env.PORT || 3000,
  sdkhost: 'localhost',
  sdkport: '3223',
  cors: {
  	allowedDomains: "http://localhost:9000"
  },
  https: false
};

