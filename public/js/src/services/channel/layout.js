
angular.module('vumigo.services').factory('channelLayout', [
    'componentHelper', function (componentHelper) {
        return function () {
            var innerRadius = 10;
            var maxOuterRadius = 100;
            var textOffset = 20;

            function layout(data) {
                angular.forEach(data, function (channel) {
                    var metadata = componentHelper.getMetadata(channel);

                    var outerRadius = innerRadius
                        + maxOuterRadius * channel.utilization;

                    var textX = innerRadius / 2.0 + textOffset;

                    metadata.layout = {
                        inner: {
                            r: innerRadius
                        },
                        outer: {
                            r: outerRadius
                        },
                        name: {
                            x: textX
                        },
                        description: {
                            x: textX
                        }
                    };

                    metadata.menu = {
                        items: [{
                            component: channel,
                            width: 32,
                            height: 32,
                            text: {
                                icon: '&#xf0c1;',
                                x: 10,
                                dy: 20
                            },
                            action: 'go:campaignDesignerConnect'
                        }, {
                            component: channel,
                            width: 32,
                            height: 32,
                            text: {
                                icon: '&#xf00d;',
                                x: 10,
                                dy: 20
                            },
                            action: 'go:campaignDesignerRemove'
                        }],
                        active: metadata.selected,
                        x: channel.x,
                        y: channel.y + outerRadius + textOffset
                    };
                });

                return data;
            }

            return layout;
        };
    }
]);
