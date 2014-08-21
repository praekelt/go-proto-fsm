
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
                    })
                    .on('mouseup', function () {
                        d3.select(this).classed('dragging', false);
                        var coordinates = d3.mouse(this);
                        $rootScope.$apply(function () {
                            $rootScope.$emit('go:campaignDesignerClick', coordinates);
                        });
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
                    var zoomFactor = newZoom / currentZoom;

                    var newX = zoom.translate()[0] - ((viewportCenterX * zoomFactor) - viewportCenterX);
                    var newY = zoom.translate()[1] - ((viewportCenterY * zoomFactor) - viewportCenterY);

                } else {
                    var newZoom = currentZoom * zoomOutFactor;
                    if (newZoom < zoomExtent[0]) newZoom = zoomExtent[0];
                    var zoomFactor = newZoom / currentZoom;

                    var newX = zoom.translate()[0] - ((viewportCenterX * zoomFactor) - viewportCenterX);
                    var newY = zoom.translate()[1] - ((viewportCenterY * zoomFactor) - viewportCenterY);
                }

                zoom.scale(newZoom).translate([newX, newY]).event(container);
            };

            return canvas;
        };
    }
]);

angular.module('vumigo.services').factory('componentHelper', ['$rootScope', 'rfc4122',
    function ($rootScope, rfc4122) {
        var bboxPadding = 5;

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

            for (var i = 0; i < data.routing_entries.length; i++) {
                if (data.routing_entries[i].uuid == componentId) {
                    return {type: 'connection', data: data.routing_entries[i]}
                }
            }

            return null;
        };

        function removeById(data, componentId) {

            /**
             * Helper function to remove component with the given
             * `componentId` in the given `data`.
             */
            var remove = function (data) {
                for (var i = 0; i < data.length; i++) {
                    if (data[i].uuid == componentId) {
                        data.splice(i, 1);
                        return true;
                    }
                }
                return false;
            };

            return remove(data.conversations)
                || remove(data.channels)
                || remove(data.routers)
                || remove(data.routing_entries);
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

        function connectComponents(data, sourceComponentId, sourceEndpointId,
                                                        targetComponentId, targetEndpointId) {

            var source = getById(data, sourceComponentId);
            var target = getById(data, targetComponentId);

            if (!source || !target || source.type == target.type) return;

            if (!sourceEndpointId) {
                if (['conversation', 'channel'].indexOf(source.type) != -1) {
                    sourceEndpointId = source.data.endpoints[0].uuid;

                } else if (source.type == 'router') {
                    if (target.type == 'conversation') {
                        sourceEndpointId = source.data.conversation_endpoints[0].uuid;

                    } else if (target.type == 'channel') {
                        sourceEndpointId = source.data.channel_endpoints[0].uuid;
                    }
                }
            }

            if (!targetEndpointId) {
                if (['conversation', 'channel'].indexOf(target.type) != -1) {
                    targetEndpointId = target.data.endpoints[0].uuid;

                } else if (target.type == 'router') {
                    if (source.type == 'conversation') {
                        targetEndpointId = target.data.conversation_endpoints[0].uuid;

                    } else if (source.type == 'channel') {
                        targetEndpointId = target.data.channel_endpoints[0].uuid;
                    }
                }
            }

            if (sourceEndpointId && targetEndpointId) {
                data.routing_entries.push({
                    uuid: rfc4122.v4(),
                    source: {
                        uuid: sourceEndpointId
                    },
                    target: {
                        uuid: targetEndpointId
                    }
                });
            }
        }

        function getEndpointById(component, endpointId) {
            if (component.type == 'router') {
                for (var i = 0; i < component.data.conversation_endpoints.length; i++) {
                    if (component.data.conversation_endpoints[i].uuid == endpointId) {
                        return {
                            data: component.data.conversation_endpoints[i],
                            type: 'conversation'
                        };
                    }
                }

                for (var i = 0; i < component.data.channel_endpoints.length; i++) {
                    if (component.data.channel_endpoints[i].uuid == endpointId) {
                        return {
                            data: component.data.channel_endpoints[i],
                            type: 'channel'
                        };
                    }
                }

            } else {
                for (var i = 0; i < component.data.endpoints.length; i++) {
                    if (component.data.endpoints[i].uuid == endpointId) {
                        return {
                            data: component.data.endpoints[i]
                        };
                    }
                }
            }

            return null;
        }

        function getMetadata(component) {
            if (!angular.isDefined(component._meta)) {
                component._meta = {};
            }
            return component._meta;
        }

        function addComponent(data, component, x, y) {
            angular.extend(component.data, {
                uuid: rfc4122.v4(),
                x: x,
                y: y
            });

            switch (component.type) {
                case 'conversation':
                    data.conversations.push(component.data);
                    break;

                case 'channel':
                    data.channels.push(component.data);
                    break;

                case 'router':
                    data.routers.push(component.data);
                    break;
            }
        }

        return {
            getById: getById,
            removeById: removeById,
            getByEndpointId: getByEndpointId,
            connectComponents: connectComponents,
            getEndpointById: getEndpointById,
            getMetadata: getMetadata,
            addComponent: addComponent
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
