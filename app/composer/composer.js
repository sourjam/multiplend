(function (angular) {
  "use strict";

  var app = angular.module('myApp.composer', ['ngRoute', 'firebase.utils', 'firebase']);

  app.controller('ComposerCtrl', ['$scope', '$route', 'fbutil', '$firebaseObject', '$location', '$sce', '$timeout', '$anchorScroll', '$q', function($scope, $route, fbutil, $firebaseObject, $location, $sce, $timeout, $anchorScroll, $q) {
    var vm = this;
    vm.aafuncs = {};
    vm.midfuncs = {};
    vm.endfuncs = {};
    vm.blockKeys = {};
    vm.focusMode = { enable: false };
    
    $scope.draftUrl = $route.current.params.key;
    $scope.aafuncs = vm.aafuncs;
    $scope.midfuncs = vm.midfuncs;
    $scope.endfuncs = vm.endfuncs;
    $scope.blockKeys = vm.blockKeys;
    $scope.focusMode = vm.focusMode;
    
    $scope.status = null;
    $scope.draft = null;
    
    $scope.trustHtml = function(string) {
      return $sce.trustAsHtml(string);
    };
    
    var blankDraft = { title: 'A Superb Story', author: 'Name yourself',
                        content: {
                          aa: {
                            label: 'Beginning',
                            subtitle: 'In the beginning...',
                            prose: 'In the beginning...',
                            to: 'b1'
                          },
                          bb: {
                            b1: {
                              label: 'Middle',
                              from: ['aa'],
                              subtitle: 'And then this happened...',
                              prose: 'And then this happened...',
                              to: 'z1',
                              choices: {
                                c0: {
                                  prose: 'And they went there...',
                                  to: 'z1'
                                }
                              }
                            }
                          },
                          zz: {
                            z1: {
                              label: 'Ending',
                              subtitle: 'At the end...',
                              from: ['b1'],
                              prose: 'In the end...'
                            }
                          }
                        }
                       };
    
    // Creates Firebase object for an initial story draft
    var createDraft = function() {
      var newDraft = fbutil.ref('drafts').push(blankDraft);
      $location.path('/composer/'+$firebaseObject(newDraft).$id);
    };
    
    // Loads existing endly draft
    var loadDraft = function(key) {
      $scope.draft = $firebaseObject(fbutil.ref('drafts').child(key));
      $scope.draft.$loaded(function(data){
        $q.when(vm.blockKeys.calculate()).then(function(res){
          vm.blockKeys.calcFroms();
          $scope.status = res;
        });
        
//        console.log(vm.blockKeys.list);
      }, function(err) {
        if (err) {
          console.log(err)
        }
      });
    };
    
    // Focus Mode functions
    vm.focusMode.overflow = function() {
      var toggle = document.body.style.overflow;
      if (toggle == 'hidden') {
        document.body.style.overflow = 'auto';
      } else {
        document.body.style.overflow = 'hidden';
      }
    };
    
    // Block key functions
    
    // Build list of all block keys
    vm.blockKeys.calculate = function() {
      var contentKeys = {};
      contentKeys.aa = {};
      contentKeys.aa.subtitle = $scope.draft.content.aa.subtitle;
      contentKeys.aa.label = $scope.draft.content.aa.label;
      Object.keys($scope.draft.content.bb).forEach(function(key){
        contentKeys[key] = {};
        contentKeys[key].subtitle = $scope.draft.content.bb[key].subtitle;
        contentKeys[key].label = $scope.draft.content.bb[key].label;
      });
      Object.keys($scope.draft.content.zz).forEach(function(key){
        contentKeys[key] = {};
        contentKeys[key].subtitle = $scope.draft.content.zz[key].subtitle;
        contentKeys[key].label = $scope.draft.content.zz[key].label;
      });
      vm.blockKeys.list = contentKeys;
      
      return true;
    };
    
    // Build table of contents
    
    vm.blockKeys.calcFroms = function() {
      var fromKeys = {};
      
      // calc beginning
      fromKeys[$scope.draft.content.aa.to] = ['aa'];
      
      // calc middle
      Object.keys($scope.draft.content.bb).forEach(function(key){
        // grab from keys if block has a choice
        if ($scope.draft.content.bb[key].choices) {
          Object.keys($scope.draft.content.bb[key].choices).forEach(function(choice){
            if (!fromKeys[$scope.draft.content.bb[key].choices[choice].to]) {
              fromKeys[$scope.draft.content.bb[key].choices[choice].to] = [key];
            } else {
              fromKeys[$scope.draft.content.bb[key].choices[choice].to].push(key);
            }
          });
        } else {
          // grab defualt from key if block has no choice
          if (!fromKeys[$scope.draft.content.bb[key].to]) {
            fromKeys[$scope.draft.content.bb[key].to] = [key];  
          } else {
            fromKeys[$scope.draft.content.bb[key].to].push(key);
          }  
        }
      });
      vm.blockKeys.froms = fromKeys;
//      console.log('fromkeys', vm.blockKeys.froms);
      return true;
    };
    
    // http://stackoverflow.com/questions/25930741/angularjs-anchorscroll-sometimes-refresh-all-page
    // why does this work?
    vm.blockKeys.goTo = function(key) {
      var id = $location.hash();
      $location.hash('anchor-'+key);
      $anchorScroll();
      $location.hash(id);
    };
    
    // Beginning block functions
    
    vm.aafuncs.updateSubtitle = function() {
      var subtext = $scope.draft.content.aa.prose;
      subtext = String(subtext).replace(/<[^>]+>/gm, '');
      $scope.draft.content.aa.subtitle = subtext.slice(0, 50).concat('...');
    };
    
    vm.aafuncs.cout = function(key) {
      $scope.focusMode.block = key;
      console.log(key)
      console.log($scope.focusMode)
    }
    
    // Middle block functions
    
    vm.midfuncs.addProse = function(key) {
      // Add a block of prose
      var newkey = 'b' + ( parseInt(key.slice(1)) + 1 );
      var newblock = angular.copy(blankDraft.content.bb.b1);
      console.log(newblock);
      newblock.from = null;
      $timeout(function(){
        $scope.draft.content.bb[newkey] = newblock;
        $scope.draft.content.bb[newkey].choices = null;
        $scope.draft.$save();
      }, 0);
    };
    
    vm.midfuncs.removeProse = function(key) {
      // Remove block of prose
      $timeout(function(){
        if (key !== 'b0') {
          $scope.draft.content.bb[key] = null;
          delete $scope.draft.content.bbb[key];
          $scope.draft.$save();  
        }
      }, 0);
    };
    
    vm.midfuncs.addChoice = function(key, choices) {
      console.log(key, choices);
      var newChoice = angular.copy(blankDraft.content.bb.b1.choices.c0);
      if (choices == null) {
        $scope.draft.content.bb[key].choices = { c0: newChoice };
        $scope.draft.$save();
      } else {
        var keyArr = Object.keys(choices).slice(-1);
        if ( parseInt(keyArr[0][1]) < 2 ) {
          var newKey = 'c' + ( parseInt(keyArr[0][1]) + 1 );
          $scope.draft.content.bb[key].choices[newKey] = newChoice;
          $scope.draft.$save();
        } else {
          console.log('Max choices reached');
        } 
      }
    };
    
    vm.midfuncs.removeChoice = function(blockKey, choiceKey) {
      $scope.draft.content.bb[blockKey].choices[choiceKey] = null;
      delete $scope.draft.content.bb[blockKey].choices[choiceKey];
      $scope.draft.$save();
    };
    
    vm.midfuncs.updateSubtitle = function(key) {
      var subtext = $scope.draft.content.bb[key].prose;
       subtext = String(subtext).replace(/<[^>]+>/gm, '');
      $scope.draft.content.aa.subtitle = subtext.slice(0, 50).concat('...');
    };
    
    // End block functions
    
    vm.endfuncs.addEnding = function(key) {
      if (key[1] >= 9) {
        console.log('max endings of 9 reached');
      } else {
        var newKey = "z" + (parseInt(key[1]) + 1);
        $scope.draft.content.zz[newKey] = {
          label: 'Ending',
          prose: 'In the end...',
          subtitle: 'In the end...'
        };
        $scope.draft.$save();
      } 
    };
    
    vm.endfuncs.removeEnding = function(key) {
      console.log('Deleting', key);
      var endList = Object.keys($scope.draft.content.zz);
      if (endList.length > 1) {
        $timeout(function(){
          $scope.draft.content.zz[key] = null;
          delete $scope.draft.content.zz[key];
          $scope.draft.$save();
        }, 0);  
      } else {
        console.log ('Must have one ending');
      }
    };
    
    // Route load
    
    if ($route.current.params.key) {
      loadDraft($route.current.params.key);
    } else {
      createDraft();
    }
    
    
    }]);

})(angular);