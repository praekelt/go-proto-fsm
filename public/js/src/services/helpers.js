angular.module('vumigo.services').factory('BaseComponent', ['rfc4122',
    function (rfc4122) {

        function BaseComponent(options) {
            options = options || {};
            this.id = options.id || rfc4122.v4();
            this.type = options.type;
        }

        BaseComponent.prototype.beforeRemove = function () {
        };

        BaseComponent.prototype.meta = function () {
            if (_.isUndefined(this._meta)) this._meta = {};
            return this._meta;
        };

        return BaseComponent;
    }
]);

angular.module('vumigo.services').factory('ConnectableComponent', ['BaseComponent',
    function (BaseComponent) {

        function ConnectableComponent(options) {
            BaseComponent.call(this, options);
            this.endpoints = [];
        }

        ConnectableComponent.prototype = Object.create(BaseComponent.prototype);

        ConnectableComponent.prototype.addEndpoint = function (endpoint) {
            endpoint.component = this;
            this.endpoints.push(endpoint);
        };

        ConnectableComponent.prototype.addEndpoints = function (endpoints) {
            _.forEach(endpoints, this.addEndpoint, this);
        };

        ConnectableComponent.prototype.getEndpoint = function (id) {
            return _.find(this.endpoints, function (endpoint) {
                return endpoint.id == id;
            });
        };

        ConnectableComponent.prototype.getEndpoints = function (componentType) {
            if (_.isEmpty(componentType)) {
                return this.endpoints;
            }

            return _.filter(this.endpoints, function (endpoint) {
                return _.isEmpty(endpoint.accepts)
                    || _.contains(endpoint.accepts, componentType);
            });
        };

        return ConnectableComponent;
    }
]);

angular.module('vumigo.services').factory('Endpoint', ['BaseComponent',
    function (BaseComponent) {

        function Endpoint(options) {
            options = options || {};
            options.type = 'endpoint';
            BaseComponent.call(this, options);

            this.component = options.component || null;
            this.name = options.name || "default";
            this.accepts = options.accepts || [];  // by default accept connections from all component types
            this.connections = [];
        }

        Endpoint.prototype = Object.create(BaseComponent.prototype);

        Endpoint.prototype.addConnection = function (connection) {
            if (!_.contains(this.connections, connection)) {
                this.connections.push(connection);
            }
        };

        Endpoint.prototype.removeConnection = function (connectionToRemove) {
            _.remove(this.connections, function (connection) {
                return connection.id == connectionToRemove.id;
            });
        };

        Endpoint.prototype.getRoutes = function () {
            var routes = _.reduce(this.connections, function (routes, connection) {
                return routes.concat(connection.routes);
            }, []);

            return _.uniq(routes, function (route) {
                return route.id;
            });
        };

        Endpoint.prototype.acceptsConnectionsFrom = function (componentType) {
            return _.isEmpty(this.accepts)
                || _.contains(this.accepts, componentType);
        };

        return Endpoint;
    }
]);

angular.module('vumigo.services').factory('MenuItem', [
    'BaseComponent',
    function (BaseComponent) {

        function MenuItem(options) {
            options = options || {};
            options.type = 'menu item';
            BaseComponent.call(this, options);

            this.menu = options.menu || null;
            this.icon = options.icon || '';
            this.action = options.action || '';
        }

        MenuItem.prototype = Object.create(BaseComponent.prototype);

        return MenuItem;
    }
]);

angular.module('vumigo.services').factory('Menu', [
    'BaseComponent',
    function (BaseComponent) {

        function Menu(options) {
            options = options || {};
            options.type = 'menu';
            BaseComponent.call(this, options);

            this.component = options.component || null;
            this.items = [];

            this.addItems(options.items || []);
        }

        Menu.prototype = Object.create(BaseComponent.prototype);

        Menu.prototype.addItem = function (item) {
            item.menu = this;
            this.items.push(item);
        };

        Menu.prototype.addItems = function (items) {
            _.forEach(items, this.addItem, this);
        };

        return Menu;
    }
]);

angular.module('vumigo.services').factory('Conversation', [
    'ConnectableComponent', 'Endpoint', 'Menu', 'MenuItem',
    function (ConnectableComponent, Endpoint, Menu, MenuItem) {

        function Conversation(options) {
            options = options || {};
            options.type = 'conversation';
            ConnectableComponent.call(this, options);

            this.name = options.name || "";
            this.description = options.description || "";
            this.x = options.x || 0;
            this.y = options.y || 0;
            this.colour = options.colour || 'LightGray';

            this.addEndpoints(options.endpoints || [
                new Endpoint({ accepts: ['channel', 'router'] })
            ]);

            this.menu = new Menu({
                component: this,
                items: [
                    new MenuItem({
                        icon: '&#xf0c1;',
                        action: 'go:campaignDesignerConnect'
                    }),
                    new MenuItem({
                        icon: '&#xf00d;',
                        action: 'go:campaignDesignerRemove'
                    })
                ],
            });
        }

        Conversation.prototype = Object.create(ConnectableComponent.prototype);

        return Conversation;
    }
]);

angular.module('vumigo.services').factory('Router', [
    'ConnectableComponent', 'Endpoint', 'Menu', 'MenuItem',
    function (ConnectableComponent, Endpoint, Menu, MenuItem) {

        function Router(options) {
            options = options || {};
            options.type = 'router';
            ConnectableComponent.call(this, options);

            this.name = options.name || "";
            this.description = options.description || "";
            this.x = options.x || 0;
            this.y = options.y || 0;

            this.addEndpoints(options.endpoints || [
                new Endpoint({ accepts: ['conversation'] }),
                new Endpoint({ accepts: ['channel'] })
            ]);

            this.menu = new Menu({
                component: this,
                items: [
                    new MenuItem({
                        icon: '&#xf0c1;',
                        action: 'go:campaignDesignerConnect'
                    }),
                    new MenuItem({
                        icon: '&#xf00d;',
                        action: 'go:campaignDesignerRemove'
                    })
                ],
            });
        }

        Router.prototype = Object.create(ConnectableComponent.prototype);

        return Router;
    }
]);

angular.module('vumigo.services').factory('Channel', [
    'ConnectableComponent', 'Endpoint', 'Menu', 'MenuItem',
    function (ConnectableComponent, Endpoint, Menu, MenuItem) {

        function Channel(options) {
            options = options || {};
            options.type = 'channel';
            ConnectableComponent.call(this, options);

            this.name = options.name || "";
            this.description = options.description || "";
            this.x = options.x || 0;
            this.y = options.y || 0;
            this.utilization = options.utilization || 0;

            this.addEndpoints(options.endpoints || [
                new Endpoint({ accepts: ['conversation', 'router'] })
            ]);

            this.menu = new Menu({
                component: this,
                items: [
                    new MenuItem({
                        icon: '&#xf0c1;',
                        action: 'go:campaignDesignerConnect'
                    }),
                    new MenuItem({
                        icon: '&#xf00d;',
                        action: 'go:campaignDesignerRemove'
                    })
                ],
            });
        }

        Channel.prototype = Object.create(ConnectableComponent.prototype);

        return Channel;
    }
]);

angular.module('vumigo.services').factory('Route', ['BaseComponent',
    function (BaseComponent) {

        function Route(options) {
            options = options || {};
            options.type = 'route';
            BaseComponent.call(this, options);
            this.source = options.source || null;
            this.target = options.target || null;
        }

        Route.prototype = Object.create(BaseComponent.prototype);

        Route.prototype.flip = function () {
            var endpoint = this.source;
            this.source = this.target;
            this.target = endpoint;
            return this;
        };

        return Route;
    }
]);

angular.module('vumigo.services').factory('ControlPoint', [
    'BaseComponent',
    function (BaseComponent) {

        function ControlPoint(options) {
            options = options || {};
            options.type = 'control point';
            BaseComponent.call(this, options);

            this.x = options.x;
            this.y = options.y;
        }

        ControlPoint.prototype = Object.create(BaseComponent.prototype);

        return ControlPoint;
    }
]);

angular.module('vumigo.services').factory('Connection', [
    'BaseComponent', 'Route', 'ControlPoint', 'Menu', 'MenuItem',
    function (BaseComponent, Route, ControlPoint, Menu, MenuItem) {
        var numberOfPoints = 3;

        function Connection(options) {
            options = options || {};
            options.type = 'connection';
            BaseComponent.call(this, options);

            this.routes = [];
            _.forEach(options.routes, this.addRoute, this);

            if (_.isArray(options.points)) {
                this.points = options.points;
            } else {
                this.points = [];
                for (var i = 0; i < numberOfPoints + 2; i++) {
                    this.points.push(new ControlPoint());
                }
            }

            this.menu = new Menu({
                component: this,
                items: [
                    new MenuItem({
                        icon: '&#xf065;',
                        action: 'go:campaignDesignerFlipDirection'
                    }),
                    new MenuItem({
                        icon: '&#xf066;',
                        action: 'go:campaignDesignerBiDirectional'
                    }),
                    new MenuItem({
                        icon: '&#xf00d;',
                        action: 'go:campaignDesignerRemove'
                    })
                ],
            });
        }

        Connection.prototype = Object.create(BaseComponent.prototype);

        Connection.prototype.beforeRemove = function () {
            BaseComponent.prototype.beforeRemove.call(this);

            if (_.isEmpty(this.routes)) return;
            var route = _.first(this.routes);
            route.source.removeConnection(this);
            route.target.removeConnection(this);
        };

        Connection.prototype.addRoute = function (route) {
            this.routes.push(route);
            route.source.addConnection(this);
            route.target.addConnection(this);
        };

        Connection.prototype.getEndpoints = function () {
            var endpoints = _.reduce(this.routes, function (endpoints, route) {
                endpoints.push(route.source, route.target);
                return endpoints;
            }, []);

            return _.uniq(endpoints, function (endpoint) {
                return endpoint.id;
            });
        };

        Connection.prototype.isConnectedTo = function (endpoints) {
            endpoints = _.intersection(
                _.pluck(this.getEndpoints(), 'id'),
                _.pluck(endpoints, 'id')
            );

            return !_.isEmpty(endpoints);
        };

        Connection.prototype.flipDirection = function () {
            if (_.isEmpty(this.routes)) return;

            var route = _.first(this.routes);
            var source = route.source;
            var target = route.target;

            var routes = _.filter(target.getRoutes(), function (route) {
                return route.source.id == target.id
                    && route.target.id != source.id;
            });

            if (!_.isEmpty(routes)) {
                alert('Not allowed!');
                return;
            }

            this.routes = [route.flip()];
            this.points.reverse();
            return this;
        };

        Connection.prototype.biDirectional = function () {
            if (_.isEmpty(this.routes) || _.size(this.routes) > 1) return;

            var route = _.first(this.routes);
            var source = route.source;
            var target = route.target;

            var routes = _.filter(target.getRoutes(), function (route) {
                return route.source.id == target.id;
            });

            if (!_.isEmpty(routes)) {
                alert('Not allowed!');
                return;
            }

            this.addRoute(new Route({
                source: route.target,
                target: route.source
            }));

            return this;
        };

        return Connection;
    }
]);

angular.module('vumigo.services').factory('ComponentManager', [
    'Endpoint', 'Conversation', 'Router', 'Channel', 'Route', 'Connection',
    'conversationLayout', 'routerLayout', 'channelLayout', 'connectionLayout',
    'menuLayout',
    function (Endpoint, Conversation, Router, Channel, Route, Connection,
              conversationLayout, routerLayout, channelLayout, connectionLayout,
              menuLayout) {

        var layoutConversations = conversationLayout();
        var layoutRouters = routerLayout();
        var layoutChannels = channelLayout();
        var layoutConnections = connectionLayout();
        var layoutMenus = menuLayout();

        function ComponentManager(data) {
            this.components = {};

            if (data) {
                this.load(data);
            }
        }

        ComponentManager.prototype.reset = function () {
            this.components = {};
        };

        ComponentManager.prototype.addComponent = function (component) {
            this.components[component.id] = component;
            return component;
        };

        ComponentManager.prototype.getComponent = function (id) {
            return this.components[id];
        };

        ComponentManager.prototype.getEndpoint = function (id) {
            var endpoints = _.reduce(_.values(this.components), function (endpoints, component) {
                _.forEach(component.endpoints, function (endpoint) {
                    endpoints[endpoint.id] = endpoint;
                });

                return endpoints;
            }, {});

            return endpoints[id];
        };

        ComponentManager.prototype.removeComponent = function (id) {
            var componentToRemove = this.getComponent(id);
            if (_.isUndefined(componentToRemove)) return;

            if (!_.isEmpty(componentToRemove.endpoints)) {
                var connectionsToRemove = _.filter(_.values(this.components), function (component) {
                    return !_.isEmpty(component.routes)
                        && component.isConnectedTo(componentToRemove.endpoints);
                });

                _.forEach(connectionsToRemove, function (connection) {
                    this.components[connection.id].beforeRemove();
                    delete this.components[connection.id];
                }, this);
            };

            this.components[componentToRemove.id].beforeRemove();
            delete this.components[componentToRemove.id];
        };

        ComponentManager.prototype.connectComponents = function (
                sourceComponent, sourceEndpoint, targetComponent, targetEndpoint) {

            if (!sourceComponent || !targetComponent
                || sourceComponent.type == targetComponent.type) return;

            if (!sourceEndpoint && !_.isEmpty(sourceComponent.endpoints)) {
                if (['conversation', 'channel'].indexOf(sourceComponent.type) != -1) {
                    sourceEndpoint = sourceComponent.endpoints[0];

                } else if (sourceComponent.type == 'router') {
                    if (targetComponent.type == 'conversation') {
                        sourceEndpoint = sourceComponent.getEndpoints('conversation')[0];

                    } else if (targetComponent.type == 'channel') {
                        sourceEndpoint = sourceComponent.getEndpoints('channel')[0];
                    }
                }
            }

            if (!targetEndpoint && !_.isEmpty(targetComponent.endpoints)) {
                if (['conversation', 'channel'].indexOf(targetComponent.type) != -1) {
                    targetEndpoint = targetComponent.endpoints[0];

                } else if (targetEndpoint.type == 'router') {
                    if (sourceEndpoint.type == 'conversation') {
                        targetEndpoint = targetComponent.getEndpoints('conversation')[0];

                    } else if (sourceEndpoint.type == 'channel') {
                        targetEndpoint = targetComponent.getEndpoints('channel')[0];
                    }
                }
            }

            if (sourceEndpoint && targetEndpoint) {
                var routes = _.filter(this.getRoutes(), function (route) {
                    return route.source.id == sourceEndpoint.id;
                });

                if (_.isEmpty(routes)) {
                    var connection = this.addComponent(new Connection({
                        routes: [
                            new Route({ source: sourceEndpoint, target: targetEndpoint })
                        ]
                    }));

                } else {
                    // TODO: Inform the user of the crime they are trying to commit
                    alert('Not allowed!');
                }
            }
        };

        ComponentManager.prototype.getConversations = function () {
            return _.where(this.components, { type: 'conversation' });
        };

        ComponentManager.prototype.getRouters = function () {
            return _.where(this.components, { type: 'router' });
        };

        ComponentManager.prototype.getChannels = function () {
            return _.where(this.components, { type: 'channel' });
        };

        ComponentManager.prototype.getConnections = function () {
            return _.where(this.components, { type: 'connection' });
        };

        ComponentManager.prototype.getRoutes = function () {
            return _.reduce(this.getConnections(), function (routes, connection) {
                _.forEach(connection.routes, function (route) {
                    routes.push(route);
                });

                return routes;
            }, []);
        };

        ComponentManager.prototype.getControlPoints = function () {
            return _.reduce(this.getConnections(), function (points, connection) {
                _.forEach(connection.points, function (point) {
                    points.push(point);
                });

                return points;
            }, []);
        };

        ComponentManager.prototype.getMenus = function () {
            return _.pluck(_.filter(this.components, 'menu'), 'menu');
        };

        ComponentManager.prototype.layoutComponents = function () {
            layoutConversations(this.getConversations());
            layoutRouters(this.getRouters());
            layoutChannels(this.getChannels());
            layoutConnections(this.getConnections());
            layoutMenus(this.getMenus());
        };

        ComponentManager.prototype.load = function (data) {
            _.forEach(data.conversations, function (d) {
                var conversation = this.addComponent(new Conversation({
                    id: d.uuid,
                    name: d.name,
                    description: d.description,
                    x: d.x,
                    y: d.y,
                    colour: d.colour,
                    endpoints: []
                }));

                _.forEach(d.endpoints, function (d) {
                    conversation.addEndpoint(new Endpoint({
                        id: d.uuid,
                        name: d.name,
                        accepts: ['channel', 'router']
                    }));
                });
            }, this);

            _.forEach(data.routers, function (d) {
                var router = this.addComponent(new Router({
                    id: d.uuid,
                    name: d.name,
                    description: d.description,
                    x: d.x,
                    y: d.y,
                    endpoints: []
                }));

                _.forEach(d.conversation_endpoints, function (d) {
                    router.addEndpoint(new Endpoint({
                        id: d.uuid,
                        name: d.name,
                        accepts: ['conversation']
                    }));
                });

                _.forEach(d.channel_endpoints, function (d) {
                    router.addEndpoint(new Endpoint({
                        id: d.uuid,
                        name: d.name,
                        accepts: ['channel']
                    }));
                });
            }, this);

            _.forEach(data.channels, function (d) {
                var channel = this.addComponent(new Channel({
                    id: d.uuid,
                    name: d.name,
                    description: d.description,
                    x: d.x,
                    y: d.y,
                    utilization: d.utilization,
                    endpoints: []
                }));

                _.forEach(d.endpoints, function (d) {
                    channel.addEndpoint(new Endpoint({
                        id: d.uuid,
                        name: d.name,
                        accepts: ['conversation', 'router']
                    }));
                });
            }, this);

            var getConnectionForEndpoints = _.bind(function (sourceId, targetId) {
                return _.find(this.getConnections(), function (connection) {
                    var routes = _.filter(connection.routes, function (route) {
                        return (route.source.id == sourceId
                                    && route.target.id == targetId)
                                || (route.target.id == sourceId
                                    && route.source.id == targetId);
                    });

                    return !_.isEmpty(routes);
                });
            }, this);

            _.forEach(data.routing_entries, function (d) {
                var connection = getConnectionForEndpoints(
                    d.source.uuid, d.target.uuid);

                if (_.isUndefined(connection)) {
                    connection = this.addComponent(new Connection());
                }

                connection.addRoute(new Route({
                    id: d.uuid,
                    source: this.getEndpoint(d.source.uuid),
                    target: this.getEndpoint(d.target.uuid)
                }));
            }, this);
        };

        ComponentManager.prototype.data = function () {
        };

        return ComponentManager;
    }
]);
