
angular.module('vumigo.services').factory('routerComponent', ['$rootScope', 'boundingBox',
    function ($rootScope, boundingBox) {
        return function () {
            var conversationPin = conversationPinComponent();
            var channelPin = channelPinComponent();
            var dragBehavior = null;
            var bBox = boundingBox();

            function enter(selection) {
                selection = selection.append('g')
                    .attr('class', 'component router');

                selection.append('circle')
                    .attr('class', 'disc');

                selection.append('text')
                    .attr('class', 'name');

                selection.append('g')
                    .attr('class', 'pins pins-conversation');

                selection.append('g')
                    .attr('class', 'pins pins-channel')
            }

            function update(selection) {
                if (dragBehavior) selection.call(dragBehavior);

                selection
                    .attr('transform', function (d) {
                        return 'translate(' + [d.x, d.y] + ')';
                    })
                    .classed('selected', function (d) {
                        return d.meta().selected;
                    });

                selection.selectAll('.disc')
                    .attr('r', function (d) { return d.meta().layout.r; });

                selection.selectAll('.name')
                    .style('font-size', function (d) {
                        return d.meta().layout.r;
                    })
                    .text(function (d) { return d.name; });

                selection.select('.pins-conversation')
                    .attr('transform', function (d) {
                        return 'translate(' + [-d.meta().layout.r, 0] + ')';
                    })
                    .selectAll('.pin')
                        .data(function(d) { return d.getEndpoints('conversation'); },
                              function(d) { return d.id; })
                        .call(conversationPin);

                selection.select('.pins-channel')
                    .selectAll('.pin')
                        .data(function(d) { return d.getEndpoints('channel'); },
                              function(d) { return d.id; })
                        .call(channelPin);

                selection.call(bBox);
            }

            function exit(selection) {
                selection.remove();
            }

            /**
             * Repaint router components.
             *
             * @param {selection} Selection containing routers.
             */
            var router = function (selection) {
                enter(selection.enter());
                update(selection);
                exit(selection.exit());
                return router;
            };

           /**
             * Get/set the drag behaviour.
             *
             * @param {value} The new drag behaviour; when setting.
             * @return The current drag behaviour.
             */
            router.drag = function(value) {
                if (!arguments.length) return dragBehavior;
                dragBehavior = value;
                return router;
            };

            return router;
        };

        /**
         * A component to draw conversation pins.
         */
        function conversationPinComponent() {
            function enter(selection) {
                selection = selection.append('g')
                    .attr('class', 'pin pin-conversation');

                selection.append('line')
                    .attr('class', 'line');

                selection.append('circle')
                    .attr('class', 'head');

                selection.append('text')
                    .attr('class', 'name');
            }

            function update(selection) {
                selection.on('mousedown', function (d) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();

                    $rootScope.$apply(function () {
                        $rootScope.$emit('go:campaignDesignerSelect', d.component, d);
                    });
                });

                selection
                    .attr('transform', function (d) {
                        return 'translate(' + [-d.meta().layout.len / 2.0, d.meta().layout.y] + ')';
                    })
                    .classed('selected', function (d) {
                        return d.meta().selected;
                    });

                selection.select('.head')
                    .attr('r', function (d) { return d.meta().layout.r; })

                selection.select('.line')
                    .attr('x2', function (d) { return d.meta().layout.len; });

                selection.select('.name')
                    .attr('x', function (d) { return d.meta().layout.name.x; })
                    .text(function (d) { return d.name; });
            }

            function exit(selection) {
                selection.remove();
            }

            function pin(selection) {
                enter(selection.enter());
                update(selection);
                exit(selection.exit());
                return pin;
            }

            return pin;
        }

        /**
         * A component to draw channel pins.
         */
        function channelPinComponent() {
            function enter(selection) {
                selection = selection.append('g')
                    .attr('class', 'pin pin-channel');

                selection.append('circle')
                    .attr('class', 'head');

                selection.append('text')
                    .attr('class', 'name');
            }

            function update(selection) {
                selection.on('mousedown', function (d) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();

                    $rootScope.$apply(function () {
                        $rootScope.$emit('go:campaignDesignerSelect', d.component, d);
                    });
                });

                selection
                    .attr('transform', function (d) {
                        return 'translate(' + [d.meta().layout.x, d.meta().layout.y] + ')';
                    })
                    .classed('selected', function (d) {
                        return d.meta().selected;
                    });

                selection.select('.head')
                    .attr('r', function (d) { return d.meta().layout.r; })

                selection.select('.name')
                    .attr('x', function (d) { return d.meta().layout.name.x; })
                    .text(function (d) { return d.name; });
            }

            function exit(selection) {
                selection.remove();
            }

            function pin(selection) {
                enter(selection.enter());
                update(selection);
                exit(selection.exit());
                return pin;
            }

            return pin;
        }

    }
]);
