describe('routerComponent', function () {
    var element, router, layout, data;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (routerComponent, routerLayout, dragBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        router = routerComponent().drag(drag);
        layout = routerLayout();

        data = [{
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
            _meta: {
                selected: true
            }
        }];

        d3.selectAll(element.find('svg').toArray()).selectAll('.router')
            .data(layout(data))
            .call(router);
    }));

    it('should have drawn the router component', inject(function () {
        var routers = element.find('.router');
        expect(routers).to.have.length(1);

        var router = routers.eq(0);
        expect(router.attr('transform')).to.equal('translate(100,100)');
        expect(router.attr('class').indexOf('selected')).not.to.equal(-1);
        expect(router.find('.disc').eq(0).attr('r')).to.equal(String(data[0]._meta.layout.r));

        var name = router.find('.name').eq(0);
        expect(name.text()).to.equal('Router 1');

        var pins = router.find('.pins').eq(0);
        expect(pins.find('.pin')).to.have.length(2);

        var pin = pins.find('.pin').eq(0);
        var len = data[0].conversation_endpoints[0]._meta.layout.len;
        var x = -(len / 2.0);
        var y = data[0].conversation_endpoints[0]._meta.layout.y;
        expect(pin.attr('transform')).to.equal('translate(' + [x, y] + ')');
        expect(pin.find('.head')).to.have.length(1);
        expect(pin.find('.head').eq(0).attr('r')).to.equal('8');
        expect(pin.find('.line')).to.have.length(1);
        expect(pin.find('.line').eq(0).attr('x2')).to.equal(String(len));

        pin = pins.find('.pin').eq(1);
        len = data[0].conversation_endpoints[1]._meta.layout.len;
        x = -(len / 2.0);
        y = data[0].conversation_endpoints[1]._meta.layout.y;
        expect(pin.attr('transform')).to.equal('translate(' + [x, y] + ')');
    }));

    it('should have drawn new router component', inject(function () {
        var routers = element.find('.router');
        expect(routers).to.have.length(1);

        data.push({
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
        });

        d3.selectAll(element.find('svg').toArray()).selectAll('.router')
            .data(layout(data))
            .call(router);

        routers = element.find('.router');
        expect(routers).to.have.length(2);
    }));

    it('should not have drawn any router components', inject(function () {
        var routers = element.find('.router');
        expect(routers).to.have.length(1);

        data.pop();

        d3.selectAll(element.find('svg').toArray()).selectAll('.router')
            .data(layout(data))
            .call(router);

        routers = element.find('.router');
        expect(routers).to.have.length(0);
    }));

    it('router should be draggable', inject(function () {
        var routers = element.find('.router');
        routers.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 70,
                y: 70
            })
            .trigger('vumigo:dragend');

        expect(routers.eq(0).attr('transform')).to.equal('translate(70,70)');
    }));

    it('router pin should be selectable', inject(function ($rootScope) {
        sinon.stub($rootScope, '$emit');

        var router = element.find('.router').eq(0);
        var pin = router.find('.pin.pin-channel').eq(0);
        pin.eq(0).trigger('mousedown');

        expect($rootScope.$emit.calledWith('go:campaignDesignerSelect', 'router1', 'endpoint4')).to.be.true;
    }));

});
