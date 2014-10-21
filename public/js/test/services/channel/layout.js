describe('channelLayout', function () {
    var data, manager, layout;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (ComponentManager, channelLayout) {
        data = {
            routing_table: {
                version: 'fsm-0.1',
                campaign_id: 'campaign1',
                components: {
                    'channel1': {
                        type: 'channel',
                        uuid: 'channel1',
                        name: "Channel 1",
                        description: "Test channel",
                        utilization: 0.5,
                        endpoints: {
                            'endpoint1': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint1',
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
                    'channel1': {
                        x: 100,
                        y: 100
                    }
                },
                routing: {},
                connections: {}
            }
        };

        manager = new ComponentManager(data);

        layout = channelLayout();
    }));

    it('should compute channel layout', inject(function (Channel, Endpoint) {
        var channels = manager.findComponents({ type: 'channel' });

        layout(channels);

        var expected = {
            layout: {
                inner: { r: 10 },
                outer: { r: 60 },
                name: { x: 25 },
                description: { x: 25 }
            }
        };

        expect(channels[0].meta()).to.deep.equal(expected);
    }));

});
