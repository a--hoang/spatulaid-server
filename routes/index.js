var express = require('express');
var router = express.Router();

//Firebase poll for data
var Firebase = require("firebase");
var spatulaid = new Firebase("https://spatulaid.firebaseio.com/spatula_001/readings");

//Particle poll for data
var Particle = require('particle-api-js');
var particle = new Particle();

var filename = "../secrets.json";
var config;
var particle_access_token;
var particle_refresh_token;
try {
  config = require(filename);
}
catch (err) {
  config = {}
  console.log("unable to read file '" + filename + "': ", err)
}

particle.login({username: config.particle_username , password: config.particle_password}).then(
  function(data){
    console.log('API call completed on promise resolve: ', data.body);
    particle_access_token = data.body.access_token;
    particle_refresh_token = data.body.refresh_token;
  },
  function(err) {
    console.log('API call completed on promise fail: ', err);
  }
);

/* GET home page. */
router.get('/', function(req, res, next) {

  particle.publishEvent({ name: 'testTemperature',
    data: "60 F",
    isPrivate: true,
    auth: particle_access_token }).then(
      function(data) {
        console.log(data);
        res.sendStatus(200);
      },
      function(err) {
        console.log("Failed to publish event: " + err)
      }
  );
});

module.exports = router;
