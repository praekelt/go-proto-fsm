
angular.module('vumigo.services').factory('connectionComponent', [
    function () {
        return function () {
            var dragBehavior = null;

            function enter(selection) {
                selection.append('path')
                    .attr('class', 'component connection');
            }

            function update(selection) {
                if (dragBehavior) selection.call(dragBehavior);

                var line = d3.svg.line()
                    .x(function (d) { return d.x(); })
                    .y(function (d) { return d.y(); })
                    .interpolate('linear');

                selection
                    .classed('selected', function (d) {
                        return d.meta().selected;
                    })
                    .attr('d', function (d) {
                        return line(d.points());
                    })
                    .style('stroke', function (d) { return d.meta().colour });
            }

            function exit(selection) {
                selection.remove();
            }

            /**
             * Repaint connection components.
             *
             * @param {selection} Selection containing connections.
             */
            var connection = function (selection) {
                enter(selection.enter());
                update(selection);
                exit(selection.exit());
                return connection;
            };

           /**
             * Get/set the drag behaviour.
             *
             * @param {value} The new drag behaviour; when setting.
             * @return The current drag behaviour.
             */
            connection.drag = function(value) {
                if (!arguments.length) return dragBehavior;
                dragBehavior = value;
                return connection;
            };

            return connection;
        };
    }
]);

angular.module('vumigo.services').factory('controlPointComponent', [function () {
    return function () {
        var dragBehavior = null;

        function enter(selection) {
            selection = selection.append('g')
                .attr('class', 'component control-point');

            selection.append('circle')
                .attr('class', 'point');
        }

        function update(selection) {
            if (dragBehavior) selection.call(dragBehavior);

            selection
                .attr('transform', function (d) {
                    return 'translate(' + [d.x(), d.y()] + ')';
                })
                .classed('active', function (d) {
                    return d.meta().visible;
                });

            selection.selectAll('.point')
                .attr('r', function (d) { return d.meta().layout.r; });
        }

        function exit(selection) {
            selection.remove();
        }

        /**
         * Repaint control point components.
         *
         * @param {selection} Selection containing control points.
         */
        var controlPoint = function (selection) {
            enter(selection.enter());
            update(selection);
            exit(selection.exit());
            return controlPoint;
        };

       /**
         * Get/set the drag behaviour.
         *
         * @param {value} The new drag behaviour; when setting.
         * @return The current drag behaviour.
         */
        controlPoint.drag = function(value) {
            if (!arguments.length) return dragBehavior;
            dragBehavior = value;
            return controlPoint;
        };

        return controlPoint;
    };
}]);

angular.module('vumigo.services').factory('routeComponent', [function () {
    return function () {

        function enter(selection) {
            selection = selection.append('g')
                .attr('class', 'component route');

            selection.append('text')
                .attr('class', 'arrow');
        }

        function update(selection) {
            selection
                .attr('transform', function (d) {
                    var layout = d.meta().layout;
                    return 'translate(' + [layout.arrow.x, layout.arrow.y]
                        + ')rotate(' + (layout.arrow.angle - 90) + ')';
                });

            selection.select('.arrow')
                .text('\uf04e');
        }

        function exit(selection) {
            selection.remove();
        }

        var route = function (selection) {
            enter(selection.enter());
            update(selection);
            exit(selection.exit());
            return route;
        };

        return route;
    };
}]);
