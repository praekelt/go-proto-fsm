
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
                            var point;
                            if (menu.component.points.length > 2) {
                                var index = Math.floor(menu.component.points.length / 2);
                                point = menu.component.points[index];

                            } else {
                                point = goUtils.midpoint(
                                    menu.component.points[0], menu.component.points[1]);
                            }

                            meta.layout = {
                                x: point.x,
                                y: point.y + menuYOffset
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
