'use strict';

var api = require('./controllers/api');

module.exports = function(app, config) {
  api.init(config, function() {
  });
  app.get('/api/list/systems', api.listSystems);
  app.get('/api/list/containers/:systemId', api.listContainers);
  //app.get('/api/build/container/:systemId/:containerId', api.buildContainer);
  app.io.route('build', api.buildContainer);
  app.get('/api/*', function(req, res) {
    res.send(404);
  });
  //app.io.route('/api/build/stdout', api.buildOutput);
};
