
angular.module('vumigo.services').factory('menuComponent', ['$rootScope',
    function ($rootScope) {
        return function () {
            var menuItem = menuItemComponent();

            function enter(selection) {
                selection = selection.append('g')
                    .attr('class', 'menu');
            }

            function update(selection) {
                selection
                    .classed('active', function (d) {
                        return d.meta().active;
                    })
                    .attr('transform', function (d) {
                        return 'translate(' + [d.meta().layout.x, d.meta().layout.y] + ')';
                    });

                selection.selectAll('.menu-item')
                    .data(function (d) { return d.items; },
                          function (d, i) { return d.id; })
                    .call(menuItem);
            }

            function exit(selection) {
                selection.remove();
            }

            var menu = function(selection) {
                enter(selection.enter());
                update(selection);
                exit(selection.exit());
                return menu;
            };

            return menu;
        };

        function menuItemComponent() {

            function enter(selection) {
                selection = selection.append('g')
                    .attr('class', 'menu-item');

                selection.append('rect');
                selection.append('text');
            }

            function update(selection) {
                selection.on('mousedown', function (d) {
                    d3.event.preventDefault();
                    d3.event.stopPropagation();

                    $rootScope.$apply(function () {
                        $rootScope.$emit(d.action, d.menu.component);
                    });
                });

                selection
                    .attr('transform', function (d, i) {
                        return 'translate(' + [d.meta().layout.width * i, 0] + ')';
                    });

                selection.selectAll('rect')
                    .attr('width', function (d) { return d.meta().layout.width; })
                    .attr('height', function (d) { return d.meta().layout.height; });

                selection.selectAll('text')
                    .text(function (d) {
                        return d.icon;
                    })
                    .attr('x', function (d) { return d.meta().layout.text.x; })
                    .attr('dy', function (d) { return d.meta().layout.text.dy; });
            }

            function exit(selection) {
                selection.remove();
            }

            function menuItem(selection) {
                enter(selection.enter());
                update(selection);
                exit(selection.exit());
                return menuItem;
            }

            return menuItem;
        }
    }
]);
