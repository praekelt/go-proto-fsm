
angular.module('vumigo.services').factory('conversationLayout', [function () {
    return function() {
        var innerRadius = 10;
        var outerRadius = 30;
        var textMargin = 20;

        function layout(data) {
            angular.forEach(data, function (conversation) {
                var textX = -(outerRadius / 2.0 + textMargin);

                conversation._layout = {
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
                }
            });

            return data;
        }

        return layout;
    };
}]);
