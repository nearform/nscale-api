'use strict';

var api = require('./controllers/api');

var apibase = '/api/1.0';

module.exports = function(app, config) {
  api.init(config, function() {
  });

  app.get(apibase + '/systems', api.listSystems);
  app.get(apibase + '/system/:systemId/containers', api.listContainers);
  //app.get('/api/build/container/:systemId/:containerId', api.buildContainer);
  app.io.route('build', api.buildContainer);
  app.get(apibase + '/*', function(req, res) {
    res.send(404);
  });
  //app.io.route('/api/build/stdout', api.buildOutput);

};
