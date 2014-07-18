
angular.module('vumigo.services').factory('connectionLayout', ['componentHelper',
    function (componentHelper) {
        return function() {
            var pointRadius = 5;
            var numberOfControlPoints = 3;

            /**
             * Return the X and Y coordinates of the given component's endpoint.
             */
            function endPoint(connection, component, endpointId) {
                var x = component.data.x;
                var y = component.data.y;
                if (component.type == 'router' && endpointId) {
                    var endpoint = null;
                    for (var i = 0; i < component.data.conversation_endpoints.length; i++) {
                        if (component.data.conversation_endpoints[i].uuid == endpointId) {
                            endpoint = component.data.conversation_endpoints[i];
                        }
                    }
                    if (endpoint) {
                        x = x - (component.data._layout.r + endpoint._layout.len / 2.0);
                        y = y + endpoint._layout.y;
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
                    var source = componentHelper.getByEndpointId(data, connection.source.uuid);
                    var target = componentHelper.getByEndpointId(data, connection.target.uuid);

                    if (angular.isUndefined(connection.points)) {
                        connection.points = [];
                    }

                    var start = endPoint(connection, source, connection.source.uuid);
                    var end = endPoint(connection, target, connection.target.uuid);

                    if (connection.points.length == 0) {
                        connection.points.push(start);
                        var points = controlPoints(connection, start, end, numberOfControlPoints);
                        angular.forEach(points, function (point) {
                            connection.points.push(point);
                        });
                        connection.points.push(end);
                    } else {
                        connection.points[0] = start;
                        connection.points[connection.points.length - 1] = end;
                    }
                });

                return data;
            }

            return layout;
        };
    }
]);
