describe('connectionLayout', function () {
    var data, layout;

    beforeEach(module('uuid'));
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
                uuid: 'connection1',
                source: {uuid: 'endpoint1'},
                target: {uuid: 'endpoint4'}
            }, {
                uuid: 'connection2',
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
            uuid: 'connection1',
            source: {uuid: 'endpoint1'},
            target: {uuid: 'endpoint4'},
            points: [],
            _meta: {
                layout: {colour: '#red'}
            }
        }, {
            uuid: 'connection2',
            source: {uuid: 'endpoint1'},
            target: {uuid: 'endpoint2'},
            points: [],
            _meta: {
                layout: {colour: '#red'}
            }
        }];

        var mklayout = function (r, connection, visible) {
            return {
                r: r,
                sourceId: connection.source.uuid,
                targetId: connection.target.uuid,
                visible: visible ? true : false
            };
        };

        var pointRadius = 5;
        var numberOfPoints = 3;

        // connection1
        var start = {
            x: 100,
            y: 100,
            _meta: {
                layout: mklayout(0, expected[0])
            }
        };

        var end = {
            _meta: {
                layout: mklayout(0, expected[0])
            }
        };

        end.x = data.routers[0].x
            - (data.routers[0]._meta.layout.r
               + data.routers[0].conversation_endpoints[0]._meta.layout.len / 2.0);

        end.y = data.routers[0].y
            + data.routers[0].conversation_endpoints[0]._meta.layout.y;

        expected[0].points.push(start);

        var xOffset = (end.x - start.x) / (numberOfPoints + 1);
        var yOffset = (end.y - start.y) / (numberOfPoints + 1);
        for (var i = 1; i <= numberOfPoints; i++) {
            expected[0].points.push({
                x: start.x + i * xOffset,
                y: start.y + i * yOffset,
                _meta: {
                    layout: mklayout(pointRadius, expected[0])
                }
            });
        }

        expected[0].points.push(end);

        // connection2
        start = {
            x: 100,
            y: 100,
            _meta: {
                layout: mklayout(0, expected[1])
            }
        };

        end = {
            x: 200,
            y: 200,
            _meta: {
                layout: mklayout(0, expected[1])
            }
        };

        expected[1].points.push(start);

        xOffset = (end.x - start.x) / (numberOfPoints + 1);
        yOffset = (end.y - start.y) / (numberOfPoints + 1);
        for (var i = 1; i <= numberOfPoints; i++) {
            expected[1].points.push({
                x: start.x + i * xOffset,
                y: start.y + i * yOffset,
                _meta: {
                    layout: mklayout(pointRadius, expected[1])
                }
            });
        }

        expected[1].points.push(end);

        expect(data.routing_entries).to.deep.equal(expected);
    }));

});
