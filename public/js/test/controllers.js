describe('CampaignMakerController', function () {
    var scope, controller;

    beforeEach(module('vumigo.controllers'));

    beforeEach(inject(function ($controller, $location) {
        scope = {};
        controller = $controller('CampaignMakerController', {$scope: scope});
    }));

    it ('should have some data', function () {
        expect(scope.data).to.not.be.empty;
    });
});
