var directives = angular.module('vumigo.directives', []);

/**
 * Directive to render the Vumi Go Campaign Designer.
 */
directives.directive('goCampaignDesigner', ['$rootScope', 'filters', 'conversations', 'utils',
    function ($rootScope, filters, conversations, utils) {
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
                .attr('class', 'container')
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
            var selection = d3.selectAll(element.toArray());

            var width = scope.canvasWidth;
            var height = scope.canvasHeight;

            // Round up the `width` and `height` to the next `scope.gridCellSize`
            if (scope.gridCellSize > 0) {
                width = Math.ceil(width / scope.gridCellSize) * scope.gridCellSize;
                height = Math.ceil(height / scope.gridCellSize) * scope.gridCellSize;
            }

            // Create behaviors
            var zoom = utils.createZoomBehavior(zoomExtent, zoomed);
            var drag = utils.createDragBehavior(dragstarted, dragged, dragended);

            // Create the SVG element
            var svg = utils.createSvg(selection, width, height);

            // Create filters
            filters.addDropShadow(svg);

            // Create our canvas and draw the grid
            var canvas = createCanvas(svg, width, height, zoom);
            utils.drawGrid(canvas, width, height, scope.gridCellSize);

            // Create conversation component
            var conversation = conversations().radius(30).drag(drag);

            repaint(); // Do initial draw

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

                // Make sure objects don't get dragged outside the canvas
                if (x < 0) x = 0;
                if (x > width) x = width;
                if (y < 0) y = 0;
                if (y > height) y = height;

                d.x = x;
                d.y = y;

                d3.select(this).attr('transform', 'translate(' + [x, y] + ')');
            }

            /** Called after the user drops an object */
            function dragended(d) {
                d3.select(this).classed('dragging', false);
            }

            /** Repaint the canvas **/
            function repaint() {
                canvas.selectAll('.conversation')
                    .data(scope.data.conversations)
                    .call(conversation);
            }

            $rootScope.$on('campaignDesignerRepaint', repaint);  // Triggered by $rootScope.$emit('campaignDesignerRepaint')
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
