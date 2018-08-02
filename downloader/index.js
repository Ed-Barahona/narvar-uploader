/* jshint node: true, devel: true */
'use strict';
const zip  = require('zip-folder');
const fse  = require('fs-extra');
const BSON = require('bson');
const logger = console;
const DOWNLOAD_DIR = 'temp/downloads/';

const apps = {
  'returns': require('./returns'),
};

const validateJSON = (json) => {
    try {
        JSON.parse(json);
        return true;
    } catch (e) {
        return false;
    }
};

const removeFiles = (data, ZIP_FILE) => {
  
  const DIR_NAME  = `${DOWNLOAD_DIR}${data.retailer_name}-${data.app_name}-${data.env}`;
  fse.remove(DIR_NAME)
    .then(() => logger.log('Removed: ', DIR_NAME))
    .catch(err => logger.error(err));
  fse.remove(ZIP_FILE)
    .then(() => logger.log('Removed: ', ZIP_FILE))
    .catch(err => logger.error(err));
};


const zipPackage = (data) => {
  
  const DIR_NAME  = `${DOWNLOAD_DIR}${data.retailer_name}-${data.app_name}-${data.env}`;
  let date = new Date();
      date = date.toISOString().split('.')[0]+"Z";
      date = date.split(':').join('-');
  
  const ZIP_FOLDER = `${DIR_NAME}-${date}.zip`;
  return new Promise((resolve, reject) => {
      /* compress folder */
      zip(DIR_NAME, ZIP_FOLDER, function(err) {
        if(err) {
            logger.log('error with folder compression: ', err);
            reject(err);
        } else {
            logger.log('zip folder created', ZIP_FOLDER);
            resolve(ZIP_FOLDER);
        }
      });
  });
};

const writeFile = (data) => {
 
  const bson      = new BSON();
  const FILE_NAME = `${data.module_name}.bson`;
  const DIR_NAME  = `${DOWNLOAD_DIR}${data.retailer_name}-${data.app_name}-${data.env}`;
  let   J_DATA    = bson.serialize(data.file_data);

  return new Promise((resolve, reject) => {
    fse.outputFile(`${DIR_NAME}/${FILE_NAME}`, J_DATA)
    .then(() => {
      logger.log('BSON file created: ', FILE_NAME);
      resolve(true);
    })
    .catch(err => {
      logger.error('Downloader write file error: ', err);
      reject(err);
    });
  });
};

const getData = (data) => {
  return new Promise((resolve, reject) => {
    for(let key in data.module){
      // process if module true
      if(data.module[key]){
        apps[data.app_name][key]().then((result) => {
          data.file_data   = result;
          data.module_name = key;
          writeFile(data).then((module) => {
            logger.log(`${module} data received`);
          }).catch(err => {
            logger.log(err);
          });
        })
        .catch(err => {
          logger.error(err);
        });
      } 
    } // end loop
    console.log('Modules completed');
    resolve(true);

  });
};

const createManifest = (data) => {
  data.created_date = new Date().toISOString();
  data.file_data    = JSON.stringify(data);
  data.module_name  = 'manifest';

  return new Promise((resolve) => {
    writeFile(data);
    resolve(data);
  });
};

/* jshint ignore:start */
const requestHandler = async (data, res) => {
  // Assigned for readability
  const manifest = await createManifest(data); 
  const modules  = await getData(data);
  const ZIP_FILE = await zipPackage(data);
  // Download
  logger.log('Downloading: ', ZIP_FILE)
  res.download(ZIP_FILE, function(err){
    if(err){
      // Handle Error
      removeFiles(data, ZIP_FILE);
    } else {
      removeFiles(data, ZIP_FILE);
    }
  });
};

const proc = (req, res) => {
  // Do some basic validation
  const data = req.body;
  logger.log(req.body);
  requestHandler(req.body, res).then((result) => {
    // console.error('Success: ', result);
  }).catch(err => {
    logger.log('Error', err);
    res.status(500).send('Unale to process your request');
  });
};

const testObj = {
  app_name: 'returns',
  retailer_name: 'nike',
  env: 'qa',
  module: {
    settings: false,
    reason_codes: true,
    return_rules: false,
    shipping_label: false,
    packing_slip: false
  }
};

setTimeout(function(){
  requestHandler(testObj).then((result) => {
    logger.error('TEST SUCCESS: ', result);
  }).catch(err => {
    logger.error('TEST ERROR: ', err);
  });
}, 3000);

const API = {
    proc,
};

module.exports = API;
/* jshint ignore:end */