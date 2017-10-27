'use strict';

require('dotenv').config({silent: true});

const fs = require('fs');
const paths = [
	`${__dirname}/lib`
];

paths.forEach(path => {
	fs.readdirSync(path).forEach(file => {
		if (file.indexOf('.js') > 0) {
			module.exports[file.replace(/\.js/, '')] = require(`${path}/${file}`);
		}
	});
});
