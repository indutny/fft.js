'use strict';

const path = require('path');

const DIST = path.join(__dirname, 'dist');
const LIB = path.join(__dirname, 'lib');

const loaders = [
  {
    test: /\.js$/,
    loader: 'babel-loader',
    query: {
      presets: [ 'es2015', 'react' ]
    }
  }
];

module.exports = [{
  target: 'web',
  entry: path.join(LIB, 'fft.js'),
  output: {
    path: DIST,
    filename: 'fft.js'
  },
  module: {
    loaders: loaders
  }
}];
