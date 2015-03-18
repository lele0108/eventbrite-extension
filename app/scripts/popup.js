'use strict';

console.log('\'Allo \'Allo! Popup');

var eventBriteApp = angular.module('eventBrite', ['ngRoute']);

eventBriteApp.config(function($routeProvider) {
        $routeProvider

            // route for the home page
            .when('/', {
                templateUrl : 'pages/home.html',
                controller  : 'mainController'
            });
    });

eventBriteApp.controller('mainController', function($scope) {
        // create a message to display in our view
        $scope.message = 'This is me testing routing!';
});