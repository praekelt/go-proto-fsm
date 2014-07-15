
angular.module('vumigo.services').factory('channelComponent', [function () {
    return function () {
        var dragBehavior = null;

        function enter(selection) {
            selection = selection.append('g')
                .attr('class', 'component channel');

            selection.append('circle')
                .attr('class', 'disc outer');

            selection.append('circle')
                .attr('class', 'disc inner');

            selection.append('text')
                .attr('class', 'name');

            selection.append('text')
                .attr('class', 'description');
        }

        function update(selection) {
            if (dragBehavior) selection.call(dragBehavior);

            selection.attr('transform', function (d) {
                return 'translate(' + [d.x, d.y] + ')';
            });

            selection.selectAll('.disc.outer')
                .attr('r', function (d) { return d._layout.outer.r; });

            selection.selectAll('.disc.inner')
                .attr('r', function (d) { return d._layout.inner.r; });

            selection.selectAll('.name')
                .attr('x', function (d) { return d._layout.name.x; })
                .text(function (d) { return d.name; });

            selection.selectAll('.description')
                .attr('x', function (d) { return d._layout.description.x; })
                .attr('dy', function (d) {
                    var fontSize = selection.select('.name')
                        .style('font-size');

                    return parseInt(fontSize) + 'px';
                })
                .text(function (d) { return d.description; });
        }

        function exit(selection) {
            selection.remove();
        }

        /**
         * Repaint conversation components.
         *
         * @param {selection} Selection containing components.
         */
        var channel = function(selection) {
            enter(selection.enter());
            update(selection);
            exit(selection.exit());
            return channel;
        };

       /**
         * Get/set the drag behaviour.
         *
         * @param {value} The new drag behaviour; when setting.
         * @return The current drag behaviour.
         */
        channel.drag = function(value) {
            if (!arguments.length) return dragBehavior;
            dragBehavior = value;
            return channel;
        };

        return channel;
    };
}]);