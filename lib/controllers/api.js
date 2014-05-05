'use strict';

var nfdsdk = require('../../../nfd-sdk/main')();



// figure this out - web sockets for the build ??
// then result for build
var stdoutHandler = function(str) {
  console.log(str);
};



var stderrHandler = function(str) {
  console.log(str);
};



exports.init= function(config, cb) {
  nfdsdk.connect({host: config.sdkhost, port: config.sdkport}, function() {
    nfdsdk.ioHandlers(stdoutHandler, stderrHandler);
    cb();
  });
};



exports.listSystems = function(req, res) {
  nfdsdk.listSystems(function(systems) {
    res.json(systems);
  });
};



exports.listContainers = function(req, res) {
  nfdsdk.listContainers(req.params.systemId, function(containers) {
    res.json(containers);
  });
};



exports.buildContainer = function(req, res) {
  nfdsdk.buildContainer(req.params.systemId, req.params.containerId, function(result) {
    if (result) {
      res.json(result);
    }
  });
};


