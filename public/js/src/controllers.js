var controllers = angular.module('vumigo.controllers', []);

controllers.controller('CampaignMakerController', ['$scope',
    function ($scope) {
        $scope.data = {
            conversations: [
                {x: 200, y: 200, name: "My cool app"},
                {x: 500, y: 500, name: "Some other app"},
            ]
        };
    }
]);
