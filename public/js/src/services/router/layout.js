
angular.module('vumigo.services').factory('routerLayout', ['componentHelper',
    function (componentHelper) {
        return function() {
            var minSize = 60;
            var pinGap = 20;
            var pinHeadRadius = 8;

            function pins(router) {
                angular.forEach(router.conversation_endpoints, function (pin, i) {
                    var metadata = componentHelper.getMetadata(pin);
                    metadata.parent = router;
                    metadata.layout = {
                        len: router._meta.layout.r,
                        y: pinGap * (i - 1),
                        r: pinHeadRadius
                    };
                });

                angular.forEach(router.channel_endpoints, function (pin) {
                    var metadata = componentHelper.getMetadata(pin);
                    metadata.parent = router;
                    metadata.layout = {
                        x: router._meta.layout.r,
                        y: 0,
                        r: pinHeadRadius
                    };
                });
            }

            function layout(data) {
                angular.forEach(data, function (router) {
                    var metadata = componentHelper.getMetadata(router);
                    var size = Math.max(minSize, router.conversation_endpoints.length * pinGap);
                    var radius = Math.sqrt(2.0 * Math.pow(size, 2)) / 2.0;

                    metadata.layout = {
                        r: radius
                    };

                    pins(router);
                });

                return data;
            }

            layout.minSize = function(value) {
                if (!arguments.length) return minSize;
                minSize = value;
                return layout;
            };

            layout.pinGap = function(value) {
                if (!arguments.length) return pinGap;
                pinGap = value;
                return layout;
            };

            return layout;
        };
    }
]);
