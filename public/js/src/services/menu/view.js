
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
                    .classed('active', function (d) { return d.active; })
                    .attr('transform', function (d) {
                        return 'translate(' + [d.x, d.y] + ')';
                    });

                selection.selectAll('.menu-item')
                    .data(function (d) { return d.items; },
                             function (d, i) { return d.component.uuid + '-' + i; })
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
                        $rootScope.$emit(d.action, d.component.uuid);
                    });
                });

                selection
                    .attr('transform', function (d, i) {
                        return 'translate(' + [d.width * i, 0] + ')';
                    });

                selection.selectAll('rect')
                    .attr('width', function (d) { return d.width; })
                    .attr('height', function (d) { return d.height; });

                selection.selectAll('text')
                    .html(function (d) {
                        return d.text.icon;
                    })
                    .attr('x', function (d) { return d.text.x; })
                    .attr('dy', function (d) { return d.text.dy; });
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
