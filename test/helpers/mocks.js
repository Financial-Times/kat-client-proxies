'use strict';

const fs = require('fs');
const path = require('path');
const paths = [
  path.join(__dirname, '..', 'mocks')
];

paths.forEach(path => {
  fs.readdirSync(path).forEach(file => {
    if (file.indexOf('.js') > 0) {
      module.exports[file.replace(/\.js/, '')] = require(`${path}/${file}`);
    }
  });
});
