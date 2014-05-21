'use strict';

var _ = require('underscore');
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

exports.getDeployed = function(req, res) {
  var urlPaths = req.path.split('/');
  urlPaths.pop(); // skip /deployed
  var systemId = urlPaths.pop();
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.getDeployed(systemId, function(system) {
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
  input.namespace = input.namespace || input.name.toLowerCase().split(' ').join('_');

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.createSystem(input.name, input.namespace, function(system) {
      nfdsdk.quit(function() {
        res.json(system);
      });
    });
  });
};

exports.updateSystem = function(req, res) {
  var systemId = req.path.split('/').pop();
  var system = req.body;

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {

    nfdsdk.getSystem(systemId, function(existingSystem) {
      var systemToUpdate = _.extend(existingSystem, system);
      nfdsdk.putSystem(JSON.stringify(systemToUpdate), function(result) {
        nfdsdk.quit(function() {
          res.json(result);
        });
      });
    });

  });
};

exports.deleteSystem = function(req, res) {
  var systemId = req.path.split('/').pop();

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.deleteSystem(systemId, function() {
      nfdsdk.quit(function() {
        res.json({ok:true});
      });
    });
  });
};

exports.deploySystem = function(req, res) {
  var systemId = req.params.systemId;
  var revisionId = req.params.revisionId || null;

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.deploySystem(systemId, revisionId, function(result) {
      //console.log('deploy result: ', JSON.stringify(result));
      nfdsdk.quit(function() {
        res.json(result);
      });
    });
  });
};

exports.deployAll = function(req, res) {
  var systemId = req.params.systemId;
  var revisionId = req.params.revisionId || null;

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.deployAll(systemId, revisionId, function(result) {
      //console.log('deploy result: ', JSON.stringify(result));
      nfdsdk.quit(function() {
        res.json(result);
      });
    });
  });
};

exports.ioDeploySystem = function(req, res) {
  var systemId = req.data.systemId;
  var revisionId = req.data.revisionId || null;

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.ioHandlers(function(out) {
      req.io.emit('stdout', JSON.stringify(out));
    },
    function(err) {
      req.io.emit('stderr', JSON.stringify(err));
    });
    nfdsdk.deploySystem(systemId, revisionId, function(result) {
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


/* History */

exports.listRevisions = function(req, res) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.listRevisions(req.params.systemId, function(revisions) {
      nfdsdk.quit(function() {
        res.json(revisions);
      });
    });
  });
};

exports.getRevision = function(req, res) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.getRevision(req.params.systemId, req.params.revisionId, function(revision) {
      nfdsdk.quit(function() {
        res.json(revision);
      });
    });
  });
};

/* Timeline */

exports.timeline = function(req, res) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.timeline(req.query.systemId, req.query.containerId, req.query.user, function(result) {
      nfdsdk.quit(function() {
        res.json(result);
      });
    });
  });
};


exports.addToTimeline = function(req, res) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.addToTimeline(JSON.stringify(req.body), function(result) {
      nfdsdk.quit(function() {
        res.json(result);
      });
    });
  });
};


/* Containers */

exports.getContainer = function(req, res) {
  var containerId = req.path.split('/').pop();
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    // TODO Replace with get container once it's ready
    nfdsdk.listContainers(function(containers) {
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

  var container = req.body;

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.addContainer(systemId, JSON.stringify(container), function(container) {
      nfdsdk.quit(function() {
        res.json(container);
      });
    });
  });
};

exports.updateContainer = function(req, res) {
  var urlPaths = req.path.split('/');
  var containerId = urlPaths.pop();
  urlPaths.pop(); // skip /container
  var systemId = urlPaths.pop();

  var container = req.body;
  container.id = containerId;

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.putContainer(systemId, JSON.stringify(container), function(result) {
      nfdsdk.quit(function() {
        res.json(result);
      });
    });
  });
};

exports.deleteContainer = function(req, res) {
  var urlPaths = req.path.split('/');
  var containerId = urlPaths.pop();
  urlPaths.pop(); // skip /container
  var systemId = urlPaths.pop();

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.deleteContainer(systemId, containerId, function(result) {
      nfdsdk.quit(function() {
        res.json(result);
      });
    });
  });
};

exports.buildContainer = function(req) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.ioHandlers(function(out) {
      req.io.emit('stdout', JSON.stringify(out));
    },
    function(err) {
      req.io.emit('stderr', JSON.stringify(err));
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
      req.io.emit('stdout', JSON.stringify(out));
    },
    function(err) {
      req.io.emit('stderr', JSON.stringify(err));
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

