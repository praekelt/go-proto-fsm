describe('routerLayout', function () {
    var data, manager, layout;

    beforeEach(module('vumigo.services'));
    beforeEach(module('uuid'));

    beforeEach(inject(function (ComponentManager, routerLayout) {
        data = {
            routing_table: {
                version: 'fsm-0.1',
                campaign_id: 'campaign1',
                components: {
                    'router1': {
                        type: 'router',
                        router_type: 'keyword',
                        uuid: 'router1',
                        name: 'A',
                        description: 'Keyword',
                        endpoints: {
                            'endpoint1': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint1',
                                name: 'default'
                            },
                            'endpoint2': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint2',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {},
            },
            layout: {
                version: 'fsm-ui-0.1',
                components: {
                    'router1': {
                        x: 100,
                        y: 100
                    }
                },
                routing: {},
                connections: {}
            }
        };

        manager = new ComponentManager(data);

        layout = routerLayout();
    }));

    it('should compute router layout', inject(function (Router, Endpoint) {
        var routers = manager.findComponents({ type: 'router' });

        layout(routers);

        var size = Math.max(layout.minSize(),
            routers[0].endpoints('conversation_endpoint').length * layout.pinGap());

        var radius = Math.sqrt(2.0 * Math.pow(size, 2)) / 2.0;

        var expected = {
            layout: { r: radius }
        };

        expect(routers[0].meta()).to.deep.equal(expected);

        expected = [{
            layout: {
                x: radius,
                y: 0,
                r: 8,
                name: { x: 10 }
            }
        }, {
            layout: {
                len: radius,
                y: -20,
                r: 8,
                name: { x: -10 }
            }
        }];

        var actual = [
            routers[0].endpoints()[0].meta(),
            routers[0].endpoints()[1].meta()
        ];

        expect(actual).to.deep.equal(expected);
    }));
});
