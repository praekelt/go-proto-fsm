
angular.module('vumigo.services').factory('menuLayout', ['componentHelper',
    function (componentHelper) {
        return function () {
            var menuItemWidth = 32;
            var menuItemHeight = 32;
            var menuYOffset = 20;
            var textX = 10;
            var textYOffset = 20;

            function item(component, icon, action) {
                return {
                    component: component,
                    width: menuItemWidth,
                    height: menuItemHeight,
                    text: {
                        icon: icon,
                        x: textX,
                        dy: textYOffset
                    },
                    action: action
                }
            }

            function layout(data) {
                angular.forEach(data.conversations, function (conversation) {
                    var metadata = componentHelper.getMetadata(conversation);
                    metadata.menu = {
                        items: [
                            item(conversation, '&#xf0c1;', 'go:campaignDesignerConnect'),
                            item(conversation, '&#xf00d;', 'go:campaignDesignerRemove')
                        ],
                        active: metadata.selected || false,
                        x: conversation.x,
                        y: conversation.y + metadata.layout.outer.r + menuYOffset
                    };
                });

                angular.forEach(data.channels, function (channel) {
                    var metadata = componentHelper.getMetadata(channel);
                    metadata.menu = {
                        items: [
                            item(channel, '&#xf0c1;', 'go:campaignDesignerConnect'),
                            item(channel, '&#xf00d;', 'go:campaignDesignerRemove')
                        ],
                        active: metadata.selected || false,
                        x: channel.x,
                        y: channel.y + metadata.layout.outer.r + menuYOffset
                    };
                });

                angular.forEach(data.routers, function (router) {
                    var metadata = componentHelper.getMetadata(router);
                    metadata.menu = {
                        items: [
                            item(router, '&#xf0c1;', 'go:campaignDesignerConnect'),
                            item(router, '&#xf00d;', 'go:campaignDesignerRemove')
                        ],
                        active: metadata.selected || false,
                        x: router.x,
                        y: router.y + metadata.layout.r + menuYOffset
                    };
                });

                angular.forEach(data.routing_entries, function (connection) {
                    var metadata = componentHelper.getMetadata(connection);
                    var point = connection.points[Math.floor(connection.points.length / 2)];
                    metadata.menu = {
                        items: [
                            item(connection, '&#xf0c1;', 'go:campaignDesignerChangeDirection'),
                            item(connection, '&#xf00d;', 'go:campaignDesignerRemove')
                        ],
                        active: metadata.selected || false,
                        x: point.x,
                        y: point.y + menuYOffset
                    };
                });

                return data;
            }

            return layout;
        };
    }
]);
