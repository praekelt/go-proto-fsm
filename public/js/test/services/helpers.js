describe('BaseComponent', function () {

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    it('should initialise new component', inject(function (BaseComponent) {
        var component = new BaseComponent({
            id: 'component1',
            type: 'test component'
        });

        expect(component.id).to.equal('component1');
        expect(component.type).to.equal('test component');
    }));

    it('should generate an id', inject(function (BaseComponent) {
        var component = new BaseComponent({
            type: 'test component'
        });

        expect(component.id).not.to.be.empty;
    }));

    it('should get or create metadata', inject(function (BaseComponent) {
        var component = new BaseComponent({
            type: 'test component'
        });

        expect(component._meta).to.be.undefined;

        var meta = component.meta();
        meta.selected = true;

        expect(component._meta).not.to.be.undefined;
        expect(component._meta).to.deep.equal(meta);
    }));

});

describe('ConnectableComponent', function () {

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    it('should initialise new component', inject(function (BaseComponent, ConnectableComponent) {
        var component = new ConnectableComponent({
            id: 'component1',
            type: 'test component'
        });

        expect(component instanceof BaseComponent).to.be.true;
        expect(component.id).to.equal('component1');
        expect(component.type).to.equal('test component');
        expect(component.endpoints).not.to.be.undefined;
        expect(component.endpoints).to.be.empty;
    }));

    it('should add endpoint', inject(function (ConnectableComponent, Endpoint) {
        var component = new ConnectableComponent({
            id: 'component1',
            type: 'test component'
        });

        expect(component.endpoints).to.be.empty;

        component.addEndpoint(new Endpoint({
            id: 'endpoint1',
            name: 'default'
        }));

        expect(component.endpoints).to.have.length(1);

        component.addEndpoints([
            new Endpoint({ id: 'endpoint2', name: 'default' }),
            new Endpoint({ id: 'endpoint3', name: 'default' })
        ]);

        expect(component.endpoints).to.have.length(3);

        expect(component.endpoints[0].id).to.equal('endpoint1');
        expect(component.endpoints[0].component).to.equal(component);
        expect(component.endpoints[1].id).to.equal('endpoint2');
        expect(component.endpoints[1].component).to.equal(component);
        expect(component.endpoints[2].id).to.equal('endpoint3');
        expect(component.endpoints[2].component).to.equal(component);
    }));

    it('should get endpoint by id', inject(function (ConnectableComponent, Endpoint) {
        var component = new ConnectableComponent({
            id: 'component1',
            type: 'test component'
        });

        var endpoint = new Endpoint({
            id: 'endpoint1',
            name: 'default'
        });

        component.addEndpoint(endpoint);

        expect(component.getEndpoint('endpoint1')).to.equal(endpoint);
    }));

    it('should get endpoints by component type', inject(function (ConnectableComponent, Endpoint) {
        var component = new ConnectableComponent({
            id: 'component1',
            type: 'test component'
        });

        var endpoints = [
            new Endpoint({ id: 'endpoint1', name: 'default', accepts: ['conversation'] }),
            new Endpoint({ id: 'endpoint2', name: 'default', accepts: ['channel'] })
        ];

        component.addEndpoints(endpoints);

        expect(component.getEndpoints('conversation')).to.deep.equal([endpoints[0]]);
    }));
});

describe('Endpoint', function () {

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    it('should initialise new component', inject(function (BaseComponent, Endpoint) {
        var component = new BaseComponent({
            type: 'test component'
        });

        var endpoint = new Endpoint({
            id: 'endpoint1',
            component: component,
            name: 'default',
            accepts: ['test component']
        });

        expect(component instanceof BaseComponent).to.be.true;
        expect(endpoint.id).to.equal('endpoint1');
        expect(endpoint.component).to.equal(component);
        expect(endpoint.name).to.equal('default');
        expect(endpoint.accepts).to.deep.equal(['test component']);
    }));


    it('should determine which component types can connect to it', inject(function (BaseComponent, Endpoint) {
        var endpoint = new Endpoint({
            id: 'endpoint1',
            name: 'default',
            accepts: ['test component', 'other component']
        });

        expect(endpoint.acceptsConnectionsFrom('test component')).to.be.true;
        expect(endpoint.acceptsConnectionsFrom('unsupported component')).to.be.false;
    }));

});

describe('MenuItem', function () {

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    it('should initialise new component', inject(function (BaseComponent, Menu, MenuItem) {
        var menu = new Menu();

        var item = new MenuItem({
            menu: menu,
            icon: 'icon1',
            action: "action1"
        });

        expect(item instanceof BaseComponent).to.be.true;
        expect(item.type).to.equal('menu item');
        expect(item.menu).to.deep.equal(menu);
        expect(item.icon).to.equal('icon1');
        expect(item.action).to.equal('action1');
    }));

});

describe('Menu', function () {

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    it('should initialise new component', inject(function (BaseComponent, Menu, MenuItem) {
        var component = new BaseComponent();

        var items = [new MenuItem({
            icon: 'icon1',
            action: "action1"
        })];

        var menu = new Menu({
            component: component,
            items: items
        });

        expect(menu instanceof BaseComponent).to.be.true;
        expect(menu.type).to.equal('menu');
        expect(menu.component).to.deep.equal(component);
        expect(menu.items).to.have.length(1);
        expect(menu.items[0].menu).to.deep.equal(menu);
    }));

    it('should add items', inject(function (BaseComponent, Menu, MenuItem) {
        var menu = new Menu();

        expect(menu.items).to.be.empty;

        menu.addItems([new MenuItem({
            icon: 'icon1',
            action: "action1"
        })]);

        expect(menu.items).to.have.length(1);

        menu.addItem(new MenuItem({
            icon: 'icon1',
            action: "action1"
        }));

        expect(menu.items).to.have.length(2);
    }));

});

describe('Conversation', function () {

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    it('should initialise new component', inject(function (ConnectableComponent, Conversation, Endpoint) {
        var conversation = new Conversation({
            id: 'conversation1',
            name: 'test conversation',
            description: "my test conversation",
            x: 100,
            y: 100,
            colour: 'red',
            endpoints: [new Endpoint({ id: 'endpoint1' })]
        });

        expect(conversation instanceof ConnectableComponent).to.be.true;
        expect(conversation.id).to.equal('conversation1');
        expect(conversation.type).to.equal('conversation');
        expect(conversation.name).to.equal('test conversation');
        expect(conversation.description).to.equal('my test conversation');
        expect(conversation.x).to.equal(100);
        expect(conversation.y).to.equal(100);
        expect(conversation.colour).to.equal('red');
        expect(conversation.endpoints).to.have.length(1);
        expect(conversation.menu).not.to.be.undefined;

        var menu = conversation.menu;
        expect(menu.items).to.have.length(3);
        expect(menu.items[0].icon).to.equal('\uf040');
        expect(menu.items[0].action).to.equal('go:campaignDesignerEdit');
        expect(menu.items[1].icon).to.equal('\uf0c1');
        expect(menu.items[1].action).to.equal('go:campaignDesignerConnect');
        expect(menu.items[2].icon).to.equal('\uf00d');
        expect(menu.items[2].action).to.equal('go:campaignDesignerRemove');
    }));

});

describe('Router', function () {

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    it('should initialise new component', inject(function (ConnectableComponent, Router, Endpoint) {
        var router = new Router({
            id: 'router1',
            name: 'test router',
            description: "my test router",
            x: 100,
            y: 100,
            endpoints: [
                new Endpoint({ id: 'endpoint1' }),
                new Endpoint({ id: 'endpoint2' })
            ]
        });

        expect(router instanceof ConnectableComponent).to.be.true;
        expect(router.id).to.equal('router1');
        expect(router.type).to.equal('router');
        expect(router.name).to.equal('test router');
        expect(router.description).to.equal('my test router');
        expect(router.x).to.equal(100);
        expect(router.y).to.equal(100);
        expect(router.endpoints).to.have.length(2);
        expect(router.menu).not.to.be.undefined;

        var menu = router.menu;
        expect(menu.items).to.have.length(3);
        expect(menu.items[0].icon).to.equal('\uf040');
        expect(menu.items[0].action).to.equal('go:campaignDesignerEdit');
        expect(menu.items[1].icon).to.equal('\uf0c1');
        expect(menu.items[1].action).to.equal('go:campaignDesignerConnect');
        expect(menu.items[2].icon).to.equal('\uf00d');
        expect(menu.items[2].action).to.equal('go:campaignDesignerRemove');
    }));

});

describe('Channel', function () {

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    it('should initialise new component', inject(function (ConnectableComponent, Channel, Endpoint) {
        var channel = new Channel({
            id: 'channel1',
            name: 'test channel',
            description: "my test channel",
            x: 100,
            y: 100,
            utilization: 0.5,
            endpoints: [new Endpoint({ id: 'endpoint1' })]
        });

        expect(channel instanceof ConnectableComponent).to.be.true;
        expect(channel.id).to.equal('channel1');
        expect(channel.type).to.equal('channel');
        expect(channel.name).to.equal('test channel');
        expect(channel.description).to.equal('my test channel');
        expect(channel.x).to.equal(100);
        expect(channel.y).to.equal(100);
        expect(channel.utilization).to.equal(0.5);
        expect(channel.endpoints).to.have.length(1);
        expect(channel.menu).not.to.be.undefined;

        var menu = channel.menu;
        expect(menu.items).to.have.length(3);
        expect(menu.items[0].icon).to.equal('\uf040');
        expect(menu.items[0].action).to.equal('go:campaignDesignerEdit');
        expect(menu.items[1].icon).to.equal('\uf0c1');
        expect(menu.items[1].action).to.equal('go:campaignDesignerConnect');
        expect(menu.items[2].icon).to.equal('\uf00d');
        expect(menu.items[2].action).to.equal('go:campaignDesignerRemove');
    }));

});

describe('Route', function () {

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    it('should initialise new component', inject(function (BaseComponent, Route, Endpoint) {
        var source = new Endpoint({ id: 'endpoint1' });
        var target = new Endpoint({ id: 'endpoint2' });

        var route = new Route({
            id: 'route1',
            source: source,
            target: target
        });

        expect(route instanceof BaseComponent).to.be.true;
        expect(route.id).to.equal('route1');
        expect(route.type).to.equal('route');
        expect(route.source).to.equal(source);
        expect(route.target).to.equal(target);
    }));

    it('should flip direction', inject(function (Route, Endpoint) {
        var source = new Endpoint({ id: 'endpoint1' });
        var target = new Endpoint({ id: 'endpoint2' });

        var route = new Route({
            source: source,
            target: target
        });

        route.flip();

        expect(route.source).to.equal(target);
        expect(route.target).to.equal(source);
    }));

});

describe('ControlPoint', function () {

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    it('should initialise new component', inject(function (BaseComponent, ControlPoint) {
        var point = new ControlPoint({
            id: 'point1',
            x: 100,
            y: 100
        });

        expect(point instanceof BaseComponent).to.be.true;
        expect(point.id).to.equal('point1');
        expect(point.x).to.equal(100);
        expect(point.y).to.equal(100);
    }));

});

describe('Connection', function () {

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    it('should initialise new component', inject(function (BaseComponent, ConnectableComponent, Endpoint, Route, Connection) {
        var component1 = new ConnectableComponent({ id: 'component1' });
        var endpoint1 = new Endpoint({ id: 'endpoint1' });
        component1.addEndpoint(endpoint1);

        var component2 = new ConnectableComponent({ id: 'component2' });
        var endpoint2 = new Endpoint({ id: 'endpoint2' });
        component2.addEndpoint(endpoint2);

        var connection = new Connection({
            id: 'connection1',
            routes: [
                new Route({
                    id: 'route1',
                    source: endpoint1,
                    target: endpoint2
                })
            ]
        });

        expect(connection instanceof BaseComponent).to.be.true;
        expect(connection.id).to.equal('connection1');
        expect(connection.type).to.equal('connection');
        expect(connection.routes).to.have.length(1);
        expect(connection.points).to.have.length(2);
        expect(connection.menu).not.to.be.undefined;

        var menu = connection.menu;
        expect(menu.items).to.have.length(3);
        expect(menu.items[0].icon).to.equal('\uf065');
        expect(menu.items[0].action).to.equal('go:campaignDesignerFlipDirection');
        expect(menu.items[1].icon).to.equal('\uf066');
        expect(menu.items[1].action).to.equal('go:campaignDesignerBiDirectional');
        expect(menu.items[2].icon).to.equal('\uf00d');
        expect(menu.items[2].action).to.equal('go:campaignDesignerRemove');
    }));

    it('should add route', inject(function (BaseComponent, ConnectableComponent, Endpoint, Route, Connection) {
        var component1 = new ConnectableComponent({ id: 'component1' });
        var endpoint1 = new Endpoint({ id: 'endpoint1' });
        component1.addEndpoint(endpoint1);

        var component2 = new ConnectableComponent({ id: 'component2' });
        var endpoint2 = new Endpoint({ id: 'endpoint2' });
        component2.addEndpoint(endpoint2);

        var connection = new Connection({
            id: 'connection1'
        });

        expect(connection.routes).to.be.empty;

        var route = new Route({
            id: 'route1',
            source: endpoint1,
            target: endpoint2
        });

        connection.addRoute(route);

        expect(connection.routes).to.have.length(1);
    }));

    it('should get unique list of endpoints', inject(function (BaseComponent, ConnectableComponent, Endpoint, Route, Connection) {
        var component1 = new ConnectableComponent({ id: 'component1' });
        var endpoint1 = new Endpoint({ id: 'endpoint1' });
        component1.addEndpoint(endpoint1);

        var component2 = new ConnectableComponent({ id: 'component2' });
        var endpoint2 = new Endpoint({ id: 'endpoint2' });
        component2.addEndpoint(endpoint2);

        var connection = new Connection({
            id: 'connection1'
        });

        connection.addRoute(new Route({
            id: 'route1',
            source: endpoint1,
            target: endpoint2
        }));

        connection.addRoute(new Route({
            id: 'route2',
            source: endpoint2,
            target: endpoint1
        }));

        var endpoints = connection.getEndpoints();

        expect(endpoints).to.deep.equal([endpoint1, endpoint2]);
    }));

    it('should determine whether it is connected to endpoints', inject(
            function (BaseComponent, ConnectableComponent, Endpoint, Route, Connection) {
        var component1 = new ConnectableComponent({ id: 'component1' });
        var endpoint1 = new Endpoint({ id: 'endpoint1' });
        component1.addEndpoint(endpoint1);

        var component2 = new ConnectableComponent({ id: 'component2' });
        var endpoint2 = new Endpoint({ id: 'endpoint2' });
        component2.addEndpoint(endpoint2);

        var endpoint3 = new Endpoint({ id: 'endpoint3' });

        var connection = new Connection({
            id: 'connection1',
            routes: [new Route({
                id: 'route1',
                source: endpoint1,
                target: endpoint2
            })]
        });

        expect(connection.isConnectedTo([endpoint1, endpoint3])).to.be.true;
        expect(connection.isConnectedTo([endpoint3])).to.be.false;
    }));

    it('should flip direction', inject(function (ConnectableComponent, Endpoint, Route, Connection) {
        var component1 = new ConnectableComponent({ id: 'component1' });
        var endpoint1 = new Endpoint({ id: 'endpoint1' });
        component1.addEndpoint(endpoint1);

        var component2 = new ConnectableComponent({ id: 'component2' });
        var endpoint2 = new Endpoint({ id: 'endpoint2' });
        component2.addEndpoint(endpoint2);

        var connection = new Connection({
            id: 'connection1',
            routes: [new Route({
                id: 'route1',
                source: endpoint1,
                target: endpoint2
            })]
        });

        connection.flipDirection();

        var expected = [new Route({
            id: 'route1',
            source: endpoint2,
            target: endpoint1
        })];

        expect(connection.routes).to.deep.equal(expected);
    }));

    it('should make bi-directional', inject(function (ConnectableComponent, Endpoint, Route, Connection, rfc4122) {
        var component1 = new ConnectableComponent({ id: 'component1' });
        var endpoint1 = new Endpoint({ id: 'endpoint1' });
        component1.addEndpoint(endpoint1);

        var component2 = new ConnectableComponent({ id: 'component2' });
        var endpoint2 = new Endpoint({ id: 'endpoint2' });
        component2.addEndpoint(endpoint2);

        var connection = new Connection({
            id: 'connection1',
            routes: [new Route({
                id: 'route1',
                source: endpoint1,
                target: endpoint2
            })]
        });

        var stub = sinon.stub(rfc4122, 'v4');
        stub.onCall(0).returns('route2');

        connection.biDirectional();

        var expected = [
            new Route({
                id: 'route1',
                source: endpoint1,
                target: endpoint2
            }),
            new Route({
                id: 'route2',
                source: endpoint2,
                target: endpoint1
            })
        ];

        expect(connection.routes).to.deep.equal(expected);
    }));

    it('should restrict endpoint to single outgoing route', inject(function (ConnectableComponent, Endpoint, Route, Connection) {
        var component1 = new ConnectableComponent({ id: 'component1' });
        var endpoint1 = new Endpoint({ id: 'endpoint1' });
        component1.addEndpoint(endpoint1);

        var component2 = new ConnectableComponent({ id: 'component2' });
        var endpoint2 = new Endpoint({ id: 'endpoint2' });
        component2.addEndpoint(endpoint2);

        var component3 = new ConnectableComponent({ id: 'component3' });
        var endpoint3 = new Endpoint({ id: 'endpoint3' });
        component3.addEndpoint(endpoint3);

        var connection1 = new Connection({
            id: 'connection1',
            routes: [new Route({
                id: 'route1',
                source: endpoint1,
                target: endpoint2
            })]
        });

        var connection2 = new Connection({
            id: 'connection2',
            routes: [new Route({
                id: 'route2',
                source: endpoint2,
                target: endpoint3
            })]
        });

        connection1.flipDirection();

        var expected = [new Route({
            id: 'route1',
            source: endpoint1,
            target: endpoint2
        })];

        expect(connection1.routes).to.deep.equal(expected);

        expected = [new Route({
            id: 'route2',
            source: endpoint2,
            target: endpoint3
        })];

        expect(connection2.routes).to.deep.equal(expected);
    }));

});

describe('ComponentManager', function () {
    var data;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function () {
        data = {
            conversations: [{
                uuid: 'conversation1',
                name: "Register",
                description: "4 Steps",
                endpoints: [{uuid: 'endpoint1', name: 'default'}],
                colour: '#f82943',
                x: 220,
                y: 120
            }, {
                uuid: 'conversation2',
                name: "Survey",
                description: "4 Questions",
                endpoints: [{uuid: 'endpoint2', name: 'default'}],
                colour: '#fbcf3b',
                x: 220,
                y: 340
            }],
            channels: [{
                uuid: 'channel1',
                name: "SMS",
                description: "082 335 29 24",
                endpoints: [{uuid: 'endpoint3', name: 'default'}],
                utilization: 0.4,
                x: 840,
                y: 360
            }, {
                uuid: 'channel2',
                name: "USSD",
                description: "*120*10001#",
                endpoints: [{uuid: 'endpoint4', name: 'default'}],
                utilization: 0.9,
                x: 840,
                y: 140
            }],
            routers: [{
                uuid: 'router1',
                name: "K",
                description: "Keyword",
                channel_endpoints: [{uuid: 'endpoint5', name: 'default'}],
                conversation_endpoints: [{
                    uuid: 'endpoint6',
                    name: 'default'
                }, {
                    uuid: 'endpoint7',
                    name: 'default'
                }],
                x: 500,
                y: 220
            }],
            routing_entries: [{
                uuid: 'connection1',
                source: {uuid: 'endpoint1'},
                target: {uuid: 'endpoint6'}
            }]
        };
    }));

    it('should initialise components', inject(function (ComponentManager) {
        var componentManager = new ComponentManager(data);
        expect(_.values(componentManager.components)).to.have.length(6);
    }));

    it('should load data', inject(function (ComponentManager) {
        var componentManager = new ComponentManager();
        expect(componentManager.components).to.be.empty;
        componentManager.load(data);
        expect(_.values(componentManager.components)).to.have.length(6);
    }));

    it('should reset components', inject(function (ComponentManager) {
        var componentManager = new ComponentManager(data);
        expect(componentManager.components).not.to.be.empty;
        componentManager.reset();
        expect(componentManager.components).to.be.empty;
    }));

    it('should add component', inject(function (ComponentManager, BaseComponent) {
        var componentManager = new ComponentManager();
        componentManager.addComponent(new BaseComponent({
            id: 'component1',
            type: 'test component'
        }));
        expect(_.values(componentManager.components)).to.have.length(1);
        expect(componentManager.components['component1'].type).to.equal('test component');
    }));

    it('should get component by id', inject(function (ComponentManager) {
        var componentManager = new ComponentManager(data);
        var conversation = componentManager.getComponent('conversation1');
        expect(conversation).to.deep.equal(componentManager.components['conversation1']);
    }));

    it('should get endpoint by id', inject(function (ComponentManager) {
        var componentManager = new ComponentManager(data);
        var endpoint = componentManager.getEndpoint('endpoint1');
        expect(endpoint).to.deep.equal(componentManager.components['conversation1'].endpoints[0]);
    }));

    it('should remove component', inject(function (ComponentManager) {
        var componentManager = new ComponentManager(data);
        expect(componentManager.components['conversation1']).not.to.be.empty;

        var component = componentManager.components['conversation1'];
        sinon.stub(component, 'beforeRemove');

        componentManager.removeComponent('conversation1');
        expect(component.beforeRemove.calledWith()).to.be.true;
        expect(componentManager.components['conversation1']).to.be.undefined;
        expect(componentManager.getConnections()).to.be.empty;
    }));

    it('should connect components', inject(function (ComponentManager, rfc4122) {
        var componentManager = new ComponentManager(data);
        expect(componentManager.getConnections()).to.have.length(1);

        var conversation2 = componentManager.components['conversation2'];
        var channel1 = componentManager.components['channel1'];

        var stub = sinon.stub(rfc4122, 'v4');
        stub.onCall(0).returns('route2');
        stub.onCall(1).returns('connection2');

        componentManager.connectComponents(conversation2, null, channel1, null);
        expect(componentManager.getConnections()).to.have.length(2);

        var connection = componentManager.components['connection2'];
        expect(connection).not.to.be.empty;
        expect(connection.routes).to.have.length(1);
        expect(connection.routes[0].source).to.deep.equal(conversation2.endpoints[0]);
        expect(connection.routes[0].target).to.deep.equal(channel1.endpoints[0]);
    }));

    it('should get components by type', inject(function (ComponentManager) {
        var componentManager = new ComponentManager(data);

        var conversations = componentManager.getConversations();
        expect(conversations).to.have.length(2);
        expect(_.pluck(conversations, 'type')).to.deep.equal([
            'conversation', 'conversation']);

        var channels = componentManager.getChannels();
        expect(channels).to.have.length(2);
        expect(_.pluck(channels, 'type')).to.deep.equal([
            'channel', 'channel']);

        var routers = componentManager.getRouters();
        expect(routers).to.have.length(1);
        expect(_.pluck(routers, 'type')).to.deep.equal(['router']);

        var connections = componentManager.getConnections();
        expect(connections).to.have.length(1);
        expect(_.pluck(connections, 'type')).to.deep.equal(['connection']);

        var points = componentManager.getControlPoints();
        expect(points).to.have.length(2);
        expect(_.pluck(points, 'type')).to.deep.equal([
            'control point', 'control point']);

        var menus = componentManager.getMenus();
        expect(menus).to.have.length(6);
        expect(_.pluck(menus, 'type')).to.deep.equal([
            'menu', 'menu', 'menu', 'menu', 'menu', 'menu']);
    }));

    it('should compute component layouts', inject(function (ComponentManager) {
        var componentManager = new ComponentManager(data);
        var meta = _.pluck(_.filter(componentManager.components, '_meta'), '_meta');
        expect(meta).to.be.empty;
        componentManager.layoutComponents();
        meta = _.pluck(_.filter(componentManager.components, '_meta'), '_meta');
        expect(meta).to.have.length(6);
        var layouts = _.pluck(_.filter(meta, 'layout'), 'layout');
        expect(meta).to.have.length(6);
    }));

});
