/* jshint node: true, devel: true */

'use strict';
const zip  = require('zip-folder');
const fse  = require('fs-extra');
const BSON = require('bson');
const path = require('path');
const logger = console;
const DOWNLOAD_DIR = 'temp/downloads/';

const apps = {
  'returns': require('./returns')
};

const clearDir = (req, res) => {
  fse.emptyDir(DOWNLOAD_DIR)
  .then(() => {
    console.log('success!: download directory cleared');
    res.status(200).send({message: 'successfully cleared download directory'});
  })
  .catch(err => {
    console.error(err);
    res.status(500).send({error: 'Unable to clear download directory'});
  });
};


const removeFiles = (data, FILE_NAME) => {
  
  const DIR_NAME = `${DOWNLOAD_DIR}${data.retailer_name}-${data.app_name}-${data.env}`;
  const ZIP_FILE = `${DOWNLOAD_DIR}${FILE_NAME}`;
  fse.remove(DIR_NAME)
    .then(() => logger.log('Removed: ', DIR_NAME))
    .catch(err => logger.error(err));
  fse.remove(ZIP_FILE)
    .then(() => logger.log('Removed: ', ZIP_FILE))
    .catch(err => logger.error(err));
};


const zipPackage = (data) => {
  console.log('creating zip package');

  let FILE_NAME  = `${data.retailer_name}-${data.app_name}-${data.env}`;
  let DIR_NAME  = `${DOWNLOAD_DIR}${FILE_NAME}`;
  let date = new Date();
      date = date.toISOString().split('.')[0]+"Z";
      date = date.split(':').join('-');
  
        FILE_NAME  = `${FILE_NAME}-${date}.zip`;
  const ZIP_FOLDER = `${DOWNLOAD_DIR}${FILE_NAME}`;
  
  return new Promise((resolve, reject) => {
      /* compress folder */
      // zip files from temp folder to zip path
      zip(DIR_NAME, ZIP_FOLDER, function(err) {
        if(err) {
            logger.log('error with folder compression: ', err);
            reject(err);
        } else {
            logger.log('zip folder created', FILE_NAME);
            resolve(FILE_NAME);
        }
      });
  });
};

const writeFile = (data) => {
  return new Promise((resolve, reject) => {
 
  const bson      = new BSON();
  const FILE_NAME = `${data.module_name}.bson`;
  const DIR_NAME  = `${DOWNLOAD_DIR}${data.retailer_name}-${data.app_name}-${data.env}`;
  let J_DATA      = bson.serialize(data.file_data);

    fse.outputFile(`${DIR_NAME}/${FILE_NAME}`, J_DATA)
    .then((result) => {
      logger.log('BSON file created: ', FILE_NAME);
      resolve(FILE_NAME);
    })
    .catch(err => {
      logger.error('Download write file error: ', err);
      reject(err);
    });
  });
};

const getData = (data) => {

  const total = Object.keys(data.module).length;
  let   count = 0;
  

  return new Promise((resolve, reject) => {
    for(let key in data.module){
      // process if module=true
      logger.log(`${key}: `, data.module[key]);
      if(data.module[key] === 'true'|| data.module[key] === true){
        logger.log('TRUE', key);
        apps[data.app_name][key]()
        .then((result) => {
          data.file_data   = result; // Response data
          data.module_name = key; // For file name
          // Create files with response data
          // console.log('WRITE FILEEEEE', data)
          writeFile(data)
          .then((module) => {
            count ++;
            checkCount();
            logger.log(`${module} Module complete`);
          }).catch(err => {
            logger.log(err);
            count ++;
            reject(err);
          });
        })
        .catch(err => {
          logger.error(err);
          reject(err);
        });
      } else {
        count ++;
        logger.log('FALSE', key);
        checkCount();
      }
    } // end loop
    function checkCount(){
      if(count === total){
        resolve(data);
      }
    }
  });
};

const createManifest = (data) => {
  // Leave as obj literall 
  // to avoid BSON issues
  const manifestFile = {
      "file_name": "Narvar configurator manifest",
      "app_name": data.app_name,
      "retailer_name": data.retailer_name,
      "env": "qa",
      "created_date": new Date().toISOString(),
      "created_by": "narvar user",
      "module": data.module
  };

  data.file_data    = manifestFile;
  data.module_name  = 'manifest';

  return new Promise((resolve) => {
    writeFile(data).then((result) => {
      console.log('Create manifest: ', result);
      resolve(data);
    });
  });
};

const browserDownload =  (res, ZIP_FILE) => {
 
  // const fullFileName = path.join(DOWNLOAD_DIR, ZIP_FILE);
  // path.resolve(__dirname, '.../public')
  res.setHeader('Content-disposition', 'attachment; filename=' + ZIP_FILE);
  res.setHeader('Content-type', 'application/zip');
  // res.sendFile(ZIP_FILE, {"root": DOWNLOAD_DIR});
  
  res.download(`${DOWNLOAD_DIR}${ZIP_FILE}`, ZIP_FILE, function(err){
      if(err){
        // Handle Error
        console.log('req handler error: ', ZIP_FILE);
        return err;
      } else {
        console.log('req handler success: ', ZIP_FILE);
        res.end();
        return ZIP_FILE;
      }
    });
};

/* jshint ignore:start */
const requestHandler = async (data, res) => {
  // Assigned for readability
  const manifest = await createManifest(data); 
  const modules  = await getData(data);
  const ZIP_FILE = await zipPackage(data);
  // const result   = await browserDownload(res, ZIP_FILE);
  // Download
  logger.log('Downloading: ', ZIP_FILE);
  // Browser download
  res.setHeader('Content-disposition', 'attachment; filename=' + ZIP_FILE);
  res.setHeader('Content-type', 'application/zip');
  // res.sendFile(ZIP_FILE, {"root": DOWNLOAD_DIR});
  return new Promise((resolve, reject) => {
    res.download(`${DOWNLOAD_DIR}${ZIP_FILE}`, ZIP_FILE, function(err){
      if(err){
        // Handle Error
        console.log('req handler error: ', err);
        res.end();
        // removeFiles(data, ZIP_FILE);
        reject(err);
      } else {
        console.log('req handler success: ', ZIP_FILE);
        res.end();
        // removeFiles(data, ZIP_FILE);
        resolve(ZIP_FILE);
      }
    });
  });
};


const proc = (req, res) => {
  // Do some basic validation
  const data = req.body;
  // logger.log(req.body);
  requestHandler(data, res).then((data) => {
    console.log('Get download success', data);
   
  }).catch(err => {
    logger.log('Error', err);
    res.status(500).send('Unale to process your request');
  });
};

const API = {
    proc,
    clearDir
};

module.exports = API;
/* jshint ignore:end */