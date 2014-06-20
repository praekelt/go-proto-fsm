var directives = angular.module('vumigo.directives', []);

/**
 * Directive to render the Vumi Go Campaign Designer.
 */
directives.directive('goCampaignDesigner', ['$rootScope', 'canvas', 'conversation',
    function ($rootScope, canvasService, conversationService) {
        var canvasWidth = 2048;
        var canvasHeight = 2048;
        var gridCellSize = 20;

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
         * Directive link function.
         *
         * @param {$scope} Reference to the directive's isolate scope.
         * @param {$element} DOM element wrapped in a jQuery object.
         * @param {$attrs} Attributes object for the element.
         */
        function link(scope, element, attrs) {
            var canvasFactory = canvasService()
                .width(scope.canvasWidth)
                .height(scope.canvasHeight)
                .gridCellSize(scope.gridCellSize);

            var canvas = canvasFactory(d3.selectAll(element.toArray()));

            var drag = d3.behavior.drag()
                .on('dragstart', dragstarted)
                .on('drag', dragged)
                .on('dragend', dragended);

            conversation = conversationService().drag(drag);

            repaint(); // Do initial draw

            /** Called when the user starts dragging a component */
            function dragstarted() {
                if (d3.event.sourceEvent) {
                    d3.event.sourceEvent.stopPropagation();
                }
                d3.select(this).classed('dragging', true);
            }

            /** Called while the user is dragging a component */
            function dragged(d) {
                var x = d3.event.x;
                var y = d3.event.y;

                // If we have a grid, snap to it
                var cellSize = canvasFactory.gridCellSize;
                if (cellSize > 0) {
                    x = Math.ceil(x / cellSize) * cellSize;
                    y = Math.ceil(y / cellSize) * cellSize;
                }

                // Make sure components don't get dragged outside the canvas
                var width = canvasFactory.width();
                if (x < 0) x = 0;
                if (x > width) x = width;

                var height = canvasFactory.height();
                if (y < 0) y = 0;
                if (y > height) y = height;

                d.x = x;
                d.y = y;

                d3.select(this).attr('transform', 'translate(' + [x, y] + ')');
            }

            /** Called after the user drops a component */
            function dragended() {
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
            template: '<div id="campaign-designer"></div>',
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
