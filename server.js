'use strict';

var port 					= process.env.PORT || 3000;
var express       = require('express');
var app           = express();
var bodyParser    = require('body-parser');
var passport      = require('passport');
var env           = process.env.NODE_ENV || 'dev';
var MongoClient   = require('mongodb').MongoClient;
var mongoose      = require('mongoose');
var config        = require('./etc');
var fs            = require('fs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(passport.initialize());

require('./models').connect(config.dbUri, {
  socketTimeoutMS: 0,
  keepAlive: true,
  reconnectTries: 30
});

// Passport
const localSignupStrategy = require('./passport/local-signup');
const localLoginStrategy = require('./passport/local-login');
passport.use('local-signup', localSignupStrategy);
passport.use('local-login', localLoginStrategy);

// Authentication
const authCheck = require('./middleware/auth-check');
//app.use('/api', authCheck);

// Load Mongoose models
var models_path = './models'
fs.readdirSync(models_path).forEach(function (file) {
  if (~file.indexOf('.js')) require(models_path + '/' + file)
})

// Routing
const authRoutes      = require('./middleware/auth');
const apiRoutes       = require('./middleware/api');
const transRoutes     = require('./middleware/trans');
const payloadCheck    = require('./middleware/payload-check');
const langCheck       = require('./middleware/lang');

app.use('/auth', authRoutes);
app.use('/api', authCheck, payloadCheck, langCheck, apiRoutes);
app.use('/trans', authCheck, payloadCheck, langCheck, transRoutes);

app.listen(port, () => {
	console.log('API server port: ' + port);
});
