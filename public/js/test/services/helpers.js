describe('BaseComponent', function () {
    var data, manager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));
    beforeEach(inject(function (ComponentManager) {
        data = {
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

        manager = new ComponentManager(data);
    }));

    it('should initialise new component', inject(function (BaseComponent) {
        var component = new BaseComponent({
            id: 'component1',
            type: 'test component',
            manager: manager
        });

        expect(component.id).to.equal('component1');
        expect(component.type).to.equal('test component');
        expect(component.manager).to.equal(manager);
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

describe('MenuItem', function () {

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    it('should initialise new component', inject(function (BaseComponent, Menu, MenuItem) {
        var menu = new Menu();

        var item = new MenuItem({
            menu: menu,
            icon: 'icon1',
            event: "event1"
        });

        expect(item instanceof BaseComponent).to.be.true;
        expect(item.type).to.equal('menu_item');
        expect(item.menu).to.deep.equal(menu);
        expect(item.icon).to.equal('icon1');
        expect(item.event).to.equal('event1');
    }));

});

describe('Menu', function () {
    var data, manager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));
    beforeEach(inject(function (ComponentManager) {
        data = {
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

        manager = new ComponentManager(data);
    }));

    it('should initialise new component', inject(function (BaseComponent, Menu, MenuItem) {
        var component = new BaseComponent();

        var menu = new Menu({
            manager: manager,
            component: component
        });

        expect(menu instanceof BaseComponent).to.be.true;
        expect(menu.type).to.equal('menu');
        expect(menu.component).to.deep.equal(component);
        expect(menu.items).to.be.empty;

        menu.addItem('icon1', "event1");

        expect(menu.items).to.have.length(1);
        expect(menu.items[0] instanceof MenuItem).to.be.true;
        expect(menu.items[0].menu).to.deep.equal(menu);
        expect(menu.items[0].icon).to.equal('icon1');
        expect(menu.items[0].event).to.equal('event1');
    }));
});

describe('RoutingComponent', function () {
    var data, manager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));
    beforeEach(inject(function (ComponentManager) {
        data = {
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

        manager = new ComponentManager(data);
    }));

    it('should initialise new component', inject(function (BaseComponent, RoutingComponent) {
        var component = new RoutingComponent({
            id: 'component1',
            type: 'test component',
            manager: manager,
            data: data
        });

        expect(component instanceof BaseComponent).to.be.true;
        expect(component.id).to.equal('component1');
        expect(component.type).to.equal('test component');
        expect(component.manager).to.equal(manager);
        expect(component.data).to.equal(data);
    }));

    it('should create menu', inject(function (RoutingComponent, Menu, MenuItem) {
        var component = new RoutingComponent({
            id: 'component1',
            type: 'test component',
            manager: manager,
            data: data,
            actions: ['edit', 'connect', 'flipDirection', 'biDirectional', 'delete']
        });

        expect(component.actions).to.deep.equal(['edit', 'connect', 'flipDirection', 'biDirectional', 'delete']);
        expect(component.menu instanceof Menu).to.be.true;
        expect(component.menu.items).to.have.length(5);
        expect(component.menu.items[0].icon).to.equal('\uf040');
        expect(component.menu.items[0].event).to.equal('go:campaignDesignerEdit');
        expect(component.menu.items[1].icon).to.equal('\uf0c1');
        expect(component.menu.items[1].event).to.equal('go:campaignDesignerConnect');
        expect(component.menu.items[2].icon).to.equal('\uf065');
        expect(component.menu.items[2].event).to.equal('go:campaignDesignerFlipDirection');
        expect(component.menu.items[3].icon).to.equal('\uf066');
        expect(component.menu.items[3].event).to.equal('go:campaignDesignerBiDirectional');
        expect(component.menu.items[4].icon).to.equal('\uf00d');
        expect(component.menu.items[4].event).to.equal('go:campaignDesignerRemove');
    }));
});

describe('Endpoint', function () {
    var data, manager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));
    beforeEach(inject(function (ComponentManager) {
        data = {
            routing_table: {
                components: {
                    'component1': {
                        type: 'channel',
                        uuid: 'component1',
                        name: 'Test component',
                        endpoints: {
                            'endpoint1': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint1',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {}
            },
            layout: {
                components: {
                    'component1': {
                        x: 0,
                        y: 0
                    }
                },
                routing: {},
                connections: {}
            }
        };

        manager = new ComponentManager(data);
    }));

    it('should initialise new component', inject(function (RoutingComponent, ConnectableComponent, Endpoint) {
        var component = new ConnectableComponent({
            id: 'component1',
            type: 'channel',
            manager: manager,
            data: data
        });

        var endpoint = new Endpoint({
            id: 'endpoint1',
            type: 'channel_endpoint',
            manager: manager,
            data: data,
            component: component
        });

        expect(endpoint instanceof RoutingComponent).to.be.true;
        expect(endpoint.id).to.equal('endpoint1');
        expect(endpoint.type).to.equal('channel_endpoint');
        expect(endpoint.component).to.equal(component);
        expect(endpoint.name()).to.equal('default');
    }));

});

describe('ConnectableComponent', function () {
    var data, manager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));
    beforeEach(inject(function (ComponentManager) {
        data = {
            routing_table: {
                components: {
                    'component1': {
                        type: 'router',
                        router_type: 'keyword',
                        uuid: 'component1',
                        name: 'Test',
                        description: 'Test component',
                        endpoints: {
                            'endpoint1': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint1',
                                name: 'default'
                            },
                            'endpoint2': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint2',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {}
            },
            layout: {
                components: {
                    'component1': {
                        x: 0,
                        y: 0
                    }
                },
                routing: {},
                connections: {}
            }
        };

        manager = new ComponentManager(data);
    }));

    it('should initialise new component', inject(function (BaseComponent, ConnectableComponent) {
        var component = new ConnectableComponent({
            id: 'component1',
            type: 'router',
            manager: manager,
            data: data
        });

        expect(component instanceof BaseComponent).to.be.true;
        expect(component.id).to.equal('component1');
        expect(component.type).to.equal('router');
        expect(component.endpoints()).to.have.length(2);
        expect(component.name()).to.equal('Test');
        expect(component.description()).to.equal('Test component');
        expect(component.x()).to.equal(0);
        expect(component.y()).to.equal(0);
    }));

    it('should get endpoints by type', inject(function (ConnectableComponent, Endpoint) {
        var component = new ConnectableComponent({
            id: 'component1',
            type: 'router',
            manager: manager,
            data: data
        });

        expect(component.endpoints()).to.deep.equal([
            manager.getComponentById('endpoint1'),
            manager.getComponentById('endpoint2')
        ]);

        expect(component.endpoints('channel_endpoint')).to.deep.equal([
            manager.getComponentById('endpoint1')
        ]);

        expect(component.endpoints('conversation_endpoint')).to.deep.equal([
            manager.getComponentById('endpoint2')
        ]);
    }));
});

describe('Channel', function () {
    var data, manager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));
    beforeEach(inject(function (ComponentManager) {
        data = {
            routing_table: {
                components: {
                    'channel1': {
                        type: 'channel',
                        uuid: 'channel1',
                        tag: ['apposit_sms', '*121#'],
                        name: '*121#',
                        description: 'Apposit Sms: *121#',
                        utilization: 0.5,
                        endpoints: {
                            'endpoint3': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint3',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {}
            },
            layout: {
                components: {
                    'channel1': {
                        x: 0,
                        y: 0
                    }
                },
                routing: {},
                connections: {}
            }
        };

        manager = new ComponentManager(data);
    }));

    it('should initialise new component', inject(function (ConnectableComponent, Channel) {
        var channel = new Channel({
            id: 'channel1',
            data: data,
            manager: manager
        });

        expect(channel instanceof ConnectableComponent).to.be.true;
        expect(channel.id).to.equal('channel1');
        expect(channel.type).to.equal('channel');
        expect(channel.name()).to.equal('*121#');
        expect(channel.description()).to.equal('Apposit Sms: *121#');
        expect(channel.x()).to.equal(0);
        expect(channel.y()).to.equal(0);
        expect(channel.utilization()).to.equal(0.5);
    }));

});

describe('Conversation', function () {
    var data, manager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));
    beforeEach(inject(function (ComponentManager) {
        data = {
            routing_table: {
                components: {
                    'conversation1': {
                        type: 'conversation',
                        conversation_type: 'bulk-message',
                        uuid: 'conversation1',
                        name: 'bulk-message1',
                        description: 'Some Bulk Message App',
                        endpoints: {
                            'endpoint1': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint1',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {}
            },
            layout: {
                components: {
                    'conversation1': {
                        x: 0,
                        y: 0,
                        colour: 'white'
                    }
                },
                routing: {},
                connections: {}
            }
        };

        manager = new ComponentManager(data);
    }));

    it('should initialise new component', inject(function (ConnectableComponent, Conversation) {
        var conversation = new Conversation({
            id: 'conversation1',
            data: data,
            manager: manager
        });

        expect(conversation instanceof ConnectableComponent).to.be.true;
        expect(conversation.id).to.equal('conversation1');
        expect(conversation.type).to.equal('conversation');
        expect(conversation.name()).to.equal('bulk-message1');
        expect(conversation.description()).to.equal('Some Bulk Message App');
        expect(conversation.x()).to.equal(0);
        expect(conversation.y()).to.equal(0);
        expect(conversation.colour()).to.equal('white');
        expect(conversation.actions).to.deep.equal(['edit', 'connect', 'delete']);
    }));

});

describe('Router', function () {
    var data, manager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));
    beforeEach(inject(function (ComponentManager) {
        data = {
            routing_table: {
                components: {
                    'router1': {
                        type: 'router',
                        router_type: 'keyword',
                        uuid: 'router1',
                        name: 'K',
                        description: 'Keyword',
                        endpoints: {
                            'endpoint5': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint5',
                                name: 'default'
                            },
                            'endpoint6': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint6',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {}
            },
            layout: {
                components: {
                    'router1': {
                        x: 0,
                        y: 0
                    }
                },
                routing: {},
                connections: {}
            }
        };

        manager = new ComponentManager(data);
    }));

    it('should initialise new component', inject(function (ConnectableComponent, Router) {
        var router = new Router({
            id: 'router1',
            data: data,
            manager: manager
        });

        expect(router instanceof ConnectableComponent).to.be.true;
        expect(router.id).to.equal('router1');
        expect(router.type).to.equal('router');
        expect(router.name()).to.equal('K');
        expect(router.description()).to.equal('Keyword');
        expect(router.x()).to.equal(0);
        expect(router.y()).to.equal(0);
        expect(router.actions).to.deep.equal(['edit', 'connect', 'delete']);
    }));

});

describe('Route', function () {
    var data, manager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));
    beforeEach(inject(function (ComponentManager) {
        data = {
            routing_table: {
                components: {
                    'channel1': {
                        type: 'channel',
                        uuid: 'channel1',
                        tag: ['apposit_sms', '*121#'],
                        name: '*121#',
                        description: 'Apposit Sms: *121#',
                        utilization: 0.5,
                        endpoints: {
                            'endpoint1': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint1',
                                name: 'default'
                            }
                        }
                    },
                    'conversation1': {
                        type: 'conversation',
                        conversation_type: 'bulk-message',
                        uuid: 'conversation1',
                        name: 'bulk-message1',
                        description: 'Some Bulk Message App',
                        endpoints: {
                            'endpoint2': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint2',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {
                    'endpoint1:endpoint2': {
                        source: 'endpoint1',
                        target: 'endpoint2'
                    },
                }
            },
            layout: {
                components: {
                    'channel1': {
                        x: 840,
                        y: 360
                    },
                    'conversation1': {
                        x: 220,
                        y: 120,
                        colour: '#f82943'
                    }
                },
                routing: {
                    'endpoint1:endpoint2': 'connection1'
                },
                connections: {
                    'connection1': {
                        endpoints: {
                            'endpoint1': 'channel1',
                            'endpoint2': 'conversation1'
                        },
                        path: [{
                            x: 840,
                            y: 360,
                        }, {
                            x: 220,
                            y: 120
                        }],
                        colour: '#f82943'
                    }
                }
            }
        };

        manager = new ComponentManager(data);
    }));

    it('should initialise new component', inject(function (RoutingComponent, Route) {
        var route = new Route({
            id: 'endpoint1:endpoint2',
            manager: manager,
            data: data,
            source: 'endpoint1',
            target: 'endpoint2'
        });

        expect(route instanceof RoutingComponent).to.be.true;
        expect(route.id).to.equal('endpoint1:endpoint2');
        expect(route.type).to.equal('route');
        expect(route.source()).to.equal(manager.getComponentById('endpoint1'));
        expect(route.target()).to.equal(manager.getComponentById('endpoint2'));
    }));

});

describe('ControlPoint', function () {
    var data, manager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));
    beforeEach(inject(function (ComponentManager) {
        data = {
            routing_table: {
                components: {
                    'channel1': {
                        type: 'channel',
                        uuid: 'channel1',
                        tag: ['apposit_sms', '*121#'],
                        name: '*121#',
                        description: 'Apposit Sms: *121#',
                        utilization: 0.5,
                        endpoints: {
                            'endpoint1': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint1',
                                name: 'default'
                            }
                        }
                    },
                    'conversation1': {
                        type: 'conversation',
                        conversation_type: 'bulk-message',
                        uuid: 'conversation1',
                        name: 'bulk-message1',
                        description: 'Some Bulk Message App',
                        endpoints: {
                            'endpoint2': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint2',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {
                    'endpoint1:endpoint2': {
                        source: 'endpoint1',
                        target: 'endpoint2'
                    },
                }
            },
            layout: {
                components: {
                    'channel1': {
                        x: 840,
                        y: 360
                    },
                    'conversation1': {
                        x: 220,
                        y: 120,
                        colour: '#f82943'
                    }
                },
                routing: {
                    'endpoint1:endpoint2': 'connection1'
                },
                connections: {
                    'connection1': {
                        endpoints: {
                            'endpoint1': 'channel1',
                            'endpoint2': 'conversation1'
                        },
                        path: [{
                            x: 840,
                            y: 360,
                        }, {
                            x: 220,
                            y: 120
                        }],
                        colour: '#f82943'
                    }
                }
            }
        };

        manager = new ComponentManager(data);
    }));

    it('should initialise new component', inject(function (RoutingComponent, ControlPoint) {
        var connection = manager.getComponentById('connection1');

        var point = new ControlPoint({
            manager: manager,
            data: data,
            connection: connection,
            index: 0
        });

        expect(point instanceof RoutingComponent).to.be.true;
        expect(point.id).to.equal(connection.id + ':' + 0);
        expect(point.x()).to.equal(840);
        expect(point.y()).to.equal(360);
    }));

});

describe('Connection', function () {
    var data, manager;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));
    beforeEach(inject(function (ComponentManager) {
        data = {
            routing_table: {
                components: {
                    'channel1': {
                        type: 'channel',
                        uuid: 'channel1',
                        tag: ['apposit_sms', '*121#'],
                        name: '*121#',
                        description: 'Apposit Sms: *121#',
                        utilization: 0.5,
                        endpoints: {
                            'endpoint1': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint1',
                                name: 'default'
                            }
                        }
                    },
                    'conversation1': {
                        type: 'conversation',
                        conversation_type: 'bulk-message',
                        uuid: 'conversation1',
                        name: 'bulk-message1',
                        description: 'Some Bulk Message App',
                        endpoints: {
                            'endpoint2': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint2',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {
                    'endpoint1:endpoint2': {
                        source: 'endpoint1',
                        target: 'endpoint2'
                    },
                }
            },
            layout: {
                components: {
                    'channel1': {
                        x: 840,
                        y: 360
                    },
                    'conversation1': {
                        x: 220,
                        y: 120,
                        colour: '#f82943'
                    }
                },
                routing: {
                    'endpoint1:endpoint2': 'connection1'
                },
                connections: {
                    'connection1': {
                        endpoints: {
                            'endpoint1': 'channel1',
                            'endpoint2': 'conversation1'
                        },
                        path: [{
                            x: 840,
                            y: 360,
                        }, {
                            x: 220,
                            y: 120
                        }],
                        colour: '#f82943'
                    }
                }
            }
        };

        manager = new ComponentManager(data);
    }));

    it('should initialise new component', inject(function (RoutingComponent, Connection) {
        var connection = new Connection({
            id: 'connection1',
            manager: manager,
            data: data
        });

        expect(connection instanceof RoutingComponent).to.be.true;
        expect(connection.id).to.equal('connection1');
        expect(connection.type).to.equal('connection');
        expect(connection.actions).to.deep.equal(['flipDirection', 'biDirectional', 'delete']);
        expect(connection.points()).to.deep.equal([
            manager.getComponentById('connection1:0'),
            manager.getComponentById('connection1:1')
        ]);
        expect(connection.routes()).to.deep.equal([
            manager.getComponentById('endpoint1:endpoint2'),
        ]);
        expect(connection.colour()).to.equal('#f82943');
    }));

});

describe('ComponentManager', function () {
    var data;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function () {
        data = {
            routing_table: {
                version: 'fsm-0.1',
                campaign_id: 'campaign1',
                components: {
                    'channel1': {
                        type: 'channel',
                        uuid: 'channel1',
                        tag: ['apposit_sms', '*121#'],
                        name: '*121#',
                        description: 'Apposit Sms: *121#',
                        utilization: 0.5,
                        endpoints: {
                            'endpoint3': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint3',
                                name: 'default'
                            }
                        }
                    },
                    'channel2': {
                        type: 'channel',
                        uuid: 'channel2',
                        tag: ['sigh_sms', '*131#'],
                        name: '*131#',
                        description: 'Sigh Sms: *131#',
                        utilization: 0.5,
                        endpoints: {
                            'endpoint4': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint4',
                                name: 'default'
                            }
                        }
                    },
                    'router1': {
                        type: 'router',
                        router_type: 'keyword',
                        uuid: 'router1',
                        name: 'K',
                        description: 'Keyword',
                        endpoints: {
                            'endpoint5': {
                                type: 'channel_endpoint',
                                uuid: 'endpoint5',
                                name: 'default'
                            },
                            'endpoint6': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint6',
                                name: 'default'
                            }
                        }
                    },
                    'conversation1': {
                        type: 'conversation',
                        conversation_type: 'bulk-message',
                        uuid: 'conversation1',
                        name: 'bulk-message1',
                        description: 'Some Bulk Message App',
                        endpoints: {
                            'endpoint1': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint1',
                                name: 'default'
                            }
                        }
                    },
                    'conversation2': {
                        type: 'conversation',
                        conversation_type: 'bulk-message',
                        uuid: 'conversation2',
                        name: 'bulk-message2',
                        description: 'Some Other Bulk Message App',
                        endpoints: {
                            'endpoint2': {
                                type: 'conversation_endpoint',
                                uuid: 'endpoint2',
                                name: 'default'
                            }
                        }
                    }
                },
                routing: {
                    'endpoint1:endpoint6': {
                        source: 'endpoint1',
                        target: 'endpoint6'
                    },
                    'endpoint6:endpoint1': {
                        source: 'endpoint6',
                        target: 'endpoint1'
                    }
                },
            },
            layout: {
                version: 'fsm-ui-0.1',
                components: {
                    'channel1': {
                        x: 840,
                        y: 360
                    },
                    'channel2': {
                        x: 840,
                        y: 140
                    },
                    'router1': {
                        x: 500,
                        y: 220
                    },
                    'conversation1': {
                        x: 220,
                        y: 120,
                        colour: '#f82943'
                    },
                    'conversation2': {
                        x: 220,
                        y: 340,
                        colour: '#fbcf3b'
                    }
                },
                routing: {
                    'endpoint1:endpoint6': 'connection1',
                    'endpoint6:endpoint1': 'connection1'
                },
                connections: {
                    'connection1': {
                        endpoints: {
                            'endpoint1': 'channel1',
                            'endpoint6': 'router1'
                        },
                        path: [{
                            x: 220,
                            y: 120,
                        }, {
                            x: 500,
                            y: 220
                        }],
                        colour: '#f82943'
                    }
                }
            }
        };
    }));

    it('should initialise components', inject(function (ComponentManager) {
        var manager = new ComponentManager(data);

        expect(manager.data).to.equal(data);

        expect(manager.components).to.have.ownProperty('channel1');
        expect(manager.components).to.have.ownProperty('channel2');
        expect(manager.components).to.have.ownProperty('conversation1');
        expect(manager.components).to.have.ownProperty('conversation2');
        expect(manager.components).to.have.ownProperty('router1');
        expect(manager.components).to.have.ownProperty('connection1');
        expect(manager.components).to.have.ownProperty('connection1:0');
        expect(manager.components).to.have.ownProperty('connection1:1');
        expect(manager.components).to.have.ownProperty('endpoint1');
        expect(manager.components).to.have.ownProperty('endpoint2');
        expect(manager.components).to.have.ownProperty('endpoint3');
        expect(manager.components).to.have.ownProperty('endpoint4');
        expect(manager.components).to.have.ownProperty('endpoint5');
        expect(manager.components).to.have.ownProperty('endpoint6');
        expect(manager.components).to.have.ownProperty('endpoint1:endpoint6');
        expect(manager.components).to.have.ownProperty('endpoint6:endpoint1');
    }));

    it('should reset components', inject(function (ComponentManager) {
        var manager = new ComponentManager(data);
        expect(manager.data).to.deep.equal(data);
        expect(manager.components).not.to.be.empty;

        manager.reset();

        expect(manager.components).to.be.empty;
        expect(manager.data).to.deep.equal({
            routing_table: {
                version: 'fsm-0.1',
                campaign_id: 'campaign1',
                components: {},
                routing: {}
            },
            layout: {
                version: 'fsm-ui-0.1',
                components: {},
                routing: {},
                connections: {}
            }
        });
    }));

    it('should create component', inject(function (
        ComponentManager, Channel, Conversation, Router,
        Endpoint, Route, Connection, ControlPoint,
        Menu, MenuItem) {

        var manager = new ComponentManager(data);

        var component = manager.createComponent({
            id: 'channel1',
            type: 'channel'
        });
        expect(component instanceof Channel).to.be.true;

        component = manager.createComponent({
            id: 'conversation1',
            type: 'conversation'
        });
        expect(component instanceof Conversation).to.be.true;

        component = manager.createComponent({
            id: 'router1',
            type: 'router'
        });
        expect(component instanceof Router).to.be.true;

        component = manager.createComponent({
            id: 'endpoint3',
            type: 'channel_endpoint',
            component: manager.getComponentById('channel1')
        });
        expect(component instanceof Endpoint).to.be.true;

        component = manager.createComponent({
            id: 'endpoint1',
            type: 'conversation_endpoint',
            component: manager.getComponentById('conversation1')
        });
        expect(component instanceof Endpoint).to.be.true;

        component = manager.createComponent({
            id: 'endpoint1:endpoint6',
            type: 'route'
        });
        expect(component instanceof Route).to.be.true;

        component = manager.createComponent({
            id: 'connection1',
            type: 'connection'
        });
        expect(component instanceof Connection).to.be.true;

        component = manager.createComponent({
            type: 'control_point',
            index: 0,
            connection: manager.getComponentById('connection1')
        });
        expect(component instanceof ControlPoint).to.be.true;

        component = manager.createComponent({
            id: 'menu1',
            type: 'menu'
        });
        expect(component instanceof Menu).to.be.true;

        component = manager.createComponent({
            id: 'menu_item1',
            type: 'menu_item'
        });
        expect(component instanceof MenuItem).to.be.true;

        component = manager.createComponent({
            type: 'not_supported'
        });
        expect(component).to.be.undefined;
    }));

    it('should add component', inject(function (ComponentManager, BaseComponent) {
        var manager = new ComponentManager(data);
        manager.addComponent(new BaseComponent({
            id: 'test1',
            type: 'test_component'
        }));

        expect(manager.components).to.have.ownProperty('test1');
    }));

    it('should get component by id', inject(function (ComponentManager) {
        var manager = new ComponentManager(data);
        var component = manager.getComponentById('conversation1');
        expect(component).not.to.be.undefined;
        expect(component.id).to.equal('conversation1');
    }));

    it('should find components', inject(function (ComponentManager) {
        var manager = new ComponentManager(data);
        var components = manager.findComponents({ type: 'channel' });
        expect(components).to.have.length(2);
        expect(_.pluck(components, 'type')).to.deep.equal(['channel', 'channel']);
    }));

    it('should delete component', inject(function (ComponentManager) {
        var manager = new ComponentManager(data);
        expect(manager.components).to.have.ownProperty('channel2');
        manager.deleteComponent('channel2');
        expect(manager.components['channel2']).to.be.undefined;
    }));

    it('should connect components', inject(function (ComponentManager, rfc4122) {
        var manager = new ComponentManager(data);
        expect(_.keys(data.layout.connections)).to.have.length(1);

        var stub = sinon.stub(rfc4122, 'v4');
        stub.onCall(0).returns('connection2');

        var conversation = manager.getComponentById('conversation2');
        var channel = manager.getComponentById('channel2');

        manager.connectComponents(conversation, null, channel, null);

        var expected = {
            endpoints: {
                'endpoint2': 'conversation2',
                'endpoint4': 'channel2'
            },
            path: [{
                x: 220,
                y: 340,
            }, {
                x: 840,
                y: 140
            }],
            colour: 'grey'
        };
        expect(data.layout.connections['connection2']).to.deep.equal(expected);

        expected = { source: 'endpoint2', target: 'endpoint4' };
        expect(data.routing_table.routing['endpoint2:endpoint4']).to.deep.equal(expected);

        expect(data.layout.routing['endpoint2:endpoint4']).to.equal('connection2');
    }));

    it('should compute component layouts', inject(function (ComponentManager) {
        var manager = new ComponentManager(data);

        var channels = manager.findComponents({ type: 'channel' });
        expect(_.filter(_.pluck(channels, '_meta'))).to.be.empty;

        var routers = manager.findComponents({ type: 'router' });
        expect(_.filter(_.pluck(routers, '_meta'))).to.be.empty;

        var conversations = manager.findComponents({ type: 'conversation' });
        expect(_.filter(_.pluck(conversations, '_meta'))).to.be.empty;

        var connections = manager.findComponents({ type: 'connection' });
        expect(_.filter(_.pluck(connections, '_meta'))).to.be.empty;

        var menus = manager.findComponents({ type: 'menu' });
        expect(_.filter(_.pluck(menus, '_meta'))).to.be.empty;

        manager.layoutComponents();

        expect(_.pluck(_.filter(_.pluck(channels, '_meta')), 'layout')).to.have.length(2);
        expect(_.pluck(_.filter(_.pluck(routers, '_meta')), 'layout')).to.have.length(1);
        expect(_.pluck(_.filter(_.pluck(conversations, '_meta')), 'layout')).to.have.length(2);
        expect(_.pluck(_.filter(_.pluck(connections, '_meta')), 'layout')).to.have.length(1);
        expect(_.pluck(_.filter(_.pluck(menus, '_meta')), 'layout')).to.have.length(6);
    }));

});
