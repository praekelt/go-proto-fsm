
angular.module('vumigo.services').factory('conversationLayout', ['componentHelper',
    function (componentHelper) {
        return function () {
            var innerRadius = 10;
            var outerRadius = 30;
            var textMargin = 20;

            function layout(data) {
                angular.forEach(data, function (conversation) {
                    var metadata = componentHelper.getMetadata(conversation);

                    var textX = -(outerRadius / 2.0 + textMargin);

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
