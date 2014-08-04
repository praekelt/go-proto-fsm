
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
                });

                return data;
            }

            return layout;
        };
    }
]);
