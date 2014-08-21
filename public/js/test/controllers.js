describe('CampaignMakerController', function () {
    var scope, controller;

    beforeEach(module('vumigo.controllers'));

    beforeEach(inject(function ($controller, $location) {
        scope = {};
        controller = $controller('CampaignMakerController', {$scope: scope});
    }));

    it('should have some data', function () {
        expect(scope.data).to.not.be.empty;
    });

    it('should have reset the data', function () {
        scope.reset();
        var expected = {
            conversations: [],
            channels: [],
            routers: [],
            routing_entries: []
        };
        expect(scope.data).to.deep.equal(expected);
    });
});
