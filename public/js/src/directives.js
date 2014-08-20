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
    'controlPointComponent',
    'menuComponent',
    'conversationLayout',
    'routerLayout',
    'channelLayout',
    'connectionLayout',
    'menuLayout',
    function ($rootScope, canvasBuilder, dragBehavior, componentHelper,
                   conversationComponent, channelComponent, routerComponent,
                   connectionComponent, controlPointComponent, menuComponent,
                   conversationLayout, routerLayout, channelLayout, connectionLayout,
                   menuLayout) {

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
            $scope.selectedEndpointId = null;
            $scope.componentSelected = false;
            $scope.connectPressed = false;

            $scope.refresh = function () {
                $rootScope.$emit('go:campaignDesignerRepaint');
            };

            $scope.connect = function () {
                $scope.connectPressed = !$scope.connectPressed;
            };

            // TODO: With the new release of AngularJS (1.3.x) use `$scope.$watchGroup`
            $scope.$watch(function () {
                return angular.toJson({
                    id: $scope.selectedComponentId,
                    endpointId: $scope.selectedEndpointId
                });

            }, function (newValue, oldValue) {
                newValue = angular.fromJson(newValue);
                oldValue = angular.fromJson(oldValue);

                // The very first time $watch fires this function oldValue will be the same as newValue
                if (newValue.id == oldValue.id &&
                        newValue.endpointId == oldValue.endpointId)
                    return;

                // If there was a component selected, unselect it.
                if (oldValue.id) {
                    var component = componentHelper.getById($scope.data, oldValue.id);
                    if (component) {
                        var metadata = componentHelper.getMetadata(component.data);
                        metadata.selected = false;

                        // If the selected component had a selected endpoint, unselect it
                        if (oldValue.endpointId) {
                            var endpoint = componentHelper.getEndpointById(component, oldValue.endpointId);
                            metadata = componentHelper.getMetadata(endpoint.data);
                            metadata.selected = false;
                        }
                    }
                }

                // If a new component has been selected update its metadata
                if (newValue.id) {
                    var component = componentHelper.getById($scope.data, newValue.id);
                    var metadata = componentHelper.getMetadata(component.data);
                    metadata.selected = true;

                    $scope.componentSelected = true;

                    // If the user selected a specific endpoint update it metadata
                    if (newValue.endpointId) {
                        var endpoint = componentHelper.getEndpointById(component, newValue.endpointId);
                        metadata = componentHelper.getMetadata(endpoint.data);
                        metadata.selected = true;
                    }

                    // If the connect button was pressed and there was a previously selected component,
                    // connect the components
                    if (oldValue.id && $scope.connectPressed) {
                        componentHelper.connectComponents(
                            $scope.data, oldValue.id, oldValue.endpointId,
                            newValue.id, newValue.endpointId);
                    }

                } else {
                    $scope.componentSelected = false;
                }

                $scope.connectPressed = false;
                $scope.refresh();  // Repaint the canvas
            });

            $rootScope.$on('go:campaignDesignerSelect', function (event, componentId, endpointId) {
                $scope.selectedComponentId = componentId || null;
                $scope.selectedEndpointId = endpointId || null;
            });

            $rootScope.$on('go:campaignDesignerConnect', function (event) {
                $scope.connect();
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
            var buildCanvas = canvasBuilder()
                .width(width)
                .height(height)
                .gridCellSize(scope.gridCellSize);

            var canvas = buildCanvas
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
                .canvasWidth(width)
                .canvasHeight(height)
                .gridCellSize(scope.gridCellSize)
                .call();

            var controlPointDrag = dragBehavior()
                .selectEnabled(false)
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

            var controlPoint = controlPointComponent()
                .drag(controlPointDrag);

            var menu = menuComponent();

            // Create layouts
            var layoutConversations = conversationLayout();
            var layoutRouters = routerLayout();
            var layoutChannels = channelLayout();
            var layoutConnections = connectionLayout();
            var layoutMenus = menuLayout();

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

                connectionLayer.selectAll('.control-point')
                    .data(function () {
                        var data = [];
                        for (var i = 0; i < scope.data.routing_entries.length; i++) {
                            for (var j = 0; j < scope.data.routing_entries[i].points.length; j++) {
                                data.push(scope.data.routing_entries[i].points[j]);
                            }
                        }
                        return data;

                    }, function (d) {
                        var meta = componentHelper.getMetadata(d);
                        return meta.id;
                    })
                    .call(controlPoint);

                // Draw context menus
                layoutMenus(scope.data);

                componentLayer.selectAll('.menu')
                    .data(function () {
                        var data = [];

                        for (var i = 0; i < scope.data.conversations.length; i++) {
                            var meta = componentHelper.getMetadata(scope.data.conversations[i]);
                            data.push(meta.menu);
                        }

                        for (var i = 0; i < scope.data.channels.length; i++) {
                            var meta = componentHelper.getMetadata(scope.data.channels[i]);
                            data.push(meta.menu);
                        }

                        for (var i = 0; i < scope.data.routers.length; i++) {
                            var meta = componentHelper.getMetadata(scope.data.routers[i]);
                            data.push(meta.menu);
                        }

                        for (var i = 0; i < scope.data.routing_entries.length; i++) {
                            var meta = componentHelper.getMetadata(scope.data.routing_entries[i]);
                            data.push(meta.menu);
                        }

                        return data;
                    })
                    .call(menu);
            }

            scope.zoomIn = function () {
                buildCanvas.zoomIn();
            };

            scope.zoomOut = function () {
                buildCanvas.zoomOut();
            };

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
