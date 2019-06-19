const mongoose = require('mongoose');

module.exports.connect = (uri) => {
	mongoose.connect(uri, {
		useMongoClient: true,
	});

	// plug in the promise library:
	mongoose.Promise = require('bluebird');

	mongoose.connection.on('error', (err) => {
		console.error(`Mongoose connection error: ${err}`);
		process.exit(1);
	});

	// load models
	require('./merchant');
};
