'use strict';

var nfdsdk = require('../../../nfd-sdk/main')();
var _config;



exports.init= function(config, cb) {
  _config = config;
  cb();
};

exports.getSystem = function(req, res) {
  var input = req.query;
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    // TODO Replace with get system once it's ready
    nfdsdk.listSystems(function(systems) {
      var system = {};
      for (var i = 0; i < systems.length; i++) {
        if (input.id === systems[i].id) {
          system = systems[i];
          break;
        }
      }
      nfdsdk.quit(function() {
        res.json(system);
      });
    });
  });
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

exports.addSystem = function(req, res) {
  var input = req.body;
  var system = {
    name: input.name
  }

  return res.json(system);

  // TODO enabled once it's ready
  // nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
  //   nfdsdk.addSystem(system, function(system) {
  //     nfdsdk.quit(function() {
  //       res.json(system);
  //     });
  //   });
  // });
};

exports.updateSystem = function(req, res) {
  var input = req.body;
  var system = {
    id: input.id,
    name: input.name
  }

  return res.json(system);

  // TODO enabled once it's ready
  // nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
  //   nfdsdk.updateSystem(system, function(system) {
  //     nfdsdk.quit(function() {
  //       res.json(system);
  //     });
  //   });
  // });
};

exports.deleteSystem = function(req, res) {
  var input = req.body;

  return res.json({ok:true});

  // TODO enabled once it's ready
  // nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
  //   nfdsdk.deleteSystem(input.id, function() {
  //     nfdsdk.quit(function() {
  //       res.json({ok:true});
  //     });
  //   });
  // });
};


/* Containers */

exports.getContainer = function(req, res) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    // TODO Replace with get container once it's ready
    nfdsdk.listContainers(function(systems) {
      var container = {};
      for (var i = 0; i < containers.length; i++) {
        if (input.id === containers[i].id) {
          container = containers[i];
          break;
        }
      }
      nfdsdk.quit(function() {
        res.json(container);
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

exports.addContainer = function(req, res) {
  var input = req.body;
  var container = {
    name: input.name
  }

  return res.json(container);

  // TODO enabled once it's ready
  // nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
  //   nfdsdk.addContainer(container, function(container) {
  //     nfdsdk.quit(function() {
  //       res.json(container);
  //     });
  //   });
  // });
};

exports.updateContainer = function(req, res) {
  var input = req.body;
  var container = {
    id: input.id,
    name: input.name
  }

  return res.json(container);

  // TODO enabled once it's ready
  // nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
  //   nfdsdk.updateContainer(container, function(container) {
  //     nfdsdk.quit(function() {
  //       res.json(container);
  //     });
  //   });
  // });
};

exports.deleteContainer = function(req, res) {
  var input = req.body;

  res.json({ok:true});

  // TODO enabled once it's ready
  // nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
  //   nfdsdk.deleteContainer(input.id, function() {
  //     nfdsdk.quit(function() {
  //       res.json({ok:true});
  //     });
  //   });
  // });
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

