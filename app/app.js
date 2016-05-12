'use strict';

// Declare app level module which depends on filters, and services
angular.module('myApp', [
    'myApp.config',
    'myApp.security',
    'myApp.home',
    'oc.lazyLoad',
    'myApp.account',
    'myApp.chat',
    'myApp.login'
  ])
  
  .config(['$routeProvider', function ($routeProvider) {
    
    $routeProvider.when('/composer',{
      templateUrl: 'composer/composer.html',
      controller: 'ComposerCtrl',
      resolve: {
        lazy: ['$ocLazyLoad', function($ocLazyLoad){
          return $ocLazyLoad.load({
            files: ['composer/composer.js']
          });
        }]
      }
    });
    
    $routeProvider.when('/composer/:key',{
      templateUrl: 'composer/composer.html',
      controller: 'ComposerCtrl',
      resolve: {
        lazy: ['$ocLazyLoad', function($ocLazyLoad){
          return $ocLazyLoad.load({
            files: ['composer/composer.js', 'bower_components/trix/dist/trix.css', 'bower_components/trix/dist/trix.js']
          });
        }],
        params: function($route) {
          return $route.current.params;
        }
      }
    });
    
    $routeProvider.otherwise({
      redirectTo: '/home'
    });
  }])
  
  .run(['$rootScope', 'Auth', function($rootScope, Auth) {
    // track status of authentication
    Auth.$onAuth(function(user) {
      $rootScope.loggedIn = !!user;
    });
  }]);
