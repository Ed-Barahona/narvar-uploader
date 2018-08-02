/* jshint node: true, devel: true */
'use strict';

/**
 * Required Dependencies 
 * go here
 */

const helloWorld = () => {
  console.log('Hello World');  
};

const healthCheck = (req, res) => {

    console.log('health_check called:', process.memoryUsage());

    res.status(200).json({
        "status": "success",
        "process": process.memoryUsage()
    });
    return res;
};

const API = {
    helloWorld,
    healthCheck
};

module.exports = API;