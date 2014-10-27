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
    'RoutingComponent',
    'Conversation',
    'Router',
    'Channel',
    'Endpoint',
    function ($rootScope, $modal, canvasBuilder, dragBehavior,
              conversationComponent, channelComponent, routerComponent,
              connectionComponent, controlPointComponent, routeComponent,
              menuComponent, ComponentManager, RoutingComponent, Conversation,
              Router, Channel, Endpoint) {

        var canvasWidth = 2048;
        var canvasHeight = 2048;
        var gridCellSize = 20;
        var componentManager = null;

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
            componentManager = new ComponentManager($scope.data);

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
             * Open component form modal dialog.
             *
             * @param {options} Either an instance of `RoutingComponent`
             *  or options for creating a new component.
             */
            $scope.openComponentForm = function (options) {
                var component, json, editing;
                if (options instanceof RoutingComponent) {
                    component = options;
                    json = component.toJson();
                    editing = true;

                } else {
                    component = componentManager.createComponent(options);
                    editing = false;
                }

                var templates = {
                    'conversation': '/templates/conversation_form_modal.html',
                    'router': '/templates/router_form_modal.html',
                    'channel': '/templates/channel_form_modal.html'
                };

                $modal.open({
                    templateUrl: templates[component.type],
                    size: 'md',
                    controller: ['$scope', function ($scope) {
                        var properties = {};

                        $scope.component = component;

                        $scope.editing = function () {
                            return editing;
                        };

                        $scope.property = function(options) {
                            var object = options.object || component;
                            var name = options.name;
                            var id = object.id + '_' + name;
                            if (!_.has(properties, id)) {
                                properties[id] = _.bind(object[name], object);
                            }
                            return properties[id];
                        };
                    }]
                }).result.then(function () {
                    if (editing) {
                        $scope.refresh();
                    } else {
                        $scope.newComponent = component;
                    }
                }, function () {
                    if (editing) {
                        component.fromJson(json);
                    } else {
                        componentManager.deleteComponent(component);
                    }
                });
            };

            $scope.edit = function () {
                if ($scope.selectedComponentId) {
                    var component = componentManager.getComponentById($scope.selectedComponentId);
                    $scope.openComponentForm(component);
                }
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
                var componentId = $scope.selectedComponentId;
                if (componentId) {
                    $modal.open({
                        templateUrl: '/templates/confirm_modal.html',
                        size: 'md',
                        controller: ['$scope', function ($scope) {
                            var component = componentManager.getComponentById(componentId);

                            $scope.type = component.type;

                            if (_.isFunction(component.name)) {
                                $scope.name = component.name();
                            } else {
                                $scope.name = component.name;
                            }
                        }]
                    }).result.then(function (data) {
                        componentManager.deleteComponent(componentId);
                        $scope.clearSelection();
                    });
                }
            };

            $scope.refresh = function () {
                $rootScope.$emit('go:campaignDesignerRepaint');
            };

            $scope.connect = function () {
                $scope.connectPressed = !$scope.connectPressed;
            };

            $scope.$watchGroup(['selectedComponentId', 'selectedEndpointId'], function (newValues, oldValues) {
                var newId = newValues[0];
                var newEndpointId = newValues[1];
                var oldId = oldValues[0];
                var oldEndpointId = oldValues[1];

                // The very first time $watch fires this function oldValue will be the same as newValue
                if (newId == oldId && newEndpointId == oldEndpointId) return;

                // If there was a component selected, unselect it.
                var oldComponent = null;
                var oldEndpoint = null;
                if (oldId) {
                    oldComponent = componentManager.getComponentById(oldId);
                    if (oldComponent) {
                        oldComponent.meta().selected = false;

                        // If the selected component had a selected endpoint, unselect it
                        if (oldEndpointId) {
                            oldEndpoint = componentManager.getComponentById(oldEndpointId);
                            oldEndpoint.meta().selected = false;
                        }
                    }
                }

                // If a new component has been selected update its metadata
                if (newId) {
                    var component = componentManager.getComponentById(newId);
                    component.meta().selected = true;

                    // If the user selected a specific endpoint update it metadata
                    var endpoint = null;
                    if (newEndpointId) {
                        endpoint = componentManager.getComponentById(newEndpointId);
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

            $rootScope.$on('go:campaignDesignerEdit', function (event) {
                $scope.edit();
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
                    .data(componentManager.findComponents({ type: 'conversation' }),
                          function (d) { return d.id; })
                    .call(conversation);

                componentLayer.selectAll('.router')
                    .data(componentManager.findComponents({ type: 'router' }),
                          function (d) { return d.id; })
                    .call(router);

                componentLayer.selectAll('.channel')
                    .data(componentManager.findComponents({ type: 'channel' }),
                          function (d) { return d.id; })
                    .call(channel);

                connectionLayer.selectAll('.connection')
                    .data(componentManager.findComponents({ type: 'connection' }),
                          function (d) { return d.id; })
                    .call(connection);

                connectionLayer.selectAll('.control-point')
                    .data(componentManager.findComponents({ type: 'control_point' }),
                          function (d) { return d.id; })
                    .call(controlPoint);

                connectionLayer.selectAll('.route')
                    .data(componentManager.findComponents({ type: 'route' }),
                          function (d) { return d.id; })
                    .call(route);

                componentLayer.selectAll('.menu')
                    .data(componentManager.findComponents({ type: 'menu' }),
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
                    scope.newComponent.x(coordinates[0]);
                    scope.newComponent.y(coordinates[1]);
                    scope.newComponent = null;
                    repaint();

                } else {
                    scope.clearSelection();
                }
            }

            $rootScope.$on('go:campaignDesignerRepaint', repaint);
            $rootScope.$on('go:campaignDesignerClick', clicked);

            d3.select('body').on('keydown', function () {
                scope.$apply(function () {
                    if (d3.event.keyCode == 27) {  // Esc
                        scope.clearSelection();
                    } else if (d3.event.keyCode == 46) {  // Delete
                        scope.remove();
                    }
                });
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
