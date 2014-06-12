describe('CampaignMakerController', function () {
    var scope, controller;

    beforeEach(module('vumigo.controllers'));

    beforeEach(inject(function ($controller, $location) {
        scope = {};
        controller = $controller('CampaignMakerController', {$scope: scope});
    }));

    it ('should have no data', function () {
        expect(scope.data).to.be.empty;
    });
});
