'use strict';

var api = require('./controllers/api');

var apibase = '/api/1.0';

module.exports = function(app, config) {
  api.init(config, function() {
  });

  app.get(apibase + '/system/:systemId/containers', api.listContainers);
  app.get(apibase + '/system/:systemId/container/:containerId', api.getContainer);
  app.get(apibase + '/system/:systemId/revisions', api.listRevisions);
  app.get(apibase + '/system/:systemId/revision/:revisionId', api.getRevision);
  app.get(apibase + '/system/:systemId', api.getSystem);
  app.get(apibase + '/systems', api.listSystems);

  app.post(apibase + '/system/:systemId', api.updateSystem);
  app.put(apibase + '/system/:systemId', api.updateSystem);
  app.post(apibase + '/system', api.addSystem);
  app.del(apibase + '/system/:systemId', api.deleteSystem);

  app.post(apibase + '/system/:systemId/container/:containerId', api.updateContainer);
  app.put(apibase + '/system/:systemId/container/:containerId', api.updateContainer);
  app.post(apibase + '/system/:systemId/container', api.addContainer);
  app.del(apibase + '/system/:systemId/container/:containerId', api.deleteContainer);

  app.io.route('build', api.buildContainer);
  app.io.route('deploy', api.deployContainer);
  app.get(apibase + '/*', function(req, res) {
    res.send(404);
  });
};

