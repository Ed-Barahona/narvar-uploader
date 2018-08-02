/* jshint node: true, devel: true */
'use strict';

const router    = require('express').Router();
const download  = require('./downloader');
const upload    = require('./uploader');
const lib       = require('./lib');
const apps      = require('./narvar-apps');
//const encoder   = require('./file-encoder');

router.get('/api/v1/health_check', lib.healthCheck);
router.post('/api/v1/download', download.proc);
router.post('/api/v1/upload', upload.proc);

module.exports = router;