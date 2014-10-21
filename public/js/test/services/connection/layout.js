describe('connectionLayout', function () {
    var data, manager, layout;

    /**
     * Helper to compute arrow position and rotation.
     */
    var arrow = function(start, end) {
        var x1 = 0;
        var y1 = 0;
        var x2 = end.x() - start.x();
        var y2 = -(end.y() - start.y());

        var angle = Math.atan(Math.abs(y2 - y1) / Math.abs(x2 - x1))
            * (180 / Math.PI);

        if (x2 >= 0 && y2 >= 0) angle = 90 - angle;
        if (x2 < 0 && y2 > 0) angle = 270 + angle;
        if (x2 <= 0 && y2 <= 0) angle = 270 - angle;
        if (x2 > 0 && y2 < 0) angle = 90 + angle;

        return {
            angle: angle,
            x: (start.x() + (end.x() - start.x()) / 4),
            y: (start.y() + (end.y() - start.y()) / 4)
        };
    };

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (ComponentManager, conversationLayout, channelLayout,
                                routerLayout, connectionLayout, dragBehavior) {

        data = {
            routing_table: {
                components: {
                    'conversation1': {
                        type: 'conversation',
                        conversation_type: 'bulk-message',
                        uuid: 'conversation1',
                        name: 'Conversation 1',
                        description: '',
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
                        name: 'Channel 1',
                        description: '',
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
                        name: 'Router 1',
                        description: '',
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
                            }
                        }
                    }
                },
                routing: {
                    'endpoint1:endpoint4': {
                        source: 'endpoint1',
                        target: 'endpoint4'
                    },
                    'endpoint4:endpoint1': {
                        source: 'endpoint4',
                        target: 'endpoint1'
                    },
                    'endpoint2:endpoint3': {
                        source: 'endpoint2',
                        target: 'endpoint3'
                    }
                }
            },
            layout: {
                components: {
                    'conversation1': {
                        x: 100,
                        y: 100,
                        colour: 'red'
                    },
                    'channel1': {
                        x: 200,
                        y: 200
                    },
                    'router1': {
                        x: 300,
                        y: 200
                    }
                },
                routing: {
                    'endpoint1:endpoint4': 'connection1',
                    'endpoint4:endpoint1': 'connection1',
                    'endpoint2:endpoint3': 'connection2'
                },
                connections: {
                    'connection1': {
                        endpoints: {
                            'endpoint1': 'conversation1',
                            'endpoint4': 'router1'
                        },
                        path: [{
                            x: 100,
                            y: 100,
                        }, {
                            x: 300,
                            y: 200
                        }],
                        colour: 'red'
                    },
                    'connection2': {
                        endpoints: {
                            'endpoint2': 'channel1',
                            'endpoint3': 'router1'
                        },
                        path: [{
                            x: 200,
                            y: 200,
                        }, {
                            x: 300,
                            y: 200
                        }],
                        colour: 'grey'
                    }
                }
            }
        };

        manager = new ComponentManager(data);

        conversationLayout()(manager.findComponents({ type: 'conversation' }));
        routerLayout()(manager.findComponents({ type: 'router' }));
        channelLayout()(manager.findComponents({ type: 'channel' }));

        layout = connectionLayout();
    }));

    it('should compute connection layout', inject(function (ControlPoint) {
        layout(manager.findComponents({ type: 'connection' }));

        var components = manager.components;

        var pointRadius = 5;
        var numberOfPoints = 0;

        // connection1
        var connection = components['connection1'];
        var points = [];

        var start = new ControlPoint({
            manager: manager,
            data: data,
            connection: connection,
            index: 0
        });
        start.meta().layout = { r: 0 };
        start.meta().visible = false;

        var end = new ControlPoint({
            manager: manager,
            data: data,
            connection: connection,
            index: connection.points().length - 1
        });
        end.meta().layout = { r: 0 };
        end.meta().visible = false;

        var router = components['router1'];
        var x = router.x()
            - (router.meta().layout.r
               + router.endpoints('conversation_endpoint')[0].meta().layout.len / 2.0);

        end.x(x);

        var y = router.y() + router.endpoints('conversation_endpoint')[0].meta().layout.y;

        end.y(y);

        points.push(start);

        var xOffset = (end.x() - start.x()) / (numberOfPoints - 1);
        var yOffset = (end.y() - start.y()) / (numberOfPoints - 1);
        for (var i = 1; i < numberOfPoints - 1; i++) {
            var point = new ControlPoint({
                manager: manager,
                data: data,
                connection: connection,
                index: i
            });

            point.x(start.x() + i * xOffset);
            point.y(start.y() + i * yOffset)
            point.meta().layout = { r: pointRadius };
            point.meta().visible = false;
            points.push(point);
        }

        points.push(end);

        expect(components['connection1'].meta().colour).to.deep.equal('red');
        expect(components['connection1'].points()).to.deep.equal(points);

        expect(components['connection1'].routes()[0].meta()).to.deep.equal({
            layout: {
                arrow: arrow(points[0], points[1])
            }
        });

        expect(components['connection1'].routes()[1].meta()).to.deep.equal({
            layout: {
                arrow: arrow(points[points.length - 1], points[points.length - 2])
            }
        });

        // connection2
        connection = components['connection2'];
        points = [];

        start = new ControlPoint({
            manager: manager,
            data: data,
            connection: connection,
            index: 0
        });
        start.meta().layout = { r: 0 };
        start.meta().visible = false;

        end = new ControlPoint({
            manager: manager,
            data: data,
            connection: connection,
            index: connection.points().length - 1
        });
        end.meta().layout = { r: 0 };
        end.meta().visible = false;

        x = router.x() + router.endpoints('channel_endpoint')[0].meta().layout.x;
        end.x(x);

        y = router.y() + router.endpoints('channel_endpoint')[0].meta().layout.y;
        end.y(y);

        points.push(start);

        xOffset = (end.x() - start.x()) / (numberOfPoints - 1);
        yOffset = (end.y() - start.y()) / (numberOfPoints - 1);
        for (var i = 1; i < numberOfPoints - 1; i++) {
            var point = new ControlPoint({
                manager: manager,
                data: data,
                connection: connection,
                index: i
            });

            point.x(start.x() + i * xOffset);
            point.y(start.y() + i * yOffset);
            point.meta().layout = { r: pointRadius };
            point.meta().visible = false;
            points.push(point);
        }

        points.push(end);

        expect(components['connection2'].points()).to.deep.equal(points);
        expect(components['connection2'].routes()[0].meta()).to.deep.equal({
            layout: {
                arrow: arrow(points[0], points[1])
            }
        });
    }));

});
