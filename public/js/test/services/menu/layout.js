describe('menuLayout', function () {
    var data, layout;

    beforeEach(module('vumigo.services'));
    beforeEach(module('uuid'));

    beforeEach(inject(function (conversationLayout, routerLayout,
                                             channelLayout, connectionLayout,
                                             menuLayout) {
        data = {
            conversations: [{
                uuid: 'conversation1',
                name: "Register",
                description: "4 Steps",
                endpoints: [{uuid: 'endpoint1', name: 'default'}],
                colour: '#f82943',
                x: 220,
                y: 120
            }],
            channels: [{
                uuid: 'channel1',
                name: "SMS",
                description: "082 335 29 24",
                endpoints: [{uuid: 'endpoint2', name: 'default'}],
                utilization: 0.4,
                x: 840,
                y: 360
            }],
            routers: [{
                uuid: 'router1',
                name: "K",
                description: "Keyword",
                channel_endpoints: [{uuid: 'endpoint3', name: 'default'}],
                conversation_endpoints: [{
                    uuid: 'endpoint4',
                    name: 'default'
                }, {
                    uuid: 'endpoint5',
                    name: 'default'
                }],
                x: 500,
                y: 220
            }],
            routing_entries: [{
                source: {uuid: 'endpoint1'},
                target: {uuid: 'endpoint4'}
            }]
        };

        conversationLayout()(data.conversations);
        routerLayout()(data.routers);
        channelLayout()(data.channels);
        connectionLayout()(data);

        layout = menuLayout();
    }));

    it('should compute menu layout', inject(function () {
        layout(data);

        var expected = {
            id: data.conversations[0].uuid,
            items: [{
                component: data.conversations[0],
                width: 32,
                height: 32,
                text: {
                    icon: '&#xf0c1;',
                    x: 10,
                    dy: 20
                },
                action: 'go:campaignDesignerConnect'
            }, {
                component: data.conversations[0],
                width: 32,
                height: 32,
                text: {
                    icon: '&#xf00d;',
                    x: 10,
                    dy: 20
                },
                action: 'go:campaignDesignerRemove'
            }],
            active: false,
            x: data.conversations[0].x,
            y: data.conversations[0].y + data.conversations[0]._meta.layout.outer.r + 20
        };

        expect(data.conversations[0]._meta.menu).to.deep.equal(expected);

        var expected = {
            id: data.channels[0].uuid,
            items: [{
                component: data.channels[0],
                width: 32,
                height: 32,
                text: {
                    icon: '&#xf0c1;',
                    x: 10,
                    dy: 20
                },
                action: 'go:campaignDesignerConnect'
            }, {
                component: data.channels[0],
                width: 32,
                height: 32,
                text: {
                    icon: '&#xf00d;',
                    x: 10,
                    dy: 20
                },
                action: 'go:campaignDesignerRemove'
            }],
            active: false,
            x: data.channels[0].x,
            y: data.channels[0].y + data.channels[0]._meta.layout.outer.r + 20
        };

        expect(data.channels[0]._meta.menu).to.deep.equal(expected);

        var expected = {
            id: data.routers[0].uuid,
            items: [{
                component: data.routers[0],
                width: 32,
                height: 32,
                text: {
                    icon: '&#xf0c1;',
                    x: 10,
                    dy: 20
                },
                action: 'go:campaignDesignerConnect'
            }, {
                component: data.routers[0],
                width: 32,
                height: 32,
                text: {
                    icon: '&#xf00d;',
                    x: 10,
                    dy: 20
                },
                action: 'go:campaignDesignerRemove'
            }],
            active: false,
            x: data.routers[0].x,
            y: data.routers[0].y + data.routers[0]._meta.layout.r + 20
        };

        expect(data.routers[0]._meta.menu).to.deep.equal(expected);
        var point = data.routing_entries[0].points[2];
        var expected = {
            id: data.routing_entries[0].uuid,
            items: [{
                component: data.routing_entries[0],
                width: 32,
                height: 32,
                text: {
                    icon: '&#xf07e;',
                    x: 10,
                    dy: 20
                },
                action: 'go:campaignDesignerChangeDirection'
            }, {
                component: data.routing_entries[0],
                width: 32,
                height: 32,
                text: {
                    icon: '&#xf00d;',
                    x: 10,
                    dy: 20
                },
                action: 'go:campaignDesignerRemove'
            }],
            active: false,
            x: point.x,
            y: point.y + 20
        };

        expect(data.routing_entries[0]._meta.menu).to.deep.equal(expected);
    }));

});
