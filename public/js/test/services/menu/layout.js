describe('menuLayout', function () {
    var data, manager, layout;

    beforeEach(module('vumigo.services'));
    beforeEach(module('uuid'));

    beforeEach(inject(function (ComponentManager, conversationLayout, routerLayout,
                                channelLayout, connectionLayout, menuLayout) {

        data = {
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
                    'channel1': {
                        type: 'channel',
                        uuid: 'channel1',
                        tag: [],
                        name: 'SMS',
                        description: '082 335 29 24',
                        utilization: 0.4,
                        endpoints: {
                            'endpoint2': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint2',
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
                            'endpoint3': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint3',
                                name: 'default'
                            },
                            'endpoint4': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint4',
                                name: 'default'
                            },
                            'endpoint5': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint5',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {
                    'endpoint1:endpoint4': {
                        source: 'endpoint1',
                        target: 'endpoint4'
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
                    'channel1': {
                        x: 840,
                        y: 360
                    },
                    'router1': {
                        x: 500,
                        y: 220
                    }
                },
                routing: {
                    'endpoint1:endpoint4': 'connection1',
                },
                connections: {
                    'connection1': {
                        endpoints: {
                            'endpoint1': 'conversation1',
                            'endpoint4': 'router1'
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

        manager = new ComponentManager(data);

        conversationLayout()(manager.findComponents({ type: 'conversation' }));
        routerLayout()(manager.findComponents({ type: 'router' }));
        channelLayout()(manager.findComponents({ type: 'channel' }));
        connectionLayout()(manager.findComponents({ type: 'connection' }));

        layout = menuLayout();
    }));

    it('should compute menu layout', inject(function (goUtils) {
        layout(manager.findComponents({ type: 'menu' }));

        var components = manager.components;

        var expected = {
            active: false,
            layout: {
                x: components['conversation1'].x(),
                y: components['conversation1'].y() + components['conversation1'].meta().layout.outer.r + 20
            }
        };

        expect(components['conversation1'].menu.meta()).to.deep.equal(expected);

        _.forEach(components['conversation1'].menu.items, function (item) {
            expected = { layout: { width: 32, height: 32, text: { x: 10, dy: 20 } } };
            expect(item.meta()).to.deep.equal(expected);
        });

        expected = {
            active: false,
            layout: {
                x: components['channel1'].x(),
                y: components['channel1'].y() + components['channel1'].meta().layout.outer.r + 20
            }
        };

        expect(components['channel1'].menu.meta()).to.deep.equal(expected);

        _.forEach(components['channel1'].menu.items, function (item) {
            expected = { layout: { width: 32, height: 32, text: { x: 10, dy: 20 } } };
            expect(item.meta()).to.deep.equal(expected);
        });

        expected = {
            active: false,
            layout: {
                x: components['router1'].x(),
                y: components['router1'].y() + components['router1'].meta().layout.r + 20
            }
        };

        expect(components['router1'].menu.meta()).to.deep.equal(expected);

        _.forEach(components['router1'].menu.items, function (item) {
            expected = { layout: { width: 32, height: 32, text: { x: 10, dy: 20 } } };
            expect(item.meta()).to.deep.equal(expected);
        });

        var point1 = components['connection1'].points()[0];
        var point2 = components['connection1'].points()[1];
        var midpoint = goUtils.midpoint(point1.x(), point1.y(), point2.x(), point2.y());
        expected = {
            active: false,
            layout: {
                x: midpoint.x,
                y: midpoint.y + 20
            }
        };

        expect(components['connection1'].menu.meta()).to.deep.equal(expected);

        _.forEach(components['connection1'].menu.items, function (item) {
            expected = { layout: { width: 32, height: 32, text: { x: 10, dy: 20 } } };
            expect(item.meta()).to.deep.equal(expected);
        });
    }));

});
