describe('goCampaignDesigner', function () {
    var element, scope;

    beforeEach(module('vumigo.services'));
    beforeEach(module('vumigo.directives'));

    beforeEach(inject(function ($rootScope, $compile) {
        element = angular.element(
            '<go-campaign-designer data-data="data">' +
            '</go-campaign-designer>');

        scope = $rootScope;
        scope.data = {
            conversations: [
                { name: "Conversation 1", description: "Test conversation", x: 100, y: 100 },
                { name: "Conversation 2", description: "Test conversation", x: 200, y: 200 }
            ],
            channels: [
                { name: "Channel 1", description: "Test channel", utilization: 0.4, x: 840, y: 360 },
                { name: "Channel 2", description: "Test channel", utilization: 0.9, x: 840, y: 140 }
            ],
            routers: [
                {
                    name: "A",
                    x: 500,
                    y: 220,
                    pins: [
                        { name: "Pin 1" },
                        { name: "Pin 2" },
                        { name: "Pin 3" }
                    ]
                }
            ]
        };
        $compile(element)(scope);
        scope.$digest();
    }));

    it('should have created element with id campaign-designer', function () {
        expect(element.attr('id')).to.equal('campaign-designer');
    });

    it('should have used default canvas parameters', function () {
        var svg = element.find('svg');

        expect(svg.eq(0).attr('width')).to.equal('2060');
        expect(svg.eq(0).attr('height')).to.equal('2060');
    });

    it('should have drawn conversations', function () {
        var conversations = element.find('g.conversation');
        expect(conversations).to.have.length(2);
    });

    it('should have drawn router', function () {
        var routers = element.find('g.router');
        expect(routers).to.have.length(1);
    });

    it('should have drawn channels', function () {
        var channels = element.find('g.channel');
        expect(channels).to.have.length(2);
    });

});
