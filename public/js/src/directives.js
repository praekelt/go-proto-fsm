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
    'conversationLayout',
    'routerLayout',
    'channelLayout',
    function ($rootScope, canvasBuilder, dragBehavior, conversationComponent,
                   channelComponent, routerComponent, conversationLayout,
                   routerLayout, channelLayout) {
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

            $scope.selectedComponentUUID = null;
            $scope.componentSelected = false;
            $scope.connectPressed = false;

            $scope.refresh = function () {
                $rootScope.$emit('go:campaignDesignerRepaint');
            };

            $scope.connect = function () {
                $scope.connectPressed = !$scope.connectPressed;
            };

            $scope.findComponent = function (uuid) {
                for (var i = 0; i < $scope.data.conversations.length; i++) {
                    if ($scope.data.conversations[i].uuid == uuid) {
                        return {
                            type: 'conversation',
                            data: $scope.data.conversations[i]
                        }
                    }
                }

                for (var i = 0; i < $scope.data.channels.length; i++) {
                    if ($scope.data.channels[i].uuid == uuid) {
                        return {
                            type: 'channel',
                            data: $scope.data.channels[i]
                        }
                    }
                }

                for (var i = 0; i < $scope.data.routers.length; i++) {
                    if ($scope.data.routers[i].uuid == uuid) {
                        return {
                            type: 'router',
                            data: $scope.data.routers[i]
                        }
                    }
                }
                return null;
            };

            $scope.connectComponents = function(component1, component2) {
                if (!component1 || !component2 || component1.type == component2.type) return;

                var sourceEndpoint = null;
                if (['conversation', 'channel'].indexOf(component1.type) != -1) {
                    sourceEndpoint = component1.data.endpoints[0];
                } else if (component1.type == 'router') {
                    if (component2.type == 'conversation') {
                        sourceEndpoint = component1.data.conversation_endpoints[0];
                    } else if (component2.type == 'channel') {
                        sourceEndpoint = component1.data.channel_endpoints[0];
                    }
                }

                var targetEndpoint = null;
                if (['conversation', 'channel'].indexOf(component2.type) != -1) {
                    targetEndpoint = component2.data.endpoints[0];
                } else if (component2.type == 'router') {
                    if (component1.type == 'conversation') {
                        targetEndpoint = component2.data.conversation_endpoints[0];
                    } else if (component1.type == 'channel') {
                        sourceEndpoint = component2.data.channel_endpoints[0];
                    }
                }

                if (sourceEndpoint && targetEndpoint) {
                    $scope.data.routing_entries.push({
                        source: {uuid: sourceEndpoint.uuid},
                        target: {uuid: targetEndpoint.uuid},
                    });
                }
            };

            $scope.$watch('selectedComponentUUID', function (newValue, oldValue) {
                if (newValue) {
                    $scope.componentSelected = true;

                    if (oldValue && newValue != oldValue && $scope.connectPressed) {
                        var oldComponent = $scope.findComponent(oldValue);
                        var newComponent = $scope.findComponent(newValue);
                        $scope.connectComponents(oldComponent, newComponent)
                        $scope.refresh();
                    }

                } else {
                    $scope.componentSelected = false;
                }

                $scope.connectPressed = false;
            });

            $rootScope.$on('go:campaignDesignerSelect', function (event, uuid) {
                $scope.selectedComponentUUID = uuid;
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

            var layoutConversations = conversationLayout();
            var layoutRouters = routerLayout();
            var layoutChannels = channelLayout();

            repaint(); // Do initial draw

            /** Repaint the canvas **/
            function repaint() {
                canvas.selectAll('.conversation')
                    .data(layoutConversations(scope.data.conversations))
                    .call(conversation);

                canvas.selectAll('.channel')
                    .data(layoutChannels(scope.data.channels))
                    .call(channel);

                canvas.selectAll('.router')
                    .data(layoutRouters(scope.data.routers))
                    .call(router);
            }

            $rootScope.$on('go:campaignDesignerRepaint', repaint);  // Triggered by $rootScope.$emit('go:campaignDesignerRepaint')
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
