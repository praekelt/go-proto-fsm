describe('connectionLayout', function () {
    var data, layout;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (conversationLayout, channelLayout, routerLayout, connectionLayout, dragBehavior) {
        data = {
            conversations: [{
                uuid: 'conversation1',
                name: "Conversation 1",
                description: "",
                endpoints: [{uuid: 'endpoint1', name: 'default'}],
                colour: '#red',
                x: 100,
                y: 100
            }],
            channels: [{
                uuid: 'channel1',
                name: "Channel 1",
                description: "",
                endpoints: [{uuid: 'endpoint2', name: 'default'}],
                utilization: 0.4,
                x: 200,
                y: 200
            }],
            routers: [{
                uuid: 'router1',
                name: "Router 1",
                description: "",
                channel_endpoints: [{uuid: 'endpoint3', name: 'default'}],
                conversation_endpoints: [{uuid: 'endpoint4', name: 'default'}],
                x: 300,
                y: 200
            }],
            routing_entries: [{
                source: {uuid: 'endpoint1'},
                target: {uuid: 'endpoint4'}
            }, {
                source: {uuid: 'endpoint1'},
                target: {uuid: 'endpoint2'}
            }]
        };

        conversationLayout()(data.conversations);
        channelLayout()(data.channels);
        routerLayout()(data.routers);

        layout = connectionLayout();
    }));

    it('should compute connection layout', inject(function () {
        layout(data);

        var expected = [{
            source: {uuid: 'endpoint1'},
            target: {uuid: 'endpoint4'},
            points: [{x: 100, y: 100}]
        }, {
            source: {uuid: 'endpoint1'},
            target: {uuid: 'endpoint2'},
            points: [{x: 100, y: 100}, {x: 200, y: 200}]
        }];

        var x = data.routers[0].x
            - (data.routers[0]._layout.r
               + data.routers[0].conversation_endpoints[0]._layout.len / 2.0);

        var y = data.routers[0].y
            + data.routers[0].conversation_endpoints[0]._layout.y;

        expected[0].points.push({x: x, y: y});

        expect(data.routing_entries).to.deep.equal(expected);
    }));

});
