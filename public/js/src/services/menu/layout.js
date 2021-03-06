
angular.module('vumigo.services').factory('menuLayout', ['goUtils',
    function (goUtils) {
        return function () {
            var menuItemWidth = 32;
            var menuItemHeight = 32;
            var menuYOffset = 20;
            var textX = 10;
            var textYOffset = 20;

            function layout(data) {
                _.forEach(data, function (menu) {
                    var meta = menu.meta();

                    meta.active = menu.component.meta().selected || false;

                    switch (menu.component.type) {
                        case 'conversation':
                            meta.layout = {
                                x: menu.component.x(),
                                y: menu.component.y()
                                    + menu.component.meta().layout.outer.r
                                    + menuYOffset
                            };
                            break;

                        case 'router':
                            meta.layout = {
                                x: menu.component.x(),
                                y: menu.component.y()
                                    + menu.component.meta().layout.r
                                    + menuYOffset
                            };
                            break;

                        case 'channel':
                            meta.layout = {
                                x: menu.component.x(),
                                y: menu.component.y()
                                    + menu.component.meta().layout.outer.r
                                    + menuYOffset
                            };
                            break;

                        case 'connection':
                            var points = menu.component.points();
                            if (points.length > 2) {
                                var index = Math.floor(points.length / 2);
                                meta.layout = {
                                    x: points[index].x(),
                                    y: points[index].y() + menuYOffset
                                };

                            } else {
                                var midpoint = goUtils.midpoint(
                                    points[0].x(),
                                    points[0].y(),
                                    points[1].x(),
                                    points[1].y()
                                );

                                meta.layout = {
                                    x: midpoint.x,
                                    y: midpoint.y + menuYOffset
                                };
                            }
                            break;

                        default:
                            meta.active = false;
                            meta.layout = {
                                x: 0,
                                y: 0
                            };
                            break;
                    }

                    _.forEach(menu.items, function (item) {
                        var meta = item.meta();
                        meta.layout = {
                            width: menuItemWidth,
                            height: menuItemHeight,
                            text: {
                                x: textX,
                                dy: textYOffset
                            }
                        };
                    });

                });

                return data;
            }

            return layout;
        };
    }
]);
