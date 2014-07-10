var services = angular.module('vumigo.services', []);

services.factory('svgToolbox', [function () {

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

services.factory('zoomBehavior', [function () {
    return function () {
        var zoomBehavior = null;  // Zoom behavior instance
        var canvas = null;  // Canvas to get zoomed/dragged
        var canvasWidth = 0; // Canvas width
        var canvasHeight = 0; // Canvas height
        var viewportElement = null;  // Viewport wrapped in a jQuery object
        var zoomExtent = [1, 10];  // Default zoom extent

        /**
         * Called when the canvas is dragged or scaled.
         */
        function zoomed() {
            var translate = d3.event.translate;
            var scale = d3.event.scale;

            if (translate[0] > 0) {
                translate[0] = 0;
            }

            if (translate[1] > 0) {
                translate[1] = 0;
            }

            // Prevent canvas being moved beyond the viewport
            if (viewportElement && viewportElement.length > 0) {
                if (canvasWidth > 0) {
                    var x = viewportElement.width() - canvasWidth * scale;
                    if (translate[0] < x) {
                        translate[0] = x;
                    }
                }

                if (canvasHeight > 0) {
                    var y = viewportElement.height() - canvasHeight * scale;
                    if (translate[1] < y) {
                        translate[1] = y;
                    }
                }
            }

            zoomBehavior.translate(translate);  // Set the zoom translation vector

            canvas.attr('transform', 'translate(' + translate + ')scale(' + scale + ')');
        }

        var zoom = function () {
            zoomBehavior = d3.behavior.zoom()
                .scaleExtent(zoomExtent)
                .on('zoom', zoomed);

            return zoomBehavior;
        };

        zoom.canvas = function(value) {
            if (!arguments.length) return canvas;
            canvas = value;
            return zoom;
        };

        zoom.canvasWidth = function(value) {
            if (!arguments.length) return canvasWidth;
            canvasWidth = value;
            return zoom;
        };

       zoom.canvasHeight = function(value) {
            if (!arguments.length) return canvasHeight;
            canvasHeight = value;
            return zoom;
        };

       zoom.viewportElement = function(value) {
            if (!arguments.length) return viewportElement;
            viewportElement = value;
            return zoom;
        };

        zoom.zoomExtent = function(value) {
            if (!arguments.length) return zoomExtent;
            zoomExtent = value;
            return zoom;
        };

        return zoom;
    };
}]);

services.factory('dragBehavior', ['$rootScope',
    function ($rootScope) {
        return function () {
            var canvasWidth = 0;
            var canvasHeight = 0;
            var gridCellSize = 0;
            var bboxPadding = 5;

            /**
             * Called when the user starts dragging a component
             */
            function dragstarted() {
                if (d3.event.sourceEvent) {
                    d3.event.sourceEvent.stopPropagation();
                }

                d3.selectAll('.component.selected')
                    .classed('selected', false)
                    .selectAll('.bbox')
                        .remove();

                var selection = d3.select(this)
                    .classed('selected', true)
                    .classed('dragging', true);

                var bbox = selection.node().getBBox();
                selection.append('rect')
                    .attr('class', 'bbox')
                    .attr('x', bbox.x - bboxPadding)
                    .attr('y', bbox.y - bboxPadding)
                    .attr('width', bbox.width + 2.0 * bboxPadding)
                    .attr('height', bbox.height + 2.0 * bboxPadding)
                    .attr('stroke-dasharray', "5,5");

                $rootScope.$apply(function () {
                    var d = selection.datum();
                    $rootScope.$emit('go:campaignDesignerSelect', d.uuid);
                });
            }

            /**
             * Called while the user is dragging a component
             */
            function dragged(d) {
                var x = d3.event.x;
                var y = d3.event.y;

                // If we have a grid, snap to it
                if (gridCellSize > 0) {
                    x = Math.round(x / gridCellSize) * gridCellSize;
                    y = Math.round(y / gridCellSize) * gridCellSize;
                }

                // Make sure components don't get dragged outside the canvas
                if (x < 0) x = 0;
                if (canvasWidth > 0) {
                    if (x > canvasWidth) x = canvasWidth;
                }

                if (y < 0) y = 0;
                if (canvasHeight > 0) {
                    if (y > canvasHeight) y = canvasHeight;
                }

                d.x = x;
                d.y = y;

                d3.select(this).attr('transform', 'translate(' + [x, y] + ')');

                $rootScope.$apply(function () {
                    $rootScope.$emit('go:campaignDesignerRepaint');
                });
            }

            /**
             * Called after the user drops a component
             */
            function dragended() {
                d3.select(this).classed('dragging', false);
            }

            var drag = function() {
                return d3.behavior.drag()
                    .on('dragstart', dragstarted)
                    .on('drag', dragged)
                    .on('dragend', dragended);
            }

            drag.canvasWidth = function(value) {
                if (!arguments.length) return canvasWidth;
                canvasWidth = value;
                return drag;
            };

           drag.canvasHeight = function(value) {
                if (!arguments.length) return canvasHeight;
                canvasHeight = value;
                return drag;
            };

           drag.gridCellSize = function(value) {
                if (!arguments.length) return gridCellSize;
                gridCellSize = value;
                return drag;
            };

            return drag;
        }
    }
]);

services.factory('canvasBuilder', ['zoomBehavior', 'svgToolbox',
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

services.factory('conversationLayout', [function () {
    return function() {
        var innerRadius = 10;
        var outerRadius = 30;
        var textMargin = 20;

        function layout(data) {
            angular.forEach(data, function (conversation) {
                var textX = -(outerRadius / 2.0 + textMargin);

                conversation._layout = {
                    inner: {
                        r: innerRadius
                    },
                    outer: {
                        r: outerRadius
                    },
                    name: {
                        x: textX
                    },
                    description: {
                        x: textX
                    }
                }
            });

            return data;
        }

        return layout;
    };
}]);

services.factory('conversationComponent', [function () {
    return function () {
        var dragBehavior = null;

        function enter(selection) {
            selection = selection.append('g')
                .attr('class', 'component conversation');

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

            selection
                .attr('transform', function (d) {
                    return 'translate(' + [d.x, d.y] + ')';
                });

            selection.selectAll('.disc.outer')
                .attr('r', function (d) { return d._layout.outer.r; })
                .style('fill', function (d) { return d.colour; });

            selection.selectAll('.disc.inner')
                .attr('r', function (d) { return d._layout.inner.r; });

            selection.selectAll('.name')
                .attr('x', function (d) { return d._layout.name.x })
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
        var conversation = function(selection) {
            enter(selection.enter());
            update(selection);
            exit(selection.exit());
            return conversation;
        };

       /**
         * Get/set the drag behaviour.
         *
         * @param {value} The new drag behaviour; when setting.
         * @return The current drag behaviour.
         */
        conversation.drag = function(value) {
            if (!arguments.length) return dragBehavior;
            dragBehavior = value;
            return conversation;
        };

        return conversation;
    };
}]);

services.factory('channelLayout', [function () {
    return function() {
        var innerRadius = 10;
        var maxOuterRadius = 100;
        var textOffset = 20;

        function layout(data) {
            angular.forEach(data, function (channel) {
                var outerRadius = innerRadius
                    + maxOuterRadius * channel.utilization;

                var textX = innerRadius / 2.0 + textOffset;

                channel._layout = {
                    inner: {
                        r: innerRadius
                    },
                    outer: {
                        r: outerRadius
                    },
                    name: {
                        x: textX
                    },
                    description: {
                        x: textX
                    }
                };
            });

            return data;
        }

        return layout;
    };
}]);

services.factory('channelComponent', [function () {
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

services.factory('routerLayout', [function () {
    return function() {
        var minSize = 60;
        var pinGap = 20;
        var pinHeadRadius = 5;

        function pins(router) {
            angular.forEach(router.conversation_endpoints, function (pin, i) {
                pin._layout = {
                    len: router._layout.r,
                    y: pinGap * (i - 1),
                    r: pinHeadRadius
                };
            });
        }

        function layout(data) {
            angular.forEach(data, function (router) {
                var size = Math.max(minSize, router.conversation_endpoints.length * pinGap);
                var radius = Math.sqrt(2.0 * Math.pow(size, 2)) / 2.0;

                router._layout = {
                    r: radius
                };

                pins(router);
            });

            return data;
        }

        layout.minSize = function(value) {
            if (!arguments.length) return minSize;
            minSize = value;
            return layout;
        };

        layout.pinGap = function(value) {
            if (!arguments.length) return pinGap;
            pinGap = value;
            return layout;
        };

        return layout;
    };
}]);

services.factory('routerComponent', [function () {
    return function () {
        var pin = pinComponent();
        var dragBehavior = null;

        function enter(selection) {
            selection = selection.append('g')
                .attr('class', 'component router');

            selection.append('circle')
                .attr('class', 'disc');

            selection.append('text')
                .attr('class', 'name');

            selection.append('g')
                .attr('class', 'pins');
        }

        function update(selection) {
            if (dragBehavior) selection.call(dragBehavior);

            selection.attr('transform', function (d) {
                return 'translate(' + [d.x, d.y] + ')';
            });

            selection.selectAll('.disc')
                .attr('r', function (d) { return d._layout.r; });

            selection.selectAll('.name')
                .style('font-size', function (d) {
                    return d._layout.r + 'px';
                })
                .text(function (d) { return d.name; });

            selection.select('.pins')
                .attr('transform', function (d) {
                    return 'translate(' + [-d._layout.r, 0] + ')';
                })
                .selectAll('.pin')
                    .data(function(d) { return d.conversation_endpoints; },
                             function(d) { return d.uuid; })
                    .call(pin);
        }

        function exit(selection) {
            selection.remove();
        }

        /**
         * Repaint router components.
         *
         * @param {selection} Selection containing routers.
         */
        var router = function (selection) {
            enter(selection.enter());
            update(selection);
            exit(selection.exit());
            return router;
        };

       /**
         * Get/set the drag behaviour.
         *
         * @param {value} The new drag behaviour; when setting.
         * @return The current drag behaviour.
         */
        router.drag = function(value) {
            if (!arguments.length) return dragBehavior;
            dragBehavior = value;
            return router;
        };

        return router;
    };

    function pinComponent() {
        function enter(selection) {
            selection = selection.append('g')
                .attr('class', 'pin');

            selection.append('circle')
                .attr('class', 'head');

            selection.append('line')
                .attr('class', 'line');
        }

        function update(selection) {
            selection
                .attr('transform', function (d) {
                    return 'translate(' + [-d._layout.len / 2.0, d._layout.y] + ')';
                });

            selection.select('.head')
                .attr('r', function (d) { return d._layout.r; })

            selection.select('.line')
                .attr('x2', function (d) { return d._layout.len; });
        }

        function exit(selection) {
            selection.remove();
        }

        function pin(selection) {
            enter(selection.enter());
            update(selection);
            exit(selection.exit());
            return pin;
        }

        return pin;
    }
}]);

services.factory('componentHelper', [function () {

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

services.factory('connectionLayout', ['componentHelper',
    function (componentHelper) {
        return function() {

            /**
             * Return the X and Y coordinates of the given component's endpoint.
             */
            function point(component, endpointId) {
                var x = component.data.x;
                var y = component.data.y;
                // if (component.type == 'router' && endpointId) {
                //     var endpoint = null;
                //     for (var i = 0; i < component.data.conversation_endpoints.length; i++) {
                //         if (component.data.conversation_endpoints[i].uuid = endpointId) {
                //             endpoint = component.data.conversation_endpoints[i];
                //         }
                //     }
                //     if (endpoint) {
                //         x = x - (component.data._layout.r + endpoint._layout.len / 2.0);
                //     }
                // }
                return {x: x, y: y};
            }

            function layout(data) {
                angular.forEach(data.routing_entries, function (connection) {
                    var source = componentHelper.getByEndpointId(data, connection.source.uuid);
                    var target = componentHelper.getByEndpointId(data, connection.target.uuid);

                    connection.points = [];
                    connection.points.push(point(source, connection.source.uuid));
                    connection.points.push(point(target, connection.target.uuid));
                });

                return data;
            }

            return layout;
        };
    }
]);

services.factory('connectionComponent', [function () {
    return function () {

        function enter(selection) {
            selection.append('path')
                .attr('class', 'component connection')
                .attr('stroke', 'black')
                .attr('stroke-width', 5)
                .attr('fill', 'none');
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
