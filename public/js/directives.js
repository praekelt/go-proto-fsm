var directives = angular.module('goprotofsm.directives', []);

directives.directive('goCampaignDesigner', [
    function () {
        var elementId = 'campaign-designer';
        var defaultCanvasWidth = 2048;
        var defaultCanvasHeight = 2048;
        var defaultGridCellSize = 20;

        function addFilters(svg) {
            var defs = svg.append('defs');

            // A transparent grey drop-shadow that blends with the background colour
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

            var merge = filter.append('feMerge');
            merge.append('feMergeNode').attr('in', 'offsetBlur');
            merge.append('feMergeNode').attr('in', 'SourceGraphic');
        }

        function drawAxis(canvas, canvasWidth, canvasHeight, gridCellSize) {
            // Draw the X axis
            canvas.append('g')
                    .attr('class', 'x axis')
                .selectAll('line')
                    .data(d3.range(0, canvasWidth, gridCellSize))
                .enter().append('line')
                    .attr('x1', function (d) { return d; })
                    .attr('y1', 0)
                    .attr('x2', function (d) { return d; })
                    .attr('y2', canvasHeight);

            // Draw the Y axis
            canvas.append('g')
                    .attr('class', 'y axis')
                .selectAll('line')
                    .data(d3.range(0, canvasHeight, gridCellSize))
                .enter().append('line')
                    .attr('x1', 0)
                    .attr('y1', function (d) { return d; })
                    .attr('x2', canvasWidth)
                    .attr('y2', function (d) { return d; });
        }

        return {
            restrict: 'E',
            replace: true,
            template: '<div id="' + elementId + '"></div>',
            scope: {
                canvasWidth: '=?',
                canvasHeight: '=?',
                gridCellSize: '=?'
            },
            controller: ['$scope', '$element', '$attrs', '$transclude',
                function ($scope, $element, $attrs, $transclude) {
                }
            ],
            link: function (scope, element, attrs) {
                var canvasWidth = scope.canvasWidth || defaultCanvasWidth;
                var canvasHeight = scope.canvasHeight || defaultCanvasHeight;
                var gridCellSize = scope.gridCellSize || defaultGridCellSize;

                // Round up the width and height to the next `gridCellSize`
                var width = Math.ceil(canvasWidth / gridCellSize) * gridCellSize;
                var height = Math.ceil(canvasHeight / gridCellSize) * gridCellSize;

                // Create the zoom behavior
                var zoom = d3.behavior.zoom()
                    .scaleExtent([1, 10])
                    .on('zoom', zoomed);

                // Create the drag behavior
                var drag = d3.behavior.drag()
                    .origin(function (d) { return d; })
                    .on('dragstart', dragstarted)
                    .on('drag', dragged)
                    .on('dragend', dragended);

                // Construct a zoomable/pannable SVG canvas
                var svg = d3.select('#' + elementId).append('svg')
                    .attr('width', width)
                    .attr('height', height);

                addFilters(svg);

                var container = svg.append('g')
                    .attr('transform', 'translate(0, 0)')
                    .call(zoom)
                    .on('mousedown', function (e) {
                        d3.select(this).classed('dragging', true);
                    }).on('mouseup', function (e) {
                        d3.select(this).classed('dragging', false);
                    });

                container.append('rect')
                    .attr('width', width)
                    .attr('height', height)
                    .style('fill', 'none')
                    .style('pointer-events', 'all');

                var canvas = container.append('g')
                        .attr('class', 'canvas');

                drawAxis(canvas, width, height, gridCellSize);

                // Add a circle that we can drag around
                var shapes = canvas.append('g').attr('class', 'layer shapes');

                var circle = shapes.selectAll('circle')
                        .data([{x: 200, y: 200, r: 30}])
                    .enter().append('circle')
                        .attr('class', 'shape')
                        .attr('r', function (d) { return d.r; })
                        .attr('cx', function (d) { return d.x; })
                        .attr('cy', function (d) { return d.y; })
                        .style('fill', '#ddd')
                        .call(drag);

                function zoomed() {
                    // Prevent canvas being moved beyond the viewport
                    var translate = d3.event.translate;
                    var scale = d3.event.scale;

                    if (translate[0] > 0) translate[0] = 0;
                    var limit = element.width() - width * scale;
                    if (translate[0] < limit) translate[0] = limit;

                    if (translate[1] > 0) { translate[1] = 0; }
                    limit = element.height() - height * scale;
                    if (translate[1] < limit) { translate[1] = limit; }

                    zoom.translate(translate);  // Set the zoom translation vector

                    canvas.attr('transform', 'translate(' + translate + ')scale(' + scale + ')');
                }

                function dragstarted(d) {
                    d3.event.sourceEvent.stopPropagation();
                    d3.select(this).classed('dragging', true);
                }

                function dragged(d) {
                    var x = Math.ceil(d3.event.x / gridCellSize) * gridCellSize;
                    var y = Math.ceil(d3.event.y / gridCellSize) * gridCellSize;
                    d3.select(this).attr('cx', d.x = x).attr('cy', d.y = y);
                }

                function dragended(d) {
                    d3.select(this).classed('dragging', false);
                }
            }
        };
    }
]);
