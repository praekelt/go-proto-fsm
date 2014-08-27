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
