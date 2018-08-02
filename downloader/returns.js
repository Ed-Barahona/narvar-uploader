/* jshint node: true, devel: true */
'use strict';
const fs = require('fs');

const settings = () => {
  console.log('Hello World');  
};

const reason_codes = (data) => {
  console.log('reason codes called');
  const returnData = require('../test-data/return-reasons.json');
  return new Promise((resolve) => {
    resolve(returnData);
  });
};

const return_rules = (data) => {
  console.log('reason codes called');
  const returnData = require('../test-data/return-reasons.json');
  return new Promise((resolve) => {
    resolve(returnData);
  });
};

const shipping_label = (data) => {
  const returnData = require('../test-data/shipping-label.json');
  return new Promise((resolve) => {
    resolve(returnData);
  }); 
};

const packing_slip = (data) => {
  const returnData = require('../test-data/packing-slip.json');
  return new Promise((resolve) => {
    resolve(returnData);
  });
};

const processor = () => {
  console.log('Hello World');  
};

const API = {
    settings,
    return_rules,
    reason_codes,
    packing_slip,
    shipping_label,
    processor,
};

module.exports = API;