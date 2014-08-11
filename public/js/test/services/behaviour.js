describe('zoomBehavior', function () {
    var element;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function (zoomBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        var svg = d3.selectAll(element.find('svg').toArray());

        var container = svg.append('g')
            .attr('class', 'container')
            .attr('transform', 'translate(0, 0)');

        var canvas = container.append('g')
            .attr('class', 'canvas');

        var zoom = zoomBehavior()
            .canvas(canvas)
            .canvasWidth(100)
            .canvasHeight(100)
            .viewportElement(element)
            .call();

        container.call(zoom);
    }));

    it('should allow canvas to be draggable', inject(function () {
        element.find('g.container')
            .d3()
            .simulate('zoomstart')
            .simulate('zoom', {
                translate: [-50, -50],
                scale: 1
            })
            .simulate('zoomend');

        var canvas = element.find('g.canvas');
        expect(canvas.eq(0).attr('transform')).to.equal('translate(-50,-50)scale(1)');
    }));

    it('should not allow canvas to be dragged beyond viewport', inject(function () {
        var container = element.find('g.container');
        var canvas = element.find('g.canvas');

        container
            .d3()
            .simulate('zoomstart')
            .simulate('zoom', {
                translate: [10, 10],
                scale: 1
            })
            .simulate('zoomend');

        expect(canvas.eq(0).attr('transform')).to.equal('translate(0,0)scale(1)');

        container
            .d3()
            .simulate('zoomstart')
            .simulate('zoom', {
                translate: [-100, -100],
                scale: 1
            })
            .simulate('zoomend');

        expect(canvas.eq(0).attr('transform')).to.equal('translate(-80,-80)scale(1)');
    }));

    it('should allow canvas to be zoomable', inject(function () {
        var canvas = element.find('g.canvas');
        var container = element.find('g.container');
        expect(canvas.attr('transform')).to.be.undefined;

        container
            .d3()
            .simulate('zoomstart')
            .simulate('zoom', {
                translate: [0, 0],
                scale: 3
            })
            .simulate('zoomend');

        expect(canvas.attr('transform')).to.equal('translate(0,0)scale(3)');
    }));
});

describe('dragBehavior', function () {
    var element, scope, canvas;

    beforeEach(module('vumigo.services'));

    beforeEach(inject(function ($rootScope, dragBehavior) {
        element = angular.element(
            '<div id="viewport" style="width: 20px; height: 20px">' +
                '<svg width="100" height="100"></svg>' +
            '</div>');

        scope = $rootScope;

        var svg = d3.selectAll(element.find('svg').toArray());

        var container = svg.append('g')
            .attr('class', 'container')
            .attr('transform', 'translate(0, 0)');

        canvas = container.append('g')
            .attr('class', 'canvas');

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .call();

        canvas.selectAll('.component')
            .data([{uuid: 'component1', x: 0, y: 0}])
            .enter().append('g')
                .attr('class', 'component')
                .attr('transform', 'translate(0,0)')
                .call(drag);
    }));

    it('should allow component to be draggable', inject(function () {
        var components = element.find('.component');
        components.eq(0)
            .d3()
            .simulate('dragstart')
            .simulate('drag', {
                x: 70,
                y: 70
            })
            .simulate('dragend');

        expect(components.eq(0).attr('transform')).to.equal('translate(70,70)');
    }));

    it('should not allow component to be dragged outside canvas', inject(function () {
        var components = element.find('.component');

        components.eq(0)
            .d3()
            .simulate('dragstart')
            .simulate('drag', {
                x: -1,
                y: -1
            })
            .simulate('dragend');

        expect(components.eq(0).attr('transform')).to.equal('translate(0,0)');

        components.eq(0)
            .d3()
            .simulate('dragstart')
            .simulate('drag', {
                x: 101,
                y: 101
            })
            .simulate('dragend');

        var svg = element.find('svg');
        var transform = 'translate(' + [100, 100] +')';
        expect(components.eq(0).attr('transform')).to.equal(transform);
    }));

    it('should snap component to grid', inject(function () {
        var components = element.find('.component');

        components.eq(0)
            .d3()
            .simulate('dragstart')
            .simulate('drag', {
                x: 14,
                y: 14
            })
            .simulate('dragend');

        expect(components.eq(0).attr('transform')).to.equal('translate(10,10)');

        components.eq(0)
            .d3()
            .simulate('dragstart')
            .simulate('drag', {
                x: 15,
                y: 15
            })
            .simulate('dragend');

        expect(components.eq(0).attr('transform')).to.equal('translate(20,20)');
    }));

    it('should select component', inject(function () {
        sinon.stub(scope, '$emit');

        var component = element.find('.component').eq(0);

        component.d3().simulate('dragstart');

        var classes = component.attr('class').split(' ');
        expect(classes.indexOf('component')).not.to.equal(-1);
        expect(classes.indexOf('dragging')).not.to.equal(-1);
        expect(scope.$emit.calledWith('go:campaignDesignerSelect', 'component1')).to.be.true;
    }));

    it('should not allow component to be draggable', inject(function (dragBehavior) {
        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .dragEnabled(false)
            .call();

        canvas.selectAll('.component.non-draggable')
            .data([{uuid: 'component2', x: 0, y: 0}])
            .enter().append('g')
                .attr('class', 'component non-draggable')
                .attr('transform', 'translate(0,0)')
                .call(drag);

        var components = element.find('.component.non-draggable');
        components.eq(0)
            .d3()
            .simulate('dragstart')
            .simulate('drag', {
                x: 70,
                y: 70
            })
            .simulate('dragend');

        expect(components.eq(0).attr('transform')).to.equal('translate(0,0)');
    }));

    it('should not select component', inject(function (dragBehavior) {
        sinon.stub(scope, '$emit');

        var drag = dragBehavior()
            .canvasWidth(100)
            .canvasHeight(100)
            .gridCellSize(10)
            .selectEnabled(false)
            .call();

        canvas.selectAll('.component.non-selectable')
            .data([{uuid: 'component2', x: 0, y: 0}])
            .enter().append('g')
                .attr('class', 'component non-selectable')
                .attr('transform', 'translate(0,0)')
                .call(drag);

        var component = element.find('.component.non-selectable').eq(0);

        component.d3().simulate('dragstart');

        var classes = component.attr('class').split(' ');
        expect(classes.indexOf('component')).not.to.equal(-1);
        expect(classes.indexOf('dragging')).not.to.equal(-1);
        expect(classes.indexOf('selected')).to.equal(-1);
        expect(scope.$emit.calledWith('go:campaignDesignerSelect', 'component2')).to.be.false;
    }));

});
