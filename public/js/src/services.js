var services = angular.module('vumigo.services', []);

services.factory('utils', [function () {

    /**
     * Draw a grid of the given size.
     *
     * @param {container} Grid container element.
     * @param {width} Grid width.
     * @param {height} Grid height.
     */
    function drawGrid(container, width, height, cellSize) {
        if (cellSize == 0) return;

        container.append('g')
                .attr('class', 'x axis')
            .selectAll('line')
                .data(d3.range(0, width, cellSize))
            .enter().append('line')
                .attr('x1', function (d) { return d; })
                .attr('y1', 0)
                .attr('x2', function (d) { return d; })
                .attr('y2', height);

        container.append('g')
                .attr('class', 'y axis')
            .selectAll('line')
                .data(d3.range(0, height, cellSize))
            .enter().append('line')
                .attr('x1', 0)
                .attr('y1', function (d) { return d; })
                .attr('x2', width)
                .attr('y2', function (d) { return d; });
    }

    return {
        drawGrid: drawGrid
    };
}]);

services.factory('filters', [function () {

    /**
     * Returns the <defs> element which contains the filter definitions.
     * If the <defs> element does not exist, append one and return it.
     *
     * @return The <defs> element.
     */
    function getDefs(svg) {
        var defs = svg.select('defs');
        if (defs[0][0]) {
            return defs;
        } else {
            return svg.append('defs');
        }
    }

    /**
     * Create a filter which adds a transparent grey drop-shadow that blends
     * with the background colour.
     *
     * @param {svg} The <svg> element.
     * @param {filterId} The filter ID; defaults to 'shadow'.
     */
    function dropShadow(svg, filterId) {
        var filterId = filterId || 'shadow';
        var filter = getDefs(svg).append('filter')
            .attr('id', filterId)
            .attr('width', 1.5)
            .attr('height', 1.5)
            .attr('x', -0.25)
            .attr('y', -0.25);

        filter.append('feGaussianBlur')
            .attr('in', 'SourceAlpha')
            .attr('stdDeviation', 2.5)
            .attr('result', 'blur');

        filter.append('feColorMatrix')
            .attr('result', 'bluralpha')
            .attr('type', 'matrix')
            .attr('values', '1 0 0 0    0\n' +
                                  '0 1 0 0    0\n' +
                                  '0 0 1 0    0\n' +
                                  '0 0 0 0.4 0');

        filter.append('feOffset')
            .attr('in', 'bluralpha')
            .attr('dx', 3)
            .attr('dy', 3)
            .attr('result', 'offsetBlur');

        var femerge = filter.append('feMerge');
        femerge.append('feMergeNode').attr('in', 'offsetBlur');
        femerge.append('feMergeNode').attr('in', 'SourceGraphic');
    }

    return {
        dropShadow: dropShadow
    };
}]);

services.factory('conversations', [function () {
    return function () {
        var radius = 20;  // Default circle radius

        /**
         * Draw a Vumi Go conversation object.
         *
         * @param {selection} The d3 selection object.
         */
        var conversation = function(selection) {
            selection = selection.enter().append('g')
                .attr('class', 'shape')
                .attr('transform', function (d) {
                    return 'translate(' + [d.x, d.y] + ')';
                });

            // Draw the circle
            var circle = selection.append('circle')
                .attr('r', radius)
                .style('fill', '#ddd');

            // Draw the conversation name
            var text = selection.append('text')
                .text(function (d) { return d.name; })
                .attr('x', function (d) { return -(radius + 5); })
                .attr('y', function (d) { return -(radius + 5); });

            return selection;
        };

        /**
         * Get/set the circle radius.
         *
         * @param {value} The new radius; when setting.
         * @return The current radius.
         */
        conversation.radius = function(value) {
            if (!arguments.length) return radius;
            radius = value;
            return conversation;
        };

        return conversation;
    };
}]);
