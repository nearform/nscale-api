'use strict';

module.exports = {
  env: 'development',
  cors: {
  	allowedDomains: ["http://localhost:9000"]
  },
  github: {
    clientID: '84e3331caaca5e22d5fc',
    clientSecret: '0fd87426322a5ecbb5b43f2477d22dc354232a26',
    urlhost: 'http://localhost:' + (process.env.PORT || 3000),
    redirect: {
      success: 'http://localhost:9000/home',
      failure: 'http://localhost:9000'
    },
    // see https://developer.github.com/v3/oauth/#scopes
    scope: ['repo', 'user:email']
  }
};