(function() {
  'use strict';

  angular.module('wordFinder', [])
  .controller('mainController', function($scope, $q, $http, myServices, myFactory, $sce) {
    var files = [];
    var userSearch = [];

    $scope.getWord = getWord;
    $scope.highlight = highlight;

    resetSearch();
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
          var book = myFactory.parseBooks(response[0], response[1]);
          files.push(book);
        }, epicFail);
      }
    }

    function getWord() {
      $scope.loading = true;
      $scope.books = [];
      userSearch = [];
      var word = $scope.word.toLowerCase();

      myServices.getSyns(word).then(function successHandler(response) {
        $scope.loading = false;
        if ($scope.searchBy === "word") {
          userSearch.push(word);
          getResults();

        } else if ($scope.searchBy === "synonym") {
          if (response && response.noun.syn) {
            userSearch = response.noun.syn;
            getResults();
          }
        }
      }, epicFail);
    }

    function getResults() {
      $scope.books = JSON.parse(myFactory.searchWord(files, userSearch));
      resetSearch();
    }

    function resetSearch() {
      $scope.searchBy = "word";
      $scope.word = null;
    }

    function highlight(text) {
      var words = userSearch.join("|"),
      re = " ("+words+") ";
      return $sce.trustAsHtml(text.replace(new RegExp(re, 'gi'), '<span class="highlighted">$&</span>'));
    }

    function epicFail(response) {
      $scope.loading = false;
      console.error(response);
    }

  })
  .factory('myFactory', function($http){
    return {
      parseBooks: function(book, fileName) {
        var bookObj = {},
        title = /(?:<title>)((?:.(?!<\/\1>))+.)(?:<\/title>)/,
        tagRemoval = book.replace(/(<([^>]+)>)/ig, "");

        bookObj.fileName = fileName || "";
        book.match(title) ? bookObj.title = book.match(title)[1] : bookObj.title = "No title found";
        bookObj.content = tagRemoval.toLowerCase() || "";

        return bookObj;
      },
      searchWord: function(books, words) {
        console.time('search time');
        var matchedItems = [],
        words = words.join("|"),
        matcher = "\\b[^.]{1,60} ("+words+") [^.]{1,60}\\b",
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
        var json = JSON.stringify(matchedItems)
        console.timeEnd('search time');

        return json;
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
