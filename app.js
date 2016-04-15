var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var routes = require('./routes/index');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'html');

app.use('/', routes);

//Firebase poll for data
var Firebase = require("firebase");
var spatulaid = new Firebase("https://spatulaid.firebaseio.com/spatula_001/readings");

spatulaid.on('value', function(data) {
  console.log(data.val());
}, function (errorObject) {
  console.log("The read failed: " + errorObject.code);
});

//Particle poll for data
var Particle = require('particle-api-js');
var particle = new Particle();

var filename = "./secrets.json";
var config;
var particle_access_token;
var particle_refresh_token;
try {
  config = require(filename);
}
catch (err) {
  config = {}
  console.log("unable to read file '" + fileName + "': ", err)
}

particle.login({username: config.particle_username , password: config.particle_password}).then(
  function(data){
    console.log('API call completed on promise resolve: ', data.body);
    particle_access_token = data.body.access_token;
    particle_refresh_token = data.body.refresh_token;

    //Get events and send to
    particle.getEventStream({
      deviceId: 'mine', 
      auth: particle_access_token }).then(function(stream) {
        stream.on('event', function(data) {
          spatulaid.push(data);
          console.log("Particle Event: " + data);
        });
    });
  },
  function(err) {
    console.log('API call completed on promise fail: ', err);
  }
);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
