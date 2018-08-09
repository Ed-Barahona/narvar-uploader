/* jshint node: true, devel: true */
'use strict';
const fs = require('fs');
const logger = console;

const settings = () => {
  logger.log('settings codes called');
  const returnData = require('../test-data/settings.json');
  return new Promise((resolve) => {
    resolve(returnData);
  });
};

const reason_codes = (data) => {
  logger.log('reason codes called');
  const returnData = require('../test-data/return-reasons.json');
  
  return new Promise((resolve) => {
    resolve(returnData);
  });
};

const return_rules = (data) => {
  logger.log('reason codes called');
  const returnData = require('../test-data/return-reasons.json');
  return new Promise((resolve) => {
    resolve(returnData);
  });
};

const shipping_label = (data) => {
  // const returnData = require('../test-data/shipping-label.json');
  const testData = {
    "status": "SUCCESS",
    "status_code": 200,
    "response": {
        "retailer_id": 723,
        "uri_moniker": "danner",
        "reason_sets": [{
            "product_category": "ALL-Products",
            "reason_set": "set1",
            "locale": "en_US",
            "type": "return",
            "return_reasons": [{
                "id": 2454,
                "display_name": "Item doesn't fit",
                "is_nested": true,
                "nested_reasons": [{
                    "id": 2454,
                    "display_name": "Item is too small",
                    "display_order": 1,
                    "retailer_reason_code": "011",
                    "comment_enabled": false,
                    "comment_required": false
                }, {
                    "id": 2455,
                    "display_name": "Item is too large",
                    "display_order": 2,
                    "retailer_reason_code": "012",
                    "comment_enabled": false,
                    "comment_required": false
                }]
            }, {
                "id": 2456,
                "display_name": "Changed mind",
                "display_order": 3,
                "retailer_reason_code": "020",
                "comment_enabled": true,
                "comment_required": false,
                "is_nested": false,
                "comment_placeholder": "Please tell us in 1 or 2 sentences why you would like to return this item."
            }, {
                "id": 2457,
                "display_name": "Item is damaged or defective",
                "display_order": 4,
                "retailer_reason_code": "030",
                "comment_enabled": true,
                "comment_required": false,
                "is_nested": false,
                "comment_placeholder": "Please tell us in 1 or 2 sentences why you would like to return this item."
            }, {
                "id": 2458,
                "display_name": "Item arrived too late",
                "display_order": 5,
                "retailer_reason_code": "040",
                "comment_enabled": true,
                "comment_required": false,
                "is_nested": false,
                "comment_placeholder": "Please tell us in 1 or 2 sentences why you would like to return this item."
            }, {
                "id": 2459,
                "display_name": "Found better price",
                "display_order": 6,
                "retailer_reason_code": "050",
                "comment_enabled": true,
                "comment_required": false,
                "is_nested": false,
                "comment_placeholder": "Please let us know where you found a better price"
            }, {
                "id": 2460,
                "display_name": "Other",
                "display_order": 7,
                "retailer_reason_code": "060",
                "comment_enabled": true,
                "comment_required": true,
                "is_nested": false,
                "comment_placeholder": "Please tell us in 1 or 2 sentences why you would like to return this item."
            }],
            "created_date": "2018-04-10T20:24:05+0000",
            "created_by": "Narvar Admin",
            "modified_date": "2018-08-10T20:24:05+0000",
            "modified_by": "Narvar Admin"
        }]
    },
    "errors": null,
    "preview_url": null
};
let returnData = JSON.parse(testData);
returnData = JSON.stringify(returnData);
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
  logger.log('Hello World');  
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