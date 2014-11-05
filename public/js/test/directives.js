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
            routing_table: {
                version: 'fsm-0.1',
                campaign_id: 'campaign1',
                components: {
                    'conversation1': {
                        type: 'conversation',
                        conversation_type: 'bulk-message',
                        uuid: 'conversation1',
                        name: 'Register',
                        description: '4 Steps',
                        endpoints: {
                            'endpoint1': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint1',
                                name: 'default'
                            }
                        }
                    },
                    'conversation2': {
                        type: 'conversation',
                        conversation_type: 'bulk-message',
                        uuid: 'conversation2',
                        name: 'Survey',
                        description: '4 Questions',
                        endpoints: {
                            'endpoint2': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint2',
                                name: 'default'
                            }
                        }
                    },
                    'channel1': {
                        type: 'channel',
                        uuid: 'channel1',
                        tag: [],
                        name: 'SMS',
                        description: '082 335 29 24',
                        utilization: 0.4,
                        endpoints: {
                            'endpoint3': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint3',
                                name: 'default'
                            }
                        }
                    },
                    'channel2': {
                        type: 'channel',
                        uuid: 'channel2',
                        tag: [],
                        name: 'USSD',
                        description: '*120*10001#',
                        utilization: 0.9,
                        endpoints: {
                            'endpoint4': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint4',
                                name: 'default'
                            }
                        }
                    },
                    'router1': {
                        type: 'router',
                        router_type: 'keyword',
                        uuid: 'router1',
                        name: 'K',
                        description: 'Keyword',
                        endpoints: {
                            'endpoint5': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint5',
                                name: 'default'
                            },
                            'endpoint6': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint6',
                                name: 'default'
                            },
                            'endpoint7': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint7',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {
                    'endpoint1:endpoint6': {
                        source: 'endpoint1',
                        target: 'endpoint6'
                    }
                },
            },
            layout: {
                version: 'fsm-ui-0.1',
                components: {
                    'conversation1': {
                        x: 220,
                        y: 120,
                        colour: '#f82943'
                    },
                    'conversation2': {
                        x: 220,
                        y: 340,
                        colour: '#fbcf3b'
                    },
                    'channel1': {
                        x: 840,
                        y: 360
                    },
                    'channel2': {
                        x: 840,
                        y: 140
                    },
                    'router1': {
                        x: 500,
                        y: 220
                    }
                },
                routing: {
                    'endpoint1:endpoint6': 'connection1',
                },
                connections: {
                    'connection1': {
                        endpoints: {
                            'endpoint1': 'conversation1',
                            'endpoint6': 'router1'
                        },
                        path: [{
                            x: 220,
                            y: 120,
                        }, {
                            x: 500,
                            y: 220
                        }],
                        colour: '#f82943'
                    }
                }
            }
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
        expect(controlPoints).to.have.length(2);
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
        expect($nameField.attr('data-ng-model')).to.equal("property({ name: 'name' })");

        var $descriptionField = $modal.find('textarea#field-description');
        expect($descriptionField).to.have.length(1);
        expect($descriptionField.attr('data-ng-model')).to.equal("property({ name: 'description' })");

        var $colourField = $modal.find('input#field-colour');
        expect($colourField).to.have.length(1);
        expect($colourField.attr('data-ng-model')).to.equal("property({ name: 'colour' })");

        var $okButton = $modal.find('button.btn-primary');
        expect($okButton).to.have.length(1);
        expect($okButton.text()).to.equal("OK");
        expect($okButton.attr('data-ng-click')).to.equal('$close()');

        var $cancelButton = $modal.find('button.btn-warning');
        expect($cancelButton).to.have.length(1);
        expect($cancelButton.text()).to.equal("Cancel");
        expect($cancelButton.attr('data-ng-click')).to.equal("$dismiss('cancel')");
    }));

    it('should add new conversation', inject(function (rfc4122, Endpoint) {
        angular.element(document.body).append(element);  // attach element to DOM

        var stub = sinon.stub(rfc4122, 'v4');
        stub.onCall(0).returns('conversation3');
        stub.onCall(1).returns('menu1');
        stub.onCall(2).returns('menu-item1');
        stub.onCall(3).returns('menu-item2');
        stub.onCall(4).returns('menu-item3');
        stub.onCall(5).returns('endpoint8');

        element.find('.nav .btn-add-conversation').click();  // open modal

        var $nameField = $('.modal-dialog').find('input#field-name');
        $nameField.scope().component.name("Conversation 3");

        var $descriptionField = $('.modal-dialog').find('textarea#field-description');
        $descriptionField.scope().component.description("Test conversation");

        var $colourField = $('.modal-dialog').find('input#field-colour');
        $colourField.scope().component.colour("#000000");

        $('.modal-dialog').find('button.btn-primary').click();  // click OK
        element.find('.container').d3().simulate('mousedown');  // select position on canvas

        var conversations = element.find('g.layer.components g.conversation');
        expect(conversations).to.have.length(3);

        var datum = conversations.get(2).__data__;
        expect(datum.id).to.equal("conversation3");
        expect(datum.name()).to.equal("Conversation 3");
        expect(datum.description()).to.equal("Test conversation");
        expect(datum.endpoints()).to.have.length(1);
        expect(datum.endpoints()[0].id).to.equal("endpoint8");
        expect(datum.endpoints()[0].name()).to.equal("default");
    }));

    it('should edit conversation', inject(function () {
        angular.element(document.body).append(element);  // attach element to DOM

        var conversation = element.find('.conversation').eq(0);
        var datum = conversation.get(0).__data__;
        expect(datum.name()).to.equal("Register");
        expect(datum.description()).to.equal("4 Steps");
        expect(datum.colour()).to.equal("#f82943");

        conversation.d3().simulate('dragstart');
        element.find('.menu.active > .menu-item:nth-child(1)').d3().simulate('mousedown');

        var $nameField = $('.modal-dialog').find('input#field-name');
        $nameField.scope().component.name("Test");

        var $descriptionField = $('.modal-dialog').find('textarea#field-description');
        $descriptionField.scope().component.description("Test conversation");

        var $colourField = $('.modal-dialog').find('input#field-colour');
        $colourField.scope().component.colour("#000000");

        $('.modal-dialog').find('button.btn-primary').click();  // click OK

        expect(datum.name()).to.equal("Test");
        expect(datum.description()).to.equal("Test conversation");
        expect(datum.colour()).to.equal("#000000");
    }));

    it('should open channel add dialog', inject(function () {
        angular.element(document.body).append(element);  // attach element to DOM

        expect($('.modal-dialog')).to.have.length(0);

        element.find('.nav .btn-add-channel').click();  // open modal

        var $modal = $('.modal-dialog');
        expect($modal).to.have.length(1);

        var $nameField = $modal.find('input#field-name');
        expect($nameField).to.have.length(1);
        expect($nameField.attr('data-ng-model')).to.equal("property({ name: 'name'})");

        var $descriptionField = $modal.find('textarea#field-description');
        expect($descriptionField).to.have.length(1);
        expect($descriptionField.attr('data-ng-model')).to.equal("property({ name: 'description'})");

        var $okButton = $modal.find('button.btn-primary');
        expect($okButton).to.have.length(1);
        expect($okButton.text()).to.equal("OK");
        expect($okButton.attr('data-ng-click')).to.equal('$close()');

        var $cancelButton = $modal.find('button.btn-warning');
        expect($cancelButton).to.have.length(1);
        expect($cancelButton.text()).to.equal("Cancel");
        expect($cancelButton.attr('data-ng-click')).to.equal("$dismiss('cancel')");
    }));

    it('should add new channel', inject(function (rfc4122, Endpoint) {
        angular.element(document.body).append(element);  // attach element to DOM

        var stub = sinon.stub(rfc4122, 'v4');
        stub.onCall(0).returns('channel3');
        stub.onCall(1).returns('menu1');
        stub.onCall(2).returns('menu-item1');
        stub.onCall(3).returns('menu-item2');
        stub.onCall(4).returns('menu-item3');
        stub.onCall(5).returns('endpoint8');

        element.find('.nav .btn-add-channel').click();  // open modal

        var $nameField = $('.modal-dialog').find('input#field-name');
        $nameField.scope().component.name("Channel 3");

        var $descriptionField = $('.modal-dialog').find('textarea#field-description');
        $descriptionField.scope().component.description("Test channel");

        $('.modal-dialog').find('button.btn-primary').click();  // click OK
        element.find('.container').d3().simulate('mousedown');  // select position on canvas

        var channels = element.find('g.layer.components g.channel');
        expect(channels).to.have.length(3);

        var datum = channels.get(2).__data__;
        expect(datum.id).to.equal("channel3");
        expect(datum.name()).to.equal("Channel 3");
        expect(datum.description()).to.equal("Test channel");
        expect(datum.endpoints()).to.have.length(1);
        expect(datum.endpoints()[0].id).to.equal("endpoint8");
        expect(datum.endpoints()[0].name()).to.equal("default");
    }));

    it('should edit channel', inject(function () {
        angular.element(document.body).append(element);  // attach element to DOM

        var channel = element.find('.channel').eq(0);
        var datum = channel.get(0).__data__;
        expect(datum.name()).to.equal("SMS");
        expect(datum.description()).to.equal("082 335 29 24");

        channel.d3().simulate('dragstart');
        element.find('.menu.active > .menu-item:nth-child(1)').d3().simulate('mousedown');

        var $nameField = $('.modal-dialog').find('input#field-name');
        $nameField.scope().component.name("Test");

        var $descriptionField = $('.modal-dialog').find('textarea#field-description');
        $descriptionField.scope().component.description("Test channel");

        $('.modal-dialog').find('button.btn-primary').click();  // click OK

        expect(datum.name()).to.equal("Test");
        expect(datum.description()).to.equal("Test channel");
    }));

    it('should open router add dialog', inject(function () {
        angular.element(document.body).append(element);  // attach element to DOM

        expect($('.modal-dialog')).to.have.length(0);

        element.find('.nav .btn-add-router').click();  // open modal

        var $modal = $('.modal-dialog');
        expect($modal).to.have.length(1);

        var $nameField = $modal.find('input#field-name');
        expect($nameField).to.have.length(1);
        expect($nameField.attr('data-ng-model')).to.equal("property({ name: 'name' })");

        var $endpointField = $modal.find('input#field-endpoint-0');
        expect($endpointField).to.have.length(1);
        expect($endpointField.attr('data-ng-model')).to.equal("property({ object: endpoint, name: 'name' })");

        var $okButton = $modal.find('button.btn-primary');
        expect($okButton).to.have.length(1);
        expect($okButton.text()).to.equal("OK");
        expect($okButton.attr('data-ng-click')).to.equal('$close()');

        var $cancelButton = $modal.find('button.btn-warning');
        expect($cancelButton).to.have.length(1);
        expect($cancelButton.text()).to.equal("Cancel");
        expect($cancelButton.attr('data-ng-click')).to.equal("$dismiss('cancel')");
    }));

    it('should add new router', inject(function (rfc4122, Endpoint) {
        angular.element(document.body).append(element);  // attach element to DOM

        var stub = sinon.stub(rfc4122, 'v4');
        stub.onCall(0).returns('router2');
        stub.onCall(1).returns('menu1');
        stub.onCall(2).returns('menu-item1');
        stub.onCall(3).returns('menu-item2');
        stub.onCall(4).returns('menu-item3');
        stub.onCall(5).returns('endpoint8');
        stub.onCall(6).returns('endpoint9');
        stub.onCall(7).returns('endpoint10');

        element.find('.nav .btn-add-router').click();  // open modal

        var $nameField = $('.modal-dialog').find('input#field-name');
        $nameField.scope().component.name("Router 2");

        $('.modal-dialog').find('.keyword-add').click();

        var $endpointField = $('.modal-dialog').find('input#field-endpoint-2');
        $nameField.scope().component.endpoints()[2].name("Keyword 1");

        $('.modal-dialog').find('button.btn-primary').click();  // click OK
        element.find('.container').d3().simulate('mousedown');  // select position on canvas

        var routers = element.find('g.layer.components g.router');
        expect(routers).to.have.length(2);

        var datum = routers.get(1).__data__;
        expect(datum.id).to.equal("router2");
        expect(datum.name()).to.equal("Router 2");
        expect(datum.endpoints()).to.have.length(3);
        expect(datum.endpoints()[0].id).to.equal("endpoint8");
        expect(datum.endpoints()[0].type).to.equal('channel_endpoint');
        expect(datum.endpoints()[0].name()).to.equal("default");
        expect(datum.endpoints()[1].id).to.equal("endpoint9");
        expect(datum.endpoints()[1].type).to.equal('conversation_endpoint');
        expect(datum.endpoints()[1].name()).to.equal("default");
        expect(datum.endpoints()[2].id).to.equal("endpoint10");
        expect(datum.endpoints()[2].type).to.equal('conversation_endpoint');
        expect(datum.endpoints()[2].name()).to.equal("Keyword 1");
    }));

    it('should edit router', inject(function () {
        angular.element(document.body).append(element);  // attach element to DOM

        var router = element.find('.router').eq(0);
        var datum = router.get(0).__data__;
        expect(datum.name()).to.equal("K");

        router.d3().simulate('dragstart');
        element.find('.menu.active > .menu-item:nth-child(1)').d3().simulate('mousedown');

        var $nameField = $('.modal-dialog').find('input#field-name');
        $nameField.scope().component.name("T");

        $('.modal-dialog').find('button.btn-primary').click();  // click OK

        expect(datum.name()).to.equal("T");
    }));

    it('should delete component', inject(function () {
        angular.element(document.body).append(element);  // attach element to DOM

        expect($('.modal-dialog')).to.have.length(0);

        var conversations = element.find('.conversation');
        expect(conversations).to.have.length(2);

        var conversation = conversations.eq(0);
        var datum = conversation.get(0).__data__;
        conversation.d3().simulate('dragstart');
        element.find('.menu.active > .menu-item:nth-child(3)').d3().simulate('mousedown');

        var $modal = $('.modal-dialog');
        expect($modal).to.have.length(1);

        var $title = $modal.find('.modal-title');
        expect($title).to.have.length(1);
        expect($title.text()).to.equal("Are you sure you want to delete \"Register\"?");

        var $yesButton = $modal.find('button.btn-danger');
        expect($yesButton).to.have.length(1);
        expect($yesButton.text()).to.equal("Yes");
        expect($yesButton.attr('data-ng-click')).to.equal('$close()');

        var $noButton = $modal.find('button.btn-warning');
        expect($noButton).to.have.length(1);
        expect($noButton.text()).to.equal("No");
        expect($noButton.attr('data-ng-click')).to.equal("$dismiss('no')");

        $yesButton.click();
        expect(element.find('.conversation')).to.have.length(1);
    }));

    it('should delete connection', inject(function () {
        angular.element(document.body).append(element);  // attach element to DOM

        expect($('.modal-dialog')).to.have.length(0);

        var connections = element.find('.connection');
        expect(connections).to.have.length(1);

        var connection = connections.eq(0);
        var datum = connection.get(0).__data__;
        connection.d3().simulate('dragstart');
        element.find('.menu.active > .menu-item:nth-child(3)').d3().simulate('mousedown');

        var $modal = $('.modal-dialog');
        expect($modal).to.have.length(1);

        var $title = $modal.find('.modal-title');
        expect($title).to.have.length(1);
        expect($title.text()).to.equal("Are you sure you want to delete selected connection?");

        var $yesButton = $modal.find('button.btn-danger');
        expect($yesButton).to.have.length(1);
        expect($yesButton.text()).to.equal("Yes");
        expect($yesButton.attr('data-ng-click')).to.equal('$close()');

        var $noButton = $modal.find('button.btn-warning');
        expect($noButton).to.have.length(1);
        expect($noButton.text()).to.equal("No");
        expect($noButton.attr('data-ng-click')).to.equal("$dismiss('no')");

        $yesButton.click();
        expect(element.find('.connection')).to.have.length(0);
    }));

});
