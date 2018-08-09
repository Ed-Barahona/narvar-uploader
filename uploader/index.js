/* jshint node: true, devel: true */
'use strict';
const fse    = require('fs-extra');
const fstream= require('fstream');
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
    logger.log('success!: download directory cleared');
    res.status(200).send({message: 'successfully cleared upload directory'});
  })
  .catch(err => {
    logger.error(err);
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

const loadManifest = (req) => {
  const err        = 'No matching manifest modules';
  const err2       = 'Retailer name does not match';
  let FILE = req.files.zipFile.name;
  let FOLDER = FILE.split('.')[0];
  let RETAILER = FOLDER.split('-')[0];

  console.log('MANIFEST FOLDER: ', FOLDER); 
  console.log('MANIFEST RETAILER: ', RETAILER); 
  
  const ZIP  = `${UPLOAD_DIR}${FILE}`;
  const TEMP = `${UPLOAD_DIR}${FOLDER}/`;

  return new Promise((resolve, reject) => {
    // check file
    // if no manifest err1
    fse.readFile(`${UPLOAD_DIR}${FOLDER}/manifest.json`, function read(err, MANIFEST) {
      if (err) {
        logger.error('File read error: ', err);
        reject(err);
      } else {
        MANIFEST = JSON.parse(MANIFEST);
        MANIFEST.folder_name = FOLDER;
        MANIFEST.file_name   = FILE;
        console.log('MANIFEST JSON: ', MANIFEST);
        resolve(MANIFEST);
      }
    });
  });
};

const postFile = (BSON_FILE) => {
  const bson      = new BSON();
  const FILE_PATH = BSON_FILE;
  const JSON_FILE = BSON_FILE.split('.')[0];
  let content;

  return new Promise((resolve, reject) => {
    fse.readFile(FILE_PATH, function read(err, B_DATA) {
      if (err) {
        logger.error('File read error: ', err);
        reject(err);
      } else {
        content =  bson.deserialize(B_DATA);
        content = JSON.stringify(content);
        fse.writeFile(`${JSON_FILE}.json`, content);
        resolve(content);
      }
    });
  });
};

const getFile = (JSON_FILE) => {

  const FILE_PATH = JSON_FILE.split('.')[0];
  let content;

  return new Promise((resolve, reject) => {
    fse.readFile(JSON_FILE, function read(err, J_DATA) {
      if (err) {
        logger.error('File read error: ', err);
        reject(err);
      } else {
        logger.log('JSON File: ', J_DATA);
        resolve(J_DATA);
      }
    });
  }); 
};

const parseFile = (BSON_FILE) => {
  const bson      = new BSON();
  const FILE_PATH = BSON_FILE;
  const JSON_FILE = BSON_FILE.split('.')[0];
  let content;

  return new Promise((resolve, reject) => {
    fse.readFile(FILE_PATH, function read(err, B_DATA) {
      if (err) {
        logger.error('File read error: ', err);
        reject(err);
      } else {
        content =  bson.deserialize(B_DATA);
        content = JSON.stringify(content);
        fse.writeFile(`${JSON_FILE}.json`, content);
        resolve(content);
      }
    });
  });
};


const procFiles = (data) => {
  const total = Object.keys(data.module).length;
  let   count = 0;
  let NAME = data.files.zipFile.name;
      NAME = NAME.split('.')[0];
   
  const TEMP = `${UPLOAD_DIR}${NAME}/`;



  logger.log('UPLOAD FILE', TEMP);

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


const postFiles = (req) => {
  
  let FILE = req.files.zipFile.name;
  let NAME = FILE.split('.')[0];
   
  const ZIP  = `${UPLOAD_DIR}${FILE}`;
  const TEMP = `${UPLOAD_DIR}${NAME}/`;

  const total = Object.keys(req.module).length;
  let   count = 0;

  return new Promise((resolve, reject) => {
    for(let key in data.module){
      // process if module=true
      if(data.module[key]){
        apps[data.app_name][key]()
        .then((result) => {
          data.file_data   = result; // Response data
          data.module_name = key; // For file name
          const JSON_FILE  = `${key}`;
          getFile(JSON_FILE)
          .then((postData) => {
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

const unzipFiles = (req) => {

  let FILE = req.files.zipFile.name;
  let NAME = FILE.split('.')[0];
   
  const ZIP  = `${UPLOAD_DIR}${FILE}`;
  const TEMP = `${UPLOAD_DIR}${NAME}/`;
  logger.log('Unzip file: ', ZIP);
  logger.log('Unzip into: ', TEMP);

  // Creates a folder based on file name
  // fse.createReadStream(ZIP)
  //   .pipe(unzip.Extract({
  //     path: TEMP
  // }));
  return new Promise((resolve, reject) => {
    fse.createReadStream(ZIP)
      .pipe(unzip.Parse())
        .on('entry', function (entry) {
        // entry.path, entry.type, entry.size;
        entry.pipe(fse.createWriteStream(`${TEMP}${entry.path}`));

        parseFile(`${TEMP}${entry.path}`).then((result) => {
          fse.unlinkSync(`${TEMP}${entry.path}`);
          resolve(TEMP);
        }).catch(err => {
          logger.error(err);
          reject(err);
        });
      });
    });
};

const createDir = (req) => {
 
  let NAME = req.files.zipFile.name;
      NAME = NAME.split('.')[0];
  let  DIR = `${UPLOAD_DIR}${NAME}/`;
  return new Promise((resolve, reject) => {
    console.log('CREATE DIR: ', DIR);
    fse.ensureDir(DIR, function (err) {
      if (err) {
        logger.error(err);
        reject(err);
      } else {
        logger.log('Temp upload dir created: ', DIR);
        resolve();
      }
    });
  });
};

const moveFile = (req) => {
  // Assumes File validation happens on client side
  // must match input field on form = zipFile
  let FILE     = req.files.zipFile;
  let ZIP_FILE = `${UPLOAD_DIR}${FILE.name}`;

  return new Promise((resolve, reject) => {
    FILE.mv(ZIP_FILE, function(err) {
      if (err) {
        logger.error('Error moving file: ', err);
        reject(err);
       } else  {
        logger.log('File moved: ', ZIP_FILE);
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
  const unzip = await unzipFiles(req);
  const man   = await loadManifest(req);
  const read  = await postFiles(man);
  //const post  = await postData(data);
};

// Process uploads
const proc = (req, res) => {
  // logger.log('UPLOAD REQ: ', req.files);
  if (!req.files){
    return res.status(400).send('No package uploaded.');
  } else { 
    requestHandler(req, res).then((result) => {
      res.status(200).send('Files successfully uploaded');
    }).catch(err => {
      logger.error('Error', err);
      res.status(500).send('Unale to process your request');
    });
  };
};

// POST processed files
const post = (req, res) => {
  // logger.log('UPLOAD REQ: ', req.body);
  if (!req.upload_directory){
    return res.status(400).send('No directory to post.');
  } else { 
    postFiles(req, res).then((result) => {
      res.status(200).send('Files successfully posted');
    }).catch(err => {
      logger.error('Error', err);
      res.status(500).send('Unale to process your request');
    });
  };
};

const API = {
  proc,
  post,
  clearDir
};

module.exports = API;