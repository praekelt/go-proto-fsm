
angular.module('vumigo.services').factory('menuLayout', [
    function () {
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
                                x: menu.component.x,
                                y: menu.component.y
                                    + menu.component.meta().layout.outer.r
                                    + menuYOffset
                            };
                            break;

                        case 'router':
                            meta.layout = {
                                x: menu.component.x,
                                y: menu.component.y
                                    + menu.component.meta().layout.r
                                    + menuYOffset
                            };
                            break;

                        case 'channel':
                            meta.layout = {
                                x: menu.component.x,
                                y: menu.component.y
                                    + menu.component.meta().layout.outer.r
                                    + menuYOffset
                            };
                            break;

                        case 'connection':
                            var x, y;
                            if (menu.component.points.length > 2) {
                                var point = menu.component.points[
                                    Math.floor(menu.component.points.length / 2)];

                                x = point.x;
                                y = point.y;

                            } else {
                                x = menu.component.points[0].x
                                    + (menu.component.points[1].x
                                       - menu.component.points[0].x) / 2,

                                y = menu.component.points[0].y
                                    + (menu.component.points[1].y
                                       - menu.component.points[0].y) / 2
                            }

                            meta.layout = {
                                x: x,
                                y: y + menuYOffset
                            };
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
