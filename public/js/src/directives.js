var directives = angular.module('vumigo.directives', []);

/**
 * Directive to render the Vumi Go Campaign Designer.
 */
directives.directive('goCampaignDesigner', [
    '$rootScope',
    'canvasBuilder',
    'dragBehavior',
    'conversationComponent',
    'channelComponent',
    'routerComponent',
    'routerLayout',
    function ($rootScope, canvasBuilder, dragBehavior, conversationComponent,
                   channelComponent, routerComponent, routerLayout) {
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
            var width = scope.canvasWidth;
            var height = scope.canvasHeight;

            // Round `width` and `height` up to the nearest `scope.gridCellSize`
            if (scope.gridCellSize > 0) {
                width = Math.ceil(width / scope.gridCellSize) * scope.gridCellSize;
                height = Math.ceil(height / scope.gridCellSize) * scope.gridCellSize;
            }

            var canvas = canvasBuilder()
                .width(width)
                .height(height)
                .gridCellSize(scope.gridCellSize)
                .apply(null, [d3.selectAll(element.toArray())]);

            var drag = dragBehavior()
                .canvasWidth(width)
                .canvasHeight(height)
                .gridCellSize(scope.gridCellSize)
                .call();

            var conversation = conversationComponent().drag(drag);
            var channel = channelComponent().drag(drag);
            var router = routerComponent().drag(drag);

            var layoutRouters = routerLayout();

            repaint(); // Do initial draw

            /** Repaint the canvas **/
            function repaint() {
                canvas.selectAll('.conversation')
                    .data(scope.data.conversations)
                    .call(conversation);

                canvas.selectAll('.channel')
                    .data(scope.data.channels)
                    .call(channel);

                canvas.selectAll('.router')
                    .data(layoutRouters(scope.data.routers))
                    .call(router);
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
