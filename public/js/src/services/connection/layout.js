
angular.module('vumigo.services').factory('connectionLayout', [
    function () {
        return function () {
            var pointRadius = 5;

            function position(point, component, endpoint) {
                point.x(component.x());
                point.y(component.y());

                if (component.type == 'router' && endpoint) {
                    var x, y;
                    if (endpoint.type == 'conversation_endpoint') {
                        x = point.x() - (component.meta().layout.r + endpoint.meta().layout.len / 2.0);
                        y = point.y() + endpoint.meta().layout.y;

                    } else if (endpoint.type == 'channel_endpoint') {
                        x = point.x() + endpoint.meta().layout.x;
                        y = point.y() + endpoint.meta().layout.y;
                    }

                    point.x(x);
                    point.y(y);
                }
            }

            function interpolate(points) {
                var start = points[0];
                var end = points[points.length - 1];
                var xOffset = (end.x() - start.x()) / (points.length - 1);
                var yOffset = (end.y() - start.y()) / (points.length - 1);
                for (var i = 1; i < points.length - 1; i++) {
                    var point = points[i];
                    if (_.isUndefined(point.x()) || _.isUndefined(point.y())) {
                        point.x(start.x() + i * xOffset);
                        point.y(start.y() + i * yOffset);
                    }
                }
            }

            function arrow(start, end) {
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
            }

            function layout(data) {
                _.forEach(data, function (connection) {
                    var routes = connection.routes();
                    var source = routes[0].source();
                    var target = routes[0].target();
                    var meta = connection.meta();

                    // Set connection colour to match conversation colour
                    if (source.component.type == 'conversation') {
                        meta.colour = source.component.colour();
                    } else if (target.component.type == 'conversation') {
                        meta.colour = target.component.colour();
                    }

                    // Determine whether the control points should be displayed
                    var visible = false;
                    if (meta.selected
                            || source.component.meta().selected
                            || target.component.meta().selected) {
                        visible = true;
                    }

                    // Fix the start and end point to the source and target components
                    var points = connection.points();
                    var start = points[0];
                    var end = points[points.length - 1];
                    position(start, source.component, source);
                    position(end, target.component, target);

                    interpolate(points);

                    for (var i = 0; i < points.length; i++) {
                        var meta = points[i].meta();
                        meta.visible = visible;
                        if (i == 0 || i == points.length - 1) {
                            meta.layout = {
                                r: 0
                            };

                        } else {
                            meta.layout = {
                                r: pointRadius
                            };
                        }
                    }

                    // Calculate route arrow position and orientation
                    routes[0].meta().layout = {
                        arrow: arrow(start, points[1])
                    };

                    if (_.size(routes) > 1) {  // bi-directional
                        routes[1].meta().layout = {
                            arrow: arrow(end, points[points.length - 2])
                        };
                    }
                });

                return data;
            }

            return layout;
        };
    }
]);
