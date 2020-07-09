require.ensure([], function(require) {
  require('nine-bootstrap')

  require('angular')
  //require('angular-route')
  var ngRoute = require('angular-route').ngRoute
  require('angular-touch')

  angular.module('app', [
    ngRoute,
    'ngTouch',
    require('gettext').name,
    require('./signin').name
  ])
    .config(function($routeProvider, $locationProvider) {
      $locationProvider.html5Mode(true)
      $routeProvider
        .otherwise({
          redirectTo: '/auth/mock/'
        })
    })
})
