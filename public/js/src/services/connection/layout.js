
angular.module('vumigo.services').factory('connectionLayout', ['componentHelper',
    function (componentHelper) {
        return function() {
            var pointRadius = 5;
            var numberOfControlPoints = 3;

            /**
             * Compute a new point for the given `component` and `endpointId`.
             */
            function point(connection, component, endpointId, visible) {
                var x = component.data.x;
                var y = component.data.y;
                if (component.type == 'router' && endpointId) {
                    var endpoint = componentHelper.getEndpointById(component, endpointId);
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
                        targetId: connection.target.uuid,
                        visible: visible
                    }
                };
            }

            /**
             * Interpolate a `numberOfPoints` points between the given `start`
             * and `end` points.
             */
            function interpolatePoints(connection, start, end, numberOfPoints, visible) {
                numberOfPoints = numberOfPoints || 3;
                var points = [];
                var xOffset = (end.x - start.x) / (numberOfPoints + 1);
                var yOffset = (end.y - start.y) / (numberOfPoints + 1);
                for (var i = 1; i <= numberOfPoints; i++) {
                    points.push({
                        x: start.x + i * xOffset,
                        y: start.y + i * yOffset,
                        _layout: {
                            r: pointRadius,
                            sourceId: connection.source.uuid,
                            targetId: connection.target.uuid,
                            visible: visible
                        }
                    });
                }
                return points;
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

                    // Determine whether the control points should be displayed
                    var visible = false;
                    if (connection._selected || source.data._selected || target.data._selected) {
                        visible = true;
                    }

                    // Fix the start and end point to the source and target components
                    var start = point(connection, source, connection.source.uuid, visible);
                    var end = point(connection, target, connection.target.uuid, visible);

                    if (angular.isUndefined(connection.points)) {
                        connection.points = [];
                    }

                    if (connection.points.length == 0) { // Initialise points
                        connection.points.push(start);
                        var points = interpolatePoints(
                            connection, start, end, numberOfControlPoints, visible);

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
                                targetId: connection.target.uuid,
                                visible: visible
                            };
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
