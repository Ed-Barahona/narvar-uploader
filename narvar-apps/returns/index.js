/* jshint node: true, devel: true */
'use strict';

const config = require('./config.json');

const APP_NAME = config.app_name;

const helloWorld = () => {
  console.log('Hello World', APP_NAME);  
};

const API = {
    helloWorld
};

module.exports = API;