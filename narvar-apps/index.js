/* jshint node: true, devel: true */
'use strict';

const db      = require('../db-connector');
const returns = require('./returns');

const helloWorld = () => {
  console.log('Hello World');  
};

const getData = (data) => {
  const QUERY = `SELECT returns_settings_json FROM retailer_info WHERE uri_moniker='ministryofsupply'`;
  db.getData(QUERY);
};

const API = {
    helloWorld
};

module.exports = API;