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
            });
    });

eventBriteApp.controller('mainController', function($scope) {
        // create a message to display in our view
        $scope.message = 'This is me testing routing!';
});

eventBriteApp.controller('homeController', function($scope) {
        // create a message to display in our view
        $scope.message = 'Search Bar would go here';
});

eventBriteApp.controller('searchController', function($scope) {
        // create a message to display in our view
        $scope.message = 'Search results are now being displayed';
});