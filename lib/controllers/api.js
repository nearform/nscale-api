/*
 * THIS SOFTWARE IS PROVIDED ``AS IS'' AND ANY EXPRESSED OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED.  IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT,
 * STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
 * IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var _ = require('underscore');
var nfdsdk = require('nscale-sdk/main')();
var _config;

var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , GitHubStrategy = require('passport-github').Strategy;

var authenticate = function(email, password, cb) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.login(email, password, function(err, out) {
      nfdsdk.quit(function() {
        cb(null, out);
      });
    });
  });
};

var initGithubAuth = function(config) {
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

  if (!config.github) {
    return;
  }

  passport.use('github', new GitHubStrategy({
      clientID:       config.github.clientID,
      clientSecret:   config.github.clientSecret,
      callbackURL:    config.github.urlhost + '/api/1.0/auth/github/callback',
      scope:          config.github.scope || []
    },
    function (accessToken, refreshToken, profile, done) {
      process.nextTick(function() {
        nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
          // TODO Update nscale-noauth to support githublogin
          // nfdsdk.githublogin(accessToken, function(out) {
          nfdsdk.login('', '', function(err, out) {
            nfdsdk.quit(function() {
              done(null, out.user);
            });
          });
        });
      });
    }
  ));

  exports.githubLogin = passport.authenticate('github');
  exports.githubCallback = passport.authenticate('github', {failureRedirect: config.github.redirect.failure});
}

exports.init= function(config, cb) {
  _config = config;
  initGithubAuth(config);
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
    cb(function(err, result) {
      nfdsdk.quit(function() {
        res.json(result);
      });
    });
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

exports.anonymousLogin = function(req, res) {
  authenticate('', '', function(err, out) {
    if (err) { return res.status(401).json({ok:false, why:err}); }
    return res.json(out);
  });
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
  var systemId = req.params.systemId;
  sdk(req, res, function(done) {
    nfdsdk.getSystem(systemId, done);
  });
};

exports.getDeployed = function(req, res) {
  var systemId = req.params.systemId;

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

exports.cloneSystem = function(req, res) {
  var input = req.body;

  sdk(req, res, function(done) {
    nfdsdk.cloneSystem(input.url, done);
  });
};

exports.syncSystem = function(req, res) {
  var systemId = req.params.systemId;

  sdk(req, res, function(done) {
    nfdsdk.syncSystem(JSON.stringify(systemToUpdate), done);
  });
};

exports.updateSystem = function(req, res) {
  var systemId = req.params.systemId;
  var system = req.body;

  sdk(req, res, function(done) {
    nfdsdk.getSystem(systemId, function(existingSystem) {
      var systemToUpdate = _.extend(existingSystem, system);
      nfdsdk.putSystem(JSON.stringify(systemToUpdate), done);
    });
  });
};

exports.deleteSystem = function(req, res) {
  var systemId = req.params.systemId;

  sdk(req, res, function(done) {
    nfdsdk.deleteSystem(systemId, done);
  });
};

exports.deploySystem = function(req, res) {
  var systemId = req.params.systemId;
  var revisionId = req.params.revisionId || null;

  sdk(req, res, function(done) {
    nfdsdk.deploySystem(systemId, revisionId, done);
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
    nfdsdk.deployRevision(systemId, revisionId, function(result) {
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

exports.markRevisionDeployed = function(req, res) {
  sdk(req, res, function(done) {
    nfdsdk.markRevision(req.params.systemId, req.params.revisionId, done);
  });
};

exports.previewRevision = function(req, res) {
  sdk(req, res, function(done) {
    nfdsdk.previewRevision(req.params.systemId, req.params.revisionId, done);
  });
};

/* Timeline */

exports.timeline = function(req, res) {
  sdk(req, res, function(done) {
    nfdsdk.timeline(req.query.systemId, done);
  });
};


exports.addToTimeline = function(req, res) {
  sdk(req, res, function(done) {
    nfdsdk.addToTimeline(JSON.stringify(req.body), done);
  });
};


/* Containers */

exports.getContainer = function(req, res) {
  var containerId = req.params.containerId;

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
  var systemId = req.params.systemId;

  var container = req.body;

  sdk(req, res, function(done) {
    nfdsdk.addContainer(systemId, JSON.stringify(container), done);
  });
};

exports.updateContainer = function(req, res) {
  var containerId = req.params.containerId;
  var systemId = req.params.systemId;

  var container = req.body;
  container.id = containerId;

  sdk(req, res, function(done) {
    nfdsdk.putContainer(systemId, JSON.stringify(container), done);
  });
};

exports.deleteContainer = function(req, res) {
  var containerId = req.params.containerId;
  var systemId = req.params.systemId;

  sdk(req, res, function(done) {
    nfdsdk.deleteContainer(systemId, containerId, done);
  });
};

exports.buildContainer = function(req) {
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
    nfdsdk.buildContainer(systemId, containerId, function(result) {
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

/* TODO Remove? */
// exports.deployContainer = function(req) {
//   var accessToken = req.data.accessToken;
//   var systemId = req.data.systemId;
//   var containerId = req.data.containerId;

//   nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport, token:accessToken}, function() {
//     nfdsdk.ioHandlers(function(out) {
//       req.io.emit('stdout', JSON.stringify(out));
//     },
//     function(err) {
//       req.io.emit('stderr', JSON.stringify(err));
//     });
//     nfdsdk.deployContainer(req.data.systemId, req.data.containerId, function(result) {
//       nfdsdk.quit(function() {
//         if (result) {
//           req.io.emit('result', result);
//         }
//         else {
//           req.io.emit('result', 'done!');
//         }
//       });
//     });
//   });
// };

