(function() {
  'use strict';

  angular.module('wordFinder', [])
  .controller('mainController', function($scope, $http) {
    $scope.test = "test";

    function getFilesNames() {
      var fileNames = ["0608271h.html", "w00001.html", "w00004.html"];
      return fileNames;
    }

    function getFiles() {
      var fileNames = getFilesNames();

      for (var i = 0; i < fileNames.length; i++) {
        var fileName = fileNames[i];
        $http.get("../grio/data/" + fileName)
        .success(function (response) {
          return response;
        })
        .error(function (response) {
          console.error(response);
        })
      }
    }

  });
})();
