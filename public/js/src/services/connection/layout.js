
angular.module('vumigo.services').factory('connectionLayout', ['componentHelper',
    function (componentHelper) {
        return function() {

            /**
             * Return the X and Y coordinates of the given component's endpoint.
             */
            function point(component, endpointId) {
                var x = component.data.x;
                var y = component.data.y;
                if (component.type == 'router' && endpointId) {
                    var endpoint = null;
                    for (var i = 0; i < component.data.conversation_endpoints.length; i++) {
                        if (component.data.conversation_endpoints[i].uuid == endpointId) {
                            endpoint = component.data.conversation_endpoints[i];
                        }
                    }
                    if (endpoint) {
                        x = x - (component.data._layout.r + endpoint._layout.len / 2.0);
                        y = y + endpoint._layout.y;
                    }
                }
                return {x: x, y: y};
            }

            function layout(data) {
                angular.forEach(data.routing_entries, function (connection) {
                    var source = componentHelper.getByEndpointId(data, connection.source.uuid);
                    var target = componentHelper.getByEndpointId(data, connection.target.uuid);

                    connection.points = [];
                    connection.points.push(point(source, connection.source.uuid));
                    connection.points.push(point(target, connection.target.uuid));
                });

                return data;
            }

            return layout;
        };
    }
]);
