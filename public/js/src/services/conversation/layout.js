
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

                    metadata.menu = {
                        items: [{
                            component: conversation,
                            width: 32,
                            height: 32,
                            text: {
                                icon: '&#xf0c1;',
                                x: 10,
                                dy: 20
                            },
                            action: 'go:campaignDesignerConnect'
                        }, {
                            component: conversation,
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
                        x: conversation.x,
                        y: conversation.y + outerRadius + textMargin
                    };

                });

                return data;
            }

            return layout;
        };
    }
]);
