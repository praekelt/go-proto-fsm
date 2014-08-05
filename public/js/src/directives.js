var directives = angular.module('vumigo.directives', []);

/**
 * Directive to render the Vumi Go Campaign Designer.
 */
directives.directive('goCampaignDesigner', [
    '$rootScope',
    'canvasBuilder',
    'dragBehavior',
    'componentHelper',
    'conversationComponent',
    'channelComponent',
    'routerComponent',
    'connectionComponent',
    'conversationLayout',
    'routerLayout',
    'channelLayout',
    'connectionLayout',
    'controlPointComponent',
    function ($rootScope, canvasBuilder, dragBehavior, componentHelper,
                   conversationComponent, channelComponent, routerComponent,
                   connectionComponent, conversationLayout, routerLayout,
                   channelLayout, connectionLayout, controlPointComponent) {

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

            $scope.selectedComponentId = null;
            $scope.componentSelected = false;
            $scope.connectPressed = false;

            $scope.refresh = function () {
                $rootScope.$emit('go:campaignDesignerRepaint');
            };

            $scope.connect = function () {
                $scope.connectPressed = !$scope.connectPressed;
            };

            $scope.$watch('selectedComponentId', function (newValue, oldValue) {
                if (newValue == oldValue) return;

                if (oldValue) {
                    var component = componentHelper.getById($scope.data, oldValue);
                    var metadata = componentHelper.getMetadata(component.data);
                    metadata.selected = false;
                }

                if (newValue) {
                    var component = componentHelper.getById($scope.data, newValue);
                    var metadata = componentHelper.getMetadata(component.data);
                    metadata.selected = true;

                    $scope.componentSelected = true;

                    if (oldValue && $scope.connectPressed) {
                        componentHelper.connectComponents($scope.data, oldValue, newValue);
                    }

                } else {
                    $scope.componentSelected = false;
                }

                $scope.connectPressed = false;
                $scope.refresh();
            });

            $rootScope.$on('go:campaignDesignerSelect', function (event, componentId) {
                $scope.selectedComponentId = componentId;
            });
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

            // Create our canvas
            var canvas = canvasBuilder()
                .width(width)
                .height(height)
                .gridCellSize(scope.gridCellSize)
                .apply(null, [d3.selectAll(element.toArray())]);

            // Add the layers to our canvas
            var connectionLayer = canvas.append('g')
                .attr('class', 'layer connections');

            var componentLayer = canvas.append('g')
                .attr('class', 'layer components');

            // Construct behaviors
            var drag = dragBehavior()
                .canvasWidth(width)
                .canvasHeight(height)
                .gridCellSize(scope.gridCellSize)
                .call();

            var connectionDrag = dragBehavior()
                .dragEnabled(false)
                .drawBoundingBox(false)
                .canvasWidth(width)
                .canvasHeight(height)
                .gridCellSize(scope.gridCellSize)
                .call();

            var controlPointDrag = dragBehavior()
                .selectEnabled(false)
                .drawBoundingBox(false)
                .canvasWidth(width)
                .canvasHeight(height)
                .gridCellSize(scope.gridCellSize)
                .call();

            // Create and configure our components
            var conversation = conversationComponent()
                .drag(drag);

            var channel = channelComponent()
                .drag(drag);

            var router = routerComponent()
                .drag(drag);

            var connection = connectionComponent()
                .drag(connectionDrag);

            // Create layouts
            var layoutConversations = conversationLayout();
            var layoutRouters = routerLayout();
            var layoutChannels = channelLayout();
            var layoutConnections = connectionLayout();

            repaint(); // Do initial draw

            /** Repaint the canvas **/
            function repaint() {
                // Draw components
                componentLayer.selectAll('.conversation')
                    .data(layoutConversations(scope.data.conversations))
                    .call(conversation);

                componentLayer.selectAll('.channel')
                    .data(layoutChannels(scope.data.channels))
                    .call(channel);

                componentLayer.selectAll('.router')
                    .data(layoutRouters(scope.data.routers))
                    .call(router);

                // Draw connections and control points
                connectionLayer.selectAll('.connection')
                    .data(layoutConnections(scope.data).routing_entries)
                    .call(connection);

                angular.forEach(scope.data.routing_entries, function (connection) {
                    var controlPoint = controlPointComponent()
                        .drag(controlPointDrag)
                        .connectionId(connection.uuid);

                    var selector = '.control-point[data-connection-uuid="'
                        + connection.uuid + '"]';

                    connectionLayer.selectAll(selector)
                        .data(connection.points)
                        .call(controlPoint);
                });
            }

            $rootScope.$on('go:campaignDesignerRepaint', repaint);
        }

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/directives/go_campaign_designer.html',
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
