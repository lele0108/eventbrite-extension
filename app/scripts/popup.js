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
eventBriteApp.controller('homeController', function($scope, $location) {
        //when user submits something in text box
        $scope.submit = function(query) {
        	$scope.query = angular.copy(query);
            console.log($scope.query);
        	$location.path('/search');
        };
});

//Angular service to save Event information between controllers for better resource and performance
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

});

eventBriteApp.service('eventBriteAPI', function($http, $q) {
    var _headers = {};

    this.callEB = function() {
        var deferred = $q.defer();
        $http.get('https://www.eventbriteapi.com/v3/events/search/', {params: _headers}). //API request sent to EventBrite
          success(function(data, status, headers, config) {
            deferred.resolve(data.events);
          }).
          error(function(data, status, headers, config) {
            deferred.resolve("There was an error");
        });
        return deferred.promise;
    }

    this.setHeaders = function(headers) {
        _headers = headers;
    }
});

//Controller for calling EventBrite API and displaying it on results page
eventBriteApp.controller('searchController', function($scope, dataService, eventBriteAPI) {
        $scope.events = {}; //variable for storing events
        //GET request for EventBrite
        var config = { //Header for API request sent to EventBrite
            q:'hackathon', 
            "location.address":'San Francisco', 
            "location.within":"15mi", 
            "start_date.range_start":'2015-03-20T21:18:02Z', 
            "start_date.range_end":'2015-03-31T21:18:07Z', 
            token:'IOTP7KEXPCDAJTKKPTJB',
        };

        eventBriteAPI.setHeaders(config);
        eventBriteAPI.callEB()
            .then(function(result){
                $scope.events = result
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