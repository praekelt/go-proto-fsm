var directives = angular.module('vumigo.directives', []);

/**
 * Directive to render the Vumi Go Campaign Designer.
 */
directives.directive('goCampaignDesigner', ['filters', 'conversations', 'utils',
    function (filters, conversations, utils) {
        var elementId = 'campaign-designer';
        var canvasWidth = 2048;
        var canvasHeight = 2048;
        var gridCellSize = 20;
        var zoomExtent = [1, 10];

        /**
         * Directive controller constructor.
         *
         * @param {$scope} Reference to the directive's isolate scope.
         * @param {$element} DOM element wrapped in a jQuery object.
         * @param {$attrs} Attributes object for the element.
         * @param {$transclude} Transclude linking function.
         */
        function controller($scope, $element, $attrs, $transclude) {
            // If any scope attributes are not supplied use the default values
            if (!angular.isDefined($scope.canvasWidth)) {
                $scope.canvasWidth = canvasWidth;
            }

            if (!angular.isDefined($scope.canvasHeight)) {
                $scope.canvasHeight = canvasHeight;
            }

            if (!angular.isDefined($scope.gridCellSize)) {
                $scope.gridCellSize = gridCellSize;
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
            var extent = extent || zoomExtent;
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
         * @param {width} The svg canvas width.
         * @param {height} The svg canvas height.
         */
        function createSvg(width, height) {
            var svg = d3.select('#' + elementId).append('svg')
                .attr('width', width)
                .attr('height', height);

            return svg;
        }

        /**
         * Return a zoomable/pannable canvas element.
         *
         * @param {svg} The <svg> element.
         * @param {width} The canvas width.
         * @param {height} The canvas height.
         * @param {zoom} The zoom behavior.
         * @return Zoomable/pannable canvas.
         */
        function createCanvas(svg, width, height, zoom) {
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

            return canvas;
        }

        /**
         * Directive link function.
         *
         * @param {$scope} Reference to the directive's isolate scope.
         * @param {$element} DOM element wrapped in a jQuery object.
         * @param {$attrs} Attributes object for the element.
         */
        function link(scope, element, attrs) {
            var width = scope.canvasWidth;
            var height = scope.canvasHeight;

            // Round up the `width` and `height` to the next `scope.gridCellSize`
            if (scope.gridCellSize > 0) {
                width = Math.ceil(width / scope.gridCellSize) * scope.gridCellSize;
                height = Math.ceil(height / scope.gridCellSize) * scope.gridCellSize;
            }

            var zoom = createZoomBehavior([1, 10], zoomed);
            var drag = createDragBehavior(dragstarted, dragged, dragended);

            var svg = createSvg(width, height);
            filters.dropShadow(svg);

            var canvas = createCanvas(svg, width, height, zoom);
            utils.drawGrid(canvas, width, height, scope.gridCellSize);

            // Draw conversations
            var conversation = conversations().radius(30);
            canvas.selectAll('.conversation')
                .data(scope.data.conversations)
                .call(conversation)
                .call(drag);

            /** Called when the canvas is dragged or scaled. */
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

            /** Called when the user starts dragging an object */
            function dragstarted(d) {
                d3.event.sourceEvent.stopPropagation();
                d3.select(this).classed('dragging', true);
            }

            /** Called while the user is dragging an object */
            function dragged(d) {
                var x = d3.event.x;
                var y = d3.event.y;

                // If we have a grid, snap to it
                if (scope.gridCellSize > 0) {
                    x = Math.ceil(x / scope.gridCellSize) * scope.gridCellSize;
                    y = Math.ceil(y / scope.gridCellSize) * scope.gridCellSize;
                }

                d.x = x;
                d.y = y;

                d3.select(this).attr('transform', 'translate(' + [x, y] + ')');
            }

            /** Called after the user drops an object */
            function dragended(d) {
                d3.select(this).classed('dragging', false);
            }
        }

        return {
            restrict: 'E',
            replace: true,
            template: '<div id="' + elementId + '"></div>',
            scope: {
                data: '=',
                canvasWidth: '=?',
                canvasHeight: '=?',
                gridCellSize: '=?'  // Set to 0 to disable grid
            },
            controller: ['$scope', '$element', '$attrs', '$transclude', controller],
            link: link
        };
    }
]);
