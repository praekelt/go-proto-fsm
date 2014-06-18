describe('goCampaignDesigner', function () {
    var element, scope;

    beforeEach(module('vumigo.services'));
    beforeEach(module('vumigo.directives'));

    beforeEach(inject(function ($rootScope, $compile) {
        element = angular.element('<go-campaign-designer data-data="data"></go-campaign-designer>');
        scope = $rootScope;
        scope.data = {
            conversations: [
                {x: 100, y: 100, name: "Conversation 1"},
                {x: 200, y: 200, name: "Conversation 2"}
            ]
        };
        $compile(element)(scope);
        scope.$digest();
    }));

    it('should have created element with id campaign-designer', function () {
        expect(element.attr('id')).to.equal('campaign-designer');
    });

    it('should have created svg element', function () {
        expect(element.find('svg')).to.have.length(1);
    });

    it('should have used default parameters', function () {
        var svg = element.find('svg');
        expect(svg.attr('width')).to.equal('2060');
        expect(svg.attr('height')).to.equal('2060');
    });

    it('should have drawn the conversations', function () {
        var canvas = element.find('g.canvas');
        var conversations = canvas.find('g.conversation');
        expect(conversations).to.have.length(2);
        expect(conversations.eq(0).attr('transform')).to.equal('translate(100,100)');
        expect(conversations.eq(1).attr('transform')).to.equal('translate(200,200)');
    });
});
