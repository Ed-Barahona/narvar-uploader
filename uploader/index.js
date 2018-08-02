/* jshint node: true, devel: true */
'use strict';
const fs     = require('fs');
const fse    = require('fs-extra');
const BSON   = require('bson');
const unzip  = require('unzip');
const mkdirp = require('mkdirp');
const UPLOAD_DIR = 'temp/uploads/';


const readFile = () => {
  const bson      = new BSON();
  const FILE_PATH = 'temp/example.bson';
  let content;
  // First I want to read the file
  fs.readFile(FILE_PATH, function read(err, B_DATA) {
      if (err) {
          throw err;
      }
      content =  bson.deserialize(B_DATA);
      processFile();
  });
  
  function processFile() {
      console.log('Uploaded: ', JSON.stringify(content));  
    }
};

const unzipFiles = (ZIP) => {
  let NAME = ZIP.split('.')[0];
      NAME = NAME.split('/')[2];
   
  const TEMP = `${UPLOAD_DIR}${NAME}/`;
  console.log('UPLOAD FILE', TEMP);

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
        console.error(err);
        reject(err);
      } else {
        console.log('pow!');
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
        reject(err);
        //return res.status(500).send(err);
      // decompress
      // res.send('File uploaded!');
       } else  {
        resolve(true);
       }
    });
  });
};

/* jshint ignore:start */
const requestHandler = async (req, res) => {
  // Assigned to var for readability
  const move  = await moveFile(req); 
  const temp  = await createDir(req); 
  const unzip = await unzipFiles(data);
  const read  = await readFiles(data);
  const post  = await postData(data);
  // Download
  console.log('Downloading: ', post)
  // res.download(ZIP_FILE);
  // removeFiles(data, ZIP_FILE);
};

const proc = (req, res) => {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  
  requestHandler(req, res).then((result) => {
    // console.error('Success: ', result);
  }).catch(err => {
    console.log('Error', err);
    res.status(500).send('Unale to process your request');
  });
 
};


setTimeout(function(){
  // readFile();
  //console.log('read called');
}, 8000);

const API = {
  proc
};

module.exports = API;