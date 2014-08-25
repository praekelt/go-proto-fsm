
angular.module('vumigo.services').factory('connectionLayout', [
    function () {
        return function () {
            var pointRadius = 5;

            function position(point, component, endpoint) {
                point.x = component.x;
                point.y = component.y;

                if (component.type == 'router' && endpoint) {
                    if (endpoint.acceptsConnectionsFrom('conversation')) {
                        point.x = point.x - (component.meta().layout.r
                                             + endpoint.meta().layout.len / 2.0);

                        point.y = point.y + endpoint.meta().layout.y;

                    } else if (endpoint.acceptsConnectionsFrom('channel')) {
                        point.x = point.x + endpoint.meta().layout.x;
                        point.y = point.y + endpoint.meta().layout.y;
                    }
                }
            }

            function interpolate(points) {
                var start = points[0];
                var end = points[points.length - 1];
                var xOffset = (end.x - start.x) / (points.length - 1);
                var yOffset = (end.y - start.y) / (points.length - 1);
                for (var i = 1; i <= points.length - 1; i++) {
                    var point = points[i];
                    if (_.isUndefined(point.meta().layout)) {
                        point.x = start.x + i * xOffset;
                        point.y = start.y + i * yOffset;
                    }
                }
            }

            function layout(data) {
                _.forEach(data, function (connection) {
                    var source = connection.getSourceEndpoint();
                    var target = connection.getTargetEndpoint();

                    if (_.isNull(source) || _.isNull(target)) return;

                    var meta = connection.meta();

                    // Set connection colour to match conversation colour
                    if (source.component.type == 'conversation') {
                        meta.colour = source.component.colour;
                    } else if (target.component.type == 'conversation') {
                        meta.colour = target.component.colour;
                    }

                    // Determine whether the control points should be displayed
                    var visible = false;
                    if (meta.selected
                            || source.component.meta().selected
                            || target.component.meta().selected) {
                        visible = true;
                    }

                    // Fix the start and end point to the source and target components
                    position(connection.points[0], source.component, source);
                    position(connection.points[connection.points.length - 1],
                             target.component, target);

                    interpolate(connection.points);

                    for (var i = 0; i < connection.points.length; i++) {
                        var meta = connection.points[i].meta();
                        meta.visible = visible;
                        if (i == 0 || i == connection.points.length - 1) {
                            meta.layout = {
                                r: 0
                            };

                        } else {
                            meta.layout = {
                                r: pointRadius
                            };
                        }
                    }
                });

                return data;
            }

            return layout;
        };
    }
]);
