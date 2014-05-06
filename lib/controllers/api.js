'use strict';

var nfdsdk = require('../../../nfd-sdk/main')();
var _config;



exports.init= function(config, cb) {
  _config = config;
  cb();
};



exports.listSystems = function(req, res) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.listSystems(function(systems) {
      nfdsdk.quit(function() {
        res.json(systems);
      });
    });
  });
};



exports.listContainers = function(req, res) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.listContainers(req.params.systemId, function(containers) {
      nfdsdk.quit(function() {
        res.json(containers);
      });
    });
  });
};



exports.buildContainer = function(req) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.ioHandlers(function(out) {
      req.io.emit('stdout', out);
    },
    function(err) {
      req.io.emit('stderr', err);
    });
    nfdsdk.buildContainer(req.data.systemId, req.data.containerId, function(result) {
      nfdsdk.quit(function() {
        if (result) {
          req.io.emit('result', result);
        }
        else {
          req.io.emit('result', 'done!');
        }
      });
    });
  });
};



exports.deployContainer = function(req) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.ioHandlers(function(out) {
      req.io.emit('stdout', out);
    },
    function(err) {
      req.io.emit('stderr', err);
    });
    nfdsdk.deployContainer(req.data.systemId, req.data.containerId, function(result) {
      nfdsdk.quit(function() {
        if (result) {
          req.io.emit('result', result);
        }
        else {
          req.io.emit('result', 'done!');
        }
      });
    });
  });
};

