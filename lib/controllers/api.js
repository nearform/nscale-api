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



/**
 * websocket route
 */
exports.buildContainer = function(req) {
  nfdsdk.connect({host: _config.sdkhost, port: _config.sdkport}, function() {
    nfdsdk.ioHandlers(function(out) {
      console.log('STDOUT: ' + out);
      req.io.emit('stdout', out);
    },
    function(err) {
      req.io.emit('stderr', err);
    });
    nfdsdk.buildContainer(req.data.systemId, req.data.containerId, function(result) {
      console.log('BUILDING');
      nfdsdk.quit(function() {
        if (result) {
          res.io.json('result', result);
        }
        else {
          req.io.emit('result', 'done!');
        }
      });
    });
  });
};


/*
<script src="/socket.io/socket.io.js"></script>
<script>
io = io.connect()

// Emit ready event.
io.emit('ready') 

// Listen for the talk event.
io.on('stdout', function(data) {
    alert(data.message)
})  

// Listen for the talk event.
io.on('stderr', function(data) {
    alert(data.message)
})  
</script>
*/


