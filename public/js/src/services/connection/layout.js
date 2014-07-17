
angular.module('vumigo.services').factory('connectionLayout', ['componentHelper',
    function (componentHelper) {
        return function() {
            var pointRadius = 5;

            /**
             * Return the X and Y coordinates of the given component's endpoint.
             */
            function point(connection, component, endpointId) {
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
                        r: pointRadius,
                        sourceId: connection.source.uuid,
                        targetId: connection.target.uuid
                    }
                };
            }

            function layout(data) {
                angular.forEach(data.routing_entries, function (connection) {
                    var source = componentHelper.getByEndpointId(data, connection.source.uuid);
                    var target = componentHelper.getByEndpointId(data, connection.target.uuid);

                    if (angular.isUndefined(connection.points)) {
                        connection.points = [];
                    }

                    var start = point(connection, source, connection.source.uuid);
                    var end = point(connection, target, connection.target.uuid);

                    if (connection.points.length == 0) {
                        var controlPoint1 = {
                            x: start.x + (end.x - start.x) / 3.0,
                            y: start.y + (end.y - start.y) / 3.0,
                            _layout: {
                                r: pointRadius,
                                sourceId: connection.source.uuid,
                                targetId: connection.target.uuid
                            }
                        };

                        var controlPoint2 = {
                            x: start.x + 2 * ((end.x - start.x) / 3.0),
                            y: start.y + 2 * ((end.y - start.y) / 3.0),
                            _layout: {
                                r: pointRadius,
                                sourceId: connection.source.uuid,
                                targetId: connection.target.uuid
                            }
                        };

                        connection.points.push(start);
                        connection.points.push(controlPoint1);
                        connection.points.push(controlPoint2);
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
