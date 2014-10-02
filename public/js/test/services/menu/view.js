describe('menuComponent', function () {
    var element, scope, menu;

    beforeEach(module('uuid'));
    beforeEach(module('vumigo.services'));

    beforeEach(inject(function ($rootScope, Menu, MenuItem, menuComponent) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        scope = $rootScope;

        menu = new Menu({
            component: { id: 'component1' },
            items: [
                new MenuItem({
                    icon: 'icon1',
                    title: 'Action1',
                    action: 'go:action1'
                }),
                new MenuItem({
                    icon: 'icon2',
                    title: 'Action2',
                    action: 'go:action2'
                })
            ],
        });

        menu.meta().layout = { x: 50, y: 50 };
        menu.meta().active = false;
        menu.items[0].meta().layout = menu.items[1].meta().layout = {
            width: 32,
            height: 32,
            text: { x: 10, dy: 20 }
        };

        d3.selectAll(element.find('svg').toArray()).selectAll('.menu')
            .data([menu])
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

        var title = item.find('title');
        expect(title).to.have.length(1);
        expect(title.eq(0).text()).to.equal('Action1');
    }));

    it('should trigger action on click', inject(function () {
        sinon.stub(scope, '$emit');

        var item = element.find('.menu-item').eq(0);
        item.d3().simulate('mousedown');

        expect(scope.$emit.calledWith('go:action1', menu.component)).to.be.true;
    }));

});
