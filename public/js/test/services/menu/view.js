describe('menuComponent', function () {
    var element, scope, component, data;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function ($rootScope, menuComponent) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        scope = $rootScope;

        component = {
            uuid: 'compinent1'
        };

        data = [{
            items: [{
                component: component,
                width: 32,
                height: 32,
                text: {
                    icon: 'icon1',
                    x: 10,
                    dy: 20
                },
                action: 'go:action1'
            }, {
                component: component,
                width: 32,
                height: 32,
                text: {
                    icon: 'icon2',
                    x: 10,
                    dy: 20
                },
                action: 'go:action2'
            }],
            active: false,
            x: 50,
            y: 50
        }];

        d3.selectAll(element.find('svg').toArray()).selectAll('.menu')
            .data(data)
            .call(menuComponent());
    }));

    it('should have drawn the menus', inject(function () {
        var menus = element.find('.menu');
        expect(menus).to.have.length(1);
        expect(menus.eq(0).attr('transform')).to.equal('translate(50,50)');

        var items = menus.eq(0).find('.menu-item');
        expect(items).to.have.length(2);
        expect(items.eq(0).attr('transform')).to.equal('translate(0,0)');
        expect(items.eq(1).attr('transform')).to.equal('translate(32,0)');

        var item = items.eq(0);
        var rects = item.find('rect');
        expect(rects).to.have.length(1);
        expect(rects.eq(0).attr('width')).to.equal('32');
        expect(rects.eq(0).attr('height')).to.equal('32');

        var text = item.find('text');
        expect(text).to.have.length(1);
        expect(text.eq(0).attr('x')).to.equal('10');
        expect(text.eq(0).attr('dy')).to.equal('20');
        expect(text.eq(0).text()).to.equal('icon1');
    }));

    it('should trigger action on click', inject(function () {
        sinon.stub(scope, '$emit');

        var item = element.find('.menu-item').eq(0);
        item.d3().simulate('mousedown');

        expect(scope.$emit.calledWith('go:action1', component.uuid)).to.be.true;
    }));

});
