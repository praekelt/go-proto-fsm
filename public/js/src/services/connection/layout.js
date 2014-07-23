
angular.module('vumigo.services').factory('connectionLayout', ['componentHelper',
    function (componentHelper) {
        return function() {
            var pointRadius = 5;
            var numberOfControlPoints = 3;

            function getEndpointById(component, endpointId) {
                if (component.type == 'router') {
                    for (var i = 0; i < component.data.conversation_endpoints.length; i++) {
                        if (component.data.conversation_endpoints[i].uuid == endpointId) {
                            return {
                                data: component.data.conversation_endpoints[i],
                                type: 'conversation'
                            };
                        }
                    }

                    for (var i = 0; i < component.data.channel_endpoints.length; i++) {
                        if (component.data.channel_endpoints[i].uuid == endpointId) {
                            return {
                                data: component.data.channel_endpoints[i],
                                type: 'channel'
                            };
                        }
                    }

                } else {
                    for (var i = 0; i < component.data.endpoints.length; i++) {
                        if (component.data.endpoints[i].uuid == endpointId) {
                            return {
                                data: component.data.endpoints[i]
                            };
                        }
                    }
                }

                return null;
            }

            /**
             * Return the X and Y coordinates of the given component's endpoint.
             */
            function endpoint(connection, component, endpointId) {
                var x = component.data.x;
                var y = component.data.y;
                if (component.type == 'router' && endpointId) {
                    var endpoint = getEndpointById(component, endpointId);
                    if (endpoint) {
                        if (endpoint.type == 'conversation') {
                            x = x - (component.data._layout.r + endpoint.data._layout.len / 2.0);
                            y = y + endpoint.data._layout.y;
                        } else if (endpoint.type == 'channel') {
                            x = x + endpoint.data._layout.x;
                            y = y + endpoint.data._layout.y;
                        }
                    }
                }

                return {
                    x: x,
                    y: y,
                    _layout: {
                        r: 0,
                        sourceId: connection.source.uuid,
                        targetId: connection.target.uuid
                    }
                };
            }

            /**
             * Return a list of control points.
             */
            function controlPoints(connection, start, end, numberOfPoints) {
                numberOfPoints = numberOfPoints || 3;
                var controlPoints = [];
                var xOffset = (end.x - start.x) / (numberOfPoints + 1);
                var yOffset = (end.y - start.y) / (numberOfPoints + 1);
                for (var i = 1; i <= numberOfPoints; i++) {
                    controlPoints.push({
                        x: start.x + i * xOffset,
                        y: start.y + i * yOffset,
                        _layout: {
                            r: pointRadius,
                            sourceId: connection.source.uuid,
                            targetId: connection.target.uuid
                        }
                    });
                }
                return controlPoints;
            }

            function layout(data) {
                angular.forEach(data.routing_entries, function (connection) {
                    connection._layout = {};

                    var source = componentHelper.getByEndpointId(data, connection.source.uuid);
                    var target = componentHelper.getByEndpointId(data, connection.target.uuid);

                    // Set connection colour to match conversation colour
                    if (source.type == 'conversation') {
                        connection._layout.colour = source.data.colour;
                    } else if (target.type == 'conversation') {
                        connection._layout.colour = target.data.colour;
                    }

                    // Fix the start and end point to the source and target components
                    var start = endpoint(connection, source, connection.source.uuid);
                    var end = endpoint(connection, target, connection.target.uuid);

                    if (angular.isUndefined(connection.points)) {
                        connection.points = [];
                    }

                    if (connection.points.length == 0) { // Initialise points
                        connection.points.push(start);
                        var points = controlPoints(connection, start, end, numberOfControlPoints);
                        angular.forEach(points, function (point) {
                            connection.points.push(point);
                        });
                        connection.points.push(end);

                    } else {  // Update points
                        connection.points[0] = start;
                        for (var i = 1; i < connection.points.length - 1; i++) {
                            connection.points[i]._layout = {
                                r: pointRadius,
                                sourceId: connection.source.uuid,
                                targetId: connection.target.uuid
                            }
                        }
                        connection.points[connection.points.length - 1] = end;
                    }
                });

                return data;
            }

            return layout;
        };
    }
]);
