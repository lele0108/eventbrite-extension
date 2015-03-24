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
eventBriteApp.controller('mainController', function($scope, $location) {
       $scope.back = function() {
            if ($location.path() == '/search') {
                $location.path('/');
            } else if ($location.path() == '/details') {
                $location.path('/search')
            }
       }
});

//controller for home page of app (search page)
eventBriteApp.controller('homeController', function($scope, $location, dataService, localStore) {
        //when user submits something in text box
        localStore.delete('cache');
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
            deferred.reject("There was an error in calling Wit.ai");
        });
        return deferred.promise;
    }
});

eventBriteApp.service('localStore', function() {

    this.store = function(key, value) {
        var storeThis = JSON.stringify(value);
        localStorage.setItem(key, storeThis);
    }

    this.retrieve = function(key) {
        var storedString = localStorage.getItem(key);
        if (storedString) {
            return JSON.parse(storedString);
        } else {
            return null;
        }
    }

    this.delete = function(key) {
        localStorage.removeItem(key);
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
            deferred.reject("There was an error calling EventBrite");
        });
        return deferred.promise;
    }

    this.setHeaders = function(headers) {
        if (headers.search_query)
            _headers.q = headers.search_query[0].value;
        if (headers.location)
            _headers["location.address"] = headers.location[0].value;
        if (headers.datetime && headers.datetime[0].type == 'interval') { //if date is in a interval format
            _headers["start_date.range_start"] = headers.datetime[0].from.value.substring(0, 19) + 'Z';
            _headers["start_date.range_end"] = headers.datetime[0].to.value.substring(0, 19) + 'Z';
        } else if (headers.datetime && headers.datetime[0].type == 'value' && headers.datetime[0].grain == 'day') { //if date is in a single day format
            _headers["start_date.range_start"] = headers.datetime[0].value.substring(0, 19) + 'Z';
            _headers["start_date.range_end"] = headers.datetime[0].value.substring(0, 11) + '23:59:59Z'
        } else if (headers.datetime && headers.datetime[0].type == 'value' && headers.datetime[0].grain == 'month') {// if date is in a single month format
            _headers["start_date.range_start"] = headers.datetime[0].value.substring(0, 19) + 'Z';
        }
    }
});

//Controller for calling EventBrite API and displaying it on results page
eventBriteApp.controller('searchController', function($scope, dataService, eventBriteAPI, witAPI, localStore) {
        $scope.events = {}; //variable for storing events
        $scope.NLPQuery = {};
        $scope.notify = 'Loading...';

        if (localStore.retrieve('cache')) {
            $scope.events = localStore.retrieve('cache');
            console.log($scope.events);
            $scope.notify = null;
        } else {
            $scope.query = dataService.getProperty();
            witAPI.setQuery($scope.query);
            witAPI.callWit()
                .then(function(result){ //wait for API to finish and return promise
                    $scope.NLPQuery = result.outcomes[0].entities;
                    eventBriteAPI.setHeaders(result.outcomes[0].entities);
                    eventBriteAPI.callEB() //call the API to retrieve data
                        .then(function(result){ //wait for API to finish and return promise
                            $scope.events = result;
                            if ($scope.events.length < 1) {
                                $scope.notify = 'No events found at this time';
                            } else {
                                localStore.store('cache', result); //cache the results if user wants to back to this page
                                $scope.notify = null;
                            }
                            console.log(result);
                        }, function(error){
                            console.log(error);
                            $scope.notify = 'Please fill in missing fields';
                    });
              }, function(error){
                console.log(error);
            });
        }

        $scope.alert = function(index){ //when event is clicked in view, save the event Data in dataService
            dataService.setProperty($scope.events[index]);
        };

        $scope.submit = function() {
            localStore.delete('key');
            $scope.notify = 'Loading...';
            eventBriteAPI.setHeaders($scope.NLPQuery);
            eventBriteAPI.callEB() //call the API to retrieve data
                    .then(function(result){ //wait for API to finish and return promise
                        $scope.events = result;
                        if ($scope.events.length < 1) {
                            $scope.notify = 'No events found at this time';
                        } else {
                            localStore.store('cache', result);
                            $scope.notify = null;
                        }
                        console.log(result);
                    }, function(error){
                        s(error);
                        $scope.notify = 'Error';
            });
        }
});

//Controller for displaying information on the event details view
eventBriteApp.controller('detailsController', function($scope, $routeParams, dataService) {
        //Getting the event details from the Angular service saved from searchController
        $scope.event = dataService.getProperty();
});