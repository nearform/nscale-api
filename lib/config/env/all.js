'use strict';

var path = require('path');

var rootPath = path.normalize(__dirname + '/../../..');

module.exports = {
  root: rootPath,
  port: process.env.PORT || 3000,
  sdkhost: 'localhost',
  sdkport: '3223',
  cors: {
  	//allowedDomains: "http://localhost:9000"
  	//allowedDomains: "http://ec2-54-216-145-36.eu-west-1.compute.amazonaws.com:8000"
  	allowedDomains: "http://nfd.nearform.com:8000"
  },
  https: false,
  github: {
    //clientID: 'bf5bd766cb8ae356a134',
    //clientSecret: '3238b8a21242f074673e699d4d80878f8a5ecae8',
    //urlhost: 'http://localhost:' + (process.env.PORT || 3000),
    //urlhost: 'http://ec2-54-216-145-36.eu-west-1.compute.amazonaws.com:3000',
    clientID: '4d9afe68c4fe0a69f50b',
    clientSecret: 'a9ef26afec582bd42ee67313d325b92b1ac8c534',
    urlhost: "http://nfd.nearform.com:3000",
    redirect: {
      //success: 'http://localhost:9000/home',
      //failure: 'http://localhost:9000'
      //success: 'http://ec2-54-216-145-36.eu-west-1.compute.amazonaws.com:8000/home',
      //failure: 'http://ec2-54-216-145-36.eu-west-1.compute.amazonaws.com:8000'
      success: 'http://nfd.nearform.com:8000/home',
      failure: 'http://nfd.nearform.com:8000'
    },
    // see https://developer.github.com/v3/oauth/#scopes
    scope: ['repo', 'user:email']
  }
};

