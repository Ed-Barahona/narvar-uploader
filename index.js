/* jshint node: true, devel: true */
'use strict';

const config      = require('config');
const express     = require('express');
const app         = express();
const path        = require('path');
const bodyParser  = require('body-parser');
const fileUpload = require('express-fileupload');
const routes      = require('./routes');
const APP_NAME 	  = 'Narvar Uploader';

const ENVIRONMENT = (process.env.NODE_ENV) ?
	(process.env.NODE_ENV) :
	config.get('environment');

process.env.NODE_ENV = ENVIRONMENT;

app.set('port', process.env.PORT || config.get('port'));
app.use(express.static('apidoc'));
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(fileUpload());
app.use(express.static('public'));
app.use(express.static('temp'));
app.all('*', routes);

const server = app.listen(app.get('port'), () => {
	app.emit('started');
	consoleMessages();
});

const consoleMessages = () => {
 console.log(
   `
    MMMMMMMMMMMWNX0OkxddddxkO0KNWMMMMMMMMMMM
    MMMMMMMMNKOxdollllllllllllloxOKNMMMMMMMM
    MMMMMWXOdollllllllllllllllllllldOXWMMMMM
    MMMMNOollllllllllllllllllllllllllokXMMMM
    MMWKdlllllllllccllllllllllllllllllldKWMM
    MW0ollllllloxkkkxdlcclllllllllllllllo0WM
    MKdllllllx0NWWWWWNKOxoclllllllxKKxclloKW
    Nkllllco0WWKkdddx0NWWXxlllllcl0WWkccllxX
    0olllclOWWOlclllccdXWWXdclllcl0WWkcclloO
    xllllcoKMNdclllllcl0WWWkclllcl0WWkcllllx
    kolllcoKMXdclllllcl0WWWkcclccxXMXdcllllx
    KdlllcoKMXdclllllcl0WMW0ddxx0NWXxlllllo0
    WOlllcoKWXdclllllcl0WWMWWWWWNKkoclllllkN
    MNxcllldxdllllllllloxxkkkkxxdlclllllldXM
    MMXxllllclllllllllllllccclcllllllllldXMM
    MMMNkllllllllllllllllllllllllllllllkNMMM
    MMMMWKkolllllllllllllllllllllllloxKWMMMM
    MMMMMMWXOdollllllllllllllllllldOKWMMMMMM
    MMMMMMMMMWX0kxdollllllllodxkOKNMMMMMMMMM
    MMMMMMMMMMMMWNX0kxddddxk0KNWMMMMMMMMMMMM

		`);
	console.log(APP_NAME);
	console.log('Application port:', app.get('port'));
	console.log('Node environment:', process.env.NODE_ENV);
};
