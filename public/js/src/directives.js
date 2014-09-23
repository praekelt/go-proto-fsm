var directives = angular.module('vumigo.directives', []);

/**
 * Directive to render the Vumi Go Campaign Designer.
 */
directives.directive('goCampaignDesigner', [
    '$rootScope',
    '$modal',
    'canvasBuilder',
    'dragBehavior',
    'conversationComponent',
    'channelComponent',
    'routerComponent',
    'connectionComponent',
    'controlPointComponent',
    'routeComponent',
    'menuComponent',
    'ComponentManager',
    'Conversation',
    'Router',
    'Channel',
    'Endpoint',
    function ($rootScope, $modal, canvasBuilder, dragBehavior,
              conversationComponent, channelComponent, routerComponent,
              connectionComponent, controlPointComponent, routeComponent,
              menuComponent, ComponentManager, Conversation, Router, Channel, Endpoint) {

        var canvasWidth = 2048;
        var canvasHeight = 2048;
        var gridCellSize = 20;
        var componentManager = new ComponentManager();

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

            // Initialise the component manager
            componentManager.load($scope.data);

            $scope.selectedComponentId = null;
            $scope.selectedEndpointId = null;
            $scope.connectPressed = false;
            $scope.newComponent = null;

            $scope.clearSelection = function () {
                $scope.selectedComponentId = null;
                $scope.selectedEndpointId = null;
                $scope.connectPressed = false;
                $scope.newComponent = null;

                $scope.refresh();
            };

            /**
             * Open modal dialog and capture new conversation details.
             */
            $scope.addConversation = function () {
                $modal.open({
                    templateUrl: '/templates/conversation_add_modal.html',
                    size: 'md',
                    controller: ['$scope', function ($scope) {
                        $scope.data = {};
                    }]
                }).result.then(function (data) {
                    $scope.newComponent = new Conversation({
                        name: data.name,
                        description: data.description,
                        colour: data.colour
                    });
                });
            };

            /**
             * Open modal dialog and capture new channel details.
             */
            $scope.addChannel = function () {
                $modal.open({
                    templateUrl: '/templates/channel_add_modal.html',
                    size: 'md',
                    controller: ['$scope', function ($scope) {
                        $scope.data = {};
                    }]
                }).result.then(function (data) {
                    $scope.newComponent = new Channel({
                        name: data.name,
                        description: data.description
                    });
                });
            };

            /**
             * Open modal dialog and capture new router details.
             */
            $scope.addRouter = function () {
                $modal.open({
                    templateUrl: '/templates/router_add_modal.html',
                    size: 'md',
                    controller: ['$scope', function ($scope) {
                        $scope.data = {
                            endpoints: [{ name: "" }]
                        };

                        $scope.addEndpoint = function () {
                            $scope.data.endpoints.push({ name: "" });
                        };

                        $scope.removeEndpoint = function (index) {
                            $scope.data.endpoints.splice(index, 1);
                        };
                    }]
                }).result.then(function (data) {
                    var options = {
                        name: data.name
                    };

                    // Add default conversation endpoint
                    var endpoints = [new Endpoint({
                        accepts: ['conversation']
                    })];

                    _.forEach(_.filter(data.endpoints, 'name'), function (endpoint) {
                        endpoints.push(new Endpoint({
                            name: endpoint.name,
                            accepts: ['conversation']
                        }));
                    });

                    // Add default channel endpoint
                    endpoints.push(new Endpoint({
                        accepts: ['channel']
                    }));

                    options.endpoints = endpoints;

                    $scope.newComponent = new Router(options);
                });
            };

            /**
             * Reset the canvas data and redraw.
             */
            $scope.new = function () {
                componentManager.reset();
                $scope.refresh();
            };

            /**
             * Remove the selected component after prompting the user to confirm.
             */
            $scope.remove = function () {
                if ($scope.selectedComponentId) {

                    var removeComponent = function () {
                        componentManager.removeComponent($scope.selectedComponentId);
                        $scope.clearSelection();
                    };

                    var modalInstance = $modal.open({
                        templateUrl: '/templates/confirm_modal.html',
                        size: 'md',
                        controller: ['$scope', '$modalInstance', function ($scope, $modalInstance) {
                            $scope.yes = function () {
                                removeComponent();
                                $modalInstance.close();
                            };

                            $scope.no = function () {
                                $modalInstance.dismiss('cancel');
                            };
                        }]
                    });
                }
            };

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
                var oldComponent = null;
                var oldEndpoint = null;
                if (oldValue.id) {
                    oldComponent = componentManager.getComponent(oldValue.id);
                    if (oldComponent) {
                        oldComponent.meta().selected = false;

                        // If the selected component had a selected endpoint, unselect it
                        if (oldValue.endpointId) {
                            oldEndpoint = componentManager.getEndpoint(oldValue.endpointId);
                            oldEndpoint.meta().selected = false;
                        }
                    }
                }

                // If a new component has been selected update its metadata
                if (newValue.id) {
                    var component = componentManager.getComponent(newValue.id);
                    component.meta().selected = true;

                    // If the user selected a specific endpoint update it metadata
                    var endpoint = null;
                    if (newValue.endpointId) {
                        endpoint = componentManager.getEndpoint(newValue.endpointId);
                        endpoint.meta().selected = true;
                    }

                    // If the connect button was pressed and there was a previously selected component,
                    // connect the components
                    if (oldComponent && $scope.connectPressed) {
                        componentManager.connectComponents(
                            oldComponent, oldEndpoint, component, endpoint);
                    }
                }

                $scope.connectPressed = false;
                $scope.refresh();  // Repaint the canvas
            });

            $rootScope.$on('go:campaignDesignerSelect', function (event, component, endpoint) {
                if (component) {
                    $scope.selectedComponentId = component.id;
                } else {
                    $scope.selectedComponentId = null;
                }

                if (endpoint) {
                    $scope.selectedEndpointId = endpoint.id;
                } else {
                    $scope.selectedEndpointId = null;
                }
            });

            $rootScope.$on('go:campaignDesignerConnect', function (event) {
                $scope.connect();
            });

            $rootScope.$on('go:campaignDesignerRemove', function (event) {
                $scope.remove();
            });

            $rootScope.$on('go:campaignDesignerFlipDirection', function (event, component) {
                if (component.type == 'connection') {
                    component.flipDirection();
                    $scope.refresh();

                } else {
                    // TODO: Trigger an error
                }
            });

            $rootScope.$on('go:campaignDesignerBiDirectional', function (event, component) {
                if (component.type == 'connection') {
                    component.biDirectional();
                    $scope.refresh();

                } else {
                    // TODO: Trigger an error
                }
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

            var route = routeComponent();

            var menu = menuComponent();

            repaint(); // Do initial draw

            /** Repaint the canvas **/
            function repaint() {
                componentManager.layoutComponents();

                componentLayer.selectAll('.conversation')
                    .data(componentManager.getConversations(),
                          function (d) { return d.id; })
                    .call(conversation);

                componentLayer.selectAll('.router')
                    .data(componentManager.getRouters(),
                          function (d) { return d.id; })
                    .call(router);

                componentLayer.selectAll('.channel')
                    .data(componentManager.getChannels(),
                          function (d) { return d.id; })
                    .call(channel);

                connectionLayer.selectAll('.connection')
                    .data(componentManager.getConnections(),
                          function (d) { return d.id; })
                    .call(connection);

                connectionLayer.selectAll('.control-point')
                    .data(componentManager.getControlPoints(),
                          function (d) { return d.id; })
                    .call(controlPoint);

                connectionLayer.selectAll('.route')
                    .data(componentManager.getRoutes(),
                          function (d) { return d.id; })
                    .call(route);

                componentLayer.selectAll('.menu')
                    .data(componentManager.getMenus(),
                          function (d) { return d.id; })
                    .call(menu);
            }

            scope.zoomIn = function () {
                buildCanvas.zoom('in');
            };

            scope.zoomOut = function () {
                buildCanvas.zoom('out');
            };

            function clicked(event, coordinates) {
                if (scope.newComponent) {
                    scope.newComponent.x = coordinates[0];
                    scope.newComponent.y = coordinates[1];
                    componentManager.addComponent(scope.newComponent);
                    scope.newComponent = null;
                    repaint();

                } else {
                    scope.clearSelection();
                }
            }

            $rootScope.$on('go:campaignDesignerRepaint', repaint);
            $rootScope.$on('go:campaignDesignerClick', clicked);

            d3.select('body').on('keydown', function () {
                if (d3.event.keyCode == 27) {  // Esc
                    scope.$apply(function () {
                        scope.clearSelection();
                    });
                }
            });
        }

        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/templates/directives/go_campaign_designer.html',
            scope: {
                data: '=',
                reset: '&',
                canvasWidth: '=?',
                canvasHeight: '=?',
                gridCellSize: '=?'  // Set to 0 to disable grid
            },
            controller: ['$scope', '$element', '$attrs', '$transclude', controller],
            link: link
        };
    }
]);
