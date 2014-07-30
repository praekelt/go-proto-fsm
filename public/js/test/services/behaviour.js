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
            .trigger('vumigo:zoomstart')
            .trigger('vumigo:zoom', {
                translate: [-50, -50],
                scale: 1
            })
            .trigger('vumigo:zoomend');

        var canvas = element.find('g.canvas');
        expect(canvas.eq(0).attr('transform')).to.equal('translate(-50,-50)scale(1)');
    }));

    it('should not allow canvas to be dragged beyond viewport', inject(function () {
        var container = element.find('g.container');
        var canvas = element.find('g.canvas');

        container
            .trigger('vumigo:zoomstart')
            .trigger('vumigo:zoom', {
                translate: [10, 10],
                scale: 1
            })
            .trigger('vumigo:zoomend');

        expect(canvas.eq(0).attr('transform')).to.equal('translate(0,0)scale(1)');

        container
            .trigger('vumigo:zoomstart')
            .trigger('vumigo:zoom', {
                translate: [-100, -100],
                scale: 1
            })
            .trigger('vumigo:zoomend');

        expect(canvas.eq(0).attr('transform')).to.equal('translate(-80,-80)scale(1)');
    }));

    it('should allow canvas to be zoomable', inject(function () {
        var canvas = element.find('g.canvas');
        expect(canvas.attr('transform')).to.be.undefined;

        canvas
            .trigger('vumigo:zoomstart')
            .trigger('vumigo:zoom', {
                translate: [0, 0],
                scale: 3
            })
            .trigger('vumigo:zoomend');

        expect(canvas.attr('transform')).to.equal('translate(0,0)scale(3)');
    }));
});

describe('dragBehavior', function () {
    var element, scope;

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

        var canvas = container.append('g')
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
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 70,
                y: 70
            })
            .trigger('vumigo:dragend');

        expect(components.eq(0).attr('transform')).to.equal('translate(70,70)');
    }));

    it('should not allow component to be dragged outside canvas', inject(function () {
        var components = element.find('.component');

        components.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: -1,
                y: -1
            })
            .trigger('vumigo:dragend');
        expect(components.eq(0).attr('transform')).to.equal('translate(0,0)');

        components.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 101,
                y: 101
            })
            .trigger('vumigo:dragend');
        var svg = element.find('svg');
        var transform = 'translate(' + [100, 100] +')';
        expect(components.eq(0).attr('transform')).to.equal(transform);
    }));

    it('should snap component to grid', inject(function () {
        var components = element.find('.component');

        components.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 14,
                y: 14
            })
            .trigger('vumigo:dragend');
        expect(components.eq(0).attr('transform')).to.equal('translate(10,10)');

        components.eq(0)
            .trigger('vumigo:dragstart')
            .trigger('vumigo:drag', {
                x: 15,
                y: 15
            })
            .trigger('vumigo:dragend');
        expect(components.eq(0).attr('transform')).to.equal('translate(20,20)');
    }));

    it('should select component', inject(function () {
        sinon.stub(scope, '$emit');

        var component = element.find('.component').eq(0);

        component.trigger('vumigo:dragstart');

        var classes = component.attr('class').split(' ');
        expect(classes.indexOf('component')).not.to.equal(-1);
        expect(classes.indexOf('dragging')).not.to.equal(-1);
        expect(classes.indexOf('selected')).not.to.equal(-1);
        expect(component.find('rect.bbox')).to.have.length(1);
        expect(scope.$emit.calledWith('go:campaignDesignerSelect', 'component1')).to.be.true;
    }));

});
