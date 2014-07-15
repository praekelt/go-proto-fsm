
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
                .interpolate('linear');

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
