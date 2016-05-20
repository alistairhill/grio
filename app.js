(function() {
  'use strict';

  angular.module('wordFinder', [])
  .controller('mainController', function($scope, $q, $http, myServices) {
    var books = [];
    $scope.test = "test";

    activate();
    function activate() {

      var promises = [
          myServices.getFiles("0608271h.html"),
          myServices.getFiles("w00001.html"),
          myServices.getFiles("w00004.html")
      ];
      $q.all(promises).then(function successHandler(results) {
        var index = 0;
        for (var i = 0; i < results.length; i++) {
          books.push(results[i]);
        }
        console.log(books);
      }, epicfail);

    }

    function epicfail(response) {
      console.error(response)
    }

  })
  .service('myServices', function($q, $http) {

    this.getFiles = function(file) {
      var deferred = $q.defer(),
      config = {
        method: 'get',
        url: "../grio/data/" + file
      };
      $http(config)
        .success(function(data) {
          deferred.resolve([data, file]);
        }).error(function(data) {
          deferred.reject(data);
        });
      return deferred.promise;
    };
  });
})();
