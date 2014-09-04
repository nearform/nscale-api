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

var api = require('./controllers/api');

var apibase = '/api/1.0';

module.exports = function(app, config) {
  api.init(config, function() {
  });

  app.post(apibase + '/auth/login', api.login);
  app.get(apibase + '/auth/github', api.githubLogin);
  app.get(apibase + '/auth/github/callback', api.githubCallback, function(req, res) {res.redirect(config.github.redirect.success);});
  app.post(apibase + '/auth/instance', api.instance);
  app.post(apibase + '/auth/logout', api.logout);

  app.get(apibase + '/system/:systemId/containers', api.listContainers);
  app.get(apibase + '/system/:systemId/container/:containerId', api.getContainer);
  app.get(apibase + '/system/:systemId/deployed', api.getDeployed);
  app.get(apibase + '/system/:systemId/revisions', api.listRevisions);
  app.get(apibase + '/system/:systemId/revision/:revisionId', api.getRevision);
  app.get(apibase + '/system/:systemId/revision/:revisionId/preview', api.previewRevision);

  // TODO Good API endpoint?
  app.post(apibase + '/system/:systemId/revision/:revisionId/markDeployed', api.markRevisionDeployed);

  app.get(apibase + '/system/:systemId', api.getSystem);
  app.get(apibase + '/systems', api.listSystems);

  app.post(apibase + '/system/clone', api.cloneSystem);
  app.post(apibase + '/system/:systemId', api.updateSystem);
  app.put(apibase + '/system/:systemId', api.updateSystem);
  app.post(apibase + '/system/:systemId/sync', api.syncSystem);
  app.post(apibase + '/system', api.addSystem);
  app.del(apibase + '/system/:systemId', api.deleteSystem);

  app.put(apibase + '/system/:systemId/deploy', api.deploySystem);
  app.put(apibase + '/system/:systemId/deploy/:revisionId', api.deploySystem);
  app.put(apibase + '/system/:systemId/deployall', api.deployAll);
  app.put(apibase + '/system/:systemId/deployall/:revisionId', api.deployAll);

  app.post(apibase + '/system/:systemId/container/:containerId', api.updateContainer);
  app.put(apibase + '/system/:systemId/container/:containerId', api.updateContainer);
  app.post(apibase + '/system/:systemId/container', api.addContainer);
  app.del(apibase + '/system/:systemId/container/:containerId', api.deleteContainer);

  app.get(apibase + '/timeline', api.timeline);
  app.post(apibase + '/timeline', api.addToTimeline);

  app.io.route('build', api.buildContainer);
  // app.io.route('deploy', api.deployContainer);

  app.io.route('system/deploy', api.ioDeploySystem);

  app.get(apibase + '/*', function(req, res) {
    res.send(404);
  });
};

