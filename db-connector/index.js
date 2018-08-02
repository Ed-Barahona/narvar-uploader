/* jshint node: true, devel: true */
'use strict';
const config   = require('config');
const { Pool } = require('pg');

const DB_USER = (process.env.PG_USER) ?
	(process.env.PG_USER) :
	config.get('pg_config.user');

const DB_HOST = (process.env.PG_HOST) ?
	(process.env.PG_HOST) :
	config.get('pg_config.host');

const DB_NAME = (process.env.PG_NAME) ?
	(process.env.PG_NAME) :
	config.get('pg_config.database');

const DB_PASS = (process.env.PG_PASS) ?
	(process.env.PG_PASS) :
	config.get('pg_config.password');

const DB_PORT = (process.env.PG_PORT) ?
	(process.env.PG_PORT) :
	config.get('pg_config.port');

const DB_MAX = (process.env.PG_MAX) ?
	(process.env.PG_MAX) :
	config.get('pg_config.max');

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_NAME,
  password: DB_PASS,
  port: DB_PORT,
  max: DB_MAX
});


const getData = (data) => {
	pool.query("SELECT returns_settings_json FROM retailer_info WHERE uri_moniker='ministryofsupply'", (err, res) => {
		if(err){
			console.log('PG ERROR: ', err);
		} else {
			console.log('DB RESULTS: ', res.rows);
		}
		pool.end();
	});
};

const API = {
	getData,
};

module.exports = API;