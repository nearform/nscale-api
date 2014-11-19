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

var express = require('express.io');
var path = require('path');
var defaultConfig = require('./config');
var config;
var passport = require('passport');
var _ = require('lodash');
var ip = require('ip');


module.exports = function(app, specifiedConfig) {
  config = defaultConfig;
  config = _.merge(config, specifiedConfig);
  config.root = path.normalize(__dirname + '/../..'); 

  app.configure('development', function(){
    app.use(function noCache(req, res, next) {
      if (req.url.indexOf('/scripts/') === 0) {
        res.header('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.header('Pragma', 'no-cache');
        res.header('Expires', 0);
      }
      next();
    });

    app.use(express.static('public'));
    app.use(express.static(path.join(config.root, '.tmp')));
    app.use(express.static(path.join(config.root, 'app')));
    app.use(express.errorHandler());
    app.set('views', config.root + '/app/views');
  });

  app.configure('production', function(){
    app.use(express.favicon(path.join(config.root, 'public', 'favicon.ico')));
    app.use(express.static(path.join(config.root, 'public')));
    app.set('views', config.root + '/views');
  });

  app.configure(function(){
    app.set('view engine', 'html');
    app.use(express.logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());

    //CORS middleware for API layer
    var allowCrossDomain = function (req, res, next) {
      if (req.url.indexOf('/api/') !== -1) {
        res.header('Access-Control-Allow-Origin', whitelistCheck(req.headers.origin));
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-UserId');

        // Access-Control-Allow-Credentials set to true allows for Cookie 'connect.sid' 
        // to be included in REST API requests but then Access-Control-Allow-Origin 
        // has to be explicit (i.e. not *)
        res.header('Access-Control-Allow-Credentials', 'true');
      }
      next();
    };

    var whitelistCheck = function(origin){
      if (_.find(config.cors.allowedDomains, function(domain) { return domain.indexOf(origin) >= 0; })) {
        return origin;
      } 
      else {
        return 'http://' + ip.address() + ':9000';
      }
    };

    app.use(allowCrossDomain);
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.session({secret: 'WX(frqqrW2o6zK', cookie: {secure: config.https}}));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
  });
  return config;
};
