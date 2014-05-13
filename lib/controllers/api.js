'use strict';

var nfdsdk = require('../../../nfd-sdk/main')();
var _config;



exports.init= function(config, cb) {
  _config = config;
  cb();
};

exports.getSystem = function(req, res) {
  var systemId = req.path.split('/').pop();
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.getSystem(systemId, function(system) {
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

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.createSystem(input.name, input.namespace || '', function(system) {
      nfdsdk.quit(function() {
        res.json(system);
      });
    });
  });
};

exports.updateSystem = function(req, res) {
  var systemId = req.path.split('/').pop();
  var input = req.body;
  var system = {
    id: systemId,
    name: input.name,
    namespace: input.namespace || ''
  }

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.putSystem(JSON.stringify(system), function(system) {
      nfdsdk.quit(function() {
        res.json(system);
      });
    });
  });
};

exports.deleteSystem = function(req, res) {
  var systemId = req.path.split('/').pop();

  return res.json({ok:true});

  // TODO enabled once it's ready
  // nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
  //   nfdsdk.deleteSystem(systemId, function() {
  //     nfdsdk.quit(function() {
  //       res.json({ok:true});
  //     });
  //   });
  // });
};


/* Containers */

exports.getContainer = function(req, res) {
  var containerId = req.path.split('/').pop();
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    // TODO Replace with get container once it's ready
    nfdsdk.listContainers(function(systems) {
      var container = {};
      for (var i = 0; i < containers.length; i++) {
        if (containerId === containers[i].id) {
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
  var urlPaths = req.path.split('/');
  urlPaths.pop(); // skip /container
  var systemId = urlPaths.pop();

  var input = req.body;
  var container = {
    name: input.name
  }

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.getSystem(systemId, function(system) {

      system.containerDefinitions.push(container);

      nfdsdk.putSystem(JSON.stringify(system), function(result) {
        nfdsdk.quit(function() {
          // TODO hack returning last container in containerDefinitions
          res.json(system.containerDefinitions[system.containerDefinitions.length-1]);
        });
      });

    });
  });

  // TODO better approach once it's ready
  // nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
  //   nfdsdk.addContainer(container, function(container) {
  //     nfdsdk.quit(function() {
  //       res.json(container);
  //     });
  //   });
  // });
};

exports.updateContainer = function(req, res) {
  var containerId = req.path.split('/').pop();
  var input = req.body;
  var container = {
    id: containerId,
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
  var containerId = req.path.split('/').pop();

  res.json({ok:true});

  // TODO enabled once it's ready
  // nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
  //   nfdsdk.deleteContainer(containerId, function() {
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

