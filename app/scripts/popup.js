'use strict';

console.log('\'Allo \'Allo! Popup');

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

eventBriteApp.controller('mainController', function($scope) {
        // create a message to display in our view
        $scope.message = 'This is me testing routing!';
});

eventBriteApp.controller('homeController', function($scope, $location) {
        // create a message to display in our view
        $scope.message = 'Search Bar would go here';
        $scope.submit = function() {
        	console.log("hello");
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

eventBriteApp.controller('searchController', function($scope, $routeParams, $http, dataService) {
        // create a message to display in our view
        $scope.message = 'Search results are now being displayed';
        $scope.events = {}; //variable for storing events
        //GET request for EventBrite
        var config = {
            q:'hackathon', 
            "location.address":'San Francisco', 
            "location.within":"15mi", 
            "start_date.range_start":'2015-03-20T21:18:02Z', 
            "start_date.range_end":'2015-03-31T21:18:07Z', 
            token:'IOTP7KEXPCDAJTKKPTJB',
        };
        $http.get('https://www.eventbriteapi.com/v3/events/search/', {params: config}).
          success(function(data, status, headers, config) {
            $scope.events = data.events;
            console.log($scope.events);
          }).
          error(function(data, status, headers, config) {
            console.log(data);
            // called asynchronously if an error occurs
            // or server returns response with an error status.
        });
        $scope.alert = function(index){
            dataService.setProperty($scope.events[index]);
        };
});

eventBriteApp.controller('detailsController', function($scope, $routeParams, dataService) {
        // create a message to display in our view
        $scope.message = 'More details about the event displayed here';
        //Getting the event details from the Angular service saved from searchController
        $scope.event = dataService.getProperty();
        console.log($scope.event);
});