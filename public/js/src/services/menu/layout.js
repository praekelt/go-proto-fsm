
angular.module('vumigo.services').factory('menuLayout', ['componentHelper',
    function (componentHelper) {
        return function () {
            var menuItemWidth = 32;
            var menuItemHeight = 32;
            var menuYOffset = 20;
            var textX = 10;
            var textYOffset = 20;
            var faLink = '&#xf0c1;';
            var faArrowsH = '&#xf07e;';
            var faTimes = '&#xf00d;';

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
                        id: conversation.uuid,
                        items: [
                            item(conversation, faLink, 'go:campaignDesignerConnect'),
                            item(conversation, faTimes, 'go:campaignDesignerRemove')
                        ],
                        active: metadata.selected || false,
                        x: conversation.x,
                        y: conversation.y + metadata.layout.outer.r + menuYOffset
                    };
                });

                angular.forEach(data.channels, function (channel) {
                    var metadata = componentHelper.getMetadata(channel);
                    metadata.menu = {
                        id: channel.uuid,
                        items: [
                            item(channel, faLink, 'go:campaignDesignerConnect'),
                            item(channel, faTimes, 'go:campaignDesignerRemove')
                        ],
                        active: metadata.selected || false,
                        x: channel.x,
                        y: channel.y + metadata.layout.outer.r + menuYOffset
                    };
                });

                angular.forEach(data.routers, function (router) {
                    var metadata = componentHelper.getMetadata(router);
                    metadata.menu = {
                        id: router.uuid,
                        items: [
                            item(router, faLink, 'go:campaignDesignerConnect'),
                            item(router, faTimes, 'go:campaignDesignerRemove')
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
                        id: connection.uuid,
                        items: [
                            item(connection, faArrowsH, 'go:campaignDesignerChangeDirection'),
                            item(connection, faTimes, 'go:campaignDesignerRemove')
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
