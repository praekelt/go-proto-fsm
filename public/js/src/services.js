var services = angular.module('vumigo.services', []);

services.factory('utils', [function () {

    /**
     * Create a filter which adds a transparent grey drop-shadow that blends
     * with the background colour.
     *
     * @param {svg} The <svg> element.
     */
    function addDropShadowFilter(svg) {
        var defs =  svg.select('defs');
        if (defs.empty()) {
            defs = svg.append('defs');
        }

        if (defs.select('filter#shadow').empty()) {
            var filter = defs.append('filter')
                .attr('id', 'shadow')
                .attr('width', 1.5)
                .attr('height', 1.5)
                .attr('x', -0.25)
                .attr('y', -0.25);

            filter.append('feGaussianBlur')
                .attr('in', 'SourceAlpha')
                .attr('stdDeviation', 2.5)
                .attr('result', 'blur');

            var colorMatrix = '1 0 0 0    0\n' +
                                         '0 1 0 0    0\n' +
                                         '0 0 1 0    0\n' +
                                         '0 0 0 0.4 0';

            filter.append('feColorMatrix')
                .attr('result', 'bluralpha')
                .attr('type', 'matrix')
                .attr('values', colorMatrix);

            filter.append('feOffset')
                .attr('in', 'bluralpha')
                .attr('dx', 3)
                .attr('dy', 3)
                .attr('result', 'offsetBlur');

            var femerge = filter.append('feMerge');
            femerge.append('feMergeNode').attr('in', 'offsetBlur');
            femerge.append('feMergeNode').attr('in', 'SourceGraphic');
        }
    }

    /**
     * Draw a grid of the given size.
     *
     * @param {selection} Grid selection element.
     * @param {width} Grid width.
     * @param {height} Grid height.
     */
    function drawGrid(selection, width, height, cellSize) {
        if (cellSize === 0) return;

        selection.append('g')
                .attr('class', 'x axis')
            .selectAll('line')
                .data(d3.range(0, width, cellSize))
            .enter().append('line')
                .attr('x1', function (d) { return d; })
                .attr('y1', 0)
                .attr('x2', function (d) { return d; })
                .attr('y2', height);

        selection.append('g')
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
        addDropShadowFilter: addDropShadowFilter,
        drawGrid: drawGrid
    };
}]);

services.factory('canvas', ['utils', function (utils) {
    return function () {
        var width = 2048;
        var height = 2048;
        var gridCellSize = 0;
        var zoomExtent = [1, 10];

        var canvas = function(selection) {
            var viewport = $(selection[0]);

            // Round `width` and `height` up to the nearest `gridCellSize`
            if (gridCellSize > 0) {
                width = Math.ceil(width / gridCellSize) * gridCellSize;
                height = Math.ceil(height / gridCellSize) * gridCellSize;
            }

            var svg = selection.append('svg')
                .attr('width', width)
                .attr('height', height);

            utils.addDropShadowFilter(svg);

            var zoom = d3.behavior.zoom()
                .scaleExtent(zoomExtent)
                .on('zoom', zoomed);

            var container = svg.append('g')
                .attr('class', 'container')
                .attr('transform', 'translate(0, 0)')
                .call(zoom)
                .on('mousedown', function () {
                    d3.select(this).classed('dragging', true);
                }).on('mouseup', function () {
                    d3.select(this).classed('dragging', false);
                });

            var rect = container.append('rect')
                .attr('width', width)
                .attr('height', height)
                .style('fill', 'none')
                .style('pointer-events', 'all');

            var canvas = container.append('g')
                .attr('class', 'canvas');

            utils.drawGrid(canvas, width, height, gridCellSize);

            /** Called when the canvas is dragged or scaled. */
            function zoomed() {
                // Prevent canvas being moved beyond the viewport
                var translate = d3.event.translate;
                var scale = d3.event.scale;

                if (translate[0] > 0) translate[0] = 0;
                var limit = viewport.width() - width * scale;
                if (translate[0] < limit) translate[0] = limit;

                if (translate[1] > 0) { translate[1] = 0; }
                limit = viewport.height() - height * scale;
                if (translate[1] < limit) { translate[1] = limit; }

                zoom.translate(translate);  // Set the zoom translation vector

                canvas.attr('transform', 'translate(' + translate + ')scale(' + scale + ')');
            }

            return canvas;
        }

        canvas.width = function(value) {
            if (!arguments.length) return width;
            width = value;
            return canvas;
        };

       canvas.height = function(value) {
            if (!arguments.length) return height;
            height = value;
            return canvas;
        };

       canvas.gridCellSize = function(value) {
            if (!arguments.length) return gridCellSize;
            gridCellSize = value;
            return canvas;
        };

       canvas.zoomExtent = function(value) {
            if (!arguments.length) return zoomExtent;
            zoomExtent = value;
            return canvas;
        };

        return canvas;
    };
}]);

services.factory('conversation', [function () {
    return function () {
        var radius = 20;  // Default circle radius
        var drag = null;  // The drag behavior

        /**
         * Draw Vumi Go conversation components.
         *
         * @param {selection} Conversation component selection.
         */
        var conversation = function(selection) {
            // Add new conversations
            var enter = selection.enter();
            if (!enter.empty()) {
                var container = enter.append('g')
                    .attr('class', 'component conversation');

                if (drag) {
                    container.call(drag);
                }

                container.append('circle')
                    .style('fill', '#ddd');

                container.append('text');
            }

            // Update conversations
            selection.attr('transform', function (d) {
                return 'translate(' + [d.x, d.y] + ')';
            });

            selection.selectAll('circle')
                .attr('r', radius);

            selection.selectAll('text')
                .attr('x', -(radius + 5))
                .attr('y', -(radius + 5))
                .text(function (d) { return d.name; });

            selection.exit().remove();  // Remove deleted conversations
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

       /**
         * Get/set the drag behaviour.
         *
         * @param {value} The new drag behaviour; when setting.
         * @return The current drag behaviour.
         */
        conversation.drag = function(value) {
            if (!arguments.length) return drag;
            drag = value;
            return conversation;
        };

        return conversation;
    };
}]);
