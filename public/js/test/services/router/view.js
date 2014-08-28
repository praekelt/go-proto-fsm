describe('routerComponent', function () {
    var element, componentManager, router, layout;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (ComponentManager, routerComponent, dragBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        componentManager = new ComponentManager({
            routers: [{
                uuid: 'router1',
                name: "Router 1",
                description: "Keyword",
                channel_endpoints: [{uuid: 'endpoint1', name: 'default'}],
                conversation_endpoints: [{
                    uuid: 'endpoint2',
                    name: 'default'
                }, {
                    uuid: 'endpoint3',
                    name: 'default'
                }],
                x: 100,
                y: 100,
            }]
        });

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        router = routerComponent()
            .drag(drag);

        componentManager.layoutComponents();

        var meta = componentManager.getComponent('router1').meta();
        meta.selected = true;

        d3.selectAll(element.find('svg').toArray()).selectAll('.router')
            .data(componentManager.getRouters())
            .call(router);
    }));

    it('should have drawn the router component', inject(function () {
        var routers = element.find('.router');
        expect(routers).to.have.length(1);

        var router = routers.eq(0);
        expect(router.attr('transform')).to.equal('translate(100,100)');
        expect(router.attr('class').indexOf('selected')).not.to.equal(-1);
        var meta = componentManager.getComponent('router1').meta();
        expect(router.find('.disc').eq(0).attr('r')).to.equal(String(meta.layout.r));

        var name = router.find('.name').eq(0);
        expect(name.text()).to.equal('Router 1');

        var pins = router.find('.pins').eq(0);
        expect(pins.find('.pin')).to.have.length(2);

        var endpoint = componentManager.getComponent('router1').getEndpoints('conversation')[0];
        var pin = pins.find('.pin').eq(0);
        var len = endpoint.meta().layout.len;
        var x = -(len / 2.0);
        var y = endpoint.meta().layout.y;
        expect(pin.attr('transform')).to.equal('translate(' + [x, y] + ')');
        expect(pin.find('.head')).to.have.length(1);
        expect(pin.find('.head').eq(0).attr('r')).to.equal('8');
        expect(pin.find('.line')).to.have.length(1);
        expect(pin.find('.line').eq(0).attr('x2')).to.equal(String(len));

        endpoint = componentManager.getComponent('router1').getEndpoints('conversation')[1];
        pin = pins.find('.pin').eq(1);
        len = endpoint.meta().layout.len;
        x = -(len / 2.0);
        y = endpoint.meta().layout.y;
        expect(pin.attr('transform')).to.equal('translate(' + [x, y] + ')');
    }));

    it('should have drawn new router component', inject(function () {
        var routers = element.find('.router');
        expect(routers).to.have.length(1);

        componentManager.load({
            routers: [{
                uuid: 'router2',
                name: "Router 2",
                description: "Keyword",
                channel_endpoints: [{uuid: 'endpoint4', name: 'default'}],
                conversation_endpoints: [{
                    uuid: 'endpoint5',
                    name: 'default'
                }, {
                    uuid: 'endpoint6',
                    name: 'default'
                }],
                x: 200,
                y: 200
            }]
        });

        componentManager.layoutComponents();

        d3.selectAll(element.find('svg').toArray()).selectAll('.router')
            .data(componentManager.getRouters())
            .call(router);

        routers = element.find('.router');
        expect(routers).to.have.length(2);
    }));

    it('should not have drawn any router components', inject(function () {
        var routers = element.find('.router');
        expect(routers).to.have.length(1);

        componentManager.reset();

        d3.selectAll(element.find('svg').toArray()).selectAll('.router')
            .data(componentManager.getRouters())
            .call(router);

        routers = element.find('.router');
        expect(routers).to.have.length(0);
    }));

    it('router should be draggable', inject(function () {
        var routers = element.find('.router');
        routers.eq(0)
            .d3()
            .simulate('dragstart')
            .simulate('drag', {
                x: 70,
                y: 70
            })
            .simulate('dragend');

        expect(routers.eq(0).attr('transform')).to.equal('translate(70,70)');
    }));

    it('router pin should be selectable', inject(function ($rootScope) {
        sinon.stub($rootScope, '$emit');

        var router = element.find('.router').eq(0);
        var pin = router.find('.pin.pin-conversation').eq(1);
        pin.d3().simulate('mousedown');

        var router = componentManager.getComponent('router1');
        var endpoint = componentManager.getEndpoint('endpoint3');

        expect($rootScope.$emit.calledWith('go:campaignDesignerSelect', router, endpoint)).to.be.true;
    }));

});
