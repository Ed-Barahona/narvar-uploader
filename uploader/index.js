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

const getFile = (JSON_FILE) => {
  
  return new Promise((resolve, reject) => {
    fse.readFile(JSON_FILE, function read(err, J_DATA) {
      if (err) {
        logger.error('File read error: ', err);
        reject(err);
      } else {
        // if (typeof J_DATA === 'string') {
        J_DATA = JSON.parse(J_DATA);
        // }
        // // J_DATA = JSON.parse(J_DATA);
        // J_DATA = JSON.stringify(J_DATA);

        // logger.log('JSON File: ', J_DATA);
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
        // Sync call
        try {
          fse.writeFile(`${JSON_FILE}.json`, content);
          logger.log(`${JSON_FILE}.json created`);
          resolve(content);
        } catch (err) {
          reject(err);
        }


        // fse.writeFile(`${JSON_FILE}.json`, content)
        //   .then(() => {
        //     logger.log(`${JSON_FILE}.json created`);
        //     resolve(content);
        //   })
        //   .catch(err => {
        //     reject(err);
        //   });
      }
    });
  });
};

const postData = (appName, key , jData) => {
  logger.log('POST Data called: ', appName, key, jData);
  return new Promise((resolve, reject) => {
    apps[appName][key](jData)
      .then((result) => {
        resolve(result);
      })
      .catch(err => {
        logger.error(err);
        reject(err);
      });
  });
};

const postFiles = (data) => {
  logger.log('POST DATA REQ DATA: ', data);
  let FILE = data.file_name;
  let NAME = FILE.split('.')[0];
   
  const ZIP  = `${UPLOAD_DIR}${FILE}`;
  const TEMP = `${UPLOAD_DIR}${NAME}/`;
  
  const total = Object.keys(data.module).length;
  let   count = 0;

  return new Promise((resolve, reject) => {
    for(let key in data.module){
      // process if module=true
      if(data.module[key] === 'true'|| data.module[key] === true){
        const JSON_FILE  = `${UPLOAD_DIR}${data.folder_name}/${key}.json`;
        count ++;
        logger.log('process: ', key);
        getFile(JSON_FILE)
          .then((jData) => {
            count ++;
            postData(data.app_name, key, jData);
            checkCount();
          }).catch(err => {
            logger.log(err);
            count ++;
            reject(err);
          });
      } else {
        count ++;
        console.log('do not process: ', key);
        checkCount();
      }
    } // end loop
    function checkCount(){
      if(count === total){
        logger.log('count complete >>>>>>>');
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

 
  return new Promise((resolve, reject)=>{
    let promiseList = [];
    let stream  = fse.createReadStream(ZIP)
    .pipe(unzip.Parse());
    stream.on('entry', function (entry) {
          // entry.path, entry.type, entry.size;
              new Promise((resolve, reject) => {
                logger.log("each file parse");

                  entry.pipe(fse.createWriteStream(`${TEMP}${entry.path}`));

                  parseFile(`${TEMP}${entry.path}`).then((result) => {
                    fse.unlinkSync(`${TEMP}${entry.path}`);
                    // resolve(TEMP);
                      logger.log(`${TEMP}${entry.path}`);
                  }).catch(err => {
                    logger.error(err);
                    reject(err);
                  });
              });
          });
      stream.on('close', function() {
        console.log("parse complete");
        Promise.all(promiseList).then(function() {
          console.log('done promises');
          resolve("done")
        });
      });
    });
      // Resolve all
      
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

const moveZip = (req) => {
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
  const move  = await moveZip(req); 
  const temp  = await createDir(req);
  const unzip = await unzipFiles(req);
  const man   = await loadManifest(req);

  console.log('MANNN RESPONSE: ', man)

  res.status(200).send({message: 'successfully uploaded files', data: man})
  // const read  = await postFiles(man);
  //const post  = await postData(data);
};

// Process uploads
const proc = (req, res) => {
  // logger.log('UPLOAD REQ: ', req.files);
  if (!req.files){
    return res.status(400).send('No package uploaded.');
  } else { 
    requestHandler(req, res).then((result) => {
      // res.status(200).send('Files successfully uploaded');
    }).catch(err => {
      logger.error('Error', err);
      res.status(500).send('Unale to process your request');
    });
  };
};

// POST processed files
const post = (req, res) => {
  logger.log('POST REQ: ', req.body);
  if (!req.body.folder_name){
    return res.status(400).send('No directory to post.');
  } else {
    console.log("req data: ", req.body);
    postFiles(req.body, res).then((result) => {
      // res.status(200).send('Files successfully posted');
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