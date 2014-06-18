var services = angular.module('vumigo.services', []);

services.factory('utils', [function () {

    /**
     * Return the `node` element inside the given `selection`.
     * If the `node` does not exist a new one is created.
     *
     * @return The `node` element.
     */
    function getOrCreate(selection, node) {
        var element = selection.select(node);
        if (element.empty()) {
            return selection.append(node);
        } else {
            return element;
        }
    }

    /**
     * Return a new zoom behavior.
     *
     * @param {extent} The zoom scale's allowed range as a two-element array.
     * @param {zoomed} A callback function for the `zoom` event.
     * @return The new zoom behavior.
     */
    function createZoomBehavior(extent, zoomed) {
        var zoom = d3.behavior.zoom()
            .scaleExtent(extent)
            .on('zoom', zoomed);

        return zoom;
    }

    /**
     * Return a new drag behavior.
     *
     * @param {dragstarted} A callback function for the `dragstart` event.
     * @param {dragged} A callback function for the `drag` event.
     * @param {dragended} A callback function for the `dragend` event.
     * @return The new drag behavior.
     */
    function createDragBehavior(dragstarted, dragged, dragended) {
        var drag = d3.behavior.drag()
            .origin(function (d) { return d; })
            .on('dragstart', dragstarted)
            .on('drag', dragged)
            .on('dragend', dragended);

        return drag;
    }

    /**
     * Create a new <svg> element.
     *
     * @param {selection} Selection to which the <svg> element will be appended.
     * @param {width} SVG canvas width.
     * @param {height} SVG canvas height.
     */
    function createSvg(selection, width, height) {
        var svg = selection.append('svg')
            .attr('width', width)
            .attr('height', height);

        return svg;
    }

    /**
     * Draw a grid of the given size.
     *
     * @param {selection} Grid selection element.
     * @param {width} Grid width.
     * @param {height} Grid height.
     */
    function drawGrid(selection, width, height, cellSize) {
        if (cellSize == 0) return;

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
        getOrCreate: getOrCreate,
        createZoomBehavior: createZoomBehavior,
        createDragBehavior: createDragBehavior,
        createSvg: createSvg,
        drawGrid: drawGrid
    };
}]);

services.factory('filters', ['utils', function (utils) {

    /**
     * Create a filter which adds a transparent grey drop-shadow that blends
     * with the background colour.
     *
     * @param {svg} The <svg> element.
     * @param {filterId} The filter ID; defaults to 'shadow'.
     */
    function dropShadow(svg, filterId) {
        var filterId = filterId || 'shadow';
        var defs = utils.getOrCreate(svg, 'defs');
        var filter = defs.append('filter')
            .attr('id', filterId)
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

    return {
        dropShadow: dropShadow
    };
}]);

services.factory('conversations', [function () {
    return function () {
        var radius = 20;  // Default circle radius
        var drag = null;  // The drag behavior

        /**
         * Draw the conversation components.
         */
        var draw = function (selection) {
            // Draw the container
            var container = selection.append('g')
                .attr('class', 'component conversation')
                .attr('transform', function (d) {
                    return 'translate(' + [d.x, d.y] + ')';
                })
                .call(drag);

            // Draw the circle
            var circle = container.append('circle')
                .attr('r', radius)
                .style('fill', '#ddd');

            // Draw the conversation name
            var text = container.append('text')
                .text(function (d) { return d.name; })
                .attr('x', -(radius + 5))
                .attr('y', -(radius + 5));
        }

        /**
         * Draw Vumi Go conversation components.
         *
         * @param {selection} Conversation component selection.
         */
        var conversation = function(selection) {
            var enter = selection.enter();
            if (!enter.empty()) {
                draw(enter);
            }
            selection.exit().remove();
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
