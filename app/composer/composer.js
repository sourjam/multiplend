(function (angular) {
  "use strict";

  var app = angular.module('myApp.composer', ['ngRoute', 'firebase.utils', 'firebase']);

  app.controller('ComposerCtrl', ['$scope', '$route', function($scope, $route) {
    console.log('controller loaded', $route);
      // when reaching this spot, controller should create and update url for a story object composer
    var vm = this;
    vm.checkRoute = checkRoute();
    vm.createDraft = createDraft();
    
    // Creates Firebase object for a story draft
    function createDraft() {
      
    }
    
    // Checks if route has firebase key
    function checkRoute() {
      if ($route.current.params.key) {
        
      } else {
        
      }
    };
    
    
    
    }]);

})(angular);