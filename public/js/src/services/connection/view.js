
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
                    .x(function (d) { return d.x; })
                    .y(function (d) { return d.y; })
                    .interpolate('linear');

                selection
                    .classed('selected', function (d) {
                        return d._meta.selected;
                    })
                    .attr('d', function (d) {
                        return line(d.points);
                    })
                    .style('stroke', function (d) { return d._meta.colour });
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
        var connectionId = null;

        function enter(selection) {
            selection = selection.append('g')
                .attr('class', 'component control-point')
                .attr('data-connection-uuid', connectionId);

            selection.append('circle')
                .attr('class', 'point');
        }

        function update(selection) {
            if (dragBehavior) selection.call(dragBehavior);

            selection
                .attr('transform', function (d) {
                    return 'translate(' + [d.x, d.y] + ')';
                })
                .classed('active', function (d) {
                    return d._meta.visible;
                });

            selection.selectAll('.point')
                .attr('r', function (d) { return d._meta.layout.r; });
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

       /**
         * Get/set the connection UUID.
         *
         * @param {value} The new connection UUID; when setting.
         * @return The current connection UUID.
         */
        controlPoint.connectionId = function(value) {
            if (!arguments.length) return connectionId;
            connectionId = value;
            return controlPoint;
        };

        return controlPoint;
    };
}]);
