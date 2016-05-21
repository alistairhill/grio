(function() {
  'use strict';

  angular.module('wordFinder', [])
  .controller('mainController', function($scope, $q, $http, myServices, fileParser, $sce) {
    var files = [];

    $scope.word = null;
    $scope.getWord = getWord;
    $scope.highlight = highlight;
    $scope.loading = false;

    getFileNames();

    function getFileNames() {
      $http.get("../grio/data/")
      .success(function (response) {
        var fileNames = response.match(/(href=")([a-z])([0-9]*)(.html)/g);
        fileLoader(fileNames);
      })
    }

    function fileLoader(fileNames) {
      for (var i = 0; i < fileNames.length; i++) {
        var fileName = fileNames[i].replace(/href="/, "")
        myServices.getFiles(fileName).then(function successHandler(response) {
          var book = fileParser.parseBooks(response[0], response[1]);
          files.push(book);
        }, epicFail);
      }
    }

    function getWord() {
      $scope.books = [];
      $scope.loading = true;
      var word = $scope.word.toLowerCase();
      if (word.length > 2) {
        myServices.getSyns(word).then(function successHandler(response) {
          $scope.loading = false;
          if (response.noun.syn) {
            $scope.synonyms = response.noun.syn;
          }
          $scope.synonyms.push(word);
          $scope.books = fileParser.searchWord(files, $scope.synonyms);

        }, epicFail);
      }
    }

    function highlight(text) {
      var syns = $scope.synonyms.join("|");
      return $sce.trustAsHtml(text.replace(new RegExp(syns, 'gi'), '<span class="highlighted">$&</span>'));
    }

    function epicFail(response) {
      console.error(response);
    }

  })
  .factory('fileParser', function($http){
    return {
      parseBooks: function(book, fileName) {
        var bookObj = {};
        var title = /(?:<title>)((?:.(?!<\/\1>))+.)(?:<\/title>)/;
        var tagRemoval = book.replace(/(<([^>]+)>)/ig, "");
        bookObj.fileName = fileName || "";
        book.match(title) ? bookObj.title = book.match(title)[1] : bookObj.title = "No title found";
        bookObj.content = tagRemoval.toLowerCase() || "";

        return bookObj;
      },
      searchWord: function(books, words) {
        var matchedItems = [],
        words = words.join("|"),
        matcher = "[^.]{1,60} ("+words+") [^.]{1,60}",
        re = new RegExp(matcher, "g");

        for (var i = 0; i < books.length; i++) {
          if (books[i].content.match(re) !== null) {
            var matchedObj = {};
            matchedObj.file = books[i].fileName;
            matchedObj.title = books[i].title;
            matchedObj.matches = books[i].content.match(re);
            matchedItems.push(matchedObj);
          }
        }
        return matchedItems;
      }
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

    this.getSyns = function(word) {
      var deferred = $q.defer(),
      apiKey = "2f79fef34b3bda9918801e189a4006fb/",
      word = word + "/json";
      var config = {
        method: 'get',
        url: "http://words.bighugelabs.com/api/2/" + apiKey + word
      };
      $http(config)
        .success(function(data) {
          deferred.resolve(data);
        }).error(function(data) {
          deferred.reject(data);
        });
      return deferred.promise;
    };
  });
})();
