'use strict';

var express = require('express.io'),
    path = require('path'),
    config = require('./config');

var passport = require('passport');

module.exports = function(app) {
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
        // Access-Control-Allow-Credentials set to true allows for Cookie 'connect.sid' to be included in REST API requests but then Access-Control-Allow-Origin has to be explicit (i.e. not *)
        res.header('Access-Control-Allow-Credentials', 'true');
      }
      next();
    };

    var whitelistCheck = function(origin){
        if(config.cors.allowedDomains.indexOf(origin) >= 0 ){
	     return origin;
	}else return "localhost:9000";
    }

    app.use(allowCrossDomain);

    app.use(express.cookieParser());
    app.use(express.bodyParser());

    app.use(express.session({secret: 'WX(frqqrW2o6zK', cookie: {secure: config.https}}));

    // Important to be before app.use(app.router)
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(app.router);
  });
};
