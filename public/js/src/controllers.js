var controllers = angular.module('vumigo.controllers', []);

controllers.controller('CampaignMakerController', ['$scope',
    function ($scope) {
        $scope.data = {
            conversations: [
                {name: "Register", description: "4 Steps", colour: '#f82943', x: 200, y: 200},
                {name: "Survey", description: "4 Questions", colour: '#fbcf3b', x: 500, y: 500},
            ]
        };
    }
]);
