
angular.module('vumigo.services').factory('routerLayout', [function () {
    return function() {
        var minSize = 60;
        var pinGap = 20;
        var pinHeadRadius = 5;

        function pins(router) {
            angular.forEach(router.conversation_endpoints, function (pin, i) {
                pin._layout = {
                    len: router._layout.r,
                    y: pinGap * (i - 1),
                    r: pinHeadRadius
                };
            });
        }

        function layout(data) {
            angular.forEach(data, function (router) {
                var size = Math.max(minSize, router.conversation_endpoints.length * pinGap);
                var radius = Math.sqrt(2.0 * Math.pow(size, 2)) / 2.0;

                router._layout = {
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
}]);
