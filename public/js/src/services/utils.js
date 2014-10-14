
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

angular.module('vumigo.services').factory('canvasBuilder', [
    '$rootScope', 'zoomBehavior', 'svgToolbox',
    function ($rootScope, zoomBehavior, svgToolbox) {
        return function () {
            var width = 2048;  // Default canvas width
            var height = 2048;  // Default canvas height
            var gridCellSize = 0;  // Disable grid by default
            var container = null;
            var zoom = null;
            var zoomInFactor = 1.1;
            var zoomOutFactor = 0.9;
            var viewportElement = null;

            var canvas = function(selection) {
                viewportElement = $(selection[0]);

                var svg = svgToolbox.selectOrAppend(selection, 'svg')
                    .attr('width', width)
                    .attr('height', height);

                svgToolbox.createShadowFilter(svg);

                container = svg.append('g')
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

                zoom = zoomBehavior()
                    .canvas(canvas)
                    .canvasWidth(width)
                    .canvasHeight(height)
                    .viewportElement(viewportElement)
                    .call();

                container
                    .on('mousedown', function () {
                        d3.select(this).classed('dragging', true);

                        var coordinates = d3.mouse(this);
                        $rootScope.$apply(function () {
                            $rootScope.$emit('go:campaignDesignerClick', coordinates);
                        });
                    })
                    .on('mouseup', function () {
                        d3.select(this).classed('dragging', false);
                    })
                    .call(zoom);

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

            /**
             * Zoom the canvas in the given direction (in/out).
             */
            canvas.zoom = function(direction) {
                var zoomExtent = zoom.scaleExtent();
                var currentZoom = zoom.scale();
                var viewportWidth = viewportElement.width();
                var viewportHeight = viewportElement.height();
                var viewportCenterX = (viewportWidth / 2) - zoom.translate()[0];
                var viewportCenterY = (viewportHeight / 2) - zoom.translate()[1];

                if (direction == 'in') {
                    var newZoom = currentZoom * zoomInFactor;
                    if (newZoom > zoomExtent[1]) newZoom = zoomExtent[1];

                } else {
                    var newZoom = currentZoom * zoomOutFactor;
                    if (newZoom < zoomExtent[0]) newZoom = zoomExtent[0];
                }

                var zoomFactor = newZoom / currentZoom;
                var newX = zoom.translate()[0] - ((viewportCenterX * zoomFactor) - viewportCenterX);
                var newY = zoom.translate()[1] - ((viewportCenterY * zoomFactor) - viewportCenterY);

                zoom.scale(newZoom).translate([newX, newY]).event(container);
            };

            return canvas;
        };
    }
]);

angular.module('vumigo.services').factory('boundingBox', [function () {
    return function () {
        var padding = 5;

        var boundingBox = function (selection) {
            selection.each(function (d) {
                var selection = d3.select(this);
                selection.selectAll('.bbox').remove();
                if (d._meta.selected) {
                    var bbox = selection.node().getBBox();
                    selection.insert('rect', ':first-child')
                        .attr('class', 'bbox')
                        .attr('x', bbox.x - padding)
                        .attr('y', bbox.y - padding)
                        .attr('width', bbox.width + 2.0 * padding)
                        .attr('height', bbox.height + 2.0 * padding);
                }
            });

            return boundingBox;
        };

        boundingBox.padding = function(value) {
            if (!arguments.length) return padding;
            padding = value;
            return boundingBox;
        };

        return boundingBox;
    };
}]);

angular.module('vumigo.services').factory('goUtils', [function () {

    function midpoint(x1, y1, x2, y2) {
        return {
            x: x1 + (x2 - x1) / 2,
            y: y1 + (y2 - y1) / 2
        }
    }

    return {
        midpoint: midpoint
    };
}]);
