
angular.module('vumigo.services').factory('routerLayout', [
    function () {
        return function() {
            var minSize = 60;
            var pinGap = 20;
            var pinHeadRadius = 8;

            function pins(router) {
                var endpoints = router.getEndpoints('conversation');
                angular.forEach(endpoints, function (pin, i) {
                    var meta = pin.meta();
                    meta.layout = {
                        len: router.meta().layout.r,
                        y: pinGap * (i - 1),
                        r: pinHeadRadius
                    };
                });

                endpoints = router.getEndpoints('channel');
                angular.forEach(endpoints, function (pin) {
                    var meta = pin.meta();
                    meta.layout = {
                        x: router.meta().layout.r,
                        y: 0,
                        r: pinHeadRadius
                    };
                });
            }

            function layout(data) {
                angular.forEach(data, function (router) {
                    var endpoints = router.getEndpoints('conversation');
                    var size = Math.max(minSize, endpoints.length * pinGap);
                    var radius = Math.sqrt(2.0 * Math.pow(size, 2)) / 2.0;

                    var meta = router.meta();
                    meta.layout = {
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
