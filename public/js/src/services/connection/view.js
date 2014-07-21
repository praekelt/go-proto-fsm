
angular.module('vumigo.services').factory('connectionComponent', [function () {
    return function () {

        function enter(selection) {
            selection.append('path')
                .attr('class', 'component connection');
        }

        function update(selection) {
            var line = d3.svg.line()
                .x(function (d) { return d.x; })
                .y(function (d) { return d.y; })
                .interpolate('cardinal');

            selection
                .attr('d', function (d) {
                    return line(d.points);
                });
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

        return connection;
    };
}]);

angular.module('vumigo.services').factory('controlPointComponent', [function () {
    return function () {
        var dragBehavior = null;

        function enter(selection) {
            selection = selection.append('g')
                .attr('class', function (d) {
                    return 'component control-point '
                        + d._layout.sourceId + '-' + d._layout.targetId;
                });

            selection.append('circle')
                .attr('class', 'point');
        }

        function update(selection) {
            if (dragBehavior) selection.call(dragBehavior);

            selection
                .attr('transform', function (d) {
                    return 'translate(' + [d.x, d.y] + ')';
                });

            selection.selectAll('.point')
                .attr('r', function (d) { return d._layout.r; });
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
