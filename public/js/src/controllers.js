var controllers = angular.module('vumigo.controllers', []);

controllers.controller('CampaignMakerController', ['$scope',
    function ($scope) {
        $scope.data = {
            conversations: [
                {name: "Register", description: "4 Steps", colour: '#f82943', x: 220, y: 120},
                {name: "Survey", description: "4 Questions", colour: '#fbcf3b', x: 220, y: 340},
            ],
            channels: [
                {name: "SMS", description: "082 335 29 24", utilization: 0.4, x: 840, y: 360},
                {name: "USSD", description: "*120*10001#", utilization: 0.9, x: 840, y: 140}
            ]
        };
    }
]);
