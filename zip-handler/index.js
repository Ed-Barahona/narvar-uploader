/* jshint node: true, devel: true */
'use strict';

const fs  = require('fs');
const zip = require('file-zip');

const helloWorld = () => {
  console.log('Hello World');  
};

/*compressed folder*/
const compressFolder = (data) => {
    zip.zipFolder(['./folder1','./folder2'],'out.zip', err => {
        if(err){
            console.log('zip error', err);
        }else{
            console.log('zip success');
        }
    });
};
/*compressed file*/
const compressFile = (data) => {
    zip.zipFile(['./file1.txt','./file2.txt'],'out.zip', err => {
        if(err){
            console.log('zip error', err);
        }else{
            console.log('zip success');
        }
    });
};
/*decompression*/
const decompress = (data) => {
    zip.unzip('out.zip','dist', err => {
        if(err){
            console.log('unzip error', err);
        }else{
            console.log('unzip success');
        }
    });
};

const API = {
    helloWorld,
    decompress,
    compressFile,
    compressFolder
};

module.exports = API;