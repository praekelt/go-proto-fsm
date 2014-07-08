describe('goCampaignDesigner', function () {
    var element, scope;

    beforeEach(module('vumigo.services'));
    beforeEach(module('vumigo.directives'));
    beforeEach(module('vumigo.templates'));

    beforeEach(inject(function ($rootScope, $compile) {
        element = angular.element(
            '<go-campaign-designer data-data="data">' +
            '</go-campaign-designer>');

        scope = $rootScope;
        scope.data = {
            conversations: [{
                uuid: 'conversation1',
                name: "Register",
                description: "4 Steps",
                endpoints: [{uuid: 'endpoint1', name: 'default'}],
                colour: '#f82943',
                x: 220,
                y: 120
            }, {
                uuid: 'conversation2',
                name: "Survey",
                description: "4 Questions",
                endpoints: [{uuid: 'endpoint2', name: 'default'}],
                colour: '#fbcf3b',
                x: 220,
                y: 340
            }],
            channels: [{
                uuid: 'channel1',
                name: "SMS",
                description: "082 335 29 24",
                endpoints: [{uuid: 'endpoint3', name: 'default'}],
                utilization: 0.4,
                x: 840,
                y: 360
            }, {
                uuid: 'channel2',
                name: "USSD",
                description: "*120*10001#",
                endpoints: [{uuid: 'endpoint4', name: 'default'}],
                utilization: 0.9,
                x: 840,
                y: 140
            }],
            routers: [{
                uuid: 'router1',
                name: "K",
                description: "Keyword",
                channel_endpoints: [{uuid: 'endpoint5', name: 'default'}],
                conversation_endpoints: [{
                    uuid: 'endpoint6',
                    name: 'default'
                }, {
                    uuid: 'endpoint7',
                    name: 'default'
                }],
                x: 500,
                y: 220
            }],
            routing_entries: [{
                source: {uuid: 'endpoint1'},
                target: {uuid: 'endpoint6'}
            }]
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
