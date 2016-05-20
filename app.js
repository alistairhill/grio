(function() {
  'use strict';

  angular.module('wordFinder', [])
  .controller('mainController', function($scope, $http) {
    $scope.test = "test";

    var fileName = "0608271h.html";
    $http.get("../grio/data/" + fileName)
    .success(function (response) {
      console.log(response)
    })
    .error(function (response) {
      console.error(response);
    })

  })
})();
