var BrowserSyncPlugin = require('browser-sync-webpack-plugin');


var SRC_PATH = __dirname + '/src';
var BUILD_PATH = __dirname + '/build';

module.exports = {
  entry: {
    index: SRC_PATH + '/index.js'
  },
  output: {
    publicPath: SRC_PATH,
    path: BUILD_PATH,
    filename: "[name].bundle.js"
  },
  module: {
    loaders: [{
      test: /\.css$/,
      loader: "style!css"
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: "babel",
      query: {
        presets: ['es2015', 'react']
      }
    }]
  },
  plugins: [
    new BrowserSyncPlugin({
      host: 'localhost',
      port: 3000,
      server: {
        baseDir: [BUILD_PATH]
      }
    })
  ]
};