
angular.module('vumigo.services').factory('svgToolbox', [function () {

    /**
     * Select the first element from the given selection that matches the
     * selector. If selector matches nothing a new element is created.
     */
    function selectOrAppend(selection, selector) {
        var element = selection.select(selector);
        if (element.empty()) {
            return selection.append(selector);
        }
        return element;
    }

    /**
     * Create an SVG filter which gives a shadow effect
     * when applied to an SVG element.
     */
    function createShadowFilter(selection) {
        var filterId = 'shadow';
        var defs = selectOrAppend(selection, 'defs');
        if (defs.select('filter#' + filterId).empty()) {
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
    }

    /**
     * Draw a grid of the supplied width and height in the given selection.
     */
    function drawGrid(selection, width, height, cellSize) {
        if (cellSize > 0) {
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
    }

    return {
        selectOrAppend: selectOrAppend,
        createShadowFilter: createShadowFilter,
        drawGrid: drawGrid
    };
}]);

angular.module('vumigo.services').factory('canvasBuilder', ['zoomBehavior', 'svgToolbox',
    function (zoomBehavior, svgToolbox) {
        return function () {
            var width = 2048;  // Default canvas width
            var height = 2048;  // Default canvas height
            var gridCellSize = 0;  // Disable grid by default

            var canvas = function(selection) {
                var viewportElement = $(selection[0]);

                var svg = svgToolbox.selectOrAppend(selection, 'svg')
                    .attr('width', width)
                    .attr('height', height);

                svgToolbox.createShadowFilter(svg);

                var container = svg.append('g')
                    .attr('class', 'container')
                    .attr('transform', 'translate(0, 0)');

                var rect = container.append('rect')
                    .attr('width', width)
                    .attr('height', height)
                    .style('fill', 'none')
                    .style('pointer-events', 'all');

                var canvas = container.append('g')
                    .attr('class', 'canvas');

                svgToolbox.drawGrid(canvas, width, height, gridCellSize);

                var zoom = zoomBehavior()
                    .canvas(canvas)
                    .canvasWidth(width)
                    .canvasHeight(height)
                    .viewportElement(viewportElement)
                    .call();

                container.on('mousedown', function () {
                    d3.select(this).classed('dragging', true);
                }).on('mouseup', function () {
                    d3.select(this).classed('dragging', false);
                }).call(zoom);

                return canvas;
            };

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
    }
]);

angular.module('vumigo.services').factory('componentHelper', [function () {

    function getById(data, componentId) {
        for (var i = 0; i < data.conversations.length; i++) {
            if (data.conversations[i].uuid == componentId) {
                return {type: 'conversation', data: data.conversations[i]}
            }
        }

        for (var i = 0; i < data.channels.length; i++) {
            if (data.channels[i].uuid == componentId) {
                return {type: 'channel', data: data.channels[i]}
            }
        }

        for (var i = 0; i < data.routers.length; i++) {
            if (data.routers[i].uuid == componentId) {
                return {type: 'router', data: data.routers[i]}
            }
        }

        return null;
    };

    function getByEndpointId(data, endpointId) {
        for (var i = 0; i < data.conversations.length; i++) {
            for (var j = 0; j < data.conversations[i].endpoints.length; j++) {
                if (data.conversations[i].endpoints[j].uuid == endpointId) {
                    return {type: 'conversation', data: data.conversations[i]};
                }
            }
        }

        for (var i = 0; i < data.channels.length; i++) {
            for (var j = 0; j < data.channels[i].endpoints.length; j++) {
                if (data.channels[i].endpoints[j].uuid == endpointId) {
                    return {type: 'channel', data: data.channels[i]};
                }
            }
        }

        for (var i = 0; i < data.routers.length; i++) {
            for (var j = 0; j < data.routers[i].conversation_endpoints.length; j++) {
                if (data.routers[i].conversation_endpoints[j].uuid == endpointId) {
                    return {type: 'router', data: data.routers[i]};
                }
            }

            for (var j = 0; j < data.routers[i].channel_endpoints.length; j++) {
                if (data.routers[i].channel_endpoints[j].uuid == endpointId) {
                    return {type: 'router', data: data.routers[i]};
                }
            }
        }

        return null;
    };

    function connectComponents(data, sourceId, targetId) {
        var source = getById(data, sourceId);
        var target = getById(data, targetId);

        if (!source || !target || source.type == target.type) return;

        var sourceEndpoint = null;
        if (['conversation', 'channel'].indexOf(source.type) != -1) {
            sourceEndpoint = source.data.endpoints[0];

        } else if (source.type == 'router') {
            if (target.type == 'conversation') {
                sourceEndpoint = source.data.conversation_endpoints[0];

            } else if (target.type == 'channel') {
                sourceEndpoint = source.data.channel_endpoints[0];
            }
        }

        var targetEndpoint = null;
        if (['conversation', 'channel'].indexOf(target.type) != -1) {
            targetEndpoint = target.data.endpoints[0];

        } else if (target.type == 'router') {
            if (source.type == 'conversation') {
                targetEndpoint = target.data.conversation_endpoints[0];

            } else if (source.type == 'channel') {
                sourceEndpoint = target.data.channel_endpoints[0];
            }
        }

        if (sourceEndpoint && targetEndpoint) {
            data.routing_entries.push({
                source: {uuid: sourceEndpoint.uuid},
                target: {uuid: targetEndpoint.uuid},
            });
        }
    }

    return {
        getById: getById,
        getByEndpointId: getByEndpointId,
        connectComponents: connectComponents
    };

}]);
