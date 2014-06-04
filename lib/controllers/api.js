'use strict';

var _ = require('underscore');
var nfdsdk = require('../../../nfd-sdk/main')();
var _config;

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

var authenticate = function(email, password, cb) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.login(email, password, function(out) {
      nfdsdk.quit(function() {
        cb(null, out);
      });
    });
  });
};

var initAuth = function() {
  passport.serializeUser(function(user, done) {
    // TODO Serialize the whole user or just the user id or token?
    done(null, user);
  });
  passport.deserializeUser(function(user, done) {
    // TODO Should we get the user from backend for every request?
    done(null, user);
  });
  passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, function(email, password, done) {
    process.nextTick(function() {
      authenticate(email, password, done);
    });
  }));
}

exports.init= function(config, cb) {
  _config = config;
  initAuth();
  cb();
};

var accessToken = function(req) {
  var access_token = req.query.access_token;
  if( !access_token ) {
    access_token = req.headers.authorization;
    if( access_token ) {
      access_token = access_token.substring('Bearer '.length);
    }
  }
  return access_token;
};

var sdk = function(req, res, cb) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport, token:accessToken(req)}, function() {
    cb(function(result) {
      nfdsdk.quit(function() {
        res.json(result);
      });
    })
  });
};

exports.login = function(req, res) {
  passport.authenticate('local', function(err, out) {
    // see https://gist.github.com/cultofmetatron/5349630
    if (err) {return res.status(401).json({ok:false, why:err});}
    if (!out.user) {return res.status(401).json(out);}
    req.login(out.user, {}, function(err) {
      if (err) { return res.status(401).json({ok:false, why:err}); }
      return res.json(out);
    });
  })(req, res);
};

exports.logout = function(req, res) {
  // TODO Need to logout on backend too?
  req.logOut();
  res.json({ok:true});
};

exports.instance = function(req, res) {
  if (req.user) {
    res.json({ok:true, user: req.user});
  } else {
    res.json({ok:false});
  }
};

exports.getSystem = function(req, res) {
  var systemId = req.path.split('/').pop();
  sdk(req, res, function(done) {
    nfdsdk.getSystem(systemId, done);
  });
};

exports.getDeployed = function(req, res) {
  var urlPaths = req.path.split('/');
  urlPaths.pop(); // skip /deployed
  var systemId = urlPaths.pop();

  sdk(req, res, function(done) {
    nfdsdk.getDeployed(systemId, done);
  });
};

exports.listSystems = function(req, res) {
  sdk(req, res, function(done) {
    nfdsdk.listSystems(done);
  });
};

exports.addSystem = function(req, res) {
  var input = req.body;
  input.namespace = input.namespace || input.name.toLowerCase().split(' ').join('_');

  sdk(req, res, function(done) {
    nfdsdk.createSystem(input.name, input.namespace, done);
  });
};

exports.updateSystem = function(req, res) {
  var systemId = req.path.split('/').pop();
  var system = req.body;

  var user = req.header("X-UserId");

  sdk(req, res, function(done) {
    nfdsdk.getSystem(systemId, function(existingSystem) {
      var systemToUpdate = _.extend(existingSystem, system);
      nfdsdk.putSystem(user, JSON.stringify(systemToUpdate), done);
    });
  });
};

exports.deleteSystem = function(req, res) {
  var systemId = req.path.split('/').pop();

  var user = req.header("X-UserId");

  sdk(req, res, function(done) {
    nfdsdk.deleteSystem(user, systemId, done);
  });
};

exports.deploySystem = function(req, res) {
  var systemId = req.params.systemId;
  var revisionId = req.params.revisionId || null;

  var user = req.header("X-UserId");

  sdk(req, res, function(done) {
    nfdsdk.deploySystem(user, systemId, revisionId, done);
  });
};

exports.deployAll = function(req, res) {
  var systemId = req.params.systemId;
  var revisionId = req.params.revisionId || null;

  sdk(req, res, function(done) {
    nfdsdk.deployAll(systemId, revisionId, done);
  });
};

exports.ioDeploySystem = function(req, res) {
  var user = req.data.user;
  var accessToken = req.data.accessToken;
  var systemId = req.data.systemId;
  var revisionId = req.data.revisionId || null;

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport, token:accessToken}, function() {
    nfdsdk.ioHandlers(function(out) {
      req.io.emit('stdout', JSON.stringify(out));
    },
    function(err) {
      req.io.emit('stderr', JSON.stringify(err));
    });
    nfdsdk.deploySystem(user, systemId, revisionId, function(result) {
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
  sdk(req, res, function(done) {
    nfdsdk.listRevisions(req.params.systemId, done);
  });
};

exports.getRevision = function(req, res) {
  sdk(req, res, function(done) {
    nfdsdk.getRevision(req.params.systemId, req.params.revisionId, done);
  });
};

/* Timeline */

exports.timeline = function(req, res) {
  sdk(req, res, function(done) {
    nfdsdk.timeline(req.query.systemId, req.query.containerId, req.query.user, done);
  });
};


exports.addToTimeline = function(req, res) {
  sdk(req, res, function(done) {
    nfdsdk.addToTimeline(JSON.stringify(req.body), done);
  });
};


/* Containers */

exports.getContainer = function(req, res) {
  var containerId = req.path.split('/').pop();

  sdk(req, res, function(done) {
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
  sdk(req, res, function(done) {
    nfdsdk.listContainers(req.params.systemId, done);
  });
};

exports.addContainer = function(req, res) {
  var urlPaths = req.path.split('/');
  urlPaths.pop(); // skip /container
  var systemId = urlPaths.pop();

  var container = req.body;

  var user = req.header("X-UserId");

  sdk(req, res, function(done) {
    nfdsdk.addContainer(user, systemId, JSON.stringify(container), done);
  });
};

exports.updateContainer = function(req, res) {
  var urlPaths = req.path.split('/');
  var containerId = urlPaths.pop();
  urlPaths.pop(); // skip /container
  var systemId = urlPaths.pop();

  var container = req.body;
  container.id = containerId;

  var user = req.header("X-UserId");

  sdk(req, res, function(done) {
    nfdsdk.putContainer(user, systemId, JSON.stringify(container), done);
  });
};

exports.deleteContainer = function(req, res) {
  var urlPaths = req.path.split('/');
  var containerId = urlPaths.pop();
  urlPaths.pop(); // skip /container
  var systemId = urlPaths.pop();

  var user = req.header("X-UserId");

  sdk(req, res, function(done) {
    nfdsdk.deleteContainer(user, systemId, containerId, done);
  });
};

exports.buildContainer = function(req) {
  var user = req.data.user;
  var accessToken = req.data.accessToken;
  var systemId = req.data.systemId;
  var containerId = req.data.containerId;

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport, token:accessToken}, function() {
    nfdsdk.ioHandlers(function(out) {
      req.io.emit('stdout', JSON.stringify(out));
    },
    function(err) {
      req.io.emit('stderr', JSON.stringify(err));
    });
    nfdsdk.buildContainer(user, systemId, containerId, function(result) {
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
  var user = req.data.user;
  var accessToken = req.data.accessToken;
  var systemId = req.data.systemId;
  var containerId = req.data.containerId;

  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport, token:accessToken}, function() {
    nfdsdk.ioHandlers(function(out) {
      req.io.emit('stdout', JSON.stringify(out));
    },
    function(err) {
      req.io.emit('stderr', JSON.stringify(err));
    });
    nfdsdk.deployContainer(req.data.user, req.data.systemId, req.data.containerId, function(result) {
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

