var app = angular.module('vumigo', [
    'uuid',
    'colorpicker.module',
    'ngRoute',
    'ui.bootstrap',
    'vumigo.services',
    'vumigo.controllers',
    'vumigo.directives'
]);

app.config(['$routeProvider', '$httpProvider', '$locationProvider',
    function($routeProvider, $httpProvider, $locationProvider) {
        $routeProvider.when('/', {
            templateUrl: '/templates/campaign_maker.html',
            controller: 'CampaignMakerController'
        }).otherwise({
            redirectTo: '/'
        });
        $locationProvider.html5Mode(true).hashPrefix('!');
    }

]).run(['$rootScope',
    function ($rootScope) {
    }
]);
