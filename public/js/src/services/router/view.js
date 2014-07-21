
angular.module('vumigo.services').factory('routerComponent', [function () {
    return function () {
        var conversationPin = conversationPinComponent();
        var channelPin = channelPinComponent();
        var dragBehavior = null;

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

            selection.attr('transform', function (d) {
                return 'translate(' + [d.x, d.y] + ')';
            });

            selection.selectAll('.disc')
                .attr('r', function (d) { return d._layout.r; });

            selection.selectAll('.name')
                .style('font-size', function (d) {
                    return d._layout.r + 'px';
                })
                .text(function (d) { return d.name; });

            selection.select('.pins-conversation')
                .attr('transform', function (d) {
                    return 'translate(' + [-d._layout.r, 0] + ')';
                })
                .selectAll('.pin')
                    .data(function(d) { return d.conversation_endpoints; },
                             function(d) { return d.uuid; })
                    .call(conversationPin);

            selection.select('.pins-channel')
                .selectAll('.pin')
                    .data(function(d) { return d.channel_endpoints; },
                             function(d) { return d.uuid; })
                    .call(channelPin);
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

            selection.append('circle')
                .attr('class', 'head');

            selection.append('line')
                .attr('class', 'line');
        }

        function update(selection) {
            selection
                .attr('transform', function (d) {
                    return 'translate(' + [-d._layout.len / 2.0, d._layout.y] + ')';
                });

            selection.select('.head')
                .attr('r', function (d) { return d._layout.r; })

            selection.select('.line')
                .attr('x2', function (d) { return d._layout.len; });
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
        }

        function update(selection) {
            selection
                .attr('transform', function (d) {
                    return 'translate(' + [d._layout.x, d._layout.y] + ')';
                });

            selection.select('.head')
                .attr('r', function (d) { return d._layout.r; })
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

}]);
