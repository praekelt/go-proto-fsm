describe('goCampaignDesigner', function () {
    var element, scope;

    beforeEach(module('uuid'));
    beforeEach(module('colorpicker.module'));
    beforeEach(module('ui.bootstrap'));
    beforeEach(module('vumigo.services'));
    beforeEach(module('vumigo.directives'));
    beforeEach(module('vumigo.templates'));

    beforeEach(inject(function ($rootScope, $compile) {
        element = angular.element(
            '<go-campaign-designer data-data="data" data-reset="reset()">' +
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

        scope.reset = function () {
            scope.data.conversations = [];
            scope.data.channels = [];
            scope.data.routers = [];
            scope.data.routing_entries = [];
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

    it('should have drawn layers', function () {
        var svg = element.find('svg');
        expect(element.find('g.layer.connections')).to.have.length(1);
        expect(element.find('g.layer.components')).to.have.length(1);
    });

    it('should have drawn conversations', function () {
        var conversations = element.find('g.layer.components g.conversation');
        expect(conversations).to.have.length(2);
    });

    it('should have drawn router', function () {
        var routers = element.find('g.layer.components g.router');
        expect(routers).to.have.length(1);
    });

    it('should have drawn channels', function () {
        var channels = element.find('g.layer.components g.channel');
        expect(channels).to.have.length(2);
    });

    it('should have drawn connections and control points', function () {
        var connections = element.find('g.layer.connections path.connection');
        expect(connections).to.have.length(1);

        var controlPoints = element.find('g.layer.connections g.control-point');
        expect(controlPoints).to.have.length(5);
    });

    it('should allow component to be selected', function () {
        var isolateScope = element.isolateScope();

        var component = element.find('.component.conversation').eq(0);
        var datum = component.get(0).__data__;

        expect(isolateScope.selectedComponentId).to.equal(null);
        expect(isolateScope.componentSelected).to.equal(false);
        expect(datum._meta.selected).to.be.undefined;

        component.d3().simulate('dragstart');
        expect(isolateScope.selectedComponentId).to.equal(datum.uuid);
        expect(isolateScope.componentSelected).to.equal(true);
        expect(datum._meta.selected).to.equal(true);
    });

    it('should allow components to be connected', function () {
        var isolateScope = element.isolateScope();

        expect(isolateScope.selectedComponentId).to.equal(null);
        expect(isolateScope.componentSelected).to.equal(false);
        expect(isolateScope.connectPressed).to.equal(false);
        expect(element.find('path.connection')).to.have.length(1);

        var conversation = element.find('.conversation').eq(0);
        var channel = element.find('.channel').eq(0);

        conversation.d3().simulate('dragstart');
        element.find('.btn-connect').click();
        expect(isolateScope.connectPressed).to.equal(true);
        channel.d3().simulate('dragstart');

        var datum = channel.get(0).__data__;
        expect(isolateScope.selectedComponentId).to.equal(datum.uuid);
        expect(isolateScope.componentSelected).to.equal(true);
        expect(isolateScope.connectPressed).to.equal(false);
        expect(element.find('path.connection')).to.have.length(2);
    });

    it('should not allow components to connect to themselves', function () {
        var isolateScope = element.isolateScope();

        expect(isolateScope.selectedComponentId).to.equal(null);
        expect(isolateScope.componentSelected).to.equal(false);
        expect(isolateScope.connectPressed).to.equal(false);
        expect(element.find('path.connection')).to.have.length(1);

        var conversation = element.find('.conversation').eq(0);
        var datum = conversation.get(0).__data__;

        conversation.d3().simulate('dragstart');
        element.find('.btn-connect').click();
        expect(isolateScope.connectPressed).to.equal(true);
        conversation.d3().simulate('dragstart');

        expect(isolateScope.selectedComponentId).to.equal(datum.uuid);
        expect(isolateScope.componentSelected).to.equal(true);
        expect(isolateScope.connectPressed).to.equal(true);
        expect(element.find('path.connection')).to.have.length(1);
    });

    it('should not allow components of the same type to connect', function () {
        var isolateScope = element.isolateScope();

        expect(isolateScope.selectedComponentId).to.equal(null);
        expect(isolateScope.componentSelected).to.equal(false);
        expect(isolateScope.connectPressed).to.equal(false);
        expect(element.find('path.connection')).to.have.length(1);

        var conversation1 = element.find('.conversation').eq(0);
        var conversation2 = element.find('.conversation').eq(1);
        var datum = conversation2.get(0).__data__;

        conversation1.d3().simulate('dragstart');
        element.find('.btn-connect').click();
        expect(isolateScope.connectPressed).to.equal(true);
        conversation2.d3().simulate('dragstart');

        expect(isolateScope.selectedComponentId).to.equal(datum.uuid);
        expect(isolateScope.componentSelected).to.equal(true);
        expect(isolateScope.connectPressed).to.equal(false);
        expect(element.find('path.connection')).to.have.length(1);
    });

    it('should have drawn the toolbar', function () {
        expect(element.find('.nav .btn-new')).to.have.length(1);
        expect(element.find('.nav .btn-add')).to.have.length(1);
        expect(element.find('.nav .btn-add-conversation')).to.have.length(1);
        expect(element.find('.nav .btn-add-router')).to.have.length(1);
        expect(element.find('.nav .btn-add-channel')).to.have.length(1);
        expect(element.find('.nav .btn-remove')).to.have.length(1);
        expect(element.find('.nav .btn-connect')).to.have.length(1);
        expect(element.find('.nav .btn-zoom-in')).to.have.length(1);
        expect(element.find('.nav .btn-zoom-out')).to.have.length(1);
    });

    it('new button should clear canvas', function () {
        element.find('.nav .btn-new').eq(0).click();
        expect(element.find('.conversation')).to.have.length(0);
        expect(element.find('.router')).to.have.length(0);
        expect(element.find('.channel')).to.have.length(0);
        expect(element.find('.connection')).to.have.length(0);
    });
});
