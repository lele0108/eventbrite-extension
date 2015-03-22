'use strict';

var eventBriteApp = angular.module('eventBrite', ['ngRoute']);

eventBriteApp.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/', {
                templateUrl : 'views/home.html',
                controller  : 'homeController'
            })

            .when('/search', {
                templateUrl : 'views/search.html',
                controller  : 'searchController'
            })

            .when('/details', {
                templateUrl : 'views/details.html',
                controller  : 'detailsController'
            });
});

//controller has control over whole app
eventBriteApp.controller('mainController', function($scope) {
       
});

//controller for home page of app (search page)
eventBriteApp.controller('homeController', function($scope, $location, dataService) {
        //when user submits something in text box
        $scope.submit = function(query) {
        	$scope.query = angular.copy(query);
            dataService.setProperty($scope.query);
        	$location.path('/search');
        };
});

//Angular service to save information between controllers for better resource and performance
eventBriteApp.service('dataService', function () {
        var property = 'First';

        return {
            getProperty: function () {
                return property;
            },
            setProperty: function(value) {
                property = value;
            }
        };
});

eventBriteApp.service('witAPI', function($http, $q) {
    var _headers = {
        access_token: 'XQNVSHYZYPJS6MNA5T7R7UZOLCLUXUMU',
        callback: 'JSON_CALLBACK'
    };

    this.setQuery = function(query) {
        _headers.q = query;
    }

    this.callWit = function() {
        var deferred = $q.defer();
        $http.jsonp('https://api.wit.ai/message', {params: _headers}). //API request sent to EventBrite
          success(function(data, status, headers, config) {
            deferred.resolve(data);
          }).
          error(function(data, status, headers, config) {
            deferred.resolve("There was an error in calling Wit.ai");
        });
        return deferred.promise;
    }
});

//service used for calling the EventBriteAPI, returns a promise when finished
eventBriteApp.service('eventBriteAPI', function($http, $q) {
    var _headers = {
        token:'IOTP7KEXPCDAJTKKPTJB',
        "location.within":"15mi"
    };

    this.callEB = function() {
        var deferred = $q.defer();
        $http.get('https://www.eventbriteapi.com/v3/events/search/', {params: _headers}). //API request sent to EventBrite
          success(function(data, status, headers, config) {
            deferred.resolve(data.events);
          }).
          error(function(data, status, headers, config) {
            deferred.resolve("There was an error calling EventBrite");
        });
        return deferred.promise;
    }

    this.setHeaders = function(headers) {
        _headers.q = headers.search_query;
        _headers["location.address"] = headers.location;
        if (headers.datetime.type == 'interval') {
            _headers["start_date.range_start"] = headers.datetime.from;
            _headers["start_date.range_end"] = headers.datetime.to;
        }
    }
});

//Controller for calling EventBrite API and displaying it on results page
eventBriteApp.controller('searchController', function($scope, dataService, eventBriteAPI, witAPI) {
        /*var config = { //Header for API request sent to EventBrite
            q:'hackathon', 
            "location.address":'San Francisco',
            "start_date.range_start":'2015-03-20T21:18:02Z', 
            "start_date.range_end":'2015-03-31T21:18:07Z', 
        };*/
        $scope.query = dataService.getProperty();
        $scope.events = {}; //variable for storing events

        witAPI.setQuery($scope.query);
        witAPI.callWit()
            .then(function(result){ //wait for API to finish and return promise
                console.log(result);
                eventBriteAPI.setHeaders(result.outcomes[0].entities);
                eventBriteAPI.callEB() //call the API to retrieve data
                    .then(function(result){ //wait for API to finish and return promise
                        $scope.events = result 
                  }, function(error){
                    console.log(error);
                });
          }, function(error){
            console.log(error);
        });

        $scope.alert = function(index){ //when event is clicked in view, save the event Data in dataService
            dataService.setProperty($scope.events[index]);
        };
});

//Controller for displaying information on the event details view
eventBriteApp.controller('detailsController', function($scope, $routeParams, dataService) {
        //Getting the event details from the Angular service saved from searchController
        $scope.event = dataService.getProperty();
        console.log($scope.event);
});