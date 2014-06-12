describe('goCampaignDesigner', function () {
    var element, scope;

    beforeEach(module('vumigo.directives'));

    beforeEach(inject(function ($rootScope, $compile) {
        element = angular.element('<go-campaign-designer></go-campaign-designer>');
        scope = $rootScope;
        $compile(element)(scope);
        scope.$digest();
    }));

    it('should create element with id campaign-designer', function () {
        expect(element.attr('id')).to.equal('campaign-designer');
    });
});
