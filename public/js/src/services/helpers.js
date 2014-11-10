angular.module('vumigo.services').factory('BaseComponent', ['rfc4122',
    function (rfc4122) {

        function BaseComponent(options) {
            options = options || {};
            this.id = options.id || rfc4122.v4();
            this.type = options.type;
            this.manager = options.manager;
        }

        BaseComponent.prototype.meta = function () {
            if (_.isUndefined(this._meta)) this._meta = {};
            return this._meta;
        };

        BaseComponent.prototype.delete = function () {
            return true;
        };

        return BaseComponent;
    }
]);

angular.module('vumigo.services').factory('MenuItem', ['BaseComponent',
    function (BaseComponent) {

        function MenuItem(options) {
            options = options || {};
            options.type = 'menu_item';
            BaseComponent.call(this, options);

            this.menu = options.menu;
            this.icon = options.icon;
            this.event = options.event;
        }

        MenuItem.prototype = Object.create(BaseComponent.prototype);

        return MenuItem;
    }
]);

angular.module('vumigo.services').factory('Menu', ['BaseComponent',
    function (BaseComponent) {

        function Menu(options) {
            options = options || {};
            options.type = 'menu';
            BaseComponent.call(this, options);

            this.component = options.component;
            this.items = options.items || [];
        }

        Menu.prototype = Object.create(BaseComponent.prototype);

        Menu.prototype.delete = function () {
            if (!BaseComponent.prototype.delete.call(this)) return false;

            _.forEach(this.items, function (item) {
                this.manager.deleteComponent(item);
            }, this);

            return true;
        };

        Menu.prototype.addItem = function (icon, event) {
            var item = this.manager.createComponent({
                type: 'menu_item',
                menu: this,
                icon: icon,
                event: event
            });

            this.items.push(item);
        };

        return Menu;
    }
]);

angular.module('vumigo.services').factory('RoutingComponent', [
    'BaseComponent', 'Menu', 'GoError',
    function (BaseComponent, Menu, GoError) {

        var actions = {
            'edit': {
                icon: '\uf040',
                event: 'go:campaignDesignerEdit'
            },
            'connect': {
                icon: '\uf0c1',
                event: 'go:campaignDesignerConnect'
            },
            'flipDirection': {
                icon: '\uf065',
                event: 'go:campaignDesignerFlipDirection'
            },
            'biDirectional': {
                icon: '\uf066',
                event: 'go:campaignDesignerBiDirectional'
            },
            'delete': {
                icon: '\uf00d',
                event: 'go:campaignDesignerRemove'
            }
        };

        function RoutingComponent(options) {
            options = options || {};
            BaseComponent.call(this, options);

            this.data = options.data;

            this.initialize(options);
            this.validate();
        }

        RoutingComponent.prototype = Object.create(BaseComponent.prototype);

        RoutingComponent.prototype.delete = function () {
            if (!BaseComponent.prototype.delete.call(this)) return false;

            this.manager.deleteComponent(this.menu);

            return true;
        };

        RoutingComponent.prototype.initialize = function (options) {
            this.actions = options.actions;

            // Create a `Menu` for the given actions
            if (!_.isEmpty(this.actions)) {
                this.menu = this.manager.createComponent({
                    type: 'menu',
                    component: this
                });

                _.forEach(this.actions, function (name) {
                    var action = actions[name];
                    this.menu.addItem(action.icon, action.event);
                }, this);
            }
        };

        /**
         * Throw a `GoError` if the component is in an invalid state.
         */
        RoutingComponent.prototype.validate = function () {
            if (_.isEmpty(this.data)) throw new GoError("Component data is empty");
        };

        /**
         * Return the component data.
         */
        RoutingComponent.prototype.datum = function (datum) {
            return null;
        };

        /**
         * Return the component layout.
         */
        RoutingComponent.prototype.layout = function (layout) {
            return null;
        };

        /**
         * Serialize the component to a JSON representation.
         */
        RoutingComponent.prototype.toJson = function () {
            var data = {
                datum: this.datum(),
                layout: this.layout()
            };

            return angular.toJson(data);
        };

        /**
         * Restore the component from a JSON representation.
         */
        RoutingComponent.prototype.fromJson = function (json) {
            var data = angular.fromJson(json);
            this.datum(data.datum);
            this.layout(data.layout);
        };

        return RoutingComponent;
    }
]);

angular.module('vumigo.services').factory('Endpoint', [
    'RoutingComponent',
    function (RoutingComponent) {

        function Endpoint(options) {
            options = options || {};
            RoutingComponent.call(this, options);
        }

        Endpoint.prototype = Object.create(RoutingComponent.prototype);

        Endpoint.prototype.delete = function () {
            if (!RoutingComponent.prototype.delete.call(this)) return false;

            delete this.data.routing_table
                    .components[this.component.id]
                    .endpoints[this.id];

            return true;
        };

        Endpoint.prototype.initialize = function (options) {
            RoutingComponent.prototype.initialize.call(this, options);

            this.component = options.component;

            var data = this.data.routing_table
                .components[this.component.id]
                .endpoints;

            if (!_.has(data, this.id)) {
                var name = options.name;
                if (_.isUndefined(name)) name = "default";
                data[this.id] = {
                    type: this.type,
                    uuid: this.id,
                    name: name
                }
            }
        };

        Endpoint.prototype.datum = function (datum) {
            if (!arguments.length) {
                return this.data.routing_table
                    .components[this.component.id]
                    .endpoints[this.id];
            }

            this.data.routing_table
                .components[this.component.id]
                .endpoints[this.id] = datum;
        };

        Endpoint.prototype.name = function (name) {
            if (!arguments.length) return this.datum().name;
            this.datum().name = name;
            return this;
        };

        Endpoint.prototype.connection = function () {
            var connectionId;
            _.forEach(this.data.layout.connections, function (connection, id) {
                if (_.has(connection.endpoints, this.id)) {
                    connectionId = id;
                    return false;
                }
            }, this);
            return this.manager.getComponentById(connectionId);
        };

        Endpoint.prototype.routes = function (direction) {
            var routes = this.manager.findComponents({ type: 'route' });

            if (!_.isUndefined(direction)) {
                routes = _.filter(routes, function (route) {
                    if (direction == 'in') {
                        return route.target().id == this.id;
                    } else if (direction == 'out') {
                        return route.source().id == this.id;
                    } else {
                        return false;
                    }
                }, this);
            }

            return routes;
        };

        return Endpoint;
    }
]);

angular.module('vumigo.services').factory('ConnectableComponent', [
    'RoutingComponent',
    function (RoutingComponent) {

        function ConnectableComponent(options) {
            options = options || {};
            RoutingComponent.call(this, options);
        }

        ConnectableComponent.prototype = Object.create(RoutingComponent.prototype);

        ConnectableComponent.prototype.delete = function () {
            if (!RoutingComponent.prototype.delete.call(this)) return false;

            _.forEach(this.endpoints(), function (endpoint) {
                this.manager.deleteComponent(endpoint.connection());
                this.manager.deleteComponent(endpoint);
            }, this);

            delete this.data.routing_table.components[this.id];
            delete this.data.layout.components[this.id];

            return true;
        };

        ConnectableComponent.prototype.initialize = function (options) {
            RoutingComponent.prototype.initialize.call(this, options);

            var datum = this.datum();
            if (!_.isEmpty(datum)) {
                _.forEach(datum.endpoints, function (data, id) {
                    this.manager.createComponent({
                        id: id,
                        type: data.type,
                        component: this
                    });
                }, this);
            }
        };

        ConnectableComponent.prototype.datum = function (datum) {
            if (!arguments.length) {
                return this.data.routing_table.components[this.id];
            }
            this.data.routing_table.components[this.id] = datum;
        };

        ConnectableComponent.prototype.layout = function (layout) {
            if (!arguments.length) {
                return this.data.layout.components[this.id];
            }
            this.data.layout.components[this.id] = layout;
        };

        ConnectableComponent.prototype.endpoints = function (type) {
            var endpoints = _.map(this.datum().endpoints, function (data) {
                return this.manager.getComponentById(data.uuid);
            }, this);

            if (type) {
                return _.filter(endpoints, { type: type });
            } else {
                return endpoints;
            }
        };

        ConnectableComponent.prototype.name = function (name) {
            if (!arguments.length) return this.datum().name;
            this.datum().name = name;
            return this;
        };

        ConnectableComponent.prototype.description = function (description) {
            if (!arguments.length) return this.datum().description;
            this.datum().description = description;
            return this;
        };

        ConnectableComponent.prototype.x = function (x) {
            if (!arguments.length) return this.layout().x;
            this.layout().x = x;
            return this;
        };

        ConnectableComponent.prototype.y = function (y) {
            if (!arguments.length) return this.layout().y;
            this.layout().y = y;
            return this;
        };

        return ConnectableComponent;
    }
]);

angular.module('vumigo.services').factory('Channel', [
    'ConnectableComponent',
    function (ConnectableComponent) {

        function Channel(options) {
            options = options || {};
            options.type = 'channel';
            options.actions = ['edit', 'connect', 'delete'];
            ConnectableComponent.call(this, options);
        }

        Channel.prototype = Object.create(ConnectableComponent.prototype);

        Channel.prototype.initialize = function (options) {
            ConnectableComponent.prototype.initialize.call(this, options);

            if (!_.has(this.data.routing_table.components, this.id)) {
                this.data.routing_table.components[this.id] = {
                    type: this.type,
                    uuid: this.id,
                    tag: options.tag || [],
                    name: options.name,
                    description: options.description || "",
                    utilization: options.utilization || 0.5,
                    endpoints: {}
                };

                this.data.layout.components[this.id] = {
                    x: 0,
                    y: 0
                };

                this.manager.createComponent({
                    type: 'channel_endpoint',
                    component: this
                });
            }
        };

        Channel.prototype.utilization = function (utilization) {
            if (!arguments.length) return this.datum().utilization;
            this.datum().utilization = utilization;
            return this;
        };

        return Channel;
    }
]);

angular.module('vumigo.services').factory('Conversation', [
    'ConnectableComponent',
    function (ConnectableComponent) {

        function Conversation(options) {
            options = options || {};
            options.type = 'conversation';
            options.actions = ['edit', 'connect', 'delete'];
            ConnectableComponent.call(this, options);
        }

        Conversation.prototype = Object.create(ConnectableComponent.prototype);

        Conversation.prototype.initialize = function (options) {
            ConnectableComponent.prototype.initialize.call(this, options);

            if (!_.has(this.data.routing_table.components, this.id)) {
                this.data.routing_table.components[this.id] = {
                    type: this.type,
                    conversation_type: options.conversation_type,
                    uuid: this.id,
                    name: options.name,
                    description: options.description || "",
                    endpoints: {}
                };

                this.data.layout.components[this.id] = {
                    x: 0,
                    y: 0,
                    colour: options.colour || 'white'
                };

                this.manager.createComponent({
                    type: 'conversation_endpoint',
                    component: this
                });
            }
        };

        Conversation.prototype.colour = function (colour) {
            if (!arguments.length) return this.layout().colour;
            this.layout().colour = colour;
            return this;
        };

        return Conversation;
    }
]);

angular.module('vumigo.services').factory('Router', [
    'ConnectableComponent', 'Endpoint',
    function (ConnectableComponent, Endpoint) {

        function Router(options) {
            options = options || {};
            options.type = 'router';
            options.actions = ['edit', 'connect', 'delete'];
            ConnectableComponent.call(this, options);
        }

        Router.prototype = Object.create(ConnectableComponent.prototype);

        Router.prototype.initialize = function (options) {
            ConnectableComponent.prototype.initialize.call(this, options);

            if (!_.has(this.data.routing_table.components, this.id)) {
                this.data.routing_table.components[this.id] = {
                    type: this.type,
                    router_type: options.router_type,
                    uuid: this.id,
                    name: options.name,
                    description: options.description || "",
                    endpoints: {}
                };

                this.data.layout.components[this.id] = {
                    x: 0,
                    y: 0
                };

                this.manager.createComponent({
                    type: 'channel_endpoint',
                    component: this
                });

                this.manager.createComponent({
                    type: 'conversation_endpoint',
                    component: this
                });
            }
        };

        Router.prototype.addEndpoint = function (options) {
            options = options || {};
            options.type = 'conversation_endpoint';
            options.name = options.name || "";
            options.component = this;
            this.manager.createComponent(options);
        };

        Router.prototype.deleteEndpoint = function (endpoint) {
            this.manager.deleteComponent(endpoint);
        };

        return Router;
    }
]);

angular.module('vumigo.services').factory('Route', [
    'RoutingComponent',
    function (RoutingComponent) {

        function Route(options) {
            options = options || {};
            options.type = 'route';
            RoutingComponent.call(this, options);
        }

        Route.prototype = Object.create(RoutingComponent.prototype);

        Route.prototype.delete = function () {
            if (!RoutingComponent.prototype.delete.call(this)) return false;

            delete this.data.routing_table.routing[this.id];
            delete this.data.layout.routing[this.id];

            return true;
        };

        Route.prototype.initialize = function (options) {
            RoutingComponent.prototype.initialize.call(this, options);

            if (!_.has(this.data.routing_table.routing, this.id)) {
                this.id = options.source.id + ':' + options.target.id;

                this.data.routing_table.routing[this.id] = {
                    source: options.source.id,
                    target: options.target.id
                };

                this.data.layout.routing[this.id] = options.connection.id;
            }
        };

        Route.prototype.datum = function (datum) {
            if (!arguments.length) {
                return this.data.routing_table.routing[this.id];
            }
            this.data.routing_table.routing[this.id] = datum;
        };

        Route.prototype.layout = function (layout) {
            if (!arguments.length) {
                return this.data.layout.routing[this.id];
            }
            this.data.layout.routing[this.id] = layout;
        };

        Route.prototype.source = function (source) {
            if (!arguments.length) {
                return this.manager.getComponentById(this.datum().source);
            }
            this.datum().source = source.id;
            return this;
        };

        Route.prototype.target = function (target) {
            if (!arguments.length) {
                return this.manager.getComponentById(this.datum().target);
            }
            this.datum().target = target.id;
            return this;
        };

        Route.prototype.flip = function () {
            var source = this.datum().source;
            this.datum().source = this.datum().target;
            this.datum().target = source;
            return this;
        };

        return Route;
    }
]);

angular.module('vumigo.services').factory('ControlPoint', [
    'RoutingComponent', 'GoError',
    function (RoutingComponent, GoError) {

        function ControlPoint(options) {
            options = options || {};
            options.type = 'control_point';
            RoutingComponent.call(this, options);
        }

        ControlPoint.prototype = Object.create(RoutingComponent.prototype);

        ControlPoint.prototype.delete = function () {
            if (!RoutingComponent.prototype.delete.call(this)) return false;

            delete this.data.layout
                .connections[this.connection.id]
                .path[this.index()];

            return true;
        };

        ControlPoint.prototype.initialize = function (options) {
            RoutingComponent.prototype.initialize.call(this, options);

            this.connection = options.connection;

            if (_.isUndefined(options.index)) {
                var data = this.data.layout
                    .connections[this.connection.id].path;

                data.push({ x: 0, y: 0 });
                this.id = this.connection.id + ':' + new String(data.length - 1);

            } else {
                this.id = this.connection.id + ':' + options.index;
            }
        };

        ControlPoint.prototype.validate = function () {
            RoutingComponent.prototype.validate.call(this);

            var parts = this.id.split(':');
            if (parts.length != 2 || _.isNaN(parseInt(parts[1]))) {
                throw new GoError("Invalid control point id: " + this.id);
            }
        };

        ControlPoint.prototype.index = function () {
            return parseInt(this.id.split(':')[1]);
        };

        ControlPoint.prototype.layout = function (layout) {
            if (!arguments.length) {
                return this.data.layout
                    .connections[this.connection.id]
                    .path[this.index()];

            }

            this.data.layout
                .connections[this.connection.id]
                .path[this.index()] = layout;
        };

        ControlPoint.prototype.x = function (x) {
            if (!arguments.length) return this.layout().x;
            this.layout().x = x;
            return this;
        };

        ControlPoint.prototype.y = function (y) {
            if (!arguments.length) return this.layout().y;
            this.layout().y = y;
            return this;
        };

        return ControlPoint;
    }
]);

angular.module('vumigo.services').factory('Connection', [
    'RoutingComponent',
    function (RoutingComponent) {

        function Connection(options) {
            options = options || {};
            options.type = 'connection';
            options.actions = ['flipDirection', 'biDirectional', 'delete'];
            RoutingComponent.call(this, options);
        }

        Connection.prototype = Object.create(RoutingComponent.prototype);

        Connection.prototype.delete = function () {
            if (!RoutingComponent.prototype.delete.call(this)) return false;

            _.forEach(this.points(), function (point) {
                this.manager.deleteComponent(point);
            }, this);

            _.forEach(this.routes(), function (route) {
                this.manager.deleteComponent(route);
            }, this);

            delete this.data.layout.connections[this.id];

            return true;
        };

        Connection.prototype.initialize = function (options) {
            RoutingComponent.prototype.initialize.call(this, options);

            if (!_.has(this.data.layout.connections, this.id)) {
                var source = options.source;
                var target = options.target;

                var endpoints = {};
                endpoints[source.id] = source.component.id;
                endpoints[target.id] = target.component.id;

                this.data.layout.connections[this.id] = {
                    endpoints: endpoints,
                    path: [{
                        x: source.component.x(),
                        y: source.component.y(),
                    }, {
                        x: target.component.x(),
                        y: target.component.y()
                    }],
                    colour: 'grey'
                };
            }

            // Create `ControlPoint` components
            _.forEach(this.layout().path, function (data, index) {
                this.manager.createComponent({
                    type: 'control_point',
                    connection: this,
                    index: index
                });
            }, this);
        };

        Connection.prototype.layout = function (layout) {
            if (!arguments.length) {
                return this.data.layout.connections[this.id];
            }
            this.data.layout.connections[this.id] = layout;
        };

        Connection.prototype.points = function () {
            return _.map(this.layout().path, function (data, index) {
                return this.manager.getComponentById(this.id + ':' + index);
            }, this);
        };

        Connection.prototype.routes = function () {
            var endpoints = _.keys(this.layout().endpoints);
            var routes = [
                this.manager.getComponentById(endpoints[0] + ':' + endpoints[1]),
                this.manager.getComponentById(endpoints[1] + ':' + endpoints[0])
            ];
            return _.filter(routes);
        };

        Connection.prototype.colour = function (colour) {
            if (!arguments.length) return this.layout().colour;
            this.layout().colour = colour;
            return this;
        };

        Connection.prototype.flipDirection = function () {
            var routes = this.routes();
            if (routes.length == 1) {  // do nothing for bi-directional connections
                if (_.isEmpty(routes[0].target().routes('out'))) {
                    routes[0].flip();
                } else {
                    // TODO: Trigger error; endpoint can have only one outgoing route
                }
            }
        };

        Connection.prototype.biDirectional = function () {
            var routes = this.routes();
            if (routes.length == 2) {
                // If the connection is already bi-directional
                // remove the second route
                this.manager.deleteComponent(routes[1]);
            } else {
                if (_.isEmpty(routes[0].target().routes('out'))) {
                    this.manager.createComponent({
                        type: 'route',
                        connection: this,
                        source: routes[0].target(),
                        target: routes[0].source()
                    });

                } else {
                    // TODO: Trigger error; endpoint can have only one outgoing route
                }
            }
        };

        return Connection;
    }
]);

angular.module('vumigo.services').factory('ComponentManager', [
    'BaseComponent', 'Endpoint', 'Conversation', 'Router', 'Channel', 'Route',
    'Connection', 'ControlPoint', 'Menu', 'MenuItem', 'conversationLayout',
    'routerLayout', 'channelLayout', 'connectionLayout', 'menuLayout',
    function (BaseComponent, Endpoint, Conversation, Router, Channel, Route,
              Connection, ControlPoint, Menu, MenuItem, conversationLayout,
              routerLayout, channelLayout, connectionLayout, menuLayout) {

        var layoutConversations = conversationLayout();
        var layoutRouters = routerLayout();
        var layoutChannels = channelLayout();
        var layoutConnections = connectionLayout();
        var layoutMenus = menuLayout();

        function ComponentManager(data) {
            if (!arguments.length) {
                this.data = {
                    routing_table: {
                        components: {},
                        routing: {}
                    },
                    layout: {
                        components: {},
                        routing: {},
                        connections: {}
                    }
                };

            } else {
                this.data = data;
            }

            this.components = {};

            // Create `Channel`, `Conversation` and `Router` components
            _.forEach(this.data.routing_table.components, function (data, id) {
                this.createComponent({
                    id: id,
                    type: data.type
                });
            }, this);

            // Create `Route` components
            _.forEach(this.data.routing_table.routing, function (data, id) {
                this.createComponent({
                    id: id,
                    type: 'route'
                });
            }, this);

            // Create `Connection` components
            _.forEach(this.data.layout.connections, function (data, id) {
                this.createComponent({
                    id: id,
                    type: 'connection'
                });
            }, this);
        }

        ComponentManager.prototype.reset = function () {
            this.data.routing_table.components = {};
            this.data.routing_table.routing = {};
            this.data.layout.components = {};
            this.data.layout.routing = {};
            this.data.layout.connections = {};

            this.components = {};
        };

        ComponentManager.prototype.createComponent = function (options) {
            options = options || {};
            options.manager = this;
            options.data = this.data;

            var component;
            switch (options.type) {
                case 'channel':
                    component = new Channel(options);
                    break;
                case 'conversation':
                    component = new Conversation(options);
                    break;
                case 'router':
                    component = new Router(options);
                    break;
                case 'channel_endpoint':
                case 'conversation_endpoint':
                    component = new Endpoint(options);
                    break;
                case 'route':
                    component = new Route(options);
                    break;
                case 'connection':
                    component = new Connection(options);
                    break;
                case 'control_point':
                    component = new ControlPoint(options);
                    break;
                case 'menu':
                    component = new Menu(options);
                    break;
                case 'menu_item':
                    component = new MenuItem(options);
                    break;
                default:
                    // TODO: Unknown component type; trigger error
                    return;
            }
            this.addComponent(component);
            return component;
        };

        ComponentManager.prototype.addComponent = function (component) {
            this.components[component.id] = component;
        };

        ComponentManager.prototype.getComponentById = function (id) {
            return this.components[id];
        };

        ComponentManager.prototype.findComponents = function (props) {
            return _.where(this.components, props);
        };

        ComponentManager.prototype.deleteComponent = function (component) {
            if (!(component instanceof BaseComponent)) {
                component = this.getComponentById(component);
            }
            if (_.isUndefined(component)) return;
            if (component.delete()) delete this.components[component.id];
        };

        ComponentManager.prototype.connectComponents = function (
                sourceComponent, sourceEndpoint, targetComponent, targetEndpoint) {

            if (!sourceComponent || !targetComponent
                || sourceComponent.type == targetComponent.type) return;

            var endpoints = sourceComponent.endpoints();
            if (!sourceEndpoint && !_.isEmpty(endpoints)) {
                if (['conversation', 'channel'].indexOf(sourceComponent.type) != -1) {
                    sourceEndpoint = endpoints[0];

                } else if (sourceComponent.type == 'router') {
                    if (targetComponent.type == 'conversation') {
                        sourceEndpoint = sourceComponent.endpoints('conversation_endpoint')[0];

                    } else if (targetComponent.type == 'channel') {
                        sourceEndpoint = sourceComponent.endpoints('channel_endpoint')[0];
                    }
                }
            }

            endpoints = targetComponent.endpoints();
            if (!targetEndpoint && !_.isEmpty(endpoints)) {
                if (['conversation', 'channel'].indexOf(targetComponent.type) != -1) {
                    targetEndpoint = endpoints[0];

                } else if (targetComponent.type == 'router') {
                    if (sourceEndpoint.type == 'conversation') {
                        targetEndpoint = targetComponent.endpoints('conversation_endpoint')[0];

                    } else if (sourceEndpoint.type == 'channel') {
                        targetEndpoint = targetComponent.endpoints('channel_endpoint')[0];
                    }
                }
            }

            if (sourceEndpoint && targetEndpoint) {
                var routes = _.filter(this.findComponents({ type: 'route' }),
                    function (route) {
                        return route.source().id == sourceEndpoint.id;
                    });

                if (_.isEmpty(routes)) {
                    var connection = this.createComponent({
                        type: 'connection',
                        source: sourceEndpoint,
                        target: targetEndpoint
                    });

                    this.createComponent({
                        type: 'route',
                        source: sourceEndpoint,
                        target: targetEndpoint,
                        connection: connection
                    });

                } else {
                    // TODO: Trigger a notification
                }
            }
        };

        ComponentManager.prototype.layoutComponents = function () {
            layoutChannels(this.findComponents({ type: 'channel' }));
            layoutRouters(this.findComponents({ type: 'router' }));
            layoutConversations(this.findComponents({ type: 'conversation' }));
            layoutConnections(this.findComponents({ type: 'connection' }));
            layoutMenus(this.findComponents({ type: 'menu' }));
        };

        return ComponentManager;
    }
]);
