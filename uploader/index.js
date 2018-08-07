/* jshint node: true, devel: true */
'use strict';
const fse    = require('fs-extra');
const BSON   = require('bson');
const unzip  = require('unzip');
const mkdirp = require('mkdirp');
const logger = console; // change to logger
const UPLOAD_DIR = 'temp/uploads/';

const apps = {
    returns: require('./returns')
};


const clearDir = (req, res) => {
  fse.emptyDir(UPLOAD_DIR)
  .then(() => {
    console.log('success!: download directory cleared');
    res.status(200).send({message: 'successfully cleared upload directory'});
  })
  .catch(err => {
    console.error(err);
    res.status(500).send({error: 'Unable to clear upload directory'});
  });
};
// Retry Queue

const validateJSON = (json) => {
  try {
      JSON.parse(json);
      return true;
  } catch (e) {
      return false;
  }
};


const postFile = (data) => {
  // JSON validate
  // POST data
};

const checkManifest = (data) => {
  const err        = 'No matching manifest modules';
  const err2       = 'Retailer name does not match';
  const manifest   = '';
  const pkgName    = '';
  const clientName = '';
  return new Promise((resolve, reject) => {
    // check file
    // if no matching manifest err1
    if (manifest === pkgName === clientName){
      // do task
      resolve(true);
    } else {
      reject(err);
    // if retailer does not match go err2 
    }
  });
};

const readFile = (data) => {
  const bson      = new BSON();
  const FILE_PATH = 'temp/example.bson';
  let content;

  return new Promise((resolve, reject) => {
    fse.readFile(FILE_PATH, function read(err, B_DATA) {
      if (err) {
        logger.error('File read error: ', err);
        reject(err);
      } else {
        content =  bson.deserialize(B_DATA);
        resolve(content);
      }
    });
  });
  
};

const procFiles = (data) => {
  const TEMP_PKG = $

  return new Promise((resolve, reject) => {
    for(let key in data.module){
      // process if module true
      if(data.module[key]){
        apps[data.app_name][key]().then((result) => {
          data.file_data   = result;
          data.module_name = key;
          readFile(data).then((file) => {
            logger.log(`${key} file read`);
            postFile(file);
          }).catch(err => {
            logger.error(err);
          });
        })
        .catch(err => {
          logger.error(err);
        });
      } 
    } // end loop
    logger.log('Modules completed');
    resolve(true);

  });
};

const unzipFiles = (ZIP) => {
  let NAME = ZIP.split('.')[0];
      NAME = NAME.split('/')[2];
   
  const TEMP = `${UPLOAD_DIR}${NAME}/`;
  logger.log('UPLOAD FILE', TEMP);

  // Creates a folder based on file name
  fse.createReadStream(ZIP)
    .pipe(unzip.Extract({
      path: TEMP
    }));
};

const createDir = (req) => {
  let NAME = req.files.zipFile.name;
      NAME = NAME.split('.')[0];
      NAME = NAME.split('/')[2];
  return new Promise((resolve, reject) => {
    mkdirp(`${UPLOAD_DIR}${NAME}/`, function (err) {
      if (err) {
        logger.error(err);
        reject(err);
      } else {
        logger.log('Temp upload dir created');
        resolve();
      }
    });
  });
};

const moveFile = (req, res) => {
  // must match input field on form = zipFile
  let sampleFile = req.files.zipFile;
  return new Promise((resolve, reject) => {
    sampleFile.mv(UPLOAD_DIR, function(err) {
      if (err) {
        logger.error('Error moving file: ', err);
        reject(err);
       } else  {
        resolve(true);
       }
    });
  });
};

/* jshint ignore:start */
const requestHandler = async (req, res) => {
  // Assigned for readability
  const move  = await moveFile(req); 
  const temp  = await createDir(req); 
  const unzip = await unzipFiles(data);
  const read  = await readFiles(data);
  const post  = await postData(data);

};

const proc = (req, res) => {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  
  requestHandler(req, res).then((result) => {
    res.status(200).send('Files successfully uploaded');
  }).catch(err => {
    logger.error('Error', err);
    res.status(500).send('Unale to process your request');
  });
};


setTimeout(function(){
  // readFile();
  // logger.log('upload called');
}, 5000);

const API = {
  proc,
  clearDir
};

module.exports = API;