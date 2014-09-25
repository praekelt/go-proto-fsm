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

    afterEach(function () {
        // Clean up DOM
        $('div#campaign-designer').remove();
        $('div#modal-backdrop, div.modal').remove();
    });

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

    it('should allow component to be selected and deselected', function () {
        var isolateScope = element.isolateScope();

        var component = element.find('.component.conversation').eq(0);
        var datum = component.get(0).__data__;

        expect(isolateScope.selectedComponentId).to.equal(null);
        expect(datum.meta().selected).to.be.undefined;

        component.d3().simulate('dragstart');
        expect(isolateScope.selectedComponentId).to.equal(datum.id);
        expect(datum.meta().selected).to.equal(true);

        element.find('.container').d3().simulate('mousedown');
        expect(isolateScope.selectedComponentId).to.equal(null);
        expect(datum.meta().selected).to.equal(false);
    });

    it('should allow components to be connected', function () {
        var isolateScope = element.isolateScope();

        expect(isolateScope.selectedComponentId).to.equal(null);
        expect(isolateScope.connectPressed).to.equal(false);
        expect(element.find('path.connection')).to.have.length(1);

        var conversation = element.find('.conversation').eq(1);
        var channel = element.find('.channel').eq(0);

        conversation.d3().simulate('dragstart');
        element.find('.btn-connect').click();
        element.find('.menu.active > .menu-item:nth-child(2)').d3().simulate('mousedown');

        expect(isolateScope.connectPressed).to.equal(true);
        channel.d3().simulate('dragstart');

        var datum = channel.get(0).__data__;
        expect(isolateScope.selectedComponentId).to.equal(datum.id);
        expect(isolateScope.connectPressed).to.equal(false);
        expect(element.find('path.connection')).to.have.length(2);
    });

    it('should not allow components to connect to themselves', function () {
        var isolateScope = element.isolateScope();

        expect(isolateScope.selectedComponentId).to.equal(null);
        expect(isolateScope.connectPressed).to.equal(false);
        expect(element.find('path.connection')).to.have.length(1);

        var conversation = element.find('.conversation').eq(0);
        var datum = conversation.get(0).__data__;

        conversation.d3().simulate('dragstart');
        element.find('.menu.active > .menu-item:nth-child(2)').d3().simulate('mousedown');
        expect(isolateScope.connectPressed).to.equal(true);
        conversation.d3().simulate('dragstart');

        expect(isolateScope.selectedComponentId).to.equal(datum.id);
        expect(isolateScope.connectPressed).to.equal(true);
        expect(element.find('path.connection')).to.have.length(1);
    });

    it('should not allow components of the same type to connect', function () {
        var isolateScope = element.isolateScope();

        expect(isolateScope.selectedComponentId).to.equal(null);
        expect(isolateScope.connectPressed).to.equal(false);
        expect(element.find('path.connection')).to.have.length(1);

        var conversation1 = element.find('.conversation').eq(0);
        var conversation2 = element.find('.conversation').eq(1);
        var datum = conversation2.get(0).__data__;

        conversation1.d3().simulate('dragstart');
        element.find('.menu.active > .menu-item:nth-child(2)').d3().simulate('mousedown');
        expect(isolateScope.connectPressed).to.equal(true);
        conversation2.d3().simulate('dragstart');

        expect(isolateScope.selectedComponentId).to.equal(datum.id);
        expect(isolateScope.connectPressed).to.equal(false);
        expect(element.find('path.connection')).to.have.length(1);
    });

    it('should have drawn the toolbar', function () {
        expect(element.find('.nav .btn-new')).to.have.length(1);
        expect(element.find('.nav .btn-add')).to.have.length(1);
        expect(element.find('.nav .btn-add-conversation')).to.have.length(1);
        expect(element.find('.nav .btn-add-router')).to.have.length(1);
        expect(element.find('.nav .btn-add-channel')).to.have.length(1);
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

    it('should open conversation add dialog', inject(function () {
        angular.element(document.body).append(element);  // attach element to DOM

        expect($('.modal-dialog')).to.have.length(0);

        element.find('.nav .btn-add-conversation').click();  // open modal

        var $modal = $('.modal-dialog');
        expect($modal).to.have.length(1);

        var $nameField = $modal.find('input#field-name');
        expect($nameField).to.have.length(1);
        expect($nameField.attr('data-ng-model')).to.equal('data.name');

        var $descriptionField = $modal.find('textarea#field-description');
        expect($descriptionField).to.have.length(1);
        expect($descriptionField.attr('data-ng-model')).to.equal('data.description');

        var $colourField = $modal.find('input#field-colour');
        expect($colourField).to.have.length(1);
        expect($colourField.attr('data-ng-model')).to.equal('data.colour');

        var $okButton = $modal.find('button.btn-primary');
        expect($okButton).to.have.length(1);
        expect($okButton.text()).to.equal("OK");
        expect($okButton.attr('data-ng-click')).to.equal('$close(data)');

        var $cancelButton = $modal.find('button.btn-warning');
        expect($cancelButton).to.have.length(1);
        expect($cancelButton.text()).to.equal("Cancel");
        expect($cancelButton.attr('data-ng-click')).to.equal("$dismiss('cancel')");
    }));

    it('should add new conversation', inject(function (rfc4122, Endpoint) {
        angular.element(document.body).append(element);  // attach element to DOM

        var stub = sinon.stub(rfc4122, 'v4');
        stub.onCall(0).returns('conversation3');
        stub.onCall(1).returns('endpoint8');

        element.find('.nav .btn-add-conversation').click();  // open modal

        var $nameField = $('.modal-dialog').find('input#field-name');
        $nameField.scope().data.name = "Conversation 3";

        var $descriptionField = $('.modal-dialog').find('textarea#field-description');
        $descriptionField.scope().data.description = "Test conversation";

        var $colourField = $('.modal-dialog').find('input#field-colour');
        $colourField.scope().data.colour = "#000000";

        $('.modal-dialog').find('button.btn-primary').click();  // click OK
        element.find('.container').d3().simulate('mousedown');  // select position on canvas

        var conversations = element.find('g.layer.components g.conversation');
        expect(conversations).to.have.length(3);

        var datum = conversations.get(2).__data__;
        expect(datum.id).to.equal("conversation3");
        expect(datum.name).to.equal("Conversation 3");
        expect(datum.description).to.equal("Test conversation");
        expect(datum.endpoints).to.have.length(1);
        expect(datum.endpoints[0].id).to.equal("endpoint8");
        expect(datum.endpoints[0].name).to.equal("default");
    }));

    it('should open channel add dialog', inject(function () {
        angular.element(document.body).append(element);  // attach element to DOM

        expect($('.modal-dialog')).to.have.length(0);

        element.find('.nav .btn-add-channel').click();  // open modal

        var $modal = $('.modal-dialog');
        expect($modal).to.have.length(1);

        var $nameField = $modal.find('input#field-name');
        expect($nameField).to.have.length(1);
        expect($nameField.attr('data-ng-model')).to.equal('data.name');

        var $descriptionField = $modal.find('textarea#field-description');
        expect($descriptionField).to.have.length(1);
        expect($descriptionField.attr('data-ng-model')).to.equal('data.description');

        var $okButton = $modal.find('button.btn-primary');
        expect($okButton).to.have.length(1);
        expect($okButton.text()).to.equal("OK");
        expect($okButton.attr('data-ng-click')).to.equal('$close(data)');

        var $cancelButton = $modal.find('button.btn-warning');
        expect($cancelButton).to.have.length(1);
        expect($cancelButton.text()).to.equal("Cancel");
        expect($cancelButton.attr('data-ng-click')).to.equal("$dismiss('cancel')");
    }));

    it('should add new channel', inject(function (rfc4122, Endpoint) {
        angular.element(document.body).append(element);  // attach element to DOM

        var stub = sinon.stub(rfc4122, 'v4');
        stub.onCall(0).returns('channel3');
        stub.onCall(1).returns('endpoint8');

        element.find('.nav .btn-add-channel').click();  // open modal

        var $nameField = $('.modal-dialog').find('input#field-name');
        $nameField.scope().data.name = "Channel 3";

        var $descriptionField = $('.modal-dialog').find('textarea#field-description');
        $descriptionField.scope().data.description = "Test channel";

        $('.modal-dialog').find('button.btn-primary').click();  // click OK
        element.find('.container').d3().simulate('mousedown');  // select position on canvas

        var channels = element.find('g.layer.components g.channel');
        expect(channels).to.have.length(3);

        var datum = channels.get(2).__data__;
        expect(datum.id).to.equal("channel3");
        expect(datum.name).to.equal("Channel 3");
        expect(datum.description).to.equal("Test channel");
        expect(datum.endpoints).to.have.length(1);
        expect(datum.endpoints[0].id).to.equal("endpoint8");
        expect(datum.endpoints[0].name).to.equal("default");
    }));

    it('should open router add dialog', inject(function () {
        angular.element(document.body).append(element);  // attach element to DOM

        expect($('.modal-dialog')).to.have.length(0);

        element.find('.nav .btn-add-router').click();  // open modal

        var $modal = $('.modal-dialog');
        expect($modal).to.have.length(1);

        var $nameField = $modal.find('input#field-name');
        expect($nameField).to.have.length(1);
        expect($nameField.attr('data-ng-model')).to.equal('data.name');

        var $endpointField = $modal.find('input#field-endpoint-0');
        expect($endpointField).to.have.length(1);
        expect($endpointField.attr('data-ng-model')).to.equal('endpoint.name');

        var $okButton = $modal.find('button.btn-primary');
        expect($okButton).to.have.length(1);
        expect($okButton.text()).to.equal("OK");
        expect($okButton.attr('data-ng-click')).to.equal('$close(data)');

        var $cancelButton = $modal.find('button.btn-warning');
        expect($cancelButton).to.have.length(1);
        expect($cancelButton.text()).to.equal("Cancel");
        expect($cancelButton.attr('data-ng-click')).to.equal("$dismiss('cancel')");
    }));

    it('should add new router', inject(function (rfc4122, Endpoint) {
        angular.element(document.body).append(element);  // attach element to DOM

        var stub = sinon.stub(rfc4122, 'v4');
        stub.onCall(0).returns('endpoint8');
        stub.onCall(1).returns('router2');
        stub.onCall(2).returns('endpoint9');
        stub.onCall(3).returns('endpoint10');

        element.find('.nav .btn-add-router').click();  // open modal

        var $nameField = $('.modal-dialog').find('input#field-name');
        $nameField.scope().data.name = "Router 2";

        var $endpointField = $('.modal-dialog').find('input#field-endpoint-0');
        $endpointField.scope().data.endpoints = [{
            name: "Keyword 1"
        }];

        $('.modal-dialog').find('button.btn-primary').click();  // click OK
        element.find('.container').d3().simulate('mousedown');  // select position on canvas

        var routers = element.find('g.layer.components g.router');
        expect(routers).to.have.length(2);

        var datum = routers.get(1).__data__;
        expect(datum.id).to.equal("router2");
        expect(datum.name).to.equal("Router 2");
        expect(datum.endpoints).to.have.length(3);
        expect(datum.endpoints[0].id).to.equal("endpoint8");
        expect(datum.endpoints[0].name).to.equal("Keyword 1");
        expect(datum.endpoints[0].accepts).to.deep.equal(['conversation']);
        expect(datum.endpoints[1].id).to.equal("endpoint9");
        expect(datum.endpoints[1].name).to.equal("default");
        expect(datum.endpoints[1].accepts).to.deep.equal(['conversation']);
        expect(datum.endpoints[2].id).to.equal("endpoint10");
        expect(datum.endpoints[2].name).to.equal("default");
        expect(datum.endpoints[2].accepts).to.deep.equal(['channel']);
    }));

});
