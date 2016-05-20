(function() {
  'use strict';

  angular.module('wordFinder', [])
  .controller('mainController', function($scope, $q, $http, myServices, fileParser) {
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
          var book = fileParser.parseBooks(results[i][0], results[i][1]);
          books.push(book);
        }
        console.log(books);
      }, epicfail);

    }

    function epicfail(response) {
      console.error(response)
    }

  })
  .factory('fileParser', function($http){
    return {
      parseBooks: function(book, fileName) {
        var bookObj = {};
        var title = /(?:<title>)((?:.(?!<\/\1>))+.)(?:<\/title>)/;
        var tagRemoval = book.replace(/(<([^>]+)>)/ig, "");
        bookObj.fileName = fileName;
        bookObj.title = book.match(title)[1];
        bookObj.content = tagRemoval;

        return bookObj;
      }
    };
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
