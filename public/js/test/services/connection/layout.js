describe('connectionLayout', function () {
    var components, layout;

    /**
     * Helper to compute arrow position and rotation.
     */
    var arrow = function(start, end) {
        var x1 = 0;
        var y1 = 0;
        var x2 = end.x - start.x;
        var y2 = -(end.y - start.y);

        var angle = Math.atan(Math.abs(y2 - y1) / Math.abs(x2 - x1))
            * (180 / Math.PI);

        if (x2 >= 0 && y2 >= 0) angle = 90 - angle;
        if (x2 < 0 && y2 > 0) angle = 270 + angle;
        if (x2 <= 0 && y2 <= 0) angle = 270 - angle;
        if (x2 > 0 && y2 < 0) angle = 90 + angle;

        return {
            angle: angle,
            x: (start.x + (end.x - start.x) / 2),
            y: (start.y + (end.y - start.y) / 2)
        };
    };

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (Endpoint, Conversation, Channel, Router, Connection, Route,
                                conversationLayout, channelLayout, routerLayout, connectionLayout,
                                dragBehavior) {

        var endpoint1 = new Endpoint({ id: 'endpoint1', name: 'default', accepts: ['channel', 'router'] });
        var endpoint2 = new Endpoint({ id: 'endpoint2', name: 'default', accepts: ['conversation', 'router'] });
        var endpoint3 = new Endpoint({ id: 'endpoint3', name: 'default', accepts: ['channel'] });
        var endpoint4 = new Endpoint({ id: 'endpoint4', name: 'default', accepts: ['conversation'] });

        components = {
            'conversation1': new Conversation({
                id: 'conversation1',
                name: "Conversation 1",
                description: "",
                endpoints: [endpoint1],
                colour: 'red',
                x: 100,
                y: 100
            }),
            'channel1': new Channel({
                id: 'channel1',
                name: "Channel 1",
                description: "",
                endpoints: [endpoint2],
                utilization: 0.4,
                x: 200,
                y: 200
            }),
            'router1': new Router({
                id: 'router1',
                name: "Router 1",
                description: "",
                endpoints: [endpoint3, endpoint4],
                x: 300,
                y: 200
            }),
            'connection1': new Connection({
                id: 'connection1',
                routes: [new Route({
                    source: endpoint1,
                    target: endpoint4
                }), new Route({
                    source: endpoint4,
                    target: endpoint1
                })]
            }),
            'connection2': new Connection({
                id: 'connection2',
                routes: [new Route({
                    source: endpoint2,
                    target: endpoint3
                })]
            })
        };

        _.forEach(components['connection1'].endpoints, function (endpoint) {
            endpoint.component = components['connection1'];
        });

        _.forEach(components['channel1'].endpoints, function (endpoint) {
            endpoint.component = components['channel1'];
        });

        _.forEach(components['router1'].endpoints, function (endpoint) {
            endpoint.component = components['router1'];
        });

        conversationLayout()([components['conversation1']]);
        routerLayout()([components['router1']]);
        channelLayout()([components['channel1']]);

        layout = connectionLayout();
    }));

    it('should compute connection layout', inject(function (ControlPoint) {
        layout([
            components['connection1'],
            components['connection2']
        ]);

        var pointRadius = 5;
        var numberOfPoints = 5;

        // connection1
        var connection = components['connection1'];
        var points = [];

        var start = new ControlPoint({
            id: connection.points[0].id,
            x: 100,
            y: 100
        });
        start.meta().layout = { r: 0 };
        start.meta().visible = false;

        var end = new ControlPoint({
            id: connection.points[connection.points.length - 1].id,
        });
        end.meta().layout = { r: 0 };
        end.meta().visible = false;

        var router = components['router1'];
        end.x = router.x
            - (router.meta().layout.r
               + router.getEndpoints('conversation')[0].meta().layout.len / 2.0);

        end.y = router.y + router.getEndpoints('conversation')[0].meta().layout.y;

        points.push(start);

        var xOffset = (end.x - start.x) / (numberOfPoints - 1);
        var yOffset = (end.y - start.y) / (numberOfPoints - 1);
        for (var i = 1; i < numberOfPoints - 1; i++) {
            var point = new ControlPoint({
                id: connection.points[i].id,
                x: start.x + i * xOffset,
                y: start.y + i * yOffset
            });
            point.meta().layout = { r: pointRadius };
            point.meta().visible = false;
            points.push(point);
        }

        points.push(end);

        expect(components['connection1'].meta().colour).to.deep.equal('red');
        expect(components['connection1'].points).to.deep.equal(points);

        expect(components['connection1'].routes[0].meta()).to.deep.equal({
            layout: {
                arrow: arrow(points[0], points[1])
            }
        });

        expect(components['connection1'].routes[1].meta()).to.deep.equal({
            layout: {
                arrow: arrow(points[points.length - 1], points[points.length - 2])
            }
        });

        // connection2
        connection = components['connection2'];
        points = [];

        start = new ControlPoint({
            id: connection.points[0].id,
            x: 200,
            y: 200
        });
        start.meta().layout = { r: 0 };
        start.meta().visible = false;

        end = new ControlPoint({
            id: connection.points[connection.points.length - 1].id,
        });
        end.meta().layout = { r: 0 };
        end.meta().visible = false;

        end.x = router.x + router.getEndpoints('channel')[0].meta().layout.x;
        end.y = router.y + router.getEndpoints('channel')[0].meta().layout.y;

        points.push(start);

        xOffset = (end.x - start.x) / (numberOfPoints - 1);
        yOffset = (end.y - start.y) / (numberOfPoints - 1);
        for (var i = 1; i < numberOfPoints - 1; i++) {
            var point = new ControlPoint({
                id: connection.points[i].id,
                x: start.x + i * xOffset,
                y: start.y + i * yOffset
            });
            point.meta().layout = { r: pointRadius };
            point.meta().visible = false;
            points.push(point);
        }

        points.push(end);

        expect(components['connection2'].points).to.deep.equal(points);
        expect(components['connection2'].routes[0].meta()).to.deep.equal({
            layout: {
                arrow: arrow(points[0], points[1])
            }
        });
    }));

});
