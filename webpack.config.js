var _ = require('lodash')

var webpack = require('webpack')
//var CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
var ProgressPlugin = require('webpack/lib/ProgressPlugin')

var pathutil = require('./lib/util/pathutil')
var path = require('path')
var log = require('./lib/util/logger').createLogger('webpack:config')

module.exports = {
  mode: 'production',
  context: __dirname,
  cache: true,
  entry: {
    app: pathutil.resource('app/app.js'),
    authldap: pathutil.resource('auth/ldap/scripts/entry.js'),
    authmock: pathutil.resource('auth/mock/scripts/entry.js')
  },
  output: {
    //path: pathutil.resource('build'),
    path: '/tmp/build/res/build',
    publicPath: '/static/app/build/',
    filename: 'entry/[name].entry.js',
    chunkFilename: '[id].[hash].chunk.js'
  },
  stats: {
    colors: true
  },
  
  resolve: {
    modules: [
      "node_modules", 
      //path.resolve(__dirname, "bower_components"),  // works
      '/tmp/build/bower_components',
      //path.resolve(__dirname, "res/web_modules" ), // works
      '/tmp/build/res/web_modules',
      //path.resolve(__dirname, "res/app/components" )// works
      '/tmp/build/res/app/components'
    ],
    /*root: [
      pathutil.resource('app/components')
    ],
    modulesDirectories: [
      'web_modules',
      'bower_components',
      'node_modules'
    ],*/
    alias: {
      'angular-bootstrap': 'angular-bootstrap/ui-bootstrap-tpls',
      localforage: 'localforage/dist/localforage.js',
      'socket.io': 'socket.io-client',
      stats: 'stats.js/src/Stats.js',
      'underscore.string': 'underscore.string/index',
      'ngRoute': 'angular-route'
    }
  },
  module: {
    rules: [
      {test: /\.css$/, loader: 'css-loader'},
      {test: /\.scss$/, loader: 'css-loader!sass-loader'}
      , {test: /\.less$/, loader: 'css-loader!less-loader'}
      //, {test: /\.json$/, loader: 'json-loader'}
      , {test: /\.jpg$/, loader: 'url-loader', options: { limit: 1000, mimetype: 'image/jpeg' } }
      , {test: /\.png$/, loader: 'url-loader', options: { limit: 1000, mimetype: 'image/png' } }
      , {test: /\.gif$/, loader: 'url-loader', options: { limit: 1000, mimetype: 'image/gif' } }
      , {test: /\.svg/, loader: 'url-loader', options: { limit: 1, mimetype: 'image/svg+xml' } }
      , {test: /\.woff/, loader: 'url-loader', options: { limit: 1, mimetype: 'application/font-woff' } }
      , {test: /\.otf/, loader: 'url-loader', options: { limit: 1, mimetype: 'application/font-woff' } }
      , {test: /\.ttf/, loader: 'url-loader', options: { limit: 1, mimetype: 'application/font-woff' } }
      , {test: /\.eot/, loader: 'url-loader', options: { limit: 1, mimetype: 'vnd.ms-fontobject' } }
      , {test: /\.pug$/, loader: 'template-html-loader?engine=jade'}
      , {test: /\.html$/, loader: 'html-loader'}
      , {test: /angular\.js$/, loader: 'exports-loader?exports=angular'}
      , {test: /angular-cookies\.js$/, loader: 'imports-loader?angular'}
      , {test: /angular-route\.js$/, loader: 'imports-loader?angular'}
      , {test: /angular-touch\.js$/, loader: 'imports-loader?angular'}
      , {test: /angular-animate\.js$/, loader: 'imports-loader?angular'}
      , {test: /angular-growl\.js$/, loader: 'imports-loader?angular'}
      , {test: /dialogs\.js$/, loader: 'script-loader'}
    ],
    // TODO: enable when its sane
    // preLoaders: [
    //  {
    //    test: /\.js$/,
    //    exclude: /node_modules|bower_components/,
    //    loader: 'eslint-loader'
    //  }
    // ],
    noParse: [
      pathutil.resource('bower_components')
    ]
  },
  plugins: [
    new ProgressPlugin(_.throttle(
      function(progress, message) {
        var msg
        if (message) {
          msg = message
        }
        else {
          msg = progress >= 1 ? 'complete' : 'unknown'
        }
        log.info('Build progress %d%% (%s)', Math.floor(progress * 100), msg)
      }
      , 1000
    ))
  ]
}
